#!/usr/bin/env python3
"""Convert site images in assets/img/ to modern formats and update references.

  still PNG/JPG/GIF -> WebP   (lossless for graphics/alpha, lossy for photos/renders)
  animated GIF      -> MP4    (H.264; <img> tags become muted looping <video>)
                    -> animated WebP when the GIF has transparency or is
                       referenced somewhere a <video> can't replace it

Images larger than MAX_DIM on their long side are downscaled. A conversion is
only kept if it is at least MIN_SAVING smaller than the original; otherwise the
original is left alone. Converted originals are deleted from assets/img/ and
from docs/assets/img/, and every reference in the site source is rewritten.

Safe to re-run: already-converted files are skipped.

Setup (once):
    python3 -m venv .venv
    .venv/bin/pip install -r scripts/requirements-images.txt
Run:
    npm run images            # or: .venv/bin/python scripts/optimize_images.py
    npm run images -- --dry-run
Then rebuild with `npm run build`.
"""
import argparse
import io
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageSequence
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "assets" / "img"
DOCS_IMG_DIR = ROOT / "docs" / "assets" / "img"

MAX_DIM = 2560          # px, long side
MIN_SAVING = 0.10       # keep conversion only if >= 10% smaller
WEBP_PHOTO_Q = 82      # JPG sources (already lossy)
WEBP_SCREEN_Q = 90     # PNG sources: screenshots/renders with fine detail
WEBP_ANIM_Q = 80
MP4_CRF = 23

INPUT_EXTS = {".png", ".jpg", ".jpeg", ".gif"}
TEXT_EXTS = {".md", ".njk", ".html", ".liquid", ".css", ".js", ".ts", ".json", ".xml", ".txt"}
# Folders with their own game-local assets/img/ trees: relative "assets/img/..."
# paths in these are not ours. Absolute "/assets/img/..." paths are always ours.
RELATIVE_REF_EXCLUDE = ("src/games/", "src/SwingBolt/")
SKIP_TEXT_DIRS = ("src/arena/",)  # large generated data, no image refs

PATH_CHARS = r"[\w./%-]"


def git_files(*paths):
    out = subprocess.run(["git", "ls-files", "-z", *paths], cwd=ROOT,
                         capture_output=True, text=True, check=True).stdout
    return [p for p in out.split("\0") if p]


def text_files():
    files = []
    for rel in git_files("src", "_drafts", "README.md"):
        p = ROOT / rel
        if p.suffix.lower() in TEXT_EXTS and not rel.startswith(SKIP_TEXT_DIRS) and p.exists():
            files.append(rel)
    return files


def ref_pattern(rel_img, allow_relative):
    """Regex matching a reference to assets/img/<rel_img> as a whole path."""
    prefix = r"(?:/|\.\./|)" if allow_relative else r"/"
    return re.compile(r"(?<!" + PATH_CHARS + r")(" + prefix + r")assets/img/"
                      + re.escape(rel_img) + r"(?!" + PATH_CHARS + r")")


class Refs:
    def __init__(self):
        self.files = {rel: (ROOT / rel).read_text(encoding="utf-8", errors="surrogateescape")
                      for rel in text_files()}
        self.dirty = set()

    def _patterns(self, rel_file, rel_img):
        return ref_pattern(rel_img, not rel_file.startswith(RELATIVE_REF_EXCLUDE))

    def find(self, rel_img):
        """Yield (file, text, match) for each reference to rel_img."""
        for f, text in self.files.items():
            for m in self._patterns(f, rel_img).finditer(text):
                yield f, text, m

    def video_safe(self, rel_img):
        """True if every reference sits in <img src>, <a href> or ![](...)."""
        ctx = re.compile(r"(?:<img\b[^>]*\bsrc|<a\b[^>]*\bhref)\s*=\s*[\"']$|!\[[^\]]*\]\($")
        found = False
        for _f, text, m in self.find(rel_img):
            found = True
            if not ctx.search(text[max(0, m.start() - 300):m.start()]):
                return False
        return found

    def replace(self, rel_img, rel_new):
        n = 0
        for f in list(self.files):
            text = self.files[f]
            new_text, k = self._patterns(f, rel_img).subn(
                lambda m: m.group(1) + "assets/img/" + rel_new, text)
            if k:
                self.files[f] = new_text
                self.dirty.add(f)
                n += k
        return n

    def img_to_video(self, rel_mp4):
        """Turn <img src=...mp4> / ![alt](...mp4) into looping muted <video>."""
        path = r"(?:/|\.\./|)assets/img/" + re.escape(rel_mp4)
        img_tag = re.compile(r"<img\b([^>]*?)\bsrc\s*=\s*([\"'])(" + path + r")\2([^>]*?)\s*/?>")
        md_img = re.compile(r"!\[([^\]]*)\]\((" + path + r")\)")

        def attrs(a):
            a = re.sub(r"\balt\s*=", "aria-label=", a).strip()
            return (" " + a) if a else ""

        for f in list(self.files):
            text = self.files[f]
            text2 = img_tag.sub(lambda m: f'<video src="{m.group(3)}" autoplay loop muted playsinline'
                                f'{attrs(m.group(1) + " " + m.group(4))}></video>', text)
            text2 = md_img.sub(lambda m: f'<video src="{m.group(2)}" autoplay loop muted playsinline'
                               + (f' aria-label="{m.group(1)}"' if m.group(1) else "") + "></video>", text2)
            if text2 != text:
                self.files[f] = text2
                self.dirty.add(f)

    def save(self):
        for f in sorted(self.dirty):
            (ROOT / f).write_text(self.files[f], encoding="utf-8", errors="surrogateescape")
        return sorted(self.dirty)


def downscale(im):
    if max(im.size) <= MAX_DIM:
        return im
    im = im.copy()
    im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)
    return im


def is_graphic(im):
    """Flat graphics (palette/alpha/few colours) compress better losslessly."""
    if im.mode in ("P", "1", "L", "LA"):
        return True
    if "A" in im.getbands() and im.getchannel("A").getextrema()[0] < 255:
        return True
    small = im.convert("RGB").resize((min(im.width, 256), min(im.height, 256)))
    return small.getcolors(1024) is not None  # None means more than 1024 colours


def encode_still(src):
    im = Image.open(src)
    im.load()
    im = downscale(im)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "transparency" in im.info or "A" in im.getbands() else "RGB")
    buf = io.BytesIO()
    is_jpg = src.suffix.lower() in (".jpg", ".jpeg")
    if not is_jpg and is_graphic(im):
        im.save(buf, "WEBP", lossless=True, method=6)
    else:
        im.save(buf, "WEBP", quality=WEBP_PHOTO_Q if is_jpg else WEBP_SCREEN_Q, method=6)
    return buf.getvalue()


def encode_anim_webp(src):
    im = Image.open(src)
    frames, durations = [], []
    for fr in ImageSequence.Iterator(im):
        frames.append(downscale(fr.convert("RGBA")))
        durations.append(fr.info.get("duration", 100) or 100)
    buf = io.BytesIO()
    frames[0].save(buf, "WEBP", save_all=True, append_images=frames[1:], duration=durations,
                   loop=0, quality=WEBP_ANIM_Q, method=4, minimize_size=True)
    return buf.getvalue()


def encode_mp4(src):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    with tempfile.TemporaryDirectory() as td:
        out = Path(td) / "out.mp4"
        vf = (f"scale='min({MAX_DIM},iw)':'min({MAX_DIM},ih)':force_original_aspect_ratio=decrease,"
              "scale=trunc(iw/2)*2:trunc(ih/2)*2")
        subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(src), "-vf", vf,
                        "-c:v", "libx264", "-preset", "slow", "-crf", str(MP4_CRF),
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(out)],
                       check=True)
        return out.read_bytes()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true", help="report only; change nothing")
    args = ap.parse_args()

    refs = Refs()
    total_before = total_after = 0
    converted = kept = 0

    images = sorted(p for p in IMG_DIR.rglob("*") if p.suffix.lower() in INPUT_EXTS)
    for src in images:
        rel = src.relative_to(IMG_DIR).as_posix()
        size = src.stat().st_size
        try:
            im = Image.open(src)
            animated = getattr(im, "n_frames", 1) > 1
            has_alpha = "transparency" in im.info or "A" in im.getbands()
        except Exception as e:  # unreadable/corrupt
            print(f"  skip  {rel}: {e}")
            continue

        if animated and not has_alpha and refs.video_safe(rel):
            kind, ext, data = "mp4", ".mp4", encode_mp4(src)
        elif animated:
            kind, ext, data = "webp-anim", ".webp", encode_anim_webp(src)
        else:
            kind, ext, data = "webp", ".webp", encode_still(src)

        dst = src.with_suffix(ext)
        rel_new = dst.relative_to(IMG_DIR).as_posix()
        if len(data) > size * (1 - MIN_SAVING):
            kept += 1
            print(f"  keep  {rel}  ({size/1e6:.2f}MB; {kind} only {len(data)/1e6:.2f}MB)")
            continue
        if dst.exists():
            print(f"  skip  {rel}: {rel_new} already exists")
            continue

        converted += 1
        total_before += size
        total_after += len(data)
        n = sum(1 for _ in refs.find(rel))
        print(f"  {kind:9s} {rel} -> {rel_new}  {size/1e6:.2f}MB -> {len(data)/1e6:.2f}MB  ({n} refs)")
        if args.dry_run:
            continue
        dst.write_bytes(data)
        refs.replace(rel, rel_new)
        if ext == ".mp4":
            refs.img_to_video(rel_new)
        src.unlink()
        docs_copy = DOCS_IMG_DIR / rel
        if docs_copy.exists():
            docs_copy.unlink()

    changed = [] if args.dry_run else refs.save()
    print(f"\n{converted} converted, {kept} kept as-is: "
          f"{total_before/1e6:.1f}MB -> {total_after/1e6:.1f}MB")
    if changed:
        print(f"updated references in {len(changed)} files:\n  " + "\n  ".join(changed))
    if not args.dry_run and converted:
        print("\nNow run `npm run build`.")


if __name__ == "__main__":
    sys.exit(main())

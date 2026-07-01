#!/usr/bin/env python3
"""
Lint/check markdown posts for common content issues:
- dead links (http/https)
- spelling (pyspellchecker)
- repeated words
- double spaces
- missing/unused markdown footnote definitions

Usage:
  python3 scripts/check_posts.py
  python3 scripts/check_posts.py --skip-links
  python3 scripts/check_posts.py --skip-spelling
  python3 scripts/check_posts.py --date-cutoff=2026
  python3 scripts/check_posts.py --date-cutoff=2026-03-01
  python3 scripts/check_posts.py --fail-on-warn

Dependencies:
  pip install pyspellchecker
"""

from __future__ import annotations

import argparse
import concurrent.futures as futures
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple

try:
    from spellchecker import SpellChecker  # type: ignore
except Exception:  # pragma: no cover
    SpellChecker = None  # type: ignore

POSTS_GLOB = "src/posts/**/*.md"
USER_AGENT = "Mozilla/5.0 (compatible; AJWeeksPostChecker/1.0; +https://ajweeks.com)"
DEFAULT_ALLOWLIST_PATH = Path("scripts/spell_allowlist.txt")

CODE_FENCE_RE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE_RE = re.compile(r"`[^`]*`")
URL_RE = re.compile(r"https?://[^\s<>)\]]+")
MD_LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
AUTO_LINK_RE = re.compile(r"<(https?://[^>]+)>")
FOOTNOTE_REF_RE = re.compile(r"\[\^([A-Za-z0-9_-]+)\]")
FOOTNOTE_DEF_RE = re.compile(r"^\s*\[\^([A-Za-z0-9_-]+)\]:")
REPEATED_WORD_RE = re.compile(r"\b([A-Za-z][A-Za-z'’-]*)\s+([A-Za-z][A-Za-z'’-]*)\b")
DOUBLE_SPACE_RE = re.compile(r"\S {2,}\S")
WORD_RE = re.compile(r"\b([A-Za-z][A-Za-z'’-]*)\b")
DATE_PREFIX_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-")
FRONT_MATTER_DATE_RE = re.compile(r"^\s*date\s*:\s*[\"']?(\d{4}-\d{2}-\d{2})")
ACRONYM_RE = re.compile(r"^[A-Z]{2,}[sS]?$")


@dataclass
class Issue:
    severity: str  # ERROR | WARN
    path: Path
    line: int
    check: str
    message: str


def iter_non_code_lines(text: str) -> Iterable[Tuple[int, str]]:
    """Yield (line_no, line) while skipping front matter + fenced code blocks."""
    lines = text.splitlines()

    start_idx = 0
    if lines and lines[0].strip() == "---":
        # skip YAML front matter
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                start_idx = i + 1
                break

    in_code = False
    for idx in range(start_idx, len(lines)):
        line = lines[idx]
        if CODE_FENCE_RE.match(line):
            in_code = not in_code
            continue
        if in_code:
            continue
        yield idx + 1, line


def clean_line_for_text_checks(line: str) -> str:
    out = INLINE_CODE_RE.sub(" ", line)
    out = MD_LINK_RE.sub(" ", out)
    out = AUTO_LINK_RE.sub(" ", out)
    out = URL_RE.sub(" ", out)
    # For checker purposes, ignore em-dash markdown style as a typo signal.
    out = out.replace("--", " - ")
    return out


def parse_markdown_link_target(raw_target: str) -> str:
    target = raw_target.strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1].strip()

    # Handle optional title: (url "title")
    if " " in target and not target.startswith("mailto:"):
        first = target.split()[0]
        if first.startswith(("http://", "https://", "./", "../", "/", "#")):
            target = first

    return target


def normalize_url(url: str) -> str:
    """Trim obvious trailing punctuation without breaking valid URLs.

    Important: don't always strip ')' because valid URLs can end with ')'.
    Only strip unmatched trailing ')' (and ']') from surrounding prose.
    """
    u = url.strip()

    while u and u[-1] in ".,;:!?":
        u = u[:-1]

    while u.endswith(")") and u.count("(") < u.count(")"):
        u = u[:-1]

    while u.endswith("]") and u.count("[") < u.count("]"):
        u = u[:-1]

    return u


def extract_links(_path: Path, text: str) -> List[Tuple[str, int]]:
    links: List[Tuple[str, int]] = []

    for line_no, line in iter_non_code_lines(text):
        for m in MD_LINK_RE.finditer(line):
            target = parse_markdown_link_target(m.group(1))
            if target:
                links.append((normalize_url(target), line_no))

        for m in AUTO_LINK_RE.finditer(line):
            links.append((normalize_url(m.group(1)), line_no))

        for m in URL_RE.finditer(line):
            links.append((normalize_url(m.group(0)), line_no))

    return list(dict.fromkeys(links))


def check_double_spaces(path: Path, text: str) -> List[Issue]:
    issues: List[Issue] = []
    for line_no, line in iter_non_code_lines(text):
        scan = line.rstrip("\n")
        for m in DOUBLE_SPACE_RE.finditer(scan):
            snippet = scan[max(0, m.start() - 12):m.end() + 12].strip()
            issues.append(Issue("WARN", path, line_no, "double-space", f"Multiple spaces in text: '{snippet}'"))
            break
    return issues


def load_allowlist(root: Path, explicit_path: Optional[str] = None) -> Tuple[Set[str], Optional[Path]]:
    candidates: List[Path] = []

    if explicit_path:
        p = Path(explicit_path)
        if p.is_absolute():
            candidates.append(p)
        else:
            candidates.append((root / p).resolve())
            candidates.append((Path.cwd() / p).resolve())
    else:
        # Prefer project-root-relative path, but also support running from ./scripts.
        candidates.append((root / DEFAULT_ALLOWLIST_PATH).resolve())
        candidates.append((Path(__file__).resolve().parent / "spell_allowlist.txt").resolve())
        candidates.append((Path.cwd() / DEFAULT_ALLOWLIST_PATH).resolve())

    allowlist_path = next((p for p in candidates if p.exists()), None)
    if allowlist_path is None:
        return set(), None

    words: Set[str] = set()
    for line in allowlist_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        words.add(stripped.casefold())
    return words, allowlist_path


def should_spellcheck(word: str, allowlist: Set[str]) -> bool:
    # Normalize apostrophes and lowercase for checks/allowlist lookup.
    w = word.replace("’", "'").strip("'").casefold()
    if len(w) < 4:
        return False
    if any(ch.isdigit() for ch in w):
        return False
    if w in allowlist:
        return False
    return True


def is_acronym(word: str) -> bool:
    # Ignore common acronyms/initialisms like GPT, CEOs, METR.
    return bool(ACRONYM_RE.match(word))


def check_typos_and_repeats(path: Path, text: str, spell: Optional[SpellChecker], allowlist: Set[str]) -> List[Issue]:
    issues: List[Issue] = []

    for line_no, line in iter_non_code_lines(text):
        cleaned = clean_line_for_text_checks(line)

        for m in REPEATED_WORD_RE.finditer(cleaned):
            if m.group(1).casefold() == m.group(2).casefold():
                issues.append(Issue("WARN", path, line_no, "repeated-word", f"Repeated word '{m.group(1)} {m.group(2)}'"))
                break

        if spell is None:
            continue

        original_by_norm: Dict[str, str] = {}
        candidates: List[str] = []
        for word in WORD_RE.findall(cleaned):
            if is_acronym(word):
                continue

            norm = word.replace("’", "'").strip("'").casefold()
            if not should_spellcheck(norm, allowlist):
                continue
            original_by_norm.setdefault(norm, word)
            candidates.append(norm)

        if not candidates:
            continue

        unknown = spell.unknown(candidates)
        for misspelled in sorted(unknown):
            suggestion = spell.correction(misspelled)
            original = original_by_norm.get(misspelled, misspelled)
            if suggestion and suggestion != misspelled:
                issues.append(Issue("WARN", path, line_no, "typo", f"Possible typo '{original}' (did you mean '{suggestion}'?)"))
            else:
                issues.append(Issue("WARN", path, line_no, "typo", f"Possible typo '{original}'"))

    return issues


def check_footnotes(path: Path, text: str) -> List[Issue]:
    issues: List[Issue] = []
    refs: Dict[str, List[int]] = {}
    defs: Dict[str, int] = {}

    for line_no, line in iter_non_code_lines(text):
        def_match = FOOTNOTE_DEF_RE.match(line)
        if def_match:
            defs[def_match.group(1)] = line_no

        for m in FOOTNOTE_REF_RE.finditer(line):
            token = m.group(1)
            if line.lstrip().startswith(f"[^{token}]:"):
                continue
            refs.setdefault(token, []).append(line_no)

    for token, lines in refs.items():
        if token not in defs:
            issues.append(Issue("WARN", path, lines[0], "footnote", f"Reference [^{token}] has no matching definition"))

    for token, line_no in defs.items():
        if token not in refs:
            issues.append(Issue("WARN", path, line_no, "footnote", f"Definition [^{token}]: is never referenced"))

    return issues


def classify_http_failure(code: int) -> str:
    if code in (404, 410):
        return "ERROR"
    if code in (401, 403, 405, 429, 500, 502, 503, 504):
        return "WARN"
    return "ERROR"


def _request_once(url: str, method: str, timeout: float) -> Tuple[Optional[int], Optional[str]]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close",
    }
    req = urllib.request.Request(url, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = int(resp.getcode() or 0)
            # ensure at least one byte is read for some servers/proxies
            try:
                resp.read(1)
            except Exception:
                pass
            return code, None
    except urllib.error.HTTPError as e:
        return int(e.code), f"HTTP {e.code}"
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"


def check_remote_url(url: str, timeout: float) -> Tuple[str, Optional[int], str]:
    # 1) Try HEAD first
    head_code, head_err = _request_once(url, "HEAD", timeout)
    if head_code is not None and 200 <= head_code < 400:
        return "OK", head_code, ""

    # 2) Fallback to GET always (some servers return 404/405 for HEAD but 200 for GET)
    get_code, get_err = _request_once(url, "GET", timeout)
    if get_code is not None and 200 <= get_code < 400:
        return "OK", get_code, ""

    if get_code is not None:
        sev = classify_http_failure(get_code)
        detail = f"GET HTTP {get_code}"
        if head_code is not None:
            detail = f"HEAD HTTP {head_code}; {detail}"
        elif head_err:
            detail = f"HEAD failed ({head_err}); {detail}"
        return sev, get_code, detail

    # If GET failed entirely but HEAD had a code, use HEAD classification.
    if head_code is not None:
        sev = classify_http_failure(head_code)
        detail = f"HEAD HTTP {head_code}; GET failed ({get_err or 'unknown'})"
        return sev, head_code, detail

    return "WARN", None, f"HEAD failed ({head_err or 'unknown'}); GET failed ({get_err or 'unknown'})"


def check_links(paths_and_text: Sequence[Tuple[Path, str]], timeout: float, workers: int) -> List[Issue]:
    issues: List[Issue] = []
    url_to_refs: Dict[str, List[Tuple[Path, int]]] = {}

    for path, text in paths_and_text:
        for raw_url, line_no in extract_links(path, text):
            url = raw_url.strip()
            if not url or url.startswith(("#", "mailto:", "tel:", "javascript:")):
                continue

            parsed = urllib.parse.urlparse(url)
            if parsed.scheme in ("http", "https"):
                url_to_refs.setdefault(url, []).append((path, line_no))
            elif parsed.scheme == "":
                # Relative links (./foo.md, ../bar.md)
                if url.startswith(("./", "../")):
                    target = (path.parent / url).resolve()
                    if not target.exists():
                        issues.append(Issue("ERROR", path, line_no, "link-local", f"Relative link target does not exist: {url}"))

    checked: Dict[str, Tuple[str, Optional[int], str]] = {}
    with futures.ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        fut_map = {pool.submit(check_remote_url, url, timeout): url for url in url_to_refs}
        for fut in futures.as_completed(fut_map):
            url = fut_map[fut]
            try:
                checked[url] = fut.result()
            except Exception as e:
                checked[url] = ("WARN", None, f"Unhandled checker error: {e}")

    for url, refs in url_to_refs.items():
        sev, _code, detail = checked[url]
        if sev == "OK":
            continue
        for path, line_no in refs:
            msg = f"{url}"
            if detail:
                msg += f" ({detail})"
            issues.append(Issue(sev, path, line_no, "link", msg))

    return issues


def parse_date_cutoff(raw: Optional[str]) -> Optional[date]:
    if not raw:
        return None

    value = raw.strip().strip("\"'")
    if re.fullmatch(r"\d{4}", value):
        return date(int(value), 1, 1)

    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        y, m, d = value.split("-")
        try:
            return date(int(y), int(m), int(d))
        except ValueError:
            raise ValueError("--date-cutoff has invalid calendar date")

    raise ValueError("--date-cutoff must be YYYY or YYYY-MM-DD")


def post_date_from_path(path: Path) -> Optional[date]:
    # Expects filenames like YYYY-MM-DD-title.md
    m = DATE_PREFIX_RE.match(path.name)
    if not m:
        return None

    y, mo, d = m.group(1).split("-")
    try:
        return date(int(y), int(mo), int(d))
    except ValueError:
        return None


def post_date_from_front_matter(path: Path) -> Optional[date]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except Exception:
        return None

    if not lines or lines[0].strip() != "---":
        return None

    for i in range(1, len(lines)):
        line = lines[i]
        if line.strip() == "---":
            break

        m = FRONT_MATTER_DATE_RE.match(line)
        if not m:
            continue

        y, mo, d = m.group(1).split("-")
        try:
            return date(int(y), int(mo), int(d))
        except ValueError:
            return None

    return None


def post_date(path: Path) -> Optional[date]:
    return post_date_from_path(path) or post_date_from_front_matter(path)


def collect_posts(root: Path, cutoff: Optional[date]) -> List[Path]:
    posts = sorted(root.glob(POSTS_GLOB))
    if cutoff is None:
        return posts

    filtered: List[Path] = []
    for p in posts:
        p_date = post_date(p)
        # With cutoff active, only include posts we can date and that are >= cutoff.
        if p_date is not None and p_date >= cutoff:
            filtered.append(p)
    return filtered


def run_checks(args: argparse.Namespace) -> List[Issue]:
    root = Path(args.root).resolve()

    try:
        cutoff = parse_date_cutoff(args.date_cutoff)
    except ValueError as e:
        return [Issue("ERROR", root / "src/posts", 1, "date-cutoff", str(e))]

    posts = collect_posts(root, cutoff)
    if not posts:
        if cutoff is None:
            print(f"No posts found via glob: {POSTS_GLOB}")
        else:
            print(f"No posts found via glob: {POSTS_GLOB} after cutoff {cutoff.isoformat()}")
        return []

    allowlist, allowlist_path = load_allowlist(root, args.allowlist)

    if getattr(args, "verbose", False):
        if allowlist_path is None:
            print("[check_posts] Allowlist not found (using empty allowlist)")
        else:
            print(f"[check_posts] Loaded {len(allowlist)} allowlist word(s) from {allowlist_path}")
            print(f"[check_posts] Allowlist contents: {allowlist}")

    spell: Optional[SpellChecker] = None
    if not args.skip_spelling:
        if SpellChecker is None:
            return [
                Issue(
                    "ERROR",
                    root / "scripts/check_posts.py",
                    1,
                    "spelling",
                    "pyspellchecker is not installed. Run: pip install pyspellchecker",
                )
            ]
        spell = SpellChecker(distance=1)
        if allowlist:
            spell.word_frequency.load_words(allowlist)

    paths_and_text: List[Tuple[Path, str]] = []
    for p in posts:
        try:
            paths_and_text.append((p, p.read_text(encoding="utf-8")))
        except Exception as e:
            return [Issue("ERROR", p, 1, "read", f"Failed to read file: {e}")]

    issues: List[Issue] = []
    for path, text in paths_and_text:
        issues.extend(check_double_spaces(path, text))
        issues.extend(check_typos_and_repeats(path, text, spell, allowlist))
        issues.extend(check_footnotes(path, text))

    if not args.skip_links:
        issues.extend(check_links(paths_and_text, timeout=args.timeout, workers=args.workers))

    issues.sort(key=lambda i: (str(i.path), i.line, i.severity, i.check, i.message))
    return issues


def _env_truthy(name: str) -> bool:
    v = os.getenv(name)
    if v is None:
        return False
    return v.strip().lower() in {"1", "true", "yes", "on"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Check markdown posts for content issues.")
    parser.add_argument("--root", default=".", help="Project root (default: current directory)")
    parser.add_argument("--date-cutoff", default=None, help="Only check posts on/after this date (YYYY or YYYY-MM-DD)")
    parser.add_argument("--allowlist", default=None, help="Path to spelling allowlist file")
    parser.add_argument("--verbose", action="store_true", help="Print checker diagnostics (loaded allowlist, etc.)")
    parser.add_argument("--skip-links", action="store_true", help="Skip network link checking")
    parser.add_argument("--skip-spelling", action="store_true", help="Skip pyspellchecker-based typo checks")
    parser.add_argument("--timeout", type=float, default=10.0, help="HTTP timeout seconds (default: 10)")
    parser.add_argument("--workers", type=int, default=8, help="Concurrent link checker workers (default: 8)")
    parser.add_argument("--fail-on-warn", action="store_true", help="Return non-zero if warnings exist")
    args = parser.parse_args()

    # npm run often passes flags as npm_config_* env vars unless you use `-- ...`.
    if args.date_cutoff is None and os.getenv("npm_config_date_cutoff"):
        args.date_cutoff = os.getenv("npm_config_date_cutoff")
    if args.allowlist is None and os.getenv("npm_config_allowlist"):
        args.allowlist = os.getenv("npm_config_allowlist")
    if not args.verbose and _env_truthy("npm_config_verbose"):
        args.verbose = True

    issues = run_checks(args)

    if not issues:
        print("✅ No issues found in posts.")
        return 0

    err_count = 0
    warn_count = 0
    for issue in issues:
        rel = issue.path.as_posix()
        print(f"{issue.severity:5} {rel}:{issue.line} [{issue.check}] {issue.message}")
        if issue.severity == "ERROR":
            err_count += 1
        else:
            warn_count += 1

    print(f"\nSummary: {err_count} error(s), {warn_count} warning(s), {len(issues)} total issue(s)")

    if err_count > 0:
        return 1
    if args.fail_on_warn and warn_count > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

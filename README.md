# AJ Weeks - Personal Website

My personal website primarily featuring my writings.

## Technology Stack

- **Static Site Generator**: 11ty
- **Template Engine**: Nunjucks
- **Fonts**: self-hosted in `src/fonts/` (woff2, latin + latin-ext subsets, SIL OFL licences alongside)

## Build Instructions

### Prerequisites

- Node.js 18 or newer (required by Eleventy 3)
- npm

### Installation

Install dependencies:
```bash
npm install
```

### Development

To run the site in development mode with live reload:

```bash
npm run start
```

This starts the development server at `http://localhost:8081`. Edits to the page you are viewing are patched in place (morphdom) rather than fully reloaded, so client scripts in `src/js/` must cope with the DOM changing underneath them.

### Production Build

To build the site for production:

```bash
npm run build
```

This generates the static site in `_site/` (gitignored).

## Deployment

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and deploys `_site/` to GitHub Pages (the repo's Pages source must be set to "GitHub Actions"). Pull requests get the build as a check, without deploying. Only commit source; the build output is never committed.

### Drafts

Add `draft: true` to a post's front matter to keep it out of `npm run build` (the page, the writings lists, the feed and the sitemap). Drafts still render under `npm run start`.

### Link preview images

To give a post a large preview card when shared (X, LinkedIn, Slack, Discord, ...), add to its front matter:

```yaml
image: /assets/social/my-post.png
imageAlt: "Short description of the image"
```

Use a 1200×630 PNG or JPG (some sites don't accept WebP for previews). Keep these in `assets/social/`, which `npm run images` doesn't touch (it would convert anything in `assets/img/` to WebP). Pages without `image` get a small text-only card.

### Old vs. new writings

Posts dated before 2026 (`NEW_WRITINGS_YEAR` in `.eleventy.js`) are listed on `/old-writings/`; newer ones on `/writings/` and in the feed (`collections.writings` / `collections.oldWritings`).

## RSS Feed

A feed is generated at:

- `/feed.xml`

It is built from `collections.writings` (translation-deduped posts from 2026 on).

After build, verify locally at:

- `_site/feed.xml`

## Post Checks / Tests

The repo includes a post checker (`scripts/check_posts.py`) for:
- spelling/typos (via `pyspellchecker`)
- dead links
- repeated words
- double spaces
- footnote reference/definition mismatches

### Prerequisites

Python 3.11+ (Pillow 13 requires it). The Python tooling (post checks and `npm run images`) is pinned in `scripts/requirements.txt`; install it into `.venv`, which the npm scripts use:

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
```

Spelling allowlist is read from:
- `scripts/spell_allowlist.txt` (default)

(You can override with `--allowlist=path/to/file.txt`.)

### Commands

Run all checks:

```bash
npm run check:posts
```

Run checks without network link validation (faster):

```bash
npm run check:posts:fast
```

Pass args through npm scripts using `--`:

```bash
npm run check:posts:fast -- --date-cutoff=2026 --verbose
npm run check:posts -- --date-cutoff=2026-03-01 --allowlist=scripts/spell_allowlist.txt
```

(`--verbose` is supported and useful for diagnostics like allowlist loading.)

Run only link checks:

```bash
npm run check:posts:links
```

### Optional filters

Only check newer posts:

```bash
.venv/bin/python scripts/check_posts.py --date-cutoff=2026
.venv/bin/python scripts/check_posts.py --date-cutoff=2026-03-01
```

Debug allowlist loading:

```bash
.venv/bin/python scripts/check_posts.py --skip-links --verbose
.venv/bin/python scripts/check_posts.py --skip-links --allowlist=scripts/spell_allowlist.txt --verbose
```


# TODO:
* Copy scrollbar / interactive ToC from e.g. https://www.apolloresearch.ai/science/we-need-a-science-of-evals

# AJ Weeks - Personal Website

My personal website primarily featuring my writings.

## Technology Stack

- **Static Site Generator**: 11ty
- **Template Engine**: Nunjucks

## Build Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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

This will start the development server at `http://localhost:8080` (or another available port).

### Production Build

To build the site for production:

```bash
npm run build
```

This will generate the static site in the `_site` directory.

## RSS Feed

A feed is generated at:

- `/feed.xml`

It is built from `collections.post` (deduped translations), currently including posts from 2026+.

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

Install Python dependency:

```bash
pip install pyspellchecker
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
python scripts/check_posts.py --date-cutoff=2026
python scripts/check_posts.py --date-cutoff=2026-03-01
```

Debug allowlist loading:

```bash
python scripts/check_posts.py --skip-links --verbose
python scripts/check_posts.py --skip-links --allowlist=scripts/spell_allowlist.txt --verbose
```


# TODO:
* Copy scrollbar / interactive ToC from e.g. https://www.apolloresearch.ai/science/we-need-a-science-of-evals
* Setup feed.xml again

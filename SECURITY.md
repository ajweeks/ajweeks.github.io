# Security Policy

This repository is the source for [ajweeks.com](https://ajweeks.com), a static
personal site built with Eleventy and served by GitHub Pages behind Cloudflare.
There is no server-side code, no user accounts, and the site collects no user
data, so the attack surface is small, but reports are still welcome.

## Reporting a vulnerability

Please **don't open a public issue** for a security problem. Instead, report it
privately through GitHub:

1. Go to the [Security tab](https://github.com/ajweeks/ajweeks.github.io/security)
   of this repository.
2. Click **Report a vulnerability** and describe the issue.

Helpful details include the affected URL or file, steps to reproduce, and the
impact you think it has.

This is a one-person hobby project, so responses are best effort: I aim to
acknowledge reports within a week and to fix confirmed issues in scope as soon
as I reasonably can. I'm happy to credit you in the fix unless you'd rather stay
anonymous. There is no bug bounty.

## Scope

Only the current site and the `master` branch are supported; older versions are
not maintained.

**In scope**

- Pages served from `ajweeks.com`, including the hosted browser games
- Client-side scripts in `src/js/` and the game pages (e.g. XSS, DOM injection)
- The build configuration (`.eleventy.js`), the GitHub Actions workflow, and
  dependency issues that affect the built site or the deploy pipeline
- Leaked secrets or private data committed to the repository

**Out of scope**

- Vulnerabilities in GitHub Pages, GitHub Actions, or Cloudflare themselves
  (please report those to the respective vendor)
- Third-party content embedded in pages (YouTube, Vimeo, Sketchfab)
- Missing security headers or best-practice hardening without a demonstrated
  impact, and reports from automated scanners without a working proof of concept
- Denial-of-service attacks, social engineering, and physical attacks
- Old game code that is archived as-is, unless the issue affects visitors of the
  live site

Please only test against content you can see as an ordinary visitor; don't run
load tests or automated scans against the live site.

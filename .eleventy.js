const { DateTime } = require("luxon");

const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");

function markdownItEmDash(md) {
    md.core.ruler.after("inline", "double_hyphen_to_emdash", (state) => {
        for (const token of state.tokens) {
            if (token.type !== "inline" || !token.children) continue;
            for (const child of token.children) {
                if (child.type !== "text" || !child.content || !child.content.includes("--")) continue;
                child.content = child.content.replace(/--/g, "—");
            }
        }
    });
}

// Render markdown-it-footnote output in its final form at build time, so the
// page (and feed readers / no-JS visitors) get it without client-side patching:
//   - ref labels are "1" rather than "[1]"
//   - the footnote-ref class sits on the <a> (the hoverable/clickable circle), not the <sup>
//   - list items carry data-footnote-number for the CSS ::before marker
function markdownItFootnoteStyle(md) {
    md.renderer.rules.footnote_caption = (tokens, idx) => {
        const { id, subId } = tokens[idx].meta;
        return subId > 0 ? `${id + 1}:${subId}` : `${id + 1}`;
    };
    md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
        const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
        const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
        let refid = id;
        if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`;
        return `<sup><a href="#fn${id}" id="fnref${refid}" class="footnote-ref">${caption}</a></sup>`;
    };
    md.renderer.rules.footnote_open = (tokens, idx, options, env, slf) => {
        let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
        if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;
        return `<li id="fn${id}" class="footnote-item" data-footnote-number="${tokens[idx].meta.id + 1}">`;
    };
}

// Posts dated before this year are listed on /old-writings/ rather than
// /writings/ and the feed, and prev/next links don't cross the boundary.
const NEW_WRITINGS_YEAR = 2026;
const isNewPost = (post) => post.date.getFullYear() >= NEW_WRITINGS_YEAR;

// Normalise the date shapes Eleventy hands templates (Date, luxon DateTime,
// ISO string). Front-matter dates are UTC midnight, so format them in UTC to
// avoid shifting the day in negative-offset time zones.
function toDateTime(value) {
    if (DateTime.isDateTime(value)) return value;
    if (value instanceof Date) return DateTime.fromJSDate(value, { zone: "utc" });
    return DateTime.fromISO(value, { zone: "utc" });
}

// Deduplicate posts that are translations of each other.
// Keeps the first occurrence (in source order) per translationKey.
function dedupeTranslations(posts) {
    const seen = new Set();
    return posts.filter((p) => {
        const key = p.data && p.data.translationKey;
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

module.exports = function (eleventyConfig) {
    // Drafts: posts with `draft: true` are rendered by `npm start` but left out
    // of `npm run build` (pages, collections, feed and sitemap).
    eleventyConfig.addPreprocessor("drafts", "*", (data) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") return false;
    });

    // Newest-first, translation-deduped post lists for the writings pages and feed.
    eleventyConfig.addCollection("writings", (api) =>
        dedupeTranslations(api.getFilteredByTag("post")).filter(isNewPost).reverse());
    eleventyConfig.addCollection("oldWritings", (api) =>
        dedupeTranslations(api.getFilteredByTag("post")).filter((p) => !isNewPost(p)).reverse());

    // Passthrough copy for CSS and Images
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/fonts");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("AJ-Weeks_CV.pdf");
    eleventyConfig.addPassthroughCopy("AJ-Weeks-CV-2026.md");
    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("logo.ico");
    eleventyConfig.addPassthroughCopy("utterly-privacy-policy.html");
    eleventyConfig.addPassthroughCopy("src/arena/**");
    eleventyConfig.addPassthroughCopy("src/SwingBolt/Build");
    eleventyConfig.addPassthroughCopy("src/SwingBolt/TemplateData");
    
    // Copy all game assets (exclude .html/.md templates, which Eleventy renders
    // via their permalinks — copying them verbatim causes duplicate, broken
    // output, e.g. the mirrors MIME error). Source/OS files (.ase, Thumbs.db,
    // desktop.ini, .url shortcuts) are deliberately not listed.
    const gameAssetExts = [
        "js", "ts", "css", "png", "jpg", "jpeg", "gif", "webp", "svg",
        "wav", "mp3", "mp4", "webm", "ico", "ttf", "otf", "woff", "woff2",
        "eot", "json", "txt", "obj", "mtl",
        "glb", "gltf", "bin", "data", "wasm",
    ];
    for (const ext of gameAssetExts) {
        eleventyConfig.addPassthroughCopy(`src/games/**/*.${ext}`);
    }

    // Date filters: display ("May 22, 2026"), month + year ("May 2026"), and
    // machine-readable ISO date for <time datetime>.
    eleventyConfig.addFilter("postDate", (value) =>
        value ? toDateTime(value).setLocale("en").toLocaleString(DateTime.DATE_MED) : "");
    eleventyConfig.addFilter("monthYear", (value) =>
        value ? toDateTime(value).setLocale("en").toFormat("LLLL yyyy") : "");
    eleventyConfig.addFilter("dateISO", (value) => (value ? toDateTime(value).toISODate() : ""));

    // Friendly language name from BCP 47 code (e.g. "en" -> "English")
    const languageNames = {
        en: "English",
        sv: "Svenska",
    };
    eleventyConfig.addFilter("languageName", (code) => {
        if (!code) return "English";
        const lc = String(code).toLowerCase();
        return languageNames[lc] || code;
    });

    // Collect translations of a post by its translationKey.
    eleventyConfig.addFilter("translationsFor", (posts, key) => {
        if (!posts || !key) return [];
        const matches = posts.filter(p => p.data && p.data.translationKey === key);
        if (matches.length < 2) return [];
        return matches;
    });

    // Lazy-load media in page content (applied to {{ content }} in base.njk, so
    // standalone game pages that may draw <img> elements to a canvas are left
    // alone). The first <img> is left eager as it's the likely LCP element.
    // Tags that already set loading/decoding are not changed.
    eleventyConfig.addFilter("lazyMedia", (html) => {
        if (typeof html !== "string") return html;
        let seenImg = false;
        return html.replace(/<(img|iframe)\b([^>]*)>/gi, (tag, name, attrs) => {
            const isImg = name.toLowerCase() === "img";
            if (isImg && !seenImg) {
                seenImg = true;
                return tag;
            }
            let extra = "";
            if (!/\sloading\s*=/i.test(attrs)) extra += ' loading="lazy"';
            if (isImg && !/\sdecoding\s*=/i.test(attrs)) extra += ' decoding="async"';
            return extra ? `<${name}${extra}${attrs}>` : tag;
        });
    });

    // Previous/next post links for a post page. Skips other translations of the
    // same post, and never links across the old/new writings boundary.
    eleventyConfig.addFilter("adjacentPosts", (posts, page, translationKey) => {
        const idx = posts.findIndex((p) => p.url === page.url);
        if (idx < 0) return {};
        const notSameTranslation = (p) => !translationKey || p.data.translationKey !== translationKey;
        const sameEra = (p) => p && isNewPost(p) === isNewPost(posts[idx]) ? p : null;
        return {
            previous: sameEra(posts.slice(0, idx).filter(notSameTranslation).pop()),
            next: sameEra(posts.slice(idx + 1).find(notSameTranslation)),
        };
    });

    // --- Sitemap helpers ---
    // Root-level game pages (those listed on /games/ plus Ludum Dare / jam
    // entries). Pages under /games/ are matched by URL prefix instead.
    const gameRootUrls = new Set([
        "/flex-engine/",
        "/ultimate-efficiency/",
        "/wire/",
        "/slappin-stackers/",
        "/mirrors/",
        "/TM495/",
        "/breakout/",
        "/tictactoe/",
        "/swing-bolt/",
        "/hexahover/",
        "/gjgdcjam/",
        "/rubiks-cube/",
        "/SwingBolt/",
        "/games/", // the games index page itself
    ]);

    function sitemapCategoryFor(page) {
        if (!page || !page.url) return "other";
        const url = page.url;
        const tags = (page.data && Array.isArray(page.data.tags)) ? page.data.tags : [];
        if (tags.includes("post")) return "post";
        if (url.startsWith("/posts/") || url.startsWith("/old-posts/")) return "post";
        if (url.startsWith("/games/") || gameRootUrls.has(url)) return "game";
        return "other";
    }

    // Build a display/sort label for a sitemap entry: prefer the page title,
    // otherwise derive from the URL with leading/trailing slashes and any
    // "/games/" prefix stripped out.
    function sitemapLabelFor(page) {
        const title = page.data && page.data.title;
        if (title) return String(title);
        let label = page.url || "";
        label = label.replace(/^\/games\//, "");
        label = label.replace(/^\/+|\/+$/g, "");
        return label || page.url;
    }

    // Returns the pages of a given category ("post" | "game" | "other"),
    // alphabetised by label. Excludes the sitemap page, the home page, and
    // the feed. Each entry is annotated with a `sitemapLabel` for display.
    eleventyConfig.addFilter("sitemapPages", (allPages, category) => {
        if (!Array.isArray(allPages)) return [];
        const result = allPages.filter((page) => {
            if (!page || !page.url) return false;
            if (page.url === "/" || page.url === "/sitemap/" || page.url === "/feed.xml") return false;
            if (page.url.startsWith("/sitemap")) return false;
            return sitemapCategoryFor(page) === category;
        });
        result.forEach((page) => { page.sitemapLabel = sitemapLabelFor(page); });
        result.sort((a, b) => a.sitemapLabel.localeCompare(b.sitemapLabel));
        return result;
    });

    // https://github.com/trunkcode/detect-external-link, The MIT License (MIT) Copyright (c) 2023 TrunkCode
    function detectExternalLink (linkToCheck, options) {
        const configHosts = [];
        const finalConfig = Object.assign({}, options);

        let isExternal = false;
        let linkOrigin = '';

        if (finalConfig.hosts) {
            let singleHost;
            for (singleHost of finalConfig.hosts) {
            if (singleHost.indexOf('http://') === 0 || singleHost.indexOf('https://') === 0) {
                configHosts.push(new URL(singleHost).hostname);
            } else {
                configHosts.push(singleHost);
            }
            }
        }

        if (linkToCheck.indexOf('http://') === 0 || linkToCheck.indexOf('https://') === 0) {
            linkOrigin = new URL(linkToCheck).hostname;
        } else if (linkToCheck.indexOf('//') === 0) {
            linkOrigin = new URL('https:' + linkToCheck).hostname;
        }

        if (linkOrigin) {
            if (configHosts.length === 0 || configHosts.indexOf(linkOrigin) === -1) {
            isExternal = true;
            }
        }

        return isExternal;
    }

    // https://github.com/trunkcode/markdown-it-external-link, The MIT License (MIT) Copyright (c) 2023 TrunkCode
    function markdownitExternalLink (md, userConfig) {
        const defaultConfig = {
            hosts: [],
            rel: 'noopener',
            target: '_blank',
        };

        // Remember old renderer, if overridden, or proxy to default renderer.
        const defaultOpenRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

        const finalConfig = Object.assign({}, defaultConfig, userConfig);

        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            if (tokens[idx] && tokens[idx].attrs) {
            const linkIndex = tokens[idx].attrIndex('href');

            if (linkIndex in tokens[idx].attrs && tokens[idx].attrs[linkIndex][1]) {
                if (detectExternalLink(tokens[idx].attrs[linkIndex][1], finalConfig)) {
                const relIndex = tokens[idx].attrIndex('rel');
                const targetIndex = tokens[idx].attrIndex('target');

                // Check `target` before adding it new one.
                if (targetIndex < 0) {
                    tokens[idx].attrPush(['target', finalConfig.target]);
                } else {
                    tokens[idx].attrs[targetIndex][1] = finalConfig.target;
                }

                // Check `rel` before adding it new one.
                if (relIndex < 0) {
                    tokens[idx].attrPush(['rel', finalConfig.rel]);
                } else {
                    tokens[idx].attrs[relIndex][1] = finalConfig.rel;
                }
                }
            }
            }

            // pass token to default renderer.
            return defaultOpenRender(tokens, idx, options, env, self);
        };
    }

    const md = markdownIt({ html: true, linkify: true })
        .use(markdownItFootnote)
        .use(markdownItFootnoteStyle)
        .use(markdownItEmDash);

    // Links to these hosts open in the same tab; everything else gets target="_blank".
    md.use(markdownitExternalLink, {
        hosts: ["ajweeks.com", "www.ajweeks.com"],
    });

    eleventyConfig.setLibrary("md", md);

    return {
        dir: {
            input: "src",
            // Build output; deployed to GitHub Pages by .github/workflows/deploy.yml (not committed).
            output: "_site"
        }
    };
};

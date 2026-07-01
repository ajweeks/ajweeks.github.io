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

module.exports = function (eleventyConfig) {
    // Passthrough copy for CSS and Images
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/_headers");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("AJ-Weeks_CV.pdf");
    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("logo.ico");
    eleventyConfig.addPassthroughCopy(".htaccess");
    eleventyConfig.addPassthroughCopy("utterly-privacy-policy.html");
    eleventyConfig.addPassthroughCopy("src/arena/**");
    eleventyConfig.addPassthroughCopy("src/utterly");
    
    // Copy all game assets (exclude .html/.md templates, which Eleventy renders
    // via their permalinks — copying them verbatim causes duplicate, broken
    // output, e.g. the mirrors MIME error).
    const gameAssetExts = [
        "js", "ts", "css", "png", "jpg", "jpeg", "gif", "webp", "svg",
        "wav", "mp3", "mp4", "webm", "ico", "ttf", "otf", "woff", "woff2",
        "eot", "json", "ase", "db", "txt", "obj", "mtl", "ini", "url",
        "glb", "gltf", "bin", "data", "wasm",
    ];
    for (const ext of gameAssetExts) {
        eleventyConfig.addPassthroughCopy(`src/games/**/*.${ext}`);
    }

    // Date filter for display
    eleventyConfig.addFilter("postDate", (dateObj) => {
        if (!dateObj) return "";
        if (DateTime.isDateTime(dateObj)) return dateObj.setLocale('en').toLocaleString(DateTime.DATE_MED);
        if (dateObj instanceof Date) {
            return DateTime.fromJSDate(dateObj).setLocale('en').toLocaleString(DateTime.DATE_MED);
        }
        return DateTime.fromISO(dateObj).setLocale('en').toLocaleString(DateTime.DATE_MED);
    });

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

    // Deduplicate posts that are translations of each other.
    // Keeps the first occurrence (in source order) per translationKey.
    eleventyConfig.addFilter("dedupeTranslations", (posts) => {
        if (!posts) return posts;
        const seen = new Set();
        const result = [];
        for (const p of posts) {
            const key = p.data && p.data.translationKey;
            if (!key) {
                result.push(p);
                continue;
            }
            if (seen.has(key)) continue;
            seen.add(key);
            result.push(p);
        }
        return result;
    });

    // Date filter for machine-readable attribute
    eleventyConfig.addFilter("dateISO", (dateObj) => {
        if (!dateObj) return "";
        if (DateTime.isDateTime(dateObj)) return dateObj.toISODate();
        if (dateObj instanceof Date) {
            return DateTime.fromJSDate(dateObj).toISODate();
        }
        return DateTime.fromISO(dateObj).toISODate();
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
        .use(markdownItEmDash);

    // Mark http://example.com and http://test.example.com as internal domain.
    md.use(markdownitExternalLink, {
    'hosts': [
        'http://ajweeks.com',
    ]
    });

    eleventyConfig.setLibrary("md", md);

    return {
        dir: {
            input: "src",
            output: "docs"
        }
    };
};

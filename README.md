# WetBond static export

WB-1 converts the 40 Claude Design pages in `wbsite/` into rendered HTML in `site/`. The baseline export remains unchanged at `023a6218`.

```bash
npm ci
npx playwright install chromium
npm run build
npm test
node scripts/integration.mjs
npm run preview
```

Deploy only `site/`. `site/routes.json` maps every source page to its clean URL. Main is the homepage, served at `/` from `index.html` with canonical `https://wetbond.com/`; `/main` is a redirect (`vercel.json` 301 to `/`; `main.html` is a noindex static fallback with canonical `/` and a meta refresh, for hosts without redirect support). All other page routes use lowercase, hyphenated source names. The host must serve extensionless paths from the matching `.html` file, redirect `.html` and trailing-slash variants to the canonical path, and return HTTP 404 with `404.html` for unknown routes. `site/vercel.json` configures clean URLs and no trailing slash for Vercel. The local preview implements clean-path lookup and an HTTP 404; it also redirects `/main`, `/main.html` and `/main/` to `/` with HTTP 301.

Every page has a `https://wetbond.com` canonical URL. The sitemap lists all 40 URLs (the homepage once, as `https://wetbond.com/`), and robots points to it. Assets are copied byte for byte; CSS is captured from the rendered stylesheet rules into content-addressed shared files. All pages use one shared export runtime.

Rendered content works without JavaScript. An inert template retains the original component markup, and the original page logic remains `text/x-dc`. The shared runtime has three asserted, minimal adaptations: read the inert template, mount into the existing rendered root, and use the original page name on a clean route. It remounts the exported component to attach its original handlers. No form backend or analytics is added; exported email and placeholder behavior stays as supplied.

The build and comparison use 2026-10-13 at noon UTC as a deterministic clock for the exported scheduling widgets. Initial static dates reflect that snapshot; the runtime updates them from the current browser clock. This remains a launch consideration, as do all other placeholders in the supplied export. Fonts remain external Google Fonts; this build does not vend their binaries.

`reports/PIXEL_PARITY.md`, `pixel-parity.json` (1440) and `mobile-375.json` (375) cover all 40 pages, both with JavaScript disabled and with the runtime enabled. `visible-text.diff` (built pages against `wbsite/` sources) must be empty. Full-page before/after/interactive screenshots for Main, Warranty and FindADealer are in `reports/screenshots/`. Comparisons use reduced motion, exported video posters, and initial component state; they do not prove all interactive states or form delivery.

Historical WB-1 evidence (not a WB-2 result): the saved full strict pixel run flags 15 residual scaled-mobile pixels on ProductsColor and Science (158 of 160 comparisons exact). Earlier fresh-context recaptures matched exactly, but the latest recheck produced About 1914, ProductsColor 32 and Science 684 changed pixels. Visual parity therefore needs Kaya review; it is not a verified all-green result. Reproduce with `npm test` and `node scripts/recheck-mobile.mjs`. Reports are local QA artifacts and are deliberately excluded from this commit. The saved visible-text diff is empty; the latest integration check passes all 40 routes, 9499 local references, 134 byte-identical assets and sampled interactions.

## WB-2: phone layout, head and landmarks

All build-time changes live in `scripts/build.mjs`, `scripts/transform.mjs` and `scripts/responsive.css`; `npm run build` reproduces `site/`.

- Every page and `404.html` declares `<meta name="viewport" content="width=device-width, initial-scale=1">`. `scripts/responsive.css` is copied to `site/shared/responsive.css` and linked after each page's own stylesheet. It contains phone-width rules only (`max-width: 760px`): warranty seals stack with text at 12px or more, the DealerVSL county-cap block and the Main stage buttons no longer push past 375px. Desktop is unchanged.
- Titles follow `<Page> | WetBond`, with page names from each page's nav label or h1 (`titles` in `scripts/transform.mjs`). Every page has `og:type`, `og:site_name`, `og:title` and `og:url` (its canonical). Share descriptions are omitted on ProductsPenetrating, Technical, Contractors and Warranty per Zola/Nova’s held-claim review. ProductsPenetrating also omits its ordinary description; ProductsRepair trims its existing description to the last full sentence, with no new words. Other descriptions retain existing copy. `og:image` uses the first content section’s existing image when available, otherwise `brand-mark.png`, a raster of the existing compact header mark. Missing descriptions use the page’s own first content paragraph.
- Favicon: `favicon.svg` is the existing compact WetBond mark from the site header (`.lg-c`), copied unchanged except for the SVG namespace; `favicon.ico` is a 32px raster of it. No new brand artwork was made.
- One `<main>` landmark wraps the content between the header (or the dealer funnel bar) and the footer on every page. On DealerVSL, an exported stray `</div>` closes the `.fp` wrapper early, so the build splits that wrapper after the funnel bar; both halves keep class `fp`.
- Template attributes the browser would act on before state (`{{…}}` in `href`, `src`, SVG geometry, number-input `value`, for example `{{pcv.img}}`, `{{pcv.mail}}`, `{{sel.href}}`, `{{wp.cx}}`, `{{c.p}}`) are renamed in the inert template to `data-wb-tpl-*`. Two asserted runtime adaptations restore them before the runtime compiles the template or re-reads it from the fetched page. Static HTML carries resolved values only.
- `npm test` keeps strict pixel parity at 1440 and, at 375, checks a mobile-device context for innerWidth 375, no horizontal overflow, no console or page errors, and no failed or 4xx/5xx requests. All 144 URL-less footer social anchors are removed from the 36 source pages that contain them and from rebuilt live/inert markup. Other footer links are preserved. The DealerVSL countdown remains unchanged.

Approved transfer-copy rows WB-12c/d/e are applied verbatim from routing-copy r3 in a separate commit. `node scripts/wb2-source-check.mjs` checks all 39 non-DealerApply sources byte-for-byte against WB-1 after only enumerated approved changes; its report lists every row and mirror. DealerApply carries approved B4/B5 volume, purchase acknowledgment and timing changes; the same check exercises all 1,680 trade/crew/volume/timing/purchase routing combinations and rejects stale revenue/capital answers. No answers are submitted or persisted.

Review artifacts committed under `docs/`: enumerated WB-1 allowed source deltas, the 40-page title/description sheet, and simulated mobile Lighthouse before/after results. Run `node scripts/wb2-review-artifacts.mjs` and `node scripts/wb2-lighthouse.mjs` to recreate them. The latter is one localhost lab run per homepage, not production evidence. WB-2 performance remains limited by existing media and client runtime; those optimizations belong to WB-3.

## SITES-PUBLIC-HOTFIX: public-release strip

Maat's public release check (`RESEARCH/MAAT_PUBLIC_RELEASE_CHECK_2026_10_22.md`, items 1–6) with Melan's defaults and Nova's rulings. Every source change is a counted, exact row in `docs/WB_PUBLIC_HOTFIX_DELTAS.json`, and `node scripts/wb2-source-check.mjs` replays them against the WB-1 baseline.

- **Routes removed** (source deleted; the host serves `404.html` with HTTP 404): `/book`, `/find-a-dealer`, `/dealer-apply`, `/dealer-schedule`, `/dealer-confirmed`, `/dealer-vsl`. Every link to them is gone. The DealerVSL testimonial (Ray's override) is unchanged in source history; the route is simply not served.
- **Intake removed:** the Main photo check (file input, local object URL, mailto summary, and its runtime handlers), the Main book request and ZIP lookup, the Contractors market questions and call booking, the Field Data notify form, the warranty-lookup and property-assessment mailtos, and the copy that promised them.
- **Lookup, coverage and verification promises removed:** CityPittsburgh coverage, "check any contractor’s certification", and dealer-lookup copy on Contractors.
- **Entity:** no sentence or JSON-LD node names WetBond Systems (LLC) as manufacturer, issuer or operator. Brand name only; no replacement entity.
- **Documents:** the non-working TDS/SDS/warranty/spec downloads on Technical and the "available on request" rows on For architects are removed. No files were added.
- **Warranty metadata:** the description is omitted (as on ProductsPenetrating).
- **No indexing:** `robots.txt` is `Disallow: /` with no sitemap, no `sitemap.xml` is published, `_headers` sets `X-Robots-Tag: noindex` on `/*`, and `vercel.json` sets the same header on every path. GitHub Pages ignores `_headers` and `vercel.json`, so every page, `main.html` and `404.html` also carry `<meta name="robots" content="noindex">`; on Pages, assets get no noindex header.

Phone and support email links remain. Their ownership is not verified by this change.

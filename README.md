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

Deploy only `site/`. `site/routes.json` maps every source page to its clean URL. Main is the homepage, served at `/` from `index.html` with canonical `https://wetbond.com/`; `/main` is a redirect (`vercel.json` 301 to `/`; `main.html` is a noindex static fallback with canonical `/` and a meta refresh, used by the local preview). All other page routes use lowercase, hyphenated source names. The host must serve extensionless paths from the matching `.html` file, redirect `.html` and trailing-slash variants to the canonical path, and return HTTP 404 with `404.html` for unknown routes. `site/vercel.json` configures clean URLs and no trailing slash for Vercel. The local preview implements clean-path lookup and an HTTP 404; it does not model production redirects.

Every page has a `https://wetbond.com` canonical URL. The sitemap lists all 40 URLs (the homepage once, as `https://wetbond.com/`), and robots points to it. Assets are copied byte for byte; CSS is captured from the rendered stylesheet rules into content-addressed shared files. All pages use one shared export runtime.

Rendered content works without JavaScript. An inert template retains the original component markup, and the original page logic remains `text/x-dc`. The shared runtime has three asserted, minimal adaptations: read the inert template, mount into the existing rendered root, and use the original page name on a clean route. It remounts the exported component to attach its original handlers. No form backend or analytics is added; exported email and placeholder behavior stays as supplied.

The build and comparison use 2026-10-13 at noon UTC as a deterministic clock for the exported scheduling widgets. Initial static dates reflect that snapshot; the runtime updates them from the current browser clock. This remains a launch consideration, as do all other placeholders in the supplied export. Fonts remain external Google Fonts; this build does not vend their binaries.

`reports/PIXEL_PARITY.md`, `pixel-parity.json` (1440) and `mobile-375.json` (375) cover all 40 pages, both with JavaScript disabled and with the runtime enabled. `visible-text.diff` (built pages against `wbsite/` sources) must be empty. Full-page before/after/interactive screenshots for Main, Warranty and FindADealer are in `reports/screenshots/`. Comparisons use reduced motion, exported video posters, and initial component state; they do not prove all interactive states or form delivery.

The saved full strict pixel run flags 15 residual scaled-mobile pixels on ProductsColor and Science (158 of 160 comparisons exact). Earlier fresh-context recaptures matched exactly, but the latest recheck produced About 1914, ProductsColor 32 and Science 684 changed pixels. Visual parity therefore needs Kaya review; it is not a verified all-green result. Reproduce with `npm test` and `node scripts/recheck-mobile.mjs`. Reports are local QA artifacts and are deliberately excluded from this commit. The saved visible-text diff is empty; the latest integration check passes all 40 routes, 9499 local references, 134 byte-identical assets and sampled interactions.

## WB-2: phone layout, head and landmarks

All build-time changes live in `scripts/build.mjs`, `scripts/transform.mjs` and `scripts/responsive.css`; `npm run build` reproduces `site/`.

- Every page and `404.html` declares `<meta name="viewport" content="width=device-width, initial-scale=1">`. `scripts/responsive.css` is copied to `site/shared/responsive.css` and linked after each page's own stylesheet. It contains phone-width rules only (`max-width: 760px`): warranty seals stack with text at 12px or more, the DealerVSL county-cap block and the Main stage buttons no longer push past 375px. Desktop is unchanged.
- Titles follow `<Page> | WetBond`, with page names from each page's nav label or h1 (`titles` in `scripts/transform.mjs`). Every page has `og:type`, `og:site_name`, `og:title`, `og:description` (the page's existing meta description) and `og:url` (its canonical). `og:image` is set only where the page's first content section has an image, using that existing asset (`ogImage` in `routes.json`).
- Favicon: `favicon.svg` is the existing compact WetBond mark from the site header (`.lg-c`), copied unchanged except for the SVG namespace; `favicon.ico` is a 32px raster of it. No new brand artwork was made.
- One `<main>` landmark wraps the content between the header (or the dealer funnel bar) and the footer on every page. On DealerVSL, an exported stray `</div>` closes the `.fp` wrapper early, so the build splits that wrapper after the funnel bar; both halves keep class `fp`.
- Template attributes the browser would act on before state (`{{…}}` in `href`, `src`, SVG geometry, number-input `value`, for example `{{pcv.img}}`, `{{pcv.mail}}`, `{{sel.href}}`, `{{wp.cx}}`, `{{c.p}}`) are renamed in the inert template to `data-wb-tpl-*`. Two asserted runtime adaptations restore them before the runtime compiles the template or re-reads it from the fetched page. Static HTML carries resolved values only.
- `npm test` keeps strict pixel parity at 1440 and, at 375, checks a mobile-device context for innerWidth 375, no horizontal overflow, no console or page errors, and no failed or 4xx/5xx requests. Footer social links (`href="#"`) and the DealerVSL countdown are unchanged (separate decisions).


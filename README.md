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

Deploy only `site/`. `site/routes.json` maps every source page to its clean URL. Main is `/main`; `/` preserves the exported meta-refresh, updated to that clean route. All page routes use lowercase, hyphenated source names. The host must serve extensionless paths from the matching `.html` file, redirect `.html` and trailing-slash variants to the canonical path, and return HTTP 404 with `404.html` for unknown routes. `site/vercel.json` configures clean URLs and no trailing slash for Vercel. The local preview implements clean-path lookup and an HTTP 404; it does not model production redirects.

Every page has a `https://wetbond.com` canonical URL. The sitemap lists all 40 URLs, and robots points to it. Assets are copied byte for byte; CSS is captured from the rendered stylesheet rules into content-addressed shared files. All pages use one shared export runtime.

Rendered content works without JavaScript. An inert template retains the original component markup, and the original page logic remains `text/x-dc`. The shared runtime has three asserted, minimal adaptations: read the inert template, mount into the existing rendered root, and use the original page name on a clean route. It remounts the exported component to attach its original handlers. No form backend or analytics is added; exported email and placeholder behavior stays as supplied.

The build and comparison use 2026-10-13 at noon UTC as a deterministic clock for the exported scheduling widgets. Initial static dates reflect that snapshot; the runtime updates them from the current browser clock. This remains a launch consideration, as do all other placeholders in the supplied export. Fonts remain external Google Fonts; this build does not vend their binaries.

`reports/PIXEL_PARITY.md` and `pixel-parity.json` cover all 40 pages at 1440 and 375, both with JavaScript disabled and with the runtime enabled. The 375 pass uses a mobile device context; its enlarged layout viewport is intentionally preserved for parity. Viewport, root-page and other launch fixes are WB-2. `visible-text.diff` must be empty. Full-page before/after/interactive screenshots for Main, Warranty and FindADealer are in `reports/screenshots/`. Comparisons use reduced motion, exported video posters, and initial component state; they do not prove all interactive states or form delivery.

The saved full strict pixel run flags 15 residual scaled-mobile pixels on ProductsColor and Science (158 of 160 comparisons exact). Earlier fresh-context recaptures matched exactly, but the latest recheck produced About 1914, ProductsColor 32 and Science 684 changed pixels. Visual parity therefore needs Kaya review; it is not a verified all-green result. Reproduce with `npm test` and `node scripts/recheck-mobile.mjs`. Reports are local QA artifacts and are deliberately excluded from this commit. The saved visible-text diff is empty; the latest integration check passes all 40 routes, 9499 local references, 134 byte-identical assets and sampled interactions.

# Website tools: how the embed slots switch on

Every tool slot on this site is already placed (see `pages` in `mockup/mockup.js`). A slot shows a preview card until its tool is listed as live, then loads the real tool from the tools host using the embed kit (`substrate-tools/docs/website-embed.md`).

To switch a tool on for this site:

1. Tools side: approve the tool's copy, list it in `TOOLS_LIVE_<BRAND>`, and add this site's origin to `EMBED_ALLOWED_ORIGINS_<BRAND>` (the staging origin now, the main domain at cutover).
2. Site side: add the tool id to `live` in `window.MK` (`mockup/mockup.js`), e.g. `"live": ["quiz", "comparison"]`.

Then, with no page edits:
- the tool's slots render `<div data-substrate-tool="…" data-brand="…">` and load `https://<tools host>/embed/v1.js` once per page;
- the sticky phone bar, hero buttons, ZIP box and desktop offer button link to the live tool (`request`, `estimator`);
- if the loader or the tool can't load within 6 seconds, the slot shows a "Call" fallback, never an empty box.

Tool ids: estimator, booking, request, dealer-application, locator, quiz, photo-quote, visualizer, care-plan, checklist, referral, portfolio, training, comparison, material-calculator.

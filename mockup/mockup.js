/* Design mockup v1. Injects the approved changes at runtime so the page source stays identical to the site. */
window.MK={"live": [], "brand": "wb", "name": "WetBond", "phone": "(844) 652-6266", "tel": "+18446526266", "ask": "Moisture Inspection", "cta": "Get my free inspection", "ziplabel": "Find a Certified Contractor and a free inspection", "host": "tools.wetbond.com", "tools": {"request": ["Request a Free Moisture Inspection", "Pick a time, tell us about the concrete. A Certified Contractor confirms."], "booking": ["Book a time", "Step 2 after a request: choose a slot on the calendar."], "estimator": ["Estimator", "Damp wall, floor or slab? Start with what you see; get the likely fix and price drivers."], "dealer-application": ["Contractor application", "Apply to become a WetBond contractor, with the overview video and a call booking."], "quiz": ["Fit check", "Is WetBond right for your wall, floor or slab? A few quick questions."], "photo-quote": ["Photo quote", "Send photos of your concrete, get a pre-assessment."], "checklist": ["Moisture checklist", "Check walls, floors, slabs and crawl spaces for moisture."], "comparison": ["Compare your options", "Drains, membranes, sealers and WetBond, side by side."], "visualizer": ["Visualizer", "See a finish on your concrete. Every image is labeled Visualization."], "care-plan": ["Care plan", "A year-round care plan for your concrete."], "material-calculator": ["Material calculator", "Product quantities for a job, from the data sheet coverage rates."], "referral": ["Referral", "Know someone whose concrete needs attention? Refer them."], "locator": ["Contractor locator", "Find a Certified Contractor by ZIP."], "portfolio": ["Project portfolio", "Real, dated jobs from Certified Contractors."], "training": ["Contractor training", "Certification training for signed-in contractors."]}, "img": ["care-plan", "checklist", "comparison", "dealer-application", "estimator", "locator", "material-calculator", "photo-quote", "portfolio", "quiz", "referral", "request", "training", "visualizer"], "home": ["quiz", "estimator", "photo-quote", "checklist", "comparison", "visualizer"], "pages": {"/for-homeowners": ["request", "quiz"], "/cost": ["estimator", "request"], "/how-it-works": ["quiz"], "/basements": ["estimator", "photo-quote"], "/crawl-spaces": ["estimator", "checklist"], "/floors": ["estimator", "visualizer"], "/repairs": ["photo-quote", "care-plan"], "/learn-why-basements-leak": ["checklist"], "/sump-pits": ["checklist"], "/compare": ["comparison"], "/products-color": ["visualizer"], "/warranty": ["care-plan"], "/technical": ["material-calculator"], "/contractors": ["dealer-application", "material-calculator", "training"], "/for-property-managers": ["referral"], "/field-data": ["portfolio"]}};
(function () {
  var M = window.MK, nr = M.brand === "nr";
  // Site root = folder above /mockup/, so the mockup works at / or under any base path.
  var ROOT = window.MK_ROOT || ((document.currentScript && document.currentScript.src) || (location.origin + "/mockup/mockup.js")).replace(/mockup\/mockup\.js.*$/, "");
  function path() {
    var href = location.href.split(/[?#]/)[0];
    var p = href.indexOf(ROOT) === 0 ? "/" + href.slice(ROOT.length) : location.pathname;
    p = p.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    if (p.length > 1) p = p.replace(/\/$/, "");
    return p || "/";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // Tools listed in MK.live are embedded for real from the tools host (docs/website-embed.md in substrate-tools).
  // Everything else shows its preview card. Going live = add the tool id to the list in mockup.js; no page edits.
  function live(k) { return (M.live || []).indexOf(k) >= 0; }
  function toolUrl(k) { return live(k) ? "https://" + M.host + "/" + k : ROOT + "mockup/tools/" + k + "/index.html"; }
  function loader() {
    if (document.getElementById("mk-embed-loader")) return;
    var s = document.createElement("script"); s.id = "mk-embed-loader"; s.async = true; s.src = "https://" + M.host + "/embed/v1.js";
    s.onerror = function () { [].forEach.call(document.querySelectorAll(".mk-live"), function (c) { c.classList.add("mk-failed"); }); };
    document.head.appendChild(s);
    // if a mount is still empty after 6s (tool gate off, origin not allowlisted), show the call-us fallback
    setTimeout(function () { [].forEach.call(document.querySelectorAll(".mk-live"), function (c) { if (!c.querySelector("iframe")) c.classList.add("mk-failed"); }); }, 6000);
  }
  function el(h) { var t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstChild; }

  window.MK_READY = function () { return nr || (!!window.__mkQuiet && (path() !== "/" || !!document.getElementById("mk-zipwrap"))); };
  function flag() {
    if (document.getElementById("mk-flag")) return;
    document.body.insertBefore(el('<div class="mk-flag mk" id="mk-flag">MOCKUP of ' + esc(M.name) + ' with the approved design changes. Not the live site.</div>'), document.body.firstChild);
  }
  function bar() {
    if (document.getElementById("mk-bar")) return;
    document.body.appendChild(el('<div class="mk-bar mk" id="mk-bar"><a class="c" href="tel:' + M.tel + '">Call</a><a class="p" href="' + toolUrl("request") + '">Free ' + esc(M.ask.replace(/^\w/, function (c) { return c; })) + '</a></div>'));
    document.body.classList.add("mk-has-bar");
  }
  function hideOldBars() {
    if (nr) { var m = document.querySelector(".mbar"); if (m) m.style.display = "none"; return; }
    var all = document.querySelectorAll("a,button");
    for (var i = 0; i < all.length; i++) {
      if (all[i].textContent.trim() !== "Call us" || all[i].closest(".mk")) continue;
      var n = all[i];
      for (var j = 0; j < 4 && n; j++) { if (getComputedStyle(n).position === "fixed") { n.style.display = "none"; break; } n = n.parentElement; }
    }
  }
  function zipCard() {
    return '<div class="mk-zip mk" id="mk-zip"><b>' + esc(M.ziplabel) + '</b><form action="' + toolUrl("estimator") + '" method="get">' +
      '<input name="zip" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" maxlength="5" placeholder="ZIP code" aria-label="ZIP code">' +
      '<button type="submit">' + esc(M.cta) + '</button></form><small><a href="' + ROOT + (nr ? 'cost/index.html' : 'cost.html') + '">See typical costs</a> · 3 quick steps · no obligation · or call <a href="tel:' + M.tel + '">' + esc(M.phone) + '</a></small></div>';
  }
  function hero() {
    if (path() !== "/" || document.getElementById("mk-zip")) return;
    if (nr) {
      var h = document.querySelector("section.hero"); if (!h) return;
      var ps = h.querySelectorAll("p"), last = ps[ps.length - 1] || h.querySelector("h1");
      last.insertAdjacentHTML("afterend", zipCard());
    } else {
      var a = [].filter.call(document.querySelectorAll("a"), function (x) { return x.textContent.trim() === "Call to find a Certified Contractor"; })[0];
      if (!a) return;
      a.parentElement.insertAdjacentHTML("beforebegin", zipCard()); a.parentElement.style.display = "none";
      if (window.MK_PLACE) window.MK_PLACE();
    }
  }
  function sections() {
    var root = document.querySelector("main") || document.getElementById("dc-root") || document.body;
    return [].filter.call(root.querySelectorAll("section"), function (s) { return !s.closest(".mk") && !s.parentElement.closest("section") && !s.closest("header,footer,nav"); });
  }
  function homeTools() {
    if (path() !== "/" || document.getElementById("mk-tools")) return;
    var s = sections(); if (!s.length) return;
    var cards = M.home.map(function (k) { return '<a href="' + toolUrl(k) + '"><strong>' + esc(M.tools[k][0]) + ' →</strong><span>' + esc(M.tools[k][1]) + '</span></a>'; }).join("");
    var first = nr ? (document.querySelector("section.hero") || s[0]).nextElementSibling || s[0] : s[0];
    first.insertAdjacentHTML("afterend", '<section class="mk-sec mk" id="mk-tools"><div class="in"><h2>Plan it yourself, in minutes</h2><p class="l">Free tools. No contact details until you ask for an inspection.</p><div class="mk-grid">' + cards + '</div></div></section>');
  }
  function toolCard(k) {
    if (live(k)) {
      setTimeout(loader, 0);
      return '<div class="mk-tool mk-live"><div data-substrate-tool="' + k + '" data-brand="' + M.brand.toUpperCase() + '" data-substrate-title="' + esc(M.name + " " + M.tools[k][0].toLowerCase()) + '" data-substrate-pixels="forward"></div>' +
        '<div class="mk-fallback tx"><h3>' + esc(M.tools[k][0]) + '</h3><p>' + esc(M.tools[k][1]) + '</p><a class="go" href="tel:' + M.tel + '">Call ' + esc(M.phone) + '</a></div></div>';
    }
    var t = M.tools[k], img = M.img.indexOf(k) >= 0 ? '<div class="shot"><img src="' + ROOT + 'mockup/img/' + k + '.jpg" alt="' + esc(t[0]) + ' preview" loading="lazy"></div>' : "";
    return '<div class="mk-tool">' + img + '<div class="tx"><h3>' + esc(t[0]) + '</h3><p>' + esc(t[1]) + '</p><a class="go" href="' + toolUrl(k) + '">Open ' + esc(t[0].toLowerCase()) + '</a>' +
      '<p class="mk-note">Mockup: the live tool loads here from ' + M.host + '. If it can\'t load, a "Call ' + esc(M.phone) + '" link shows instead.</p></div></div>';
  }
  function slots() {
    var list = M.pages[path()]; if (!list || document.getElementById("mk-slot")) return;
    var s = sections(); if (!s.length) return;
    var anchor = s[Math.min(1, s.length - 1)];
    if (path() === "/" && nr) anchor = document.getElementById("home-compare") || anchor;
    var head = list.length === 1 ? M.tools[list[0]][0] : "Tools for this step";
    anchor.insertAdjacentHTML("afterend", '<section class="mk-sec mk" id="mk-slot"><div class="in"><h2>' + esc(head) + '</h2><p class="l">' + esc(list.length === 1 ? M.tools[list[0]][1] : "Use these free tools right here on the page.") + '</p><div class="mk-slot' + (list.length > 1 ? " two" : "") + '">' + list.map(toolCard).join("") + '</div></div></section>');
  }
  // When hosted under a base path, page scripts still build root links ("/basements"); point them at the packed files.
  var BASED = ROOT !== location.origin + "/";
  function fixLinks() {
    if (!BASED) return;
    var as = document.querySelectorAll('a[href^="/"]:not([href^="//"])');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute("href"), m = h.match(/^([^?#]*)(.*)$/), p = m[1].replace(/^\/+|\/+$/g, "");
      var f = !p ? "index.html" : /\.[a-z0-9]{2,5}$/i.test(p) ? p : (nr ? p + "/index.html" : p + ".html");
      as[i].setAttribute("href", ROOT + f + m[2]);
    }
  }
  function apply() {
    if (!document.body) return;
    try { fixLinks(); flag(); hideOldBars(); bar(); hero(); homeTools(); slots(); } catch (e) { if (window.console) console.warn("mockup", e); }
  }
  var t; function soon() { clearTimeout(t); t = setTimeout(apply, 120); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
  window.addEventListener("load", apply);
  // WetBond renders parts of its pages after load; re-apply if that render replaces our blocks.
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { /* stop watching after hydration settles */ }, 8000);
})();

/* Lucide icons (ISC license) */
window.MK_ICONS={"arrow-down-to-line": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12 17V3\" /> <path d=\"m6 11 6 6 6-6\" /> <path d=\"M19 21H5\" /> </svg>", "arrow-up": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m5 12 7-7 7 7\" /> <path d=\"M12 19V5\" /> </svg>", "badge-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /> <path d=\"m9 12 2 2 4-4\" /> </svg>", "book-open": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12 7v14\" /> <path d=\"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z\" /> </svg>", "brick-wall": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <rect x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M12 9v6\" /> <path d=\"M16 15v6\" /> <path d=\"M16 3v6\" /> <path d=\"M3 15h18\" /> <path d=\"M3 9h18\" /> <path d=\"M8 15v6\" /> <path d=\"M8 3v6\" /> </svg>", "building-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\" /> <path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\" /> <path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\" /> <path d=\"M10 6h4\" /> <path d=\"M10 10h4\" /> <path d=\"M10 14h4\" /> <path d=\"M10 18h4\" /> </svg>", "calculator": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <rect x=\"4\" y=\"2\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"6\" y2=\"6\" /> <line x1=\"16\" x2=\"16\" y1=\"14\" y2=\"18\" /> <path d=\"M16 10h.01\" /> <path d=\"M12 10h.01\" /> <path d=\"M8 10h.01\" /> <path d=\"M12 14h.01\" /> <path d=\"M8 14h.01\" /> <path d=\"M12 18h.01\" /> <path d=\"M8 18h.01\" /> </svg>", "calendar-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M8 2v4\" /> <path d=\"M16 2v4\" /> <rect x=\"3\" y=\"4\" rx=\"2\" /> <path d=\"M3 10h18\" /> <path d=\"m9 16 2 2 4-4\" /> </svg>", "camera": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\" /> <circle cx=\"12\" cy=\"13\" r=\"3\" /> </svg>", "chevron-down": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m6 9 6 6 6-6\" /> </svg>", "circle-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m9 12 2 2 4-4\" /> </svg>", "circle-x": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m15 9-6 6\" /> <path d=\"m9 9 6 6\" /> </svg>", "clipboard-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <rect x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /> <path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /> <path d=\"m9 14 2 2 4-4\" /> </svg>", "cloud-rain": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\" /> <path d=\"M16 14v6\" /> <path d=\"M8 14v6\" /> <path d=\"M12 16v6\" /> </svg>", "cog": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z\" /> <path d=\"M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z\" /> <path d=\"M12 2v2\" /> <path d=\"M12 22v-2\" /> <path d=\"m17 20.66-1-1.73\" /> <path d=\"M11 10.27 7 3.34\" /> <path d=\"m20.66 17-1.73-1\" /> <path d=\"m3.34 7 1.73 1\" /> <path d=\"M14 12h8\" /> <path d=\"M2 12h2\" /> <path d=\"m20.66 7-1.73 1\" /> <path d=\"m3.34 17 1.73-1\" /> <path d=\"m17 3.34-1 1.73\" /> <path d=\"m11 13.73-4 6.93\" /> </svg>", "drafting-compass": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m12.99 6.74 1.93 3.44\" /> <path d=\"M19.136 12a10 10 0 0 1-14.271 0\" /> <path d=\"m21 21-2.16-3.84\" /> <path d=\"m3 21 8.02-14.26\" /> <circle cx=\"12\" cy=\"5\" r=\"2\" /> </svg>", "droplets": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z\" /> <path d=\"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97\" /> </svg>", "file-chart-column": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /> <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M8 18v-1\" /> <path d=\"M12 18v-6\" /> <path d=\"M16 18v-3\" /> </svg>", "file-text": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /> <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M10 9H8\" /> <path d=\"M16 13H8\" /> <path d=\"M16 17H8\" /> </svg>", "flag": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\" /> <line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\" /> </svg>", "flask-conical": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2\" /> <path d=\"M8.5 2h7\" /> <path d=\"M7 16h10\" /> </svg>", "gauge": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m12 14 4-4\" /> <path d=\"M3.34 19a10 10 0 1 1 17.32 0\" /> </svg>", "graduation-cap": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z\" /> <path d=\"M22 10v6\" /> <path d=\"M6 12.5V16a6 3 0 0 0 12 0v-3.5\" /> </svg>", "handshake": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m11 17 2 2a1 1 0 1 0 3-3\" /> <path d=\"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4\" /> <path d=\"m21 3 1 11h-2\" /> <path d=\"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3\" /> <path d=\"M3 4h8\" /> </svg>", "hard-hat": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5\" /> <path d=\"M14 6a6 6 0 0 1 6 6v3\" /> <path d=\"M4 15v-3a6 6 0 0 1 6-6\" /> <rect x=\"2\" y=\"15\" rx=\"1\" /> </svg>", "hourglass": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M5 22h14\" /> <path d=\"M5 2h14\" /> <path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\" /> <path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\" /> </svg>", "house": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" /> </svg>", "landmark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <line x1=\"3\" x2=\"21\" y1=\"22\" y2=\"22\" /> <line x1=\"6\" x2=\"6\" y1=\"18\" y2=\"11\" /> <line x1=\"10\" x2=\"10\" y1=\"18\" y2=\"11\" /> <line x1=\"14\" x2=\"14\" y1=\"18\" y2=\"11\" /> <line x1=\"18\" x2=\"18\" y1=\"18\" y2=\"11\" /> <polygon points=\"12 2 20 7 4 7\" /> </svg>", "layers": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z\" /> <path d=\"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65\" /> <path d=\"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65\" /> </svg>", "leaf": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\" /> <path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\" /> </svg>", "life-buoy": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m4.93 4.93 4.24 4.24\" /> <path d=\"m14.83 9.17 4.24-4.24\" /> <path d=\"m14.83 14.83 4.24 4.24\" /> <path d=\"m9.17 14.83-4.24 4.24\" /> <circle cx=\"12\" cy=\"12\" r=\"4\" /> </svg>", "lightbulb": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\" /> <path d=\"M9 18h6\" /> <path d=\"M10 22h4\" /> </svg>", "list": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M3 12h.01\" /> <path d=\"M3 18h.01\" /> <path d=\"M3 6h.01\" /> <path d=\"M8 12h13\" /> <path d=\"M8 18h13\" /> <path d=\"M8 6h13\" /> </svg>", "mail": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <rect x=\"2\" y=\"4\" rx=\"2\" /> <path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" /> </svg>", "map-pin": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /> <circle cx=\"12\" cy=\"10\" r=\"3\" /> </svg>", "megaphone": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m3 11 18-5v12L3 14v-3z\" /> <path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\" /> </svg>", "message-circle-question": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\" /> <path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" /> <path d=\"M12 17h.01\" /> </svg>", "monitor-smartphone": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8\" /> <path d=\"M10 19v-3.96 3.15\" /> <path d=\"M7 19h5\" /> <rect x=\"16\" y=\"12\" rx=\"2\" /> </svg>", "package": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\" /> <path d=\"M12 22V12\" /> <path d=\"m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7\" /> <path d=\"m7.5 4.27 9 5.15\" /> </svg>", "paintbrush": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m14.622 17.897-10.68-2.913\" /> <path d=\"M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z\" /> <path d=\"M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15\" /> </svg>", "palette": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\" /> <circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\" /> <circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" /> <circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\" /> <path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z\" /> </svg>", "phone": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\" /> </svg>", "receipt": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z\" /> <path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /> <path d=\"M12 17.5v-11\" /> </svg>", "recycle": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5\" /> <path d=\"M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12\" /> <path d=\"m14 16-3 3 3 3\" /> <path d=\"M8.293 13.596 7.196 9.5 3.1 10.598\" /> <path d=\"m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843\" /> <path d=\"m13.378 9.633 4.096 1.098 1.097-4.096\" /> </svg>", "scale": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\" /> <path d=\"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\" /> <path d=\"M7 21h10\" /> <path d=\"M12 3v18\" /> <path d=\"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\" /> </svg>", "shield-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /> <path d=\"m9 12 2 2 4-4\" /> </svg>", "sparkles": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\" /> <path d=\"M20 3v4\" /> <path d=\"M22 5h-4\" /> <path d=\"M4 17v2\" /> <path d=\"M5 18H3\" /> </svg>", "spray-can": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M3 3h.01\" /> <path d=\"M7 5h.01\" /> <path d=\"M11 7h.01\" /> <path d=\"M3 7h.01\" /> <path d=\"M7 9h.01\" /> <path d=\"M3 11h.01\" /> <rect x=\"15\" y=\"5\" /> <path d=\"m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2\" /> <path d=\"m13 14 8-2\" /> <path d=\"m13 19 8-2\" /> </svg>", "square-stack": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2\" /> <path d=\"M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2\" /> <rect x=\"14\" y=\"14\" rx=\"2\" /> </svg>", "sun": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"12\" cy=\"12\" r=\"4\" /> <path d=\"M12 2v2\" /> <path d=\"M12 20v2\" /> <path d=\"m4.93 4.93 1.41 1.41\" /> <path d=\"m17.66 17.66 1.41 1.41\" /> <path d=\"M2 12h2\" /> <path d=\"M20 12h2\" /> <path d=\"m6.34 17.66-1.41 1.41\" /> <path d=\"m19.07 4.93-1.41 1.41\" /> </svg>", "wind": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12.8 19.6A2 2 0 1 0 14 16H2\" /> <path d=\"M17.5 8a2.5 2.5 0 1 1 2 4H2\" /> <path d=\"M9.8 4.4A2 2 0 1 1 11 8H2\" /> </svg>", "wrench": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\" /> </svg>", "zap": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\" /> </svg>"};
/* Visual uplift v2 (mockup only). Runs after mockup.js. Uses window.MK and window.MK_ICONS.
   1) Icons: one outline set (Lucide, ISC), added only where a card's title maps to a clear meaning,
      and only when every card in that group gets one (no half-decorated grids).
   2) Measure: running text capped at ~68 characters per line.
   3) Desktop two-column sections: the heading column stays in view (sticky) instead of leaving a void.
   4) Long pages: an "On this page" jump list after the hero; a back-to-top button on phones.
   5) WetBond FAQ: questions collapse into tap-to-open rows on phones and desktop. */
(function () {
  var M = window.MK, I = window.MK_ICONS || {};
  if (!M || /noup/.test(location.search)) return;
  var nr = M.brand === "nr";

  // keyword -> icon. Order matters: first match wins. Lowercase match on the card title.
  var MAP = [
    [/warrant/, "shield-check"], [/inspection|assessment|check-?up|audit/, "clipboard-check"],
    [/reading|meter|measur|gauge|recorded|underwrit/, "gauge"], [/photo|camera|visuali/, "camera"],
    [/cost|price|quote|\$|upsold|invest/, "receipt"], [/certif|badge|professional-grade|legit/, "badge-check"],
    [/training|academy|course|learn the|certify/, "graduation-cap"], [/playbook|manual|guide|book/, "book-open"],
    [/crm|software|app\b/, "monitor-smartphone"], [/marketing|material pack/, "megaphone"],
    [/architect|engineer|spec/, "drafting-compass"], [/property manager|hoa|portfolio|multifamily|building/, "building-2"],
    [/agent|insur|underwriter/, "landmark"], [/homeowner|your home|my house|tear my house/, "house"],
    [/contractor|dealer|you replace roofs|your company/, "hard-hat"], [/phone|call/, "phone"], [/email|mail/, "mail"],
    [/address|location|map|territor|market/, "map-pin"], [/disappear|leave|gone/, "life-buoy"],
    [/sump|pump|drain/, "arrow-down-to-line"], [/crack|joint|tie-rod/, "zap"], [/mold|mildew|musty|smell/, "wind"],
    [/leak|water|wet|damp|seep|moisture|flood/, "droplets"], [/stain|chalky|efflores|white/, "sparkles"],
    [/rust|appliance/, "cog"], [/peel|paint|coating|bubbl/, "paintbrush"],
    [/uv|sun|solar|heat/, "sun"], [/algae|moss|streak|lichen/, "leaf"], [/granule|gutter/, "cloud-rain"],
    [/curl|crack|brittle|aging|age/, "hourglass"], [/repair|tune|maintenance|fix|caulk|flashing/, "wrench"],
    [/soft wash|clean|wash|rinse/, "spray-can"], [/spray|application|apply|treat/, "spray-can"],
    [/sample|test|science|chemistry|silicone|physics|lab/, "flask-conical"], [/data|record|report|field/, "file-chart-column"],
    [/sheet|document|safety|template|registration|register|agreement/, "file-text"],
    [/sustain|landfill|green|recycl/, "recycle"], [/color|finish|graphite|slate|walnut|black|sandstone|cedar/, "palette"],
    [/compare|vs\.?|versus|option|alternativ/, "scale"], [/system|layer|how it works|inside and on top|envelope/, "layers"],
    [/tote|order|product|material|package|caulk/, "package"], [/calculat/, "calculator"], [/time|day|schedule|first jobs|independent jobs/, "calendar-check"],
    [/floor|slab|garage/, "square-stack"], [/basement|wall|crawl|foundation/, "brick-wall"], [/roof|shingle/, "house"],
    [/integrity|accountab/, "scale"], [/leadership/, "flag"], [/creativ|innovation/, "lightbulb"], [/loyal|partner|referr|introduce/, "handshake"],
    [/faith|question|\?|“/, "message-circle-question"], [/good fit|good candidate|yes\b|checked/, "circle-check"],
    [/tell you no|won.t|can.t|not a fit|bond through|bond to a new|fix a failed/, "circle-x"]
  ];
  function iconFor(title) {
    var t = (title || "").toLowerCase();
    if (/^[“"]|\?$/.test(t.trim())) return "message-circle-question";
    for (var i = 0; i < MAP.length; i++) if (MAP[i][0].test(t)) return MAP[i][1];
    return null;
  }
  function svg(name, size) {
    var s = I[name]; if (!s) return "";
    return s.replace("<svg", '<svg width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false"');
  }
  function lum(rgb) { var m = (rgb || "").match(/\d+(\.\d+)?/g); if (!m) return 1; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; }
  function vis(e) { var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function mainEl() { return document.querySelector("main") || document.getElementById("dc-root") || document.body; }

  // ---------- 1) Icons on card groups
  function icons() {
    var main = mainEl();
    var all = main.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var g = all[i];
      if (g.dataset.mkIc || g.closest(".mk,nav,header,footer,table,.wbh,.wbf")) continue;
      var cs = getComputedStyle(g);
      if (cs.display !== "grid" && cs.display !== "flex") continue;
      var kids = [].filter.call(g.children, function (k) { return vis(k) && k.getBoundingClientRect().height > 56; });
      if (kids.length < 2 || kids.length > 12) continue;
      if (/sw|swatch|viz|price|calc/.test(String(g.className))) continue;
      var plan = [], ok = true;
      for (var k = 0; k < kids.length; k++) {
        var kid = kids[k];
        if (kid.querySelector("svg, img, picture, video, .ic, [class*='phimg'], [class*='media'], [role=img]")) { ok = false; break; }
        // skip cards that already show a picture (CSS background photos count)
        if ([kid].concat([].slice.call(kid.querySelectorAll("div,span,figure,a"))).some(function (e) { return /url\(/.test(getComputedStyle(e).backgroundImage); })) { ok = false; break; }
        // skip cards that already carry a marker tile (letter/number badge) or a list bullet
        var fc = kid.firstElementChild, fr = fc && fc.getBoundingClientRect();
        if (fc && fr.width <= 64 && fr.height <= 64 && getComputedStyle(fc).backgroundColor !== "rgba(0, 0, 0, 0)") { ok = false; break; }
        if (kid.tagName === "LI" && getComputedStyle(kid, "::before").content !== "none") { ok = false; break; }
        var title = kid.querySelector("h3, h4, b, strong");
        // the title must be its own line (a heading or a block-level label), not bold words inside a sentence
        if (title && !/^H[34]$/.test(title.tagName) && getComputedStyle(title).display === "inline" && title.parentElement && title.parentElement.textContent.trim().length > title.textContent.trim().length + 2) { ok = false; break; }
        if (!title || title.closest("p") && title.closest("p").textContent.trim().length > title.textContent.trim().length + 140) { ok = false; break; }
        var name = iconFor(title.textContent);
        if (!name && /rel-card|kl|keep|learn/.test((g.className || "") + " " + (g.closest("section") || {}).className)) name = "book-open";
        if (!name || !I[name]) { ok = false; break; }
        plan.push([kid, title, name]);
      }
      if (!ok) continue;
      g.dataset.mkIc = "1";
      plan.forEach(function (p) {
        var kid = p[0], title = p[1];
        var dark = lum(getComputedStyle(kid).color) > 0.6;
        var span = document.createElement("span");
        span.className = "mk-ic" + (dark ? " mk-ic-d" : "");
        span.innerHTML = svg(p[2], 22);
        // place above the title, inside the card
        var host = title.parentElement === kid || kid.tagName === "LI" ? kid : title.parentElement;
        host.insertBefore(span, host === kid ? kid.firstChild : title);
        kid.classList.add("mk-has-ic");
      });
    }
  }

  // ---------- 2) Measure
  function measure() {
    var ps = mainEl().querySelectorAll("p, li");
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (p.closest(".mk, table, nav, header, footer") || p.dataset.mkMeasure) continue;
      var w = p.getBoundingClientRect().width, fs = parseFloat(getComputedStyle(p).fontSize) || 16;
      if (w / (fs * 0.5) > 82 && p.textContent.trim().length > 90) {
        p.dataset.mkMeasure = "1";
        p.style.maxWidth = "68ch";
        if (getComputedStyle(p).textAlign === "center") { p.style.marginLeft = "auto"; p.style.marginRight = "auto"; }
      }
    }
  }

  // ---------- 3) Sticky heading columns (desktop)
  function sticky() {
    if (innerWidth < 1024) return;
    var hs = mainEl().querySelectorAll("h2");
    var head = document.querySelector("header, .wbh, .site-head"), top = 24 + (head && getComputedStyle(head).position.match(/fixed|sticky/) ? head.getBoundingClientRect().height : 0);
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i]; if (h.closest(".mk")) continue;
      if (h.dataset.mkSticky) continue;
      // Case A: the heading itself is a grid item in a 2-column grid (WetBond sections)
      var par = h.parentElement, pcs = par && getComputedStyle(par);
      if (pcs && pcs.display === "grid" && pcs.gridTemplateColumns.split(" ").length >= 2) {
        var others = [].filter.call(par.children, function (c) { return c !== h && vis(c); });
        var hb = h.getBoundingClientRect(), pb = par.getBoundingClientRect();
        if (others.length && others.every(function (c) { return c.getBoundingClientRect().left > hb.right - 4; }) && pb.height > hb.height * 2.2 && pb.height > 600) {
          h.dataset.mkSticky = "1"; h.style.position = "sticky"; h.style.top = top + "px"; h.style.alignSelf = "start";
        }
        continue;
      }
      var col = h.parentElement, row = col && col.parentElement;
      if (!row || col.dataset.mkSticky) continue;
      var rs = getComputedStyle(row);
      if (!(rs.display === "grid" || rs.display === "flex") || rs.flexDirection === "column") continue;
      var sib = [].filter.call(row.children, function (c) { return c !== col && vis(c); })[0];
      if (!sib) continue;
      var a = col.getBoundingClientRect(), b = sib.getBoundingClientRect();
      if (b.left <= a.left || b.height < a.height * 1.8 || b.height < 500 || a.height > innerHeight * 0.6) continue;
      col.dataset.mkSticky = "1"; col.style.position = "sticky"; col.style.top = top + "px"; col.style.alignSelf = "start";
    }
  }

  // ---------- 4a) On this page
  function toc() {
    if (document.getElementById("mk-toc") || document.querySelector(".on-page, [aria-label='On this page']")) return;
    var main = mainEl();
    var hs = [].filter.call(main.querySelectorAll("h2"), function (h) { return vis(h) && !h.closest(".mk, footer, header") && h.textContent.trim().length < 70; });
    if (hs.length < 6 || document.body.scrollHeight < innerHeight * 7) return;
    var first = hs[0].closest("section"); if (!first) return;
    var links = hs.map(function (h, i) {
      if (!h.id) h.id = "mk-s" + i;
      return '<a href="#' + h.id + '">' + h.textContent.trim().replace(/[<>&]/g, "") + "</a>";
    }).join("");
    first.insertAdjacentHTML("beforebegin", '<nav class="mk mk-toc" id="mk-toc" aria-label="On this page"><div class="in"><span>' + svg("list", 16) + ' On this page</span><div class="l">' + links + "</div></div></nav>");
  }
  // ---------- 4b) Back to top (phones, long pages)
  function backTop() {
    if (document.getElementById("mk-top") || document.body.scrollHeight < innerHeight * 5) return;
    var b = document.createElement("a");
    b.id = "mk-top"; b.className = "mk mk-top"; b.href = "#"; b.setAttribute("aria-label", "Back to top"); b.innerHTML = svg("arrow-up", 20);
    b.addEventListener("click", function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(b);
    var on = false;
    addEventListener("scroll", function () { var s = scrollY > innerHeight * 2; if (s !== on) { on = s; b.classList.toggle("on", s); } }, { passive: true });
  }

  // ---------- 5) WetBond FAQ accordion
  function faq() {
    if (nr || !/\/faq(\.html)?$/.test(location.pathname)) return;
    var ps = mainEl().querySelectorAll("section p");
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i], q = p.firstElementChild;
      if (p.dataset.mkFaq || !q || q.tagName !== "STRONG" || !/\?$/.test(q.textContent.trim())) continue;
      p.dataset.mkFaq = "1";
      var d = document.createElement("details"); d.className = "mk-faq";
      var s = document.createElement("summary"); s.innerHTML = '<span>' + q.innerHTML + '</span>' + svg("chevron-down", 20);
      q.remove();
      // answers that continue into following plain paragraphs stay together
      var body = document.createElement("div"); body.className = "a"; body.appendChild(p.cloneNode(true));
      var n = p.nextElementSibling;
      while (n && n.tagName === "P" && !(n.firstElementChild && n.firstElementChild.tagName === "STRONG")) { var nx = n.nextElementSibling; body.appendChild(n); n = nx; }
      d.appendChild(s); d.appendChild(body); p.replaceWith(d);
    }
  }


  // ---------- 6) Phones: long sections collapse to a preview with "Show more" (nothing removed)
  function collapse() {
    if (innerWidth > 760 || document.body.scrollHeight < innerHeight * 12) return;
    var secs = [].filter.call(mainEl().querySelectorAll("section"), function (s) {
      return !s.closest(".mk") && !s.parentElement.closest("section") && vis(s) && !s.querySelector("form, iframe, details.mk-faq, .mk-zip");
    });
    secs.forEach(function (s, i) {
      if (i < 3 || s.dataset.mkCol) return;
      var h = s.getBoundingClientRect().height;
      if (h < innerHeight * 1.6) return;
      s.dataset.mkCol = "1";
      var bgEl = s, bg = "rgba(0, 0, 0, 0)";
      while (bgEl && (bg = getComputedStyle(bgEl).backgroundColor) === "rgba(0, 0, 0, 0)") bgEl = bgEl.parentElement;
      s.style.setProperty("--mk-fade", bg === "rgba(0, 0, 0, 0)" ? "#fff" : bg);
      s.classList.add("mk-col");
      s.style.maxHeight = Math.round(innerHeight * 1.05) + "px";
      var b = document.createElement("button");
      b.type = "button"; b.className = "mk mk-more"; b.setAttribute("aria-expanded", "false");
      b.innerHTML = "<span>Show the rest of this section</span>" + svg("chevron-down", 18);
      b.addEventListener("click", function () { open(s, b); });
      s.after(b);
    });
  }
  function open(s, b) { s.classList.remove("mk-col"); s.style.maxHeight = ""; if (b) b.remove(); }
  function openFor(id) {
    var t = id && document.getElementById(id); if (!t) return;
    var s = t.closest(".mk-col"); if (s) open(s, s.nextElementSibling && s.nextElementSibling.classList.contains("mk-more") ? s.nextElementSibling : null);
  }
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest('a[href^="#"]'); if (a) openFor(a.getAttribute("href").slice(1)); }, true);
  addEventListener("hashchange", function () { openFor(location.hash.slice(1)); });

  function run() { try { faq(); icons(); measure(); toc(); backTop(); sticky(); collapse(); } catch (e) { if (window.console) console.warn("uplift", e); } if (!window.MK_READY || window.MK_READY()) document.documentElement.classList.remove("mk-wait"); }
  var t; function soon() { clearTimeout(t); t = setTimeout(run, 200); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
  addEventListener("load", function () { run(); setTimeout(run, 600); });
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("resize", soon);
})();

/* Conversion + density layer v3 (mockup only). Runs after uplift.js.
   - Section padding capped (less dead space), hero pulled up so the ZIP box sits above the fold
   - Every homeowner page gets a call to action in its hero; trust strip under the homepage ZIP box
   - Desktop: a floating offer button after the first screen
   - Phones: minimum 13px text, 44px tap targets, no orphan card cells */
(function () {
  var M = window.MK, I = window.MK_ICONS || {};
  if (!M || /noup/.test(location.search)) return;
  var nr = M.brand === "nr", ROOT = window.MK_ROOT || (location.origin + "/");
  function svg(n, s) { return (I[n] || "").replace("<svg", '<svg width="' + s + '" height="' + s + '" aria-hidden="true"'); }
  function vis(e) { var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function mainEl() { return document.querySelector("main") || document.getElementById("dc-root") || document.body; }
  function path() { var h = location.href.split(/[?#]/)[0]; var p = h.indexOf(ROOT) === 0 ? "/" + h.slice(ROOT.length) : location.pathname; p = p.replace(/\/index\.html$/, "/").replace(/\.html$/, ""); if (p.length > 1) p = p.replace(/\/$/, ""); return p || "/"; }
  function live(k) { return (M.live || []).indexOf(k) >= 0; }
  function toolUrl(k) { return live(k) ? "https://" + M.host + "/" + k : ROOT + "mockup/tools/" + k + "/index.html"; }
  var costUrl = ROOT + (nr ? "cost/index.html" : "cost.html");
  var offer = "Free " + M.ask, PRO = /contractors|architects|privacy|terms|accessibility|patents|documents|training|technical|products|404|referral|main$/;
  function tops() { return [].filter.call(mainEl().querySelectorAll("section"), function (s) { return !s.closest(".mk") && !s.parentElement.closest("section") && vis(s); }); }

  function density() {
    var cap = innerWidth >= 900 ? 72 : 44, s = tops();
    s.forEach(function (x, i) {
      if (x.dataset.mkPad === String(cap)) return; x.dataset.mkPad = String(cap);
      var c = getComputedStyle(x), pt = parseFloat(c.paddingTop), pb = parseFloat(c.paddingBottom);
      if (i === 0) { var hc = innerWidth >= 900 ? 56 : 28; if (pt > hc) x.style.paddingTop = hc + "px"; if (pb > cap) x.style.paddingBottom = cap + "px"; return; }
      if (pt > cap) x.style.paddingTop = cap + "px";
      if (pb > cap) x.style.paddingBottom = cap + "px";
    });
    // inner wrappers that carry the padding instead of the section (WetBond home)
    s.forEach(function (x) { [].forEach.call(x.children, function (k) { if (k.dataset.mkPad) return; k.dataset.mkPad = "1"; var c = getComputedStyle(k), pt = parseFloat(c.paddingTop), pb = parseFloat(c.paddingBottom), cap2 = innerWidth >= 900 ? 80 : 48; if (pt > cap2 + 8) k.style.paddingTop = cap2 + "px"; if (pb > cap2 + 8) k.style.paddingBottom = cap2 + "px"; }); });
  }

  function heroCta() {
    if (document.getElementById("mk-hcta") || path() === "/" || PRO.test(path())) return;
    var hero = tops()[0], h1 = hero && hero.querySelector("h1"); if (!h1) return;
    if ([].some.call(hero.querySelectorAll("a,button"), function (a) { return /assessment|inspection|estimate/i.test(a.textContent) && vis(a); })) return;
    var box = h1.parentElement, ps = [].filter.call(box.querySelectorAll("p"), function (p) { return !p.closest("nav") && !/crumb/.test(p.className) && vis(p); });
    var after = ps.length ? ps[ps.length - 1] : h1;
    if (after.parentElement !== box && after.parentElement.parentElement === box) after = after.parentElement;
    var dark = (function () { var m = getComputedStyle(h1).color.match(/\d+/g); return m && (+m[0] + +m[1] + +m[2]) / 3 > 150; })();
    after.insertAdjacentHTML("afterend", '<div class="mk mk-hcta' + (dark ? " d" : "") + '" id="mk-hcta"><a class="p" href="' + toolUrl("request") + '">Get my ' + offer + '</a><a class="s" href="' + costUrl + '">See typical costs</a></div>');
  }

  function trust() {
    var z = document.getElementById("mk-zip"); if (!z || document.getElementById("mk-trust")) return;
    var items = nr ? [["clipboard-check", "Free assessment, in writing"], ["shield-check", "Registered warranty"], ["circle-check", "An honest no if it won't help"]]
                   : [["clipboard-check", "Free inspection"], ["shield-check", "Written limited warranty"], ["badge-check", "Certified Contractors only"]];
    var dark = (function () { var e = z.parentElement, bg; while (e && (bg = getComputedStyle(e).backgroundColor) === "rgba(0, 0, 0, 0)") e = e.parentElement; var m = (bg || "").match(/\d+/g); return !m || (+m[0] + +m[1] + +m[2]) / 3 < 110 || nr; })();
    z.insertAdjacentHTML("afterend", '<ul class="mk mk-trust' + (dark ? " d" : "") + '" id="mk-trust">' + items.map(function (i) { return "<li>" + svg(i[0], 18) + "<span>" + i[1] + "</span></li>"; }).join("") + "</ul>");
  }

  // WetBond home: the ZIP box moves into the empty right side of the headline on desktop,
  // and directly under the headline on phones, so the offer is on the first screen.
  function wbHero() {
    if (nr || path() !== "/") return;
    var z = document.getElementById("mk-zip"), h1 = document.querySelector("main h1, #dc-root h1"); if (!z || !h1) return;
    var mode = innerWidth >= 1100 ? "d" : "m"; if (z.dataset.mkPos === mode) return; z.dataset.mkPos = mode;
    var t = document.getElementById("mk-trust"), wrap = document.getElementById("mk-zipwrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.id = "mk-zipwrap"; wrap.className = "mk"; }
    wrap.appendChild(z); if (t) wrap.appendChild(t);
    var box = h1.parentElement;
    if (mode === "d") {
      box.style.position = "relative"; box.appendChild(wrap);
      wrap.style.cssText = "position:absolute;right:0;top:" + (h1.offsetTop + 24) + "px;width:400px";
    } else {
      wrap.style.cssText = "margin:8px 0 20px";
      var after = h1; while (after.nextElementSibling && after.nextElementSibling.querySelector && /pause/i.test(after.nextElementSibling.textContent) && after.nextElementSibling.textContent.trim().length < 12) after = after.nextElementSibling;
      after.after(wrap);
    }
  }

  window.MK_PLACE = function () { try { trust(); wbHero(); } catch (e) {} };

  function fab() {
    if (document.getElementById("mk-fab") || PRO.test(path())) return;
    var a = document.createElement("a"); a.id = "mk-fab"; a.className = "mk mk-fab"; a.href = toolUrl("request");
    a.innerHTML = svg("clipboard-check", 18) + "<span>" + offer + "</span>"; document.body.appendChild(a);
    var on = false; addEventListener("scroll", function () { var s = scrollY > innerHeight * 0.9; if (s !== on) { on = s; a.classList.toggle("on", s); } }, { passive: true });
  }

  function phone() {
    if (innerWidth > 760) return;
    var main = mainEl();
    [].forEach.call(main.querySelectorAll("p,li,a,span,td,th,small,figcaption,label,button,dt,dd"), function (e) {
      if (e.dataset.mkFs || e.closest(".mk, svg, [role=img]") || !vis(e)) return;
      if (![].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim().length > 2; })) return;
      if (parseFloat(getComputedStyle(e).fontSize) < 13) { e.dataset.mkFs = "1"; e.style.fontSize = "13px"; }
    });
    [].forEach.call(document.querySelectorAll("main a, main button, main summary, footer a, .wbf a"), function (e) {
      if (e.dataset.mkTap || e.closest(".mk") || e.closest("p, td, h1, h2, h3, figcaption") || !vis(e)) return;
      var r = e.getBoundingClientRect(); if (r.height >= 44 || r.height < 8) return;
      e.dataset.mkTap = "1"; var d = getComputedStyle(e).display;
      if (d === "inline") e.style.display = "inline-flex";
      e.style.alignItems = e.style.alignItems || "center"; e.style.minHeight = "44px";
    });
    [].forEach.call(main.querySelectorAll("*"), function (g) {
      if (g.dataset.mkOrph || g.closest(".mk, table")) return; var c = getComputedStyle(g);
      if (c.display !== "grid" || c.gridTemplateColumns.split(" ").length !== 2) return;
      var k = [].filter.call(g.children, vis); if (k.length < 3 || k.length % 2 === 0) return;
      var a = k[0].getBoundingClientRect(), b = k[1].getBoundingClientRect(); if (Math.abs(a.top - b.top) > 4 || Math.abs(a.width - b.width) > 8) return;
      g.dataset.mkOrph = "1"; k[k.length - 1].style.gridColumn = "1 / -1";
    });
  }

  function run() { try { density(); heroCta(); trust(); wbHero(); fab(); phone(); } catch (e) { if (window.console) console.warn("convert", e); } if (!window.MK_READY || window.MK_READY()) document.documentElement.classList.remove("mk-wait"); }
  // WetBond pages re-render themselves after load; show the page once that has settled (capped by the page's own timer)
  var q; function quiet() { clearTimeout(q); q = setTimeout(function () { window.__mkQuiet = true; run(); }, 300); }
  quiet();
  var t; function soon() { clearTimeout(t); t = setTimeout(run, 120); if (!window.__mkQuiet) quiet(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
  addEventListener("load", function () { run(); setTimeout(run, 500); });
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("resize", function () { var zz = document.getElementById("mk-zip"); if (zz) delete zz.dataset.mkPos; [].forEach.call(document.querySelectorAll("[data-mk-pad]"), function (e) { delete e.dataset.mkPad; }); soon(); });
})();

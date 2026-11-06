# v7.6 port validation

Approved base: `7feb593aaf774f51604eda6e2185c2d5bba7d27e`. Archive SHA256: `66bfd3c62109fa43d197ff226b68fb0cb0a9b765d3fc2eb7e76c1248faa374da`. All 103 upstream manifest entries verified before import (102 brand files plus change log).

Manifest: 60 matches; 1 held-route omissions. Every other output file is listed with a SHA256 and reason in V76_MANIFEST_REPORT.json. No media substitution or optimization. Rebuild replaces the output and reproduces the same file hashes.

The only deliberate target differences are standing route holds. No internal anchor changes were needed. Existing noindex host settings remain. NANOROOF now uses flat HTML files with the existing cleanUrls configuration; its directory-based legacy tests are retained for historical use. Two trailing-whitespace lines in NANOROOF index.html are retained to preserve approved bytes.

Browser suite: all content pages at 390 and 1440; verifies noindex, JSON-LD, local responses, image decoding, runtime exceptions and overflow. The preview checks all held-route variants. External font availability, production host behavior, and all interactive states are outside this local evidence. Kaya's site-audit-snippet and v7.5 comparison, Maat review and Ray's release approval remain required. No merge, deployment or HTTPS changes performed.

The required `/home/agents/permanence-brain/README.md` and `projects/active.md` are absent on this Mac, as recorded in the approved local spec. Product authority here is the supplied PORT GO and v7.6 archive; no substitute knowledge base was inferred.

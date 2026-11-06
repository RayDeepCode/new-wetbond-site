# Site patch v7.6 — 2026-11-06 (supersedes v7.5; base v7.2, all other files unchanged)

Includes v7.3–v7.5. New in v7.6 (site copy vs warranty rev 75, 04e6b6d2…9dfdd3):
- warranty.html + floors.html: approved-flooring definition now matches rev 75 Coverage Schedule:
  adhesive also qualifies when the treated slab meets the maker's moisture limits (RH or emission
  rate) when tested as that maker requires; owner keeps any slab moisture test record from the
  flooring installer.
- Scan of all WetBond pages vs rev 75: no other warranty term on the site conflicts. The site makes no
  refund/proration, AI-review or pouring-in claims; those live in the full warranty only.
- Both dc copies patched. JSON-LD parses; inline JS passes node --check; noindex retained.
- Port order: patch73 → patch74 → patch75 → patch76 on a v7.2 tree, or diff the served files here.
Release gates unchanged. noindex stays.

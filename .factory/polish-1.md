# Polish round 1

Candidate `2e15e23a6a15b931ddd296be468dcb5cf8b6d86c` was repaired in commits `f37d8d2`, `77e5bdc`, `a1cb6ef`, and `d048868`. Screenshots are from a cold live Chromium visit at 390 px: `/.factory/evidence/live-root-390.png`, `/.factory/evidence/live-demo-390.png`, and `/.factory/evidence/live-404-390.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added `/demo` and `?demo=1`, seeded Northstar PDF, two comments, a decision, link, and two attachments; demo keys use `demo:review-packet:*`; banner, Reset demo, and Start for real work. | `@claim:demo-isolation`; live `/demo`; `live-demo-390.png` |
| F-1-2 | Added `claims.json` with one tagged observable test per retained claim. | Every command in `claims.json` passed from `/tmp/review-packet-clean-P7krDl` |
| F-1-3 | Removed the unproved account/offline-export promise; retained offline sample claim is tested. | `@claim:offline-demo`; live `/demo` |
| F-1-4 | Retained the local-file statement and proved no cross-origin request or stored selected filename. | `@claim:local-processing`; live `/demo` |
| F-1-5 | Preserved text drafts in the demo namespace and proved selected files do not survive reload. | `@claim:text-drafts`; live `/demo` |
| F-1-6 | Kept source-link behavior and exported only the safe URL. | `@claim:source-links`; live `/demo` |
| F-1-7 | Inspected seeded ZIP bytes for `index.html`, stylesheet, PDF, context, URL, and attachments. | `@claim:packet-export`; live `/demo` |
| F-1-8 | Precaches `/demo` and proves its populated state survives a first online load then offline reload. | `@claim:offline-demo`; live `/demo` |
| F-1-9 | Removed the unconfigured Plus snapshot offer and its claim. | Live `/` has no Plus offer |
| F-1-10 | Removed the account-free/readability and encryption/retention promises. | Live `/` and `/terms/` copy check |
| F-1-11 | Kept the cover statement and asserted cover markup precedes review sections. | `@claim:cover-order`; live `/demo` |
| F-1-12 | Removed price, entitlement, subscription, and free-tier marketing until billing is configured. | Live `/` has no checkout or price |
| F-1-13 | Removed the dead checkout, merchant, and refund claims. | Live `/`; no checkout link remains |
| F-1-14 | Removed visitor-facing provenance marketing; provenance remains in `design.md`. | Live `/`; `.factory/design.md` |
| F-1-15 | Rewrote the first screen around the PDF-review job, audience, sample action, outcome, and three facts. | Browser test `uses plain first-screen copy…`; live `/`; `live-root-390.png` |
| F-1-16 | Replaced vague headings/actions with Packet builder, Build a review packet, Add review context, and Download review packet. | Browser test above; live `/` |
| F-1-17 | Rewrote README sentences and documented demo URL, sample, reset, real mode, and namespaces. | `README.md`; `.factory/copy-audit.md` |
| F-1-18 | Removed the unavailable Buy Plus action rather than advertising a 404 checkout. | Live `/`; link crawl no longer includes checkout |
| F-1-19 | Added route-aware demo title/focus/announcement and a designed `/404` route; removed broad fallback so unknown URLs return the 404 document with HTTP 404. | Browser metadata test; live `/demo`; live `/not-a-real-page` → 404; `live-404-390.png` |
| F-1-20 | Added canonical, route titles, descriptions, OG/Twitter metadata, 1200×630 social art, touch icon, sitemap demo entry. | Browser metadata test; live `/`, `/demo`, `/privacy/`, `/terms/` |
| F-1-21 | Applied the same wordmark/header navigation, skip link, footer legal links, Factory attribution, and build id across app, legal, and 404 pages. | Browser metadata/skeleton test; live root/legal/404 checks |

The prior verification findings cited in the review remain covered: PDF validation, 44 px targets, landmark structure, offline behavior, and body-size checks are in the current full Playwright suite.

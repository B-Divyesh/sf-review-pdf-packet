# Polish round 2

Release candidate `cca903080edb5c51b0658f8b4d750e34eb505005` was repaired in `d6e5c6a`, `0b1c02c`, and `d7dbf49`. The deployed product is [review-pdf-packet.sociobot.in](https://review-pdf-packet.sociobot.in).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 / F-2-1 | Added a compact populated Northstar packet sheet immediately after the demo banner; it shows the PDF, a located comment, and two attachments at 390 px. Demo remains isolated under `demo:review-packet:*`. | `shows the populated demo packet in the first 390 px viewport`; [.factory/evidence/polish-2-live-demo-390.png](evidence/polish-2-live-demo-390.png); live `/demo` |
| F-1-2 | Completed `claims.json` with one tagged observable test for every retained visitor claim. | All nine listed commands passed in clean clone `/tmp/review-pdf-packet-release-HsDxu1` |
| F-1-3 | The unsupported account-free exported-folder promise remains removed. The retained offline sample promise is tested. | `@claim:offline-demo`; live `/demo` |
| F-1-4 | Files remain browser-local; selected file names do not enter storage or cross-origin requests. | `@claim:local-processing`; live `/demo` |
| F-1-5 | Text draft persistence and non-persistence of selected files remain verified in their respective namespaces. | `@claim:text-drafts` |
| F-1-6 | Source links export as links without fetching or copying their source content. | `@claim:source-links` |
| F-1-7 | Export contents include the seeded PDF, context, link, stylesheet, and attachments. | `@claim:packet-export` |
| F-1-8 | The populated demo survives a first online visit followed by offline reload. | `@claim:offline-demo` |
| F-1-9 | The unconfigured Plus snapshot offer remains absent. | live `/` content check |
| F-1-10 | Unsupported readability, encryption, and retention promises remain absent. | live `/`, `/privacy/`, `/terms/` check |
| F-1-11 | The packet cover remains before the review sections in the exported HTML. | `@claim:cover-order` |
| F-1-12 | Unconfigured price, entitlement, and free-tier marketing remain absent. | live `/` content check |
| F-1-13 | The dead checkout and merchant/refund claims remain absent. | live link crawl/check |
| F-1-14 | Visitor-facing generated-image marketing remains absent; provenance stays in `design.md`. | live `/`; `.factory/design.md` |
| F-1-15 | The first screen keeps the job-specific H1, audience sentence, sample action, outcome, and three plain facts. | `uses plain first-screen copy…`; live `/` |
| F-1-16 | Section headings and actions name their real outcomes; the demo exit now says **Open empty builder**. | Playwright route/demo tests; live `/demo` |
| F-1-17 | README stays under the sentence cap and documents demo contents, reset, exit, and storage namespaces. | `.factory/copy-audit.md`; README review |
| F-1-18 | No unavailable billing link is advertised. | live link check |
| F-1-19 / F-2-2 | Demo has its own title, canonical and route H1. Browser Back focuses the root H1 and announces “Review Packet home loaded.” | `uses plain first-screen copy and restores focus…`; live `/demo` → Back |
| F-1-20 | Root and route metadata remains product-specific and tested. | `has complete metadata…`; live root/demo/privacy/terms checks |
| F-1-21 / F-2-3 | 404 now uses exactly the shared Try sample → Builder → Privacy header order. | `has complete metadata…`; live `/not-a-real-page` |
| F-2-4 | Replaced misleading “nothing is saved” copy with truthful real-draft isolation wording; registered demo contents/lifecycle and 50 MiB boundary claims; removed the unsupported export-failure safety assurance. | `@claim:demo-isolation`, `@claim:demo-contents`, `@claim:pdf-size-limit`; `.factory/claims.json` |
| F-2-5 | Replaced “supporting files” with “attachments” in product, README, and metadata. | `.factory/copy-audit.md`; live `/` |
| F-2-6 | Renamed **Start for real** to **Open empty builder**, with an observable clear-and-return path. | `@claim:demo-contents`; live `/demo` |

## Final evidence

- Fresh clone: `/tmp/review-pdf-packet-release-HsDxu1`; `npm ci` found zero vulnerabilities.
- Every command in `.factory/claims.json` passed. The nine claim ids are demo isolation, demo contents, local processing, text drafts, PDF size limit, packet export, offline demo, source links, and cover order.
- `npm test` passed: 6 Vitest tests and 22 Playwright tests; the desktop-only viewport assertion and mobile-inapplicable offline duplicate are intentionally skipped.
- `npm run build` passed. Production gzip sizes: JavaScript 7.79 kB; CSS 5.18 kB.
- `npm audit --omit=dev` and `git diff --check` passed.
- Local and live `verify-url.sh` checks pass for root and demo; the live demo report is [.factory/evidence/polish-2-final-live-demo/verify.json](evidence/polish-2-final-live-demo/verify.json). The integrated Playwright axe scan reports zero violations.

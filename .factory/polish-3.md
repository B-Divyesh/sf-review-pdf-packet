# Polish round 3

Candidate `ce386d0379dcac4e634aed2917d06d922cf927a2` was repaired in implementation commit `deb9b8354acf7b9b0faebed85cf0ad5085fe3c35`. The deployed product is <https://review-pdf-packet.sociobot.in>.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the one-click `/demo` and `?demo=1` sandbox, realistic sample, isolated `demo:review-packet:*` keys, Reset demo, and Open empty builder. | `@claim:demo-isolation`, `@claim:demo-contents`, `@claim:offline-demo`; `evidence/polish-3-live-check.json`; live `/demo` |
| F-1-2 | Expanded the registry to ten claims, each with exactly one tagged observable test. | `.factory/claims.json`; every listed command passed separately in clean clone `/tmp/review-pdf-packet-polish-3-clean-ZIMVTq/repo` |
| F-1-3 | Kept the unsupported account-free export wording removed; retained offline Demo wording is tested. | `@claim:offline-demo`; `evidence/polish-3-live-check.json` |
| F-1-4 | Kept local processing wording and proved the complete Demo/export flow makes no cross-origin request or stores file bytes. | `@claim:local-processing`; production request log in `evidence/polish-3-live-check.json` |
| F-1-5 | Kept text-only draft persistence and file non-persistence in separate real and Demo namespaces. | `@claim:text-drafts`; `@claim:demo-isolation` |
| F-1-6 | Kept source references as links without fetching or copying their content. | `@claim:source-links`; live exported ZIP check |
| F-1-7 | Kept exact ZIP coverage for index, stylesheet, PDF, context, link, and both attachments. | `@claim:packet-export`; live exported ZIP check |
| F-1-8 | Kept the Demo shell and sample available after an online visit and offline reload. | `@claim:offline-demo`; production offline context in `evidence/polish-3-live-check.json` |
| F-1-9 | Kept the unsupported Plus snapshot offer absent. | Production Root/Demo copy scan |
| F-1-10 | Kept unsupported account-free, encryption, and legal-retention marketing absent. | Production Root, Privacy, and Terms copy scan |
| F-1-11 | Kept the exported cover before review sections. | `@claim:cover-order` |
| F-1-12 | Kept unconfigured prices, entitlements, and tier claims absent. | Production Root link and copy scan |
| F-1-13 | Kept dead checkout, merchant, and refund claims absent. | Production link scan; no checkout request |
| F-1-14 | Kept image provenance in `.factory/design.md`, not visitor marketing. | Production Root copy scan; `.factory/design.md` |
| F-1-15 | Preserved the job-first H1, audience sentence, sample action, adjacent outcome, and three facts. | `uses plain first-screen copy…`; `evidence/polish-3-live-root/screenshot-mobile.png` |
| F-1-16 | Preserved concrete section headings and result-naming actions; attachment actions are now exact. | `uses attachments consistently…`; production copy scan |
| F-1-17 | Kept README sentences within 22 words and documented the Demo, storage, reset, exit, and claim verification. | `.factory/copy-audit.md`; `README.md` |
| F-1-18 | Kept the unavailable checkout link removed. | Production link scan |
| F-1-19 | Preserved real Demo and 404 routes and extended focus/history behavior to every route. | `moves focus and announces…`; live unknown route returned 404 |
| F-1-20 | Preserved per-route titles, descriptions, canonicals, social metadata, and art; added the missing Demo standard description. | metadata test; `F-3-1`; live `/demo` |
| F-1-21 | Preserved the common header/footer, legal links, Factory attribution, and made the build id accurate. | metadata/skeleton test; all live route screenshots |
| F-2-1 | Preserved the compact populated packet above the fold at 390 px. | `shows the populated demo…`; `evidence/polish-3-live-demo/screenshot-mobile.png` |
| F-2-2 | Replaced route-specific restoration with the shared route-focus helper, covering Back and Forward. | `uses plain first-screen copy…`; `moves focus and announces…` |
| F-2-3 | Preserved the identical Try sample → Builder → Privacy header order on 404. | metadata/skeleton test; `evidence/polish-3-live-404/screenshot-mobile.png` |
| F-2-4 | Preserved truthful Demo isolation, exact lifecycle wording, 50 MiB testing, and precise export recovery copy. | `@claim:demo-isolation`, `@claim:demo-contents`, `@claim:pdf-size-limit` |
| F-2-5 | Finished the terminology repair: attachment-specific copy, counts, actions, and errors now say **attachments**. | `uses attachments consistently…`; `F-3-2`; `.factory/copy-audit.md` |
| F-2-6 | Preserved **Open empty builder** and its clear-and-return behavior. | `@claim:demo-contents`; live Demo banner |
| F-3-1 | Demo now sets the standard description to “Inspect a complete sample PDF review packet and reset it at any time.” | exact per-route metadata test; live browser result in `evidence/polish-3-live-check.json` |
| F-3-2 | Changed “links, and files”, “Add files”, file counts, and attachment errors to the single term **attachments**. | copy-regression test; live copy scan |
| F-3-3 | Added one route helper with H1 focus and a polite announcement on Home, Demo, Privacy, Terms, and 404, including history restoration. | route link/Back/Forward test; live result in `evidence/polish-3-live-check.json` |
| F-3-4 | `@claim:demo-contents` now asserts exactly 1 PDF, 2 comments, 1 decision, 1 source link, and 2 attachments before and after Reset. | claim test passed in both browser projects and in production |
| F-3-5 | Registered `attachment-size-limit`; the browser test accepts 75 MiB, rejects one extra byte, and preserves the accepted attachment. | `npm run test:e2e -- --grep @claim:attachment-size-limit`; production boundary check |
| F-3-6 | Vite injects the current Git SHA into app, legal, and 404 footers and the service-worker cache name on every build. | metadata test compares every footer with `git rev-parse`; live routes showed `Build deb9b8354acf` |

## Verification evidence

- Clean clone: `/tmp/review-pdf-packet-polish-3-clean-ZIMVTq/repo` at `deb9b8354acf7b9b0faebed85cf0ad5085fe3c35`.
- All ten claim commands passed separately. The offline claim passed desktop and intentionally skipped its duplicate mobile project.
- `npm test`: 6 unit tests and 28 browser tests passed; 2 project-specific skips.
- `npm run build`: `dist/index.html` produced; JS 20.63 kB raw / 7.72 kB gzip; CSS 18.82 kB raw / 5.18 kB gzip.
- `npm audit --omit=dev`: zero vulnerabilities. `git diff --check`: passed.
- Local and live `verify-url.sh`: Root, Demo, Privacy, and Terms passed with zero console or page errors. Local 404 also passed.
- Axe 4.10.3: zero violations on live Root, Demo, Privacy, Terms, and real HTTP 404; see `evidence/polish-3-live-axe.json`.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 20 ms, 67 KiB transfer.
- Screenshots: `evidence/polish-3-live-root/screenshot-mobile.png`, `evidence/polish-3-live-demo/screenshot-mobile.png`, and `evidence/polish-3-live-404/screenshot-mobile.png`.
- Production security headers include HSTS, CSP, nosniff, strict-origin referrer policy, and camera/microphone/geolocation denial.

No finding from review rounds 1–3 remains unresolved.

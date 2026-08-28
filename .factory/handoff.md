# Review Packet v1 handoff

## Independent verification 2 — FAIL

Candidate `71e52560bc307855f65b8337f36bbd1258f1597e` was independently verified from a clean checkout and against <https://review-pdf-packet.sociobot.in> on 2026-08-28 UTC. The live deployment matches every publicly served file in the fresh candidate build byte for byte. The prior 44 px target, nested-landmark, and stale-license offline issues are fixed: full populated axe scans have zero violations, desktop/mobile targets pass, offline/license flows have no errors, and the local-first export works.

The latest authoritative release verdict is nevertheless **FAIL** for two medium-severity acceptance defects:

- **V2-1:** a zero-byte or `text/plain` file named `.pdf` is announced as ready and exported as the reviewed document. The resulting successful packet has no readable source PDF, so invalid-input handling fails the core handoff job.
- **V2-2:** required source/attachment explanations, the sensitive-data/encryption warning, and merchant/refund copy compute to 12–13 px at desktop and 390 px, below `.factory/design.md` and the supplied design baseline's 16 px body minimum.

Fresh gates and positive evidence: `npm ci`, `npm audit --omit=dev`, `npm test` (5 unit + 13 applicable browser tests; 3 intentional skips), `npm run build`, and standalone `npx tsc --noEmit` all passed. There is no lint script/config. Full axe serious/critical findings are zero; 32 keyboard stops have visible 3 px focus; no measured target is below 44 x 44; 1440/390/320 px layouts do not overflow; reduced motion passes; free and Plus representative ZIPs pass `unzip -t`; no normal-load console/page errors or unexpected cross-origin requests were observed. The service worker update and interactive offline reload pass with cache `review-packet-v4`.

Production remains well inside size budgets: JS 20,861 B raw, CSS 16,239 B raw, no fonts, hero 51,004 B. Two fresh live Lighthouse mobile runs scored Performance 96/100, Accessibility 100/100, Best Practices 100/100, and SEO 100/100, with LCP 1.144–1.155 s and CLS 0. Headers and caching remain appropriate.

Full commands, reproductions, digests, browser evidence, boundary cases, and release recommendation are in `.factory/verification-2.md`. No product code was modified. This latest independent FAIL supersedes the repair section below for release acceptance.

## Repair 2 — release-blocking product QA resolved

All three findings in the independent report committed at `22b1dc89410e1ba110b099444d6a9938ace0a35b` against candidate `58bfb67caf9fbd110fb226bb69657b7c2912fe3f` are repaired. The product remains a Vite + TypeScript static PWA and the previously passing local-first packet workflow is unchanged.

### Findings reproduced and repaired

- **V1, undersized interactive targets:** before deployment, the still-live candidate reproduced the reported 390 px dimensions: header brand 168.42 x 32 px; Plus Privacy 43.45 x 14 px; Plus Terms 35.34 x 14 px; footer Privacy 57.94 x 24.80 px; footer Terms 47.13 x 24.80 px; footer brand 350 x 24.80 px. Header navigation, brand, sensitive-content label, Plus legal links, footer brand, and footer legal links now expose at least 44 x 44 CSS px hit regions. On the repaired 390 px build the corresponding heights are 44 px, with the sensitive label 324 x 65.06 px; desktop is also at least 44 px throughout. Legal-page links received the same baseline.
- **V2, nested complementary landmark:** the live candidate reproduced axe `landmark-complementary-is-top-level` (moderate, one node). The preview is now a labelled section rather than an `aside` nested in `main`. Full axe 4.10.3 scans now return zero violations on the builder at desktop and 390 px and on Privacy and Terms at 390 px.
- **V3, offline stale-license console error:** the live candidate reproduced `net::ERR_INTERNET_DISCONNECTED` after loading a cached valid verdict older than one day. License initialisation now checks the browser's known offline state before background verification, preserves the cached optimistic unlock, and explains that state without starting a doomed cross-origin request. The service-worker cache was advanced to `review-packet-v4` so existing installations receive the repaired shell.

Exact Playwright regressions in `tests/e2e/app.spec.ts` now fail for any visible initial click/touch target below 44 x 44 at desktop or 390 px, any axe violation or nested `main aside`, and any attempted billing request, console error, lost Plus state, or incorrect message in the stale cached-verdict offline case.

### Clean local verification — 2026-08-28 UTC

- `npm ci`: passed, 59 packages installed / 60 audited, zero vulnerabilities.
- `npm test`: passed, 5 Vitest unit tests and 13 Playwright browser tests; 3 intentional project-specific skips. This covers desktop and 390 px mobile, export/download, validation recovery, keyboard context entry, target geometry, full axe, responsive overflow, controlled offline interaction, and stale-license offline reconciliation.
- `npm run build`: passed (`tsc --noEmit && vite build`), with `dist/index.html` at the required root. Standalone `npx tsc --noEmit` and `npm audit --omit=dev` also passed. The project has no lint configuration or lint script; package/consumer checks are not applicable to this static web artifact.
- Production budgets: JavaScript 20,861 B raw / 7.81 kB gzip; CSS 16,239 B raw / 4.72 kB gzip; fonts 0 B; hero WebP 51,004 B. All remain well inside the 200/50/120/300 kB limits.
- `/opt/fleet/lib/verify-url.sh` passed for the local root, Privacy, and Terms with HTTP 200, correct title/lang/H1/main/alt/button semantics, and zero console or page errors.
- Manual browser inspection passed at 1440 px and 390 x 844 px in populated states. There is no horizontal overflow. A 21-stop desktop keyboard traversal cycles without a trap and every stop computes the designed 3 px coral focus ring. With reduced motion requested, animation and transition durations compute to `1e-05s` and scroll behavior to `auto`. Form recovery and generated-packet behavior remain covered by the automated suite and unchanged implementation.
- Privacy/request inspection found zero cross-origin requests in the free builder. No third-party script, font, analytics, ad, or fingerprinting resource is present. The intercepted billing/license tests remain limited to the Sociobot API.
- Local Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 917 ms, LCP 1,367 ms, CLS 0, TBT 7 ms.

### Deployment and live identity — 2026-08-28 UTC

- Repair code and regression coverage were committed as `c883009` and pushed to `origin/main`.
- `/opt/fleet/lib/deploy-static.sh review-pdf-packet /work/repo/dist` completed Azure Static Web Apps deployment `b3f50d27-2b22-4733-aad5-ee4d2054ad24` at `https://red-coast-097f1270f.7.azurestaticapps.net`. The custom domain `https://review-pdf-packet.sociobot.in` is Ready and returned HTTP 200.
- `verify-url.sh` passed on the Azure hostname and on the custom-domain root, Privacy, and Terms. Custom-domain root load was 849 ms with zero console/page errors.
- Fresh `dist/` and custom-domain SHA-256 digests match exactly: `index.html` `cf513d6209c2141b7a3046c643dcc04512ebbd592dba500cbfcadfe445dfc99f`; JS `609c22bd9167a4da4452431a0ffb946fbe81532be55a131b1cb8c5814395a60f`; CSS `39ec7c24305f4d474abadb51c63bed12b0d2100fcb3f2876b75bf8fdbab2b468`; `sw.js` `d7111335088e64c6dc4d2e1482512f4164111d1ddd1323bf5674f642ddd32958`.
- Live desktop and 390 px scans found zero axe violations, zero undersized visible targets, zero horizontal overflow, zero initial cross-origin requests, and zero console/page errors. The active cache is `review-packet-v4`; a controlled stale-license offline reload retained Plus, displayed the offline cached-verdict message, and produced no request or console error.
- A representative live 390 px export downloaded `live-repaired-handoff-review-packet.zip`; `unzip -t` passed for its `index.html`, `print.css`, and PDF with no errors.
- Live headers retain HTTPS/HSTS, the restrictive CSP, `nosniff`, strict-origin referrer policy, device-feature denial, 30-second revalidation for HTML, one-year immutable caching for hashed assets, and `no-cache` for `sw.js`.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 907 ms, LCP 1,207 ms, CLS 0, TBT 2 ms. Field INP is unavailable for this new site; TBT is the lab responsiveness proxy.

No release-blocking findings remain. A real paid checkout was not performed; checkout callback, verification, daily cache, restore, invalid/revoked, and offline paths are covered without sending a real payment.

---

## Independent verification 1 — FAIL

Candidate `58bfb67caf9fbd110fb226bb69657b7c2912fe3f` was independently verified on 2026-08-28 from a clean checkout and against <https://review-pdf-packet.sociobot.in>. The live HTML, hashed JS/CSS, service worker, artwork, and public support pages match the fresh candidate build byte for byte. Core packet creation/export, validation and recovery, local-only file handling, text-draft restoration, responsive layout, keyboard operation, generated packet portability, live offline reload, licensing state handling, security headers, caching, and performance budgets pass.

The release verdict is nevertheless **FAIL** because several interactive hit regions are below the contract's required 44 x 44 CSS px. On the live 390 px view these include the 168 x 32 px header brand, 43 x 14 px and 35 x 14 px Plus legal links, and 58 x 25 px and 47 x 25 px footer legal links. axe-core also reports one moderate `landmark-complementary-is-top-level` best-practice issue for the nested packet-preview `<aside>`; serious/critical axe findings are zero. A stale cached Plus license used offline works visibly but logs one expected failed-network console resource error.

Fresh verification evidence:

- `npm ci`: passed; `npm audit --omit=dev`: zero vulnerabilities.
- `npm test`: passed — 5 unit tests and 10 applicable Playwright tests; 2 intentional project-specific skips.
- `npm run build` and standalone `npx tsc --noEmit`: passed. No lint script/configuration exists.
- Production output: 20,692 B JS, 15,835 B CSS, zero font bytes, 51,004 B hero WebP.
- Live Lighthouse 12.8.2 mobile: Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 1.212 s, CLS 0, TBT 205 ms.
- Local/live `verify-url.sh`: passed; live root, Privacy, and Terms returned HTTP 200 with expected semantics and zero normal-load console/page errors.
- Live service-worker update check and controlled offline reload: passed; cache `review-packet-v3` contains the candidate hashed assets and offline form/preview stayed interactive.
- Full evidence, exact digests, scenarios, response headers, and defect reproduction are in `.factory/verification.md`.

Release recommendation: correct the undersized hit regions before acceptance, then re-run target measurement and axe. The historical builder handoff follows below and does not override this independent FAIL verdict.

---

## Historical builder handoff

## Repair 1 — offline service-worker reload

The offline reload regression from candidate `bb7630e70071906ccc2738d7a9ff3ff2a32544e5` is repaired. The service worker now matches its precached assets while ignoring response `Vary` headers and only returns the HTML shell for failed document navigations. Previously Vite Preview's `Vary: Origin` module response missed the cache after the worker took control; the worker then returned `index.html` for the JavaScript request, leaving the visible form inert. The cache is versioned as `review-packet-v3` so repaired clients install a fresh shell.

The focused Playwright regression takes the browser offline only after `navigator.serviceWorker.controller` is present, reloads, and verifies that title, preparer, and context controls update the preview with no console or page errors.

Repair verification on 2026-08-28:

- `npm test`: passed — 5 unit tests plus 10 applicable Playwright checks (2 intentional per-project skips), including desktop/mobile, keyboard context entry, axe serious/critical findings, download integration, offline controlled reload, and console/page-error checks.
- `npm run build`: passed; `dist/index.html` is at the required root. Production JavaScript is 20,692 bytes raw / 7,781 bytes gzip; CSS is 15,835 bytes raw / 4,667 bytes gzip; the hero WebP is 51,004 bytes.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <evidence-dir>`: passed locally (HTTP 200; 532 ms load; title, `lang`, one `h1`, main landmark, image alt text and button labels present; zero console/page errors). `/privacy/` and `/terms/` both returned semantic HTML pages, and the page referenced no third-party script, font, or analytics URL.
- Lighthouse 12.8.2 mobile simulation against the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, total blocking time 0 ms.

Deployment evidence on 2026-08-28:

- `/opt/fleet/lib/deploy-static.sh review-pdf-packet /work/repo/dist` uploaded deployment `b53e21d5-5fa0-405c-b316-c0929dcca6bb` successfully to Azure Static Web Apps at `https://red-coast-097f1270f.7.azurestaticapps.net`.
- The deployed default hostname passed `verify-url.sh`: HTTP 200, 693 ms load, product title/lang/landmarks/alt and button-label checks passed, and there were zero console/page errors. A production-browser service-worker check then reloaded offline and changed the preview title to `Live offline handoff` with zero errors.
- The custom CNAME was pointed at that Azure hostname. Azure's first managed-certificate attachment returned its own `unknown error`; the failed binding was removed, recreated with the same CNAME-delegated configuration, and reached `Ready`. The public product URL `https://review-pdf-packet.sociobot.in` then passed `verify-url.sh` (HTTP 200; 748 ms; expected title/lang/landmarks/alt/button labels; zero console/page errors). The live browser offline reload check also passed at that URL.

## What shipped

- A responsive, local-first Vite + TypeScript packet builder for one reviewed PDF, structured comments and decisions, source links, and supporting attachments.
- A real ZIP export containing a standalone `index.html`, print stylesheet, original PDF, and attachment folder. The generated review page is escaped against markup injection, works without this website, embeds the PDF when supported, and includes readable fallbacks.
- File/type/size/link validation, explicit sensitive-data confirmation, actionable empty and error states, keyboard paths, removal with undo, text-draft persistence, mobile layout, and offline shell caching.
- Review Packet Plus license handling per the Sociobot contract: checkout link, return-token capture and URL cleanup, local token storage, once-daily verification, cached offline unlock, revocation handling, and paste-to-restore. Plus adds local text snapshots and a custom cover note; core export and accessibility remain free.
- Paper-cut diorama identity and an original generated hero asset. Full direction, prompt, review, palette, type, spacing, motion, and provenance are in `.factory/design.md`.
- Privacy and terms pages, MIT license, security/cache headers, robots/sitemap files, and product documentation.

## Run and verify

```sh
npm install
npm test
npm run build
```

The exact build command is `npm run build`; deploy `dist/`. The final local run produced `dist/index.html` at the root.

Verification on 2026-08-28:

- `npm test`: 5 unit tests and 10 applicable Playwright tests passed across desktop Chromium and a 390px mobile viewport; 2 project-inapplicable cases skipped by design.
- Covered: successful packet download, ZIP structure/checksum, output escaping, validation/focus, keyboard context entry, mobile overflow, serious/critical axe findings, console/page errors, and an interactive offline reload.
- `npm run build`: passed. Initial JS 20,692 bytes raw / 7.78 KB gzip; CSS 15,835 bytes raw / 4.67 KB gzip; hero WebP 51,004 bytes.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, title and `lang` present, exactly one `h1`, main landmark present, no missing alt text, no unlabeled buttons, and zero console/page errors. Measured local load: 524 ms.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0, total blocking time 10 ms.
- `npm audit --omit=dev`: zero vulnerabilities.
- Visual inspection completed at 1440px desktop and 390px mobile.

## Known constraints and next steps

- The export intentionally uses uncompressed ZIP entries to avoid a large runtime dependency; its size is approximately the sum of the chosen files. The UI caps the PDF at 50 MB and attachments at 75 MB total to keep browser memory use predictable.
- Files are deliberately not persisted between reloads; text is. Users re-add the PDF and attachments after a refresh or snapshot restore.
- Exported folders are not encrypted or a legal retention system, and the interface says so before download.
- The factory must register `review-pdf-packet`, configure the production return URL, and ensure the hosted one-time price matches the displayed $12 before release. No product ID or payment-provider secret is embedded here.
- Real payment completion was not exercised because factory billing registration happens after handoff; callback parsing, caching, verification requests, restore UI, and failure/offline states are implemented.

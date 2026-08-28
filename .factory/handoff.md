# Review Packet v1 handoff

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

# Handoff — polish round 2 (accepted repair)

## Delivered

- Repaired every finding in `review-1.md`, `review-2.md`, and `polish-1.md`; the complete finding-to-evidence map is in [polish-2.md](polish-2.md).
- The one-click `/demo` path is isolated from real drafts, truthful about demo storage, and shows its seeded PDF, located comment, and attachment count above the fold at 390 px.
- Browser Back now restores root-H1 focus and announces the home route. Demo itself has a single route H1, focused on arrival. The designed 404 uses the same Try sample → Builder → Privacy header as every other route.
- Completed the claims registry and observable tests for demo isolation/lifecycle, local processing, text persistence, the 50 MiB PDF limit, export, offline demo, source links, and cover order.
- Standardised product copy on **attachments**, replaced the vague demo exit action with **Open empty builder**, and removed the unsupported export-failure safety assurance.

## Commits and deployment

- Repair commits: `d6e5c6ae88c02010f88fdd428bbb6ef040974a94`, `0b1c02cb0fc27ae509eb98afcfdcc26b4cb4a351`, and `d7dbf4953cef4f0db4537e8bdcf6f5be5ae75ba0` on `origin/main`.
- Static deployment completed with `/opt/fleet/lib/deploy-static.sh review-pdf-packet /work/repo/dist`; Azure deployment id `ac7b92a3-08c4-43ae-a65a-13df8af63fe9` succeeded.
- Live URL: <https://review-pdf-packet.sociobot.in>.

## Verification

- Exact clean checkout: `/tmp/review-pdf-packet-release-HsDxu1`; `npm ci` completed with zero vulnerabilities.
- Every command declared in `.factory/claims.json` passed from that checkout: demo isolation, demo contents, local processing, text drafts, PDF size limit, packet export, offline demo, source links, and cover order.
- `npm test` passed: 6 Vitest tests and 22 Playwright tests, with two intentional project-specific skips. `npm run build` passed and generated `dist/`. `npm audit --omit=dev` and `git diff --check` passed.
- Production build sizes: 20.85 kB JavaScript / 7.79 kB gzip and 18.82 kB CSS / 5.18 kB gzip.
- `verify-url.sh` passed locally and live for root/demo, and live for Privacy/Terms. The live checks confirm titles, language, one H1, main landmark, image alt text, button names, and no root/demo console or page errors. Playwright's integrated axe scan found zero violations.
- Final cold mobile live check: `/demo` rendered one focused H1, the seeded `northstar-launch-review.pdf`, `Page 3, pricing table`, two attachments, no horizontal overflow, and the corrected banner. Back restored focus to `#hero-title` and announced the root route. `/not-a-real-page` returned HTTP 404 with Try sample, Builder, and Privacy links.
- Evidence: [.factory/evidence/polish-2-live-demo-390.png](evidence/polish-2-live-demo-390.png), [.factory/evidence/polish-2-final-live-demo/verify.json](evidence/polish-2-final-live-demo/verify.json), and [.factory/evidence/polish-2-local-demo/verify.json](evidence/polish-2-local-demo/verify.json).

## Known gaps

None.

---

# Handoff — adversarial review 2

## Review result

No product code was changed. The independent review is **FAIL**; see [.factory/review-2.md](review-2.md) for the complete evidence and fixes.

Blocking findings: the 390 px demo first viewport does not show populated sample data; Back from Demo does not restore focus or announce the root route; and the 404 page omits the shared Builder link. The review also records unlisted/misleading claims and two small copy defects.

## Verification run for this review

- Fresh clone: `/tmp/review-pdf-packet-review-2-SgCKrl`; `npm ci` completed with zero reported vulnerabilities.
- `npm test` passed: 6 Vitest tests and 17 Playwright tests, with one intentional mobile skip.
- `npm run build` passed and produced `dist/`.
- Every command listed in `.factory/claims.json` passed from that clean clone.
- Fresh live Chromium checks covered root and demo at 390 x 844 and 1440 x 900, demo reset/exit/storage/request isolation, route metadata, browser Back, 404, and link crawl.

## Required next work

Implement every concrete fix in `.factory/review-2.md`, rerun the entire adversarial checklist from scratch, and do not mark the product accepted until the report contains zero findings.

---

# Previous handoff — polish round 1

## Delivered

- Added an isolated, one-click Northstar review-packet demo at `/demo` and `?demo=1`.
- Rewrote the landing screen and README in plain language for the PDF-review handoff job.
- Added claim registry, demo documentation, copy audit, real demo/404 routing, metadata, social image, icons, shared legal skeleton, and mobile checks.
- Removed the unconfigured paid tier and its broken checkout instead of retaining unsupported pricing claims.
- Kept the paper-cut diorama visual system and the Vite + TypeScript static-web deployment class.

## Commits and deployment

- Repair commits: `f37d8d23d974250f8f6324bfce4f1cdd6a8b5e0a`, `77e5bdc`, `a1cb6ef`, and `d048868` on `origin/main`.
- Azure Static Web Apps deployment completed through `/opt/fleet/lib/deploy-static.sh review-pdf-packet /work/repo/dist`.
- Live URL: <https://review-pdf-packet.sociobot.in>.

## Verification

- Clean clone: `/tmp/review-packet-clean-P7krDl`; `npm ci` passed with zero audit vulnerabilities; `npm test` passed (6 unit tests, 17 browser passes, 1 intentional mobile skip); `npm run build` passed.
- Every `claims.json` command passed from that clean clone: demo isolation, local processing, text drafts, packet export, offline demo, source links, and cover order.
- Current checkout: `npm test`, `npm run build`, and `npm audit --omit=dev` passed. Production JS is 19.69 kB raw / 7.52 kB gzip; CSS is 17.56 kB raw / 4.97 kB gzip.
- `verify-url.sh` passed locally and live for `/`, `/demo`, `/privacy/`, and `/terms/`: correct title, language, one H1, main landmark, alt text, labels, and no console/page errors.
- Playwright axe scan has zero violations on the populated demo. Mobile 390 px browser check reports zero horizontal overflow. Reduced-motion and keyboard/focus baseline remain in the stylesheet and browser suite.
- Live Lighthouse 12.8.2 mobile report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 0 ms. The installed Chromium exited with a tab-crash message after the complete JSON report was written; the reported audit values are intact at `/tmp/review-packet-lighthouse-12.json`.
- Cold live browser check: `/demo` had the sample banner, PDF, 3 context items, 2 attachments, only demo storage, zero console errors, and Reset/Start for real cleared demo keys. `?demo=1` also opened the demo. Demo title, canonical, Open Graph, and Twitter title all resolve to “Demo — Review Packet”. Unknown live URLs return the designed 404 document with HTTP 404.
- Evidence screenshots: `.factory/evidence/live-root-390.png`, `.factory/evidence/live-demo-390.png`, `.factory/evidence/live-404-390.png`.

## Known gaps

None for this work order. A paid tier is intentionally absent until the factory registers a functioning checkout and pricing can be truthfully tested.

## Run

```sh
npm ci
npm test
npm run build
```

Deploy `dist/` with the factory static deployment work order.

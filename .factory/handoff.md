# Handoff — polish round 1

## Delivered

- Added an isolated, one-click Northstar review-packet demo at `/demo` and `?demo=1`.
- Rewrote the landing screen and README in plain language for the PDF-review handoff job.
- Added claim registry, demo documentation, copy audit, real demo/404 routing, metadata, social image, icons, shared legal skeleton, and mobile checks.
- Removed the unconfigured paid tier and its broken checkout instead of retaining unsupported pricing claims.
- Kept the paper-cut diorama visual system and the Vite + TypeScript static-web deployment class.

## Commits and deployment

- Repair commits: `f37d8d23d974250f8f6324bfce4f1cdd6a8b5e0a`, `77e5bdc`, `a1cb6ef` on `origin/main`.
- Azure Static Web Apps deployment completed through `/opt/fleet/lib/deploy-static.sh review-pdf-packet /work/repo/dist`.
- Live URL: <https://review-pdf-packet.sociobot.in>.

## Verification

- Clean clone: `/tmp/review-packet-clean-P7krDl`; `npm ci` passed with zero audit vulnerabilities; `npm test` passed (6 unit tests, 17 browser passes, 1 intentional mobile skip); `npm run build` passed.
- Every `claims.json` command passed from that clean clone: demo isolation, local processing, text drafts, packet export, offline demo, source links, and cover order.
- Current checkout: `npm test`, `npm run build`, and `npm audit --omit=dev` passed. Production JS is 19.69 kB raw / 7.52 kB gzip; CSS is 17.56 kB raw / 4.97 kB gzip.
- `verify-url.sh` passed locally and live for `/`, `/demo`, `/privacy/`, and `/terms/`: correct title, language, one H1, main landmark, alt text, labels, and no console/page errors.
- Playwright axe scan has zero violations on the populated demo. Mobile 390 px browser check reports zero horizontal overflow. Reduced-motion and keyboard/focus baseline remain in the stylesheet and browser suite.
- Cold live browser check: `/demo` had the sample banner, PDF, 3 context items, 2 attachments, only demo storage, zero console errors, and Reset/Start for real cleared demo keys. `?demo=1` also opened the demo. Unknown live URLs return the designed 404 document with HTTP 404.
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

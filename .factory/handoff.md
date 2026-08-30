# Handoff — independent verification 4

## Result: PASS

Candidate `d2249edd5df4db03f3fee1eba2a4e6b926ef8ec2` is accepted for <https://review-pdf-packet.sociobot.in>. The live deployment exposes matching build `d2249edd5df4`.

## What was verified

- All ten separately-run claim commands in `.factory/claims.json` passed.
- `npm ci`, `npm test` (6 unit tests; 28 browser tests passed and 2 intentional mobile skips), and `npm run build` passed.
- The real workflow works on the live site: PDF/context/link/attachment packet export; clear recovery for missing title, malformed PDF, and invalid source URL; successful corrected export.
- Live desktop and 390 px mobile QA found no overflow, console/page errors, axe violations, serious/critical accessibility findings, or third-party product requests. Focus, keyboard, route feedback, and reduced-motion coverage passed.
- The live service worker controlled `/demo`, had no waiting update after `update()`, and retained the sample on an offline reload.
- Browser headers, CSP, caching, privacy behavior, and static bundle budgets passed review.

## Verification record

See `.factory/verification-4.md` for exact commands, claim-by-claim results, live URL evidence, scope limits, and severity counts.

## Run and verify

```sh
npm ci
npm test
npm run build
```

Run every command in `.factory/claims.json` independently for claim verification. Serve `dist/` for local browser checks.

Known gaps: none. The repository does not contain the requested `verify-url.sh`; equivalent live Playwright title/lang/main/alt/console checks and axe scans were run.

# Handoff — adversarial review 3

## Result

No product code was changed. The independent review is **FAIL**; see [review-3.md](review-3.md).

Blocking findings reopen the incomplete Demo metadata repair (F-1-20) and attachment terminology repair (F-2-5). Additional findings cover legal/404 route focus, exact demo-claim assertions, the unlisted 75 MiB attachment limit, and the stale footer build identifier.

## Verification performed

- Cold live Chromium checks at 390 × 844 and 1440 × 900.
- Live Demo entry, first viewport, reset, exit, real-draft sentinel, storage namespaces, request log, offline reload, Back/Forward focus, and console checks.
- Live Root, Demo, Privacy, Terms, and designed 404 metadata, structure, link, and axe checks.
- Fresh clone `/tmp/review-pdf-packet-review-3-8nJ7TY` at `d8baf8754b37de1338977e469f2455c27d186bb1`.
- All nine commands in `.factory/claims.json` passed separately.
- `npm test` passed: 6 unit tests and 22 browser tests, with 2 intentional skips.
- `npm run build` passed and produced `dist/`; JavaScript is 7.79 kB gzip.
- `/opt/fleet/lib/verify-url.sh` passed live Root, Demo, Privacy, and Terms.

## Required next work

Implement every fix in `review-3.md`, then repeat the full review from fresh browser contexts and a clean clone. Do not accept the product until the report has zero findings and every quantitative claim is fully asserted.

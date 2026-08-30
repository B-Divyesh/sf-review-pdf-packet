# Independent product verification 4

## Verdict: PASS

Candidate `d2249edd5df4db03f3fee1eba2a4e6b926ef8ec2` meets the supplied product contract for Review Packet.

- Tested commit: `d2249edd5df4db03f3fee1eba2a4e6b926ef8ec2`
- Tested URL: <https://review-pdf-packet.sociobot.in>
- Date: 2026-08-30 UTC
- Artifact: static web/PWA. There are no server-side product endpoints, library/CLI surface, account flow, or paid unlock UI to test; concurrency, API allowance, sign-in, and consumer-install checks do not apply.

## First-read result

Cold-loading the live root answered all mandatory questions in plain words: it packages a PDF for external review; it is for people handing a reviewed document to an external reviewer; and the first clear action is **Try it with sample data**. That action opens a complete, resettable packet. The first cold load made only same-origin requests and showed build `d2249edd5df4`.

## Claim verification

`.factory/claims.json` exists and declares ten claims. Each declared command was run separately from the demo entry point and passed:

| Claim | Command result |
| --- | --- |
| `demo-isolation` | PASS — 2 browser projects |
| `demo-contents` | PASS — 2 browser projects |
| `local-processing` | PASS — 2 browser projects |
| `text-drafts` | PASS — 2 browser projects |
| `pdf-size-limit` | PASS — exact 50 MiB accepted; one extra byte rejected, in 2 browser projects |
| `attachment-size-limit` | PASS — exact 75 MiB accepted; one extra byte rejected without losing the accepted file, in 2 browser projects |
| `packet-export` | PASS — 2 browser projects |
| `offline-demo` | PASS — desktop project; mobile is the test's explicit skip |
| `source-links` | PASS — 2 browser projects |
| `cover-order` | PASS — 2 browser projects |

## Local gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 59 packages installed; audit reported zero vulnerabilities |
| `npm test` | PASS — Vitest 6/6; Playwright 28 passed, 2 intentional mobile skips |
| `npm run build` | PASS — type checking and Vite build completed; `dist/` produced |
| `git diff --check` | PASS before verification-document changes |

No lint script or lint configuration is supplied; TypeScript checking is part of the production build. Production output is within the static-product budgets: JS 20.63 kB raw / 7.72 kB gzip (limit 200 kB), CSS 18.82 kB raw / 5.18 kB gzip (limit 50 kB), no font payload, and hero WebP 51 kB (limit 300 kB).

## Product, recovery, accessibility, and mobile QA

- The live demo contained the promised PDF, two comments, one decision, one source link, and two attachments. Reset and empty-builder behavior are covered by the separate claim tests.
- Downloading the demo produced `northstar-launch-review-review-packet.zip` without a browser download failure.
- On the live empty builder, export reported and focused the missing title. A file with PDF MIME but no readable `%PDF-` header was rejected. An invalid source URL produced field-level and form-level guidance, focused the field, and, after correction, exported `release-candidate-review-review-packet.zip` successfully.
- Desktop and 390 px views were visually inspected. The mobile document width equalled the 390 px viewport; the demo preview is visible in the first phone viewport. There was no horizontal overflow.
- Keyboard smoke testing found the designed visible 3 px focus treatment and a working skip link. The existing browser suite covers keyboard context entry, route focus, and Back/Forward announcements.
- Fresh axe-core 4.10.3 Playwright scans of the live desktop and 390 px demo returned zero violations, including zero serious or critical findings. There were no console or page errors.
- With reduced motion enabled, sampled transition and animation durations were `1e-05s`.

## Privacy, PWA, headers, cache, and deployment identity

- Live root and demo browser request logs contained only `https://review-pdf-packet.sociobot.in` documents, local assets, art, and route script. No analytics, advertising, third-party fonts/scripts, document uploads, or external source-link fetch occurred.
- Root, Demo, and Privacy responses returned HSTS, `nosniff`, `strict-origin-when-cross-origin`, a restrictive self-only CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation-denying Permissions Policy. Root HTML uses short revalidation; hashed JS has `public, max-age=31536000, immutable`; service worker has `no-cache`.
- On live `/demo`, the service worker was active and controlling, `registration.update()` left no waiting update, and an offline reload retained the seeded PDF and context without errors.
- The live root contains build `d2249edd5df4`, matching the candidate. `/does-not-exist` returned HTTP 404 and the designed 404 route is covered by the browser suite.

## Defects

None found. Severity counts: critical 0, high 0, medium 0, low 0.

## Scope note

The requested `verify-url.sh` is not present in this repository. Its title/lang/main/alt/console checks were independently performed through Playwright, alongside the axe scan. Per the work-order resource restriction, no non-product external links were followed.

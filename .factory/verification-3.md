# Independent product verification 3

## Verdict: PASS

Candidate `b33d4da639506cacfd64a4d77f4bca3b5c175e6d` satisfies the supplied static-web product contract. Fresh production evidence confirms that <https://review-pdf-packet.sociobot.in> is byte-identical to the candidate build and that the local-first packet workflow, safety/recovery paths, accessibility, privacy posture, PWA offline behavior, browser policy, and delivery budgets work as required.

- Tested commit: `b33d4da639506cacfd64a4d77f4bca3b5c175e6d`
- Tested URL: <https://review-pdf-packet.sociobot.in>
- Date: 2026-08-28 UTC
- Starting state: clean `main` checkout at the exact candidate SHA; `origin/main` matched
- Artifact: static web/PWA. Library/CLI consumer, backend concurrency/persistence/health/build-identity checks do not apply.

## Release defects

None found. Severity counts: critical 0, high 0, medium 0, low 0.

The previous verification defects are fixed in this candidate: unreadable PDF payloads are rejected, body/safety prose is at least 16 px, visible targets are at least 44 by 44 CSS px, there is no nested complementary landmark, and controlled offline reload remains interactive.

## Clean gates

Executed with Node `v22.23.2` and npm `10.9.8`:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 59 packages installed; audit reported zero vulnerabilities |
| `npm audit --omit=dev` | PASS — zero vulnerabilities |
| `npm test` | PASS — Vitest 6/6; Playwright 17 passed, 3 intentional project-specific skips (45.2 s) |
| `npm run build` | PASS — `tsc --noEmit && vite build`; `dist/index.html` produced |
| `git diff --check` | PASS |

There is no lint script or lint configuration in the repository; TypeScript checking is part of the exact production build.

Production output is within the required budgets: JavaScript 21,379 B raw / 7.97 kB build gzip (limit 200 kB), CSS 16,239 B raw / 4.72 kB build gzip (limit 50 kB), no font payload, and hero WebP 51,004 B (limit 300 kB).

Fresh Lighthouse 12.8.2 mobile results on production: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 0 ms, total transfer 67 KiB.

## Product and recovery evidence

Against the live URL, a representative packet with a PDF, preparer, one comment, one decision, HTTPS source link, and two attachments downloaded as `external-review-q3-launch-review-packet.zip`. `unzip -t` passed and the archive contained exactly `index.html`, `print.css`, `launch.pdf`, `attachments/notes.txt`, and `attachments/timeline.csv`. The extracted review page contains the structured context, a `noopener noreferrer` source link, attachment links, and a standalone print stylesheet; no source workspace content is embedded.

- Draft title/context survived reload; selected files correctly did not persist.
- Missing title reports “Add a packet title before exporting” and focuses `#packet-title`.
- A PDF-MIME file without a `%PDF-` header is rejected before export; a missing-MIME valid-header PDF is accepted.
- `javascript:` source links are blocked, the invalid field is focused, and correcting input can continue without reload.
- Exact 50 MiB PDF is accepted; 50 MiB + 1 byte is rejected without replacing the valid PDF. Exact 75 MiB attachments are accepted; one additional byte is rejected without removing the accepted attachment.
- Existing automated checks additionally cover empty PDF, spoofed MIME, successful export/download, escaping user markup, checksum/ZIP structure, undo, keyboard context entry, and required sensitive-content confirmation.

## Accessibility, responsive, and visual evidence

- `/opt/fleet/lib/verify-url.sh` passed production root: HTTP 200; title, `lang="en"`, one H1, main landmark, image alt, and button labels present; no console/page errors (738 ms observed load).
- Fresh axe-core 4.10.3 scans of root, Privacy, and Terms returned zero violations; serious/critical findings are zero.
- Desktop Tab traversal followed the skip link through all controls in logical order and wrapped without a trap. Each sampled interactive element showed the designed `rgb(181, 69, 51) solid 3px` focus outline. Existing Playwright coverage verifies Enter keyboard context entry.
- At the required 390 px viewport, `scrollWidth === clientWidth` and the full visible target audit found zero target under 44 by 44 CSS px. Desktop and 390 px visual inspection found the builder usable, clear, and intentionally stacked on mobile.
- With `prefers-reduced-motion: reduce`, sampled transition duration was `1e-05s` and scroll behavior was `auto`; there is no looping or flashing motion.
- The recorded product-specific paper-cut visual system, warm explicit single-mode palette, system/Georgia typography, motion policy, and original-image provenance agree with `.factory/design.md` and were visually evident in both viewports.

## Privacy, security, deployment, and PWA evidence

- Normal root load made zero cross-origin requests. Source inspection and browser request recording found no analytics, advertising, third-party font/script, or document upload. Files remain browser-memory-only; the stated local-storage text-draft behavior was observed. The only implemented cross-origin route is the declared Sociobot checkout/license API.
- Privacy and Terms are live at `/privacy/` and `/terms/`, accurately disclose local storage, non-persisted files, readable/non-encrypted exports, billing verification, and no legal-retention claim.
- Live responses include HSTS, restrictive CSP (`default-src 'self'`; connect only to Sociobot API), `nosniff`, `strict-origin-when-cross-origin`, and a camera/microphone/geolocation-denying Permissions Policy. Root HTML is short-cache/revalidated; hashed JS/CSS are `max-age=31536000, immutable`; `sw.js` is `no-cache`; a conditional asset request returned 304 and Brotli was served.
- Candidate/live byte comparisons passed for root HTML, hashed JS, hashed CSS, service worker, and hero artwork. SHA-256: index `572be16fbc7d73b3f6badf53607846115f24f249a0323c1ae156816c43470915`; JS `a69099289ef3314fd55e2affbf0da37033206a3036c373b864e6b91403148fc3`; CSS `47b45b8b1d43995ec409af589df54a6f6a8224e7793800aa095f74102d7ef44b`; SW `ed8d1250202faf22a591e1757e508332063602b63c9a7fcd5a40de0114360401`; art `455bb29f4c311030d79596a69644f90479a884a23a5c738da352821bf0a965cd`.
- Production service worker was activated, controlled the page, had no waiting update after `registration.update()`, and an offline reload stayed editable and updated the preview. Existing automated coverage also verifies stale cached Plus verdict handling offline without a verification request.

## Coverage limitation

No real paid checkout was transacted: no test license/card or authorization to purchase was supplied. The checkout target, return-token/license code paths, cached offline behavior, and restore UI are present and exercised by automated/in-browser non-payment tests. This does not block the brief's free core builder/export acceptance.

## Recommendation

Accept and deploy/retain this candidate. Re-run this suite after any payment-registration or service-worker change.

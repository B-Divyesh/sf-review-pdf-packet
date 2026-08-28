# Independent product verification 2

## Verdict: FAIL

Candidate `71e52560bc307855f65b8337f36bbd1258f1597e` is deployed at <https://review-pdf-packet.sociobot.in> and the core packet workflow works, including offline use. The earlier target-size, landmark, and stale-license defects are repaired. This candidate nevertheless fails the supplied acceptance contract because invalid PDF content is accepted as ready and exported, and important body/safety copy is rendered below the product's documented 16 px minimum.

- Tested commit: `71e52560bc307855f65b8337f36bbd1258f1597e`
- Tested URL: <https://review-pdf-packet.sociobot.in>
- Verification date: 2026-08-28 UTC
- Starting state: clean `main` checkout at the exact candidate SHA; `origin/main` matched
- Report file: `.factory/verification-2.md` because `.factory/verification.md` already records the first independent run
- Artifact class: static web/offline app; library/CLI consumer installation and backend concurrency, persistence, health, and build-identity endpoint checks are not applicable

## Defects

### V2-1 — Medium — an empty or non-PDF file named `.pdf` is accepted and exported as the reviewed document

The document picker promises “PDF only” and reports accepted files as “ready to package,” but validation accepts either a PDF MIME type **or** a `.pdf` filename. It does not reject a zero-byte file or inspect content.

Fresh local and live reproductions:

1. Select a `text/plain` payload named `spoofed.pdf`, or an empty file named `empty.pdf`.
2. The preview changes to that filename and the status reports that it is ready.
3. Complete the required title and recipient confirmation and export.
4. The ZIP succeeds, but its reviewed-document entry is not a readable PDF.

This is an invalid-input and boundary-value failure in the core job: the sender can receive a success result whose main document cannot be reviewed. A normal `.txt` file is correctly rejected, and the upper size boundaries work: exactly 50 MiB is accepted, 50 MiB + 1 byte is rejected without losing the prior file, exactly 75 MiB of attachments is accepted, and one additional byte is rejected. A maximum-sized 125 MiB packet also exported successfully in 3.782 seconds.

### V2-2 — Medium — required explanatory and safety prose is below the visual contract's body-size minimum

`.factory/design.md` states “Body is at least 16px,” and the attached design acceptance baseline repeats a 16 px web minimum. Computed styles on both 1440 px desktop and the required 390 px mobile view show important prose below that threshold, with no mobile enlargement:

- Source-link authorisation explanation: 13 px.
- Attachment-copy explanation: 13 px.
- Exported-folder sensitive-data/encryption/retention warning: 13 px.
- Checkout merchant-of-record/refund/license-revocation copy: 12 px.
- Privacy/provenance footer copy: 13 px.

The full root-page audit found 22 visible text-bearing elements below 16 px when labels and editorial kickers are included. Contrast and axe checks pass, but the essential safety and payment prose above is body copy, not merely a decorative label. This is most apparent in the populated 390 px layout and conflicts directly with the product-specific visual contract.

## Clean checkout and repository gates

Executed from the clean candidate checkout with Node.js `v22.23.2` and npm `10.9.8`:

```text
npm ci                         PASS — 59 packages installed; 60 audited
npm audit --omit=dev           PASS — zero vulnerabilities
npm test                       PASS
  Vitest                       5/5 passed
  Playwright                   13 passed, 3 intentional project-specific skips
npm run build                  PASS — tsc --noEmit && vite build
npx tsc --noEmit               PASS
git diff --check               PASS before report changes
```

There is no lint script and no ESLint or other separate lint configuration. The exact production build created `dist/index.html` at the required root.

Production output:

| Resource | Raw | Gzip/transfer | Contract budget |
| --- | ---: | ---: | ---: |
| JavaScript | 20,861 B | 7.81 kB build gzip / 7,842 B live | <= 200 KB |
| CSS | 16,239 B | 4.72 kB build gzip / 4,939 B live | <= 50 KB |
| Fonts | 0 B | 0 B | <= 120 KB |
| Hero WebP | 51,004 B | 51,090 B live transfer | <= 300 KB |

## End-to-end and invalid-input evidence

The following independent cases passed locally unless the defect above says otherwise; the representative full packet and invalid `.pdf` case were repeated against the live URL.

- Empty states are present. Export validation reports and focuses, in order, a missing title, missing PDF, invalid source URL, and missing sensitive-recipient confirmation. Correcting each field recovers without a reload.
- A representative packet included a PDF, preparer, comment, decision, HTTPS source link, and three attachments. Both local and live downloads succeeded with the expected filename.
- `unzip -t` passed. The output contained `index.html`, `print.css`, the PDF, and every attachment. Case-insensitive duplicate names became `notes.txt` and `NOTES-2.txt`; unsafe path characters stayed inside `attachments/`.
- User-authored `<`, `>`, `&`, and link text were escaped. A `javascript:` source was blocked; the recovered HTTPS link retained `noopener noreferrer`. No third-party document content was embedded.
- The extracted packet opened directly from `file://` at 1440 px and 390 px with its stylesheet applied, one H1 and main landmark, valid relative PDF/attachment links, no overflow, and zero normal-load console/page errors. Full axe scans returned zero violations.
- Text drafts survived reload, while selected files correctly did not. Malformed local-storage draft JSON recovered to an editable empty state.
- PDF, attachment, and context removal each exposed Undo and restored the item correctly.
- The exact 50/75 MiB caps and maximum combined export passed as described under V2-1.
- A live Plus flow with an intercepted valid Sociobot verdict saved and restored a named text snapshot, deliberately omitted files from the snapshot, and exported its custom handoff note. Empty restore, callback URL stripping, token storage, valid once-daily cache, pasted restore, invalid/revoked lockout, request failure, cached stale-verdict offline unlock, and checkout URL were exercised without making a purchase.

## Accessibility, responsive behavior, and visual inspection

- Full axe-core 4.10.3 scans returned zero violations on populated local/live root pages at desktop and 390 px, on Privacy and Terms at both sizes, and on the extracted packet. Serious/critical findings: zero.
- Semantics pass: `lang="en"`, descriptive title, exactly one H1 and main landmark, no nested complementary landmark, labelled controls, image alt text, skip link, errors/status regions, and ordered headings.
- A real Tab traversal covered 32 interactive stops in logical order and cycled without a trap. Every interactive stop computed the designed 3 px solid coral focus ring; Enter/Space paths used by the builder worked.
- Independent populated-state target measurement found no visible target below 44 x 44 CSS px at desktop or 390 px. This confirms the earlier target defect is fixed.
- Populated layouts at 1440 px and 390 x 844 px had `scrollWidth === clientWidth`. Reflow checks at 640, 390, and 320 CSS px also had no horizontal overflow, including long title/link content.
- Desktop and populated 390 px screenshots were visually inspected. The paper-dossier hierarchy, responsive stacking, status feedback, and preview remained clear; V2-2 is the typography exception.
- With `prefers-reduced-motion: reduce`, animation and transition durations computed to `1e-05s`, scroll behavior to `auto`, and no looping/flashing motion exists.
- `/opt/fleet/lib/verify-url.sh` passed local and live root, Privacy, and Terms with HTTP 200, expected title/lang/H1/main/alt/button semantics, and zero console/page errors.

## Privacy, requests, and response policy

- Free initial and populated sessions made zero cross-origin requests. Selected file bytes stayed in browser memory. Lighthouse recorded only five same-origin resources plus one inline data image.
- No third-party font, script, analytics, advertising, fingerprinting, or tracking request was observed. The only application cross-origin path is the expected Sociobot checkout/license API.
- Privacy and Terms accurately describe local text storage, non-persistence of files, license verification, readable exports, merchant of record, and the lack of encryption/legal retention.
- Live HTTPS responses include HSTS, a restrictive CSP, `X-Content-Type-Options: nosniff`, `strict-origin-when-cross-origin`, and camera/microphone/geolocation denial.
- HTML/legal pages use `public, must-revalidate, max-age=30`; hashed JS/CSS and the hero use one-year immutable caching; `sw.js` uses `no-cache`. Conditional requests returned HTTP 304. JS/CSS/HTML are Brotli-compressed where appropriate.

## Deployment identity, offline behavior, and performance

Every publicly served build file matched the fresh candidate `dist/` byte for byte: root and legal HTML, hashed JS/CSS and source map, service worker, artwork, favicon, legal stylesheet, robots, and sitemap. `staticwebapp.config.json` is deployment configuration rather than a served artifact; a direct URL is rewritten to the app shell.

Key candidate/live SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `cf513d6209c2141b7a3046c643dcc04512ebbd592dba500cbfcadfe445dfc99f` |
| `assets/index-BiOlBGnp.js` | `609c22bd9167a4da4452431a0ffb946fbe81532be55a131b1cb8c5814395a60f` |
| `assets/index-DFINsMQs.css` | `39ec7c24305f4d474abadb51c63bed12b0d2100fcb3f2876b75bf8fdbab2b468` |
| `sw.js` | `d7111335088e64c6dc4d2e1482512f4164111d1ddd1323bf5674f642ddd32958` |
| `review-packet-diorama.webp` | `455bb29f4c311030d79596a69644f90479a884a23a5c738da352821bf0a965cd` |

The live service worker completed `registration.update()` with no waiting/installing worker, controlled the page, and held only `review-packet-v4`. Its cache contained the candidate root, hashed JS/CSS, artwork, favicon, legal CSS, Privacy, and Terms. A controlled offline reload stayed editable and updated the preview; a stale cached Plus license remained unlocked without a verification attempt, failed request, console error, or page error.

Two successful fresh Lighthouse 12.8.2 mobile runs scored:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 96 | 100 | 100 | 100 | 1,155 ms | 0 | 224 ms |
| 2 | 100 | 100 | 100 | 100 | 1,144 ms | 0 | 55 ms |

Transferred page weight was about 68.7 kB. Field INP is unavailable for this new site; the reported lab TBT range is retained rather than presented as INP.

## Release recommendation

Do not accept candidate `71e52560bc307855f65b8337f36bbd1258f1597e` under the supplied contract. Reject empty/non-PDF content while retaining a reasonable fallback for missing MIME metadata, and bring explanatory/safety/payment body copy to the documented minimum size. Then rerun invalid-file export, populated 390 px layout, and the existing clean gate suite. No product code was changed during this verification.

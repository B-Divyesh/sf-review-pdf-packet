# Independent product verification

## Verdict: FAIL

Candidate `58bfb67caf9fbd110fb226bb69657b7c2912fe3f` is functionally usable and is the build currently served at <https://review-pdf-packet.sociobot.in>, but it does not satisfy the acceptance contract's non-negotiable 44 x 44 CSS px interactive-target requirement. There are no critical or high-severity defects, and the core local packet workflow passes end to end.

- Tested commit: `58bfb67caf9fbd110fb226bb69657b7c2912fe3f`
- Tested URL: <https://review-pdf-packet.sociobot.in>
- Verification date: 2026-08-28 UTC
- Checkout state before verification: clean, `main` at the candidate commit
- Artifact class: static web/PWA; library, CLI, backend concurrency, persistence, and build-identity endpoint checks are not applicable

## Defects

### V1 — Medium — multiple touch/click targets are smaller than 44 x 44 CSS px

This violates the attached accessibility and design acceptance baseline. Browser bounding-box measurements on the live 390 px viewport found:

- Header brand: 168 x 32 px.
- Plus-card Privacy and Terms links: 43 x 14 px and 35 x 14 px.
- Footer Privacy and Terms links: 58 x 25 px and 47 x 25 px.
- Footer brand: 350 x 25 px.

Desktop additionally exposes the 128 x 25 px “Build a packet” navigation link and a 23 px-high sensitive-content checkbox label. These are real hit regions, not merely glyph measurements: the elements and their closest clickable labels have no padding or minimum height that expands them to 44 px. This is the defect that makes the strict acceptance verdict FAIL.

### V2 — Medium — packet preview creates a nested complementary landmark

axe-core 4.10.3 consistently reports `landmark-complementary-is-top-level` (moderate, one node) for `<aside class="packet-preview">` because it is contained inside the main landmark. This reproduces on desktop, 390 px mobile, local preview, and live. Serious/critical axe findings remain zero. The generated reviewer packet and both legal pages have zero axe findings.

### V3 — Low — stale Plus license verification emits a console network error offline

With a previously valid cached Plus verdict older than one day, a controlled offline reload correctly unlocks Plus and displays “Plus is unlocked offline using your last verified license,” but the attempted background verification emits `Failed to load resource: net::ERR_INTERNET_DISCONNECTED` in the browser console. The free offline path and a fresh cached-verdict path do not emit errors.

## Clean checkout and quality gates

Executed from the clean candidate checkout using the committed lockfile:

```text
npm ci                                  PASS (59 packages; 0 audit vulnerabilities)
npm test                                PASS
  Vitest                                5/5 passed
  Playwright desktop/mobile             10 passed, 2 intentional project-specific skips
npm run build                           PASS (tsc --noEmit && vite build)
npx tsc --noEmit                        PASS
npm audit --omit=dev                    PASS (0 vulnerabilities)
```

There is no lint script or separate lint configuration in the repository. The exact production output was created at `dist/index.html`.

## End-to-end product evidence

The following independent paths passed locally; the representative export path was repeated successfully on the live 390 px site.

- Empty state is present, and export validation proceeds in useful order: missing title, missing PDF, invalid source URL, then missing sensitive-content confirmation. Each error identifies recovery and focuses the affected control.
- A non-PDF is rejected. A 50 MB PDF is accepted; 50 MB plus one byte is rejected. Attachments totaling exactly 75 MB are accepted; one additional byte is rejected without losing the existing selection.
- Comment and decision context can be added with pointer or keyboard. Removal and Undo work for PDF, context, and attachments.
- `javascript:` source URLs are blocked. A complete HTTPS URL recovers and exports.
- Text drafts (title, preparer, context, links) survive reload; the PDF and attachments intentionally do not persist.
- A representative packet with a PDF, two context types, an authorised source link, and three attachments downloaded successfully. `unzip -t` passed. The ZIP contained `index.html`, `print.css`, the PDF, and all attachments.
- Case-insensitive duplicate attachment names were deconflicted (`notes.txt`, `NOTES-2.txt`), and unsafe filename characters were sanitized. All ZIP paths remained inside the packet.
- The extracted `index.html` opened directly from `file://` at 390 px with its stylesheet applied, no horizontal overflow, no normal-load console/page error, one H1, one main landmark, and working relative paths to the PDF and every attachment. The source link retained `noopener noreferrer`.
- HTML metacharacters are escaped by the unit-tested exporter; no third-party content is embedded.

## Accessibility, keyboard, responsive, and visual checks

- One H1, `lang="en"`, title, main landmark, image alt text, labelled buttons, explicit form labels, errors, skip link, and polite status regions are present.
- A 23-stop keyboard traversal reached every initial interactive control in logical order and returned to the start without a trap. Every focused control showed the designed 3 px coral focus ring. Enter activated the skip link and keyboard context-entry path.
- Desktop 1440 px and mobile 390 x 844 px layouts were visually inspected in populated states. The product-specific paper-folder hierarchy is intact, text remains legible, and neither initial nor populated mobile content overflows horizontally (`scrollWidth = clientWidth = 390`).
- `prefers-reduced-motion: reduce` computes dynamic animation and transition durations to `1e-05s`; no looping or flashing motion exists.
- axe-core 4.10.3: zero serious/critical findings on local and live desktop/mobile; V2 is the single moderate best-practice finding. Exported packet, Privacy, and Terms pages have zero findings.
- `/opt/fleet/lib/verify-url.sh` passed for local root, live root, live Privacy, and live Terms. Live root: HTTP 200, 830 ms scripted load, zero console/page errors, expected title/lang/H1/main/alt/button labels.

## Privacy, requests, licensing, and policies

- Initial and populated free-builder sessions made no cross-origin request. Chosen PDF and attachment bytes remained in the browser; only same-origin shell/assets were requested.
- No third-party font, script, analytics, ad, or fingerprinting request was observed. Fonts are system-local. The initial Lighthouse request inventory contained six same-origin/data resources and zero third-party resources.
- Privacy and Terms return HTTP 200, fit 390 px, have semantic title/lang/H1/main structure, and load without errors.
- License callback behavior was exercised with the billing request intercepted: token stored under `sb_license:review-pdf-packet`, query token stripped from the address bar, invalid verdict locks Plus, a repeat load uses the less-than-one-day cache, and paste-to-restore unlocks on a valid verdict. Checkout targets only the Sociobot API. No real purchase was made.
- Live response policy includes HTTPS/HSTS, CSP restricting default/script/style/image/connect/object/form/frame sources, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial.

## Deployment identity, caching, PWA, and performance

Freshly built candidate files and live responses had identical SHA-256 digests for `index.html`, hashed JS, hashed CSS, `sw.js`, hero WebP, favicon, legal CSS, Privacy, Terms, robots, and sitemap. Key examples:

| File | SHA-256 candidate/live |
| --- | --- |
| `index.html` | `c901e026885c904bc32bc1667be1aa9f235b276801994b2dedf65ae1f1c8813a` |
| `assets/index-unXxZR0B.js` | `9e5c22a80059526b7007c133d62bcbd34863e0980bcaad1c5fe4a18d904a9fbd` |
| `assets/index-CLUcxoD5.css` | `4e21afca662eb5e97cdcc209ec65ffcd8c0d92fa120d396b70167f7d57af6f82` |
| `sw.js` | `96c16329cfa1b762f8063f35d8b095c16e6a3d0ef5541d9baf9e60a85f339f37` |

Caching is appropriate for the deployed artifact: HTML/legal pages use `public, must-revalidate, max-age=30`; hashed JS/CSS and the hero use one-year immutable caching; `sw.js` uses `no-cache`; Brotli is served for JS. The unversioned hero URL is immutable, so future hero replacements must rename the file or change that policy.

The live service worker activated, controlled the page, completed `registration.update()`, and held cache `review-packet-v3` with the candidate HTML, hashed JS/CSS, hero, favicon, legal stylesheet, Privacy, and Terms. A controlled live offline reload remained interactive and updated the packet preview with zero errors in the free path.

Production budgets:

| Resource/metric | Result | Budget |
| --- | ---: | ---: |
| JavaScript | 20,692 B raw / 7,791 B transferred | <= 200 KB |
| CSS | 15,835 B raw / 4,919 B transferred | <= 50 KB |
| Fonts | 0 B | <= 120 KB |
| Hero WebP | 51,004 B | <= 300 KB |
| Lighthouse LCP | 1,212 ms | < 2,500 ms |
| Lighthouse CLS | 0 | < 0.1 |

Fresh live Lighthouse 12.8.2 mobile scores were Performance 97, Accessibility 100, Best Practices 100, and SEO 100. FCP was 955 ms, Speed Index 955 ms, and Total Blocking Time 205 ms. Field INP is not available for this new/untrafficked site; TBT is recorded as the lab responsiveness proxy.

## Release recommendation

Do not mark this candidate accepted under the supplied contract. Fix V1 and re-run mobile/desktop target measurements; fix V2 at the same time if possible. Core workflow, privacy, export portability, deployment identity, PWA offline behavior, response policy, and size/performance budgets otherwise pass.

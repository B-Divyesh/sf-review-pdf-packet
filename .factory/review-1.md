# Adversarial first-read review 1

## Verdict: FAIL

The real-data packet builder works, but this release fails the required first-read and try-out contract. It has no isolated sample-data demo, no claims registry/tests, a dead paid checkout link, and no real /demo or 404 route.

## Cold visit

Fresh Chromium contexts were opened on 2026-08-30 before scrolling at 390 x 844 and 1440 x 900. At 390 px I could infer “this probably puts a PDF and related review material in a folder,” but I could not identify a try-first action. The exact first-screen copy was:

> “A complete handoff, not another workspace” / “Send the context. Not the login.” / “Build your packet”

The only action opens a blank form that requires my own PDF. Neither viewport showed “Try it with sample data,” a demo banner, Reset demo, or Start for real. Normal initial requests were same-origin shell, JS, CSS, and artwork only; no console error occurred. That is normal-load evidence, not demo-sandbox proof.

## Findings (ordered by severity)

### F-1-1 — BLOCKING — No one-click sample-data demo or isolated demo storage

**Evidence:** /demo returns HTTP 200 but renders the identical blank root builder, with root title and no sample PDF/context/attachments, banner, Reset, or Start for real. No demo implementation exists in source. Storage uses real review-packet:* and sb_license:* keys.

**Why/fix:** A visitor cannot see the job done without supplying a PDF, and /demo can touch ordinary data. Implement /demo or ?demo=1 with a realistic named PDF, two located comments, a decision, source link, and two attachments in demo:review-packet:*. Show “Demo — sample data, nothing is saved”, working Reset demo and Start for real; discard demo data on exit. Add .factory/demo.md and Playwright tests proving normal storage is untouched and the populated demo works offline after first visit.

### F-1-2 — BLOCKING — Required claims registry and tagged claim tests absent

**Evidence:** .factory/claims.json does not exist; source search finds no @claim: test or demo test. There are therefore no listed claim commands to run from the fresh checkout.

**Why/fix:** Every retained visitor-reliance claim needs one observable demo test. Create the registry and tests or delete the claims. F-1-3 through F-1-14 enumerate every current unlisted claim group.

| ID | Exact quote/location | Why a visitor is misled | Concrete fix |
| --- | --- | --- | --- |
| F-1-3 — BLOCKING | Hero: “Your reviewer opens one tidy, offline packet—without an account.” | Account-free offline opening is asserted without proof. | Register a demo export test that opens extracted index.html offline in a fresh context and verifies the PDF, context, and attachments without sign-in. |
| F-1-4 — BLOCKING | Hero “Files stay in this browser”; builder “Nothing uploads”; footer “Files stay local”; README “The builder runs entirely in the browser” and “selected files remain only in memory.” | These privacy claims lack a complete-flow request log/storage assertion. | Register a fresh-demo request-log test allowing only same-origin requests (except documented user-initiated billing) and asserting selected files do not enter storage. |
| F-1-5 — BLOCKING | Builder: “Refreshing keeps your text draft on this device; files must be re-added for your safety.” README: “Text drafts stay in local storage; selected files remain only in memory.” | Persistence behaviour is a concrete promise. | Reload a demo after text/file selection; assert text survives, files do not, and only demo: keys are used. |
| F-1-6 — BLOCKING | “Point to authorised references without embedding their content.” | Non-embedding is untested. | Test that demo export contains a safe link only and does not fetch the source. |
| F-1-7 — BLOCKING | “Supporting files are copied into the downloaded packet.” “Includes a readable index, print stylesheet, the PDF, and every attachment.” README repeats the ZIP-content assertion. | Export contents are relied upon without a registered test. | Test ZIP integrity and exact seeded PDF/attachment/index/stylesheet contents. |
| F-1-8 — BLOCKING | “It works offline.” | The live sentence is unregistered. | Tag a new-context /demo offline-reload test @claim:offline-reload; prove seeded sample remains usable after context.setOffline(true). |
| F-1-9 — BLOCKING | “Snapshots include text context and links, never the PDF or attachments.” | The Plus privacy/behaviour promise is untested. | Use a recorded valid-license fixture; save/load a snapshot and prove it restores text only. |
| F-1-10 — BLOCKING | “Anyone with the exported folder can read its contents.” “Review Packet does not provide encryption or legal record retention.” | Readability/security assertions have no evidence. | Open demo export without credentials and assert ordinary readable ZIP output; register or remove the retention assertion. |
| F-1-11 — BLOCKING | “This cover becomes the first page your reviewer sees.” | The exported order is promised without proof. | Assert generated index.html puts the cover before review sections, or relabel as “Packet cover preview.” |
| F-1-12 — BLOCKING | “The free builder and export stay complete.” “A one-time Plus purchase adds named text snapshots and a custom handoff note…” “Unlimited named text snapshots…” “A custom note…” “No subscription and no account.” “The complete packet export is free.” README repeats the free/Plus assertions. | Pricing, tier, and entitlement claims are untested. | Test free demo export plus recorded entitlement fixture; verify displayed price/features against a checked product fixture, or remove them. |
| F-1-13 — BLOCKING | “Checkout is handled by Sociobot/Dodo, the merchant of record.” “Refunds are handled there and revoke the license.” | Billing/refund behaviour is untested and checkout is dead (F-1-18). | Test configured checkout and recorded revocation response; remove claims until live. |
| F-1-14 — BLOCKING | Footer: “Hero imagery was generated specifically for this product.” | Provenance is visitor-facing but has no observable claim test. | Remove it from product copy or register a build/provenance check. |

### F-1-15 — BLOCKING — First screen uses slogans, not the user’s job

**Evidence:** Eyebrow “A complete handoff, not another workspace”; H1 “Send the context. Not the login.”; primary “Build your packet”; caption “Everything they need, assembled together.”

**Why/fix:** They do not name PDF review packets, the external reviewer, comments/decisions, or what happens next. Replace with H1 “Package a PDF for external review”; support “For people handing a reviewed document to an external reviewer, add comments, decisions, links, and files.”; primary “Try it with sample data”; adjacent outcome “Open a complete sample packet you can inspect and reset.” Use three short tested facts.

### F-1-16 — Major — Vague headings and non-result actions

**Evidence:** “Private workbench,” “Assemble the handoff,” “Keep a shelf of reusable drafts,” “Made for clean handoffs,” “Build a packet,” and “Build your packet.”

**Why/fix:** These are mood/metaphor headings or vague actions. Rename to “Build a review packet,” “Packet builder,” “Review Packet Plus features,” and “Review Packet: local PDF handoffs.” Use “Create review packet” for real data and “Try it with sample data” for the first action.

### F-1-17 — Major — README exceeds the sentence cap and omits demo use

**Evidence:** “It is for professionals who need to hand work to an external reviewer without granting access to the source workspace or rebuilding the context in email.” is 26 words. README has no demo URL, sample description, reset guidance, or sandbox storage note.

**Why/fix:** Replace it with “It is for people sending a reviewed document to an external reviewer.” Then: “It keeps comments, decisions, and files out of email without sharing the source workspace.” Document /demo, the sample, Reset demo, Start for real, and demo: namespace.

### F-1-18 — BLOCKING — Buy Plus is a dead link

**Evidence:** Fresh browser GET of the exact Buy Plus href https://api.sociobot.in/api/v1/products/review-pdf-packet/checkout returned HTTP **404**. Root, Privacy, Terms, robots, sitemap, and sociobot.in returned 200.

**Why/fix:** The advertised $12 action has no checkout. Configure the live Sociobot checkout endpoint and test its health, or remove the paid tier until it exists.

### F-1-19 — BLOCKING — /demo and /404 are fallback pages, not routes

**Evidence:** /demo and /404 both return root H1 “Send the context. Not the login.” and root title. /demo is not “Demo — Review Packet”; /404 has no not-found explanation/back link. Configuration only supplies navigation fallback, with no 404 response override.

**Why/fix:** Add genuine demo routing, route title/focus/live announcement and back behaviour. Add designed 404.html and Static Web Apps response override with a clear home link; test direct-load/back/focus behaviour.

### F-1-20 — Major — Required metadata is missing or vague

**Evidence:** Root has no canonical, Open Graph, or Twitter metadata. Privacy and Terms also lack descriptions/canonicals/OG/Twitter data. Root title “Review Packet — context that travels with your PDF” is slogan language.

**Why/fix:** Use “Review Packet — build PDF review packets” and unique route titles/descriptions/canonicals. Add OG/Twitter title, description, and a real 1200 x 630 product-art image; test every route.

### F-1-21 — Major — Shared header/footer skeleton is inconsistent

**Evidence:** Root header lacks Demo/Privacy navigation; root footer omits “Built by Param Factory” and version/build id. Privacy/Terms have a different two-link header and a footer without Privacy, Terms, Factory, or build links.

**Why/fix:** Use one header (wordmark, Demo, builder, Privacy), skip link, and footer (one-liner, Privacy, Terms, “Built by Param Factory,” build id) on all routes. Add crawl assertions.

## Copy audit

Counts treat hyphenated and apostrophe words as one. Non-sentence headings and actions are covered by F-1-15/F-1-16. Every visible prose sentence/claim on the landing page and every README sentence follows.

### Landing page

| ID | Words | Sentence |
| --- | ---: | --- |
| L01 | 6 | A complete handoff, not another workspace |
| L02 | 3 | Send the context. |
| L03 | 3 | Not the login. |
| L04 | 10 | Bundle a PDF with decisions, comments, source links and attachments. |
| L05 | 10 | Your reviewer opens one tidy, offline packet—without an account. |
| L06 | 5 | Files stay in this browser. |
| L07 | 5 | Everything they need, assembled together. |
| L08 | 4 | Choose the reviewed PDF. |
| L09 | 4 | Record comments and decisions. |
| L10 | 4 | Download one offline folder. |
| L11 | 2 | Nothing uploads. |
| L12 | 15 | Refreshing keeps your text draft on this device; files must be re-added for your safety. |
| L13 | 7 | The name your reviewer will see first. |
| L14 | 10 | or drop it here · PDF only · up to 50 MB |
| L15 | 9 | Give each note a clear destination in the PDF. |
| L16 | 8 | Comments ask for attention; decisions close the loop. |
| L17 | 10 | Add the notes that would otherwise get lost in email. |
| L18 | 8 | Point to authorised references without embedding their content. |
| L19 | 8 | Supporting files are copied into the downloaded packet. |
| L20 | 11 | Includes a readable index, print stylesheet, the PDF, and every attachment. |
| L21 | 3 | It works offline. |
| L22 | 11 | Snapshots include text context and links, never the PDF or attachments. |
| L23 | 9 | Anyone with the exported folder can read its contents. |
| L24 | 10 | Review Packet does not provide encryption or legal record retention. |
| L25 | 9 | This cover becomes the first page your reviewer sees. |
| L26 | 7 | The free builder and export stay complete. |
| L27 | 22 | A one-time Plus purchase adds named text snapshots and a custom handoff note—useful when review packets are part of your routine. |
| L28 | 7 | Unlimited named text snapshots on this device |
| L29 | 7 | A custom note on exported packet covers |
| L30 | 5 | No subscription and no account |
| L31 | 10 | Checkout is handled by Sociobot/Dodo, the merchant of record. |
| L32 | 8 | Refunds are handled there and revoke the license. |
| L33 | 6 | The complete packet export is free. |
| L34 | 4 | Made for clean handoffs. |
| L35 | 3 | Files stay local. |
| L36 | 8 | Hero imagery was generated specifically for this product. |

### README

| ID | Words | Sentence |
| --- | ---: | --- |
| R01 | 20 | Review Packet turns a reviewed PDF, structured comments and decisions, source links, and supporting files into one portable offline folder. |
| R02 | 26 | It is for professionals who need to hand work to an external reviewer without granting access to the source workspace or rebuilding the context in email. |
| R03 | 7 | The builder runs entirely in the browser. |
| R04 | 15 | It exports a standards-based ZIP containing index.html, print.css, the original PDF, and attachments. |
| R05 | 12 | Text drafts stay in local storage; selected files remain only in memory. |
| R06 | 7 | The complete builder and export are free. |
| R07 | 18 | A one-time Plus license adds reusable text snapshots and a custom cover note through the Sociobot billing API. |
| R08 | 6 | Requires Node.js 20 or newer. |
| R09 | 5 | Open the printed local URL. |
| R10 | 7 | No backend or environment variables are required. |
| R11 | 19 | npm test runs unit coverage for safe export generation and the ZIP writer, then Playwright keyboard/mobile/accessibility flows. |
| R12 | 20 | The exact production build command is npm run build; output lands in dist/ with dist/index.html at its root. |
| R13 | 10 | Deploy the contents of dist/ to Azure Static Web Apps. |
| R14 | 9 | public/staticwebapp.config.json supplies security and cache headers. |
| R15 | 16 | Product registration, checkout configuration, DNS, and billing are factory concerns and are intentionally not managed here. |
| R16 | 9 | Privacy and terms are available at /privacy/ and /terms/. |
| R17 | 1 | MIT. |
| R18 | 3 | See LICENSE. |

R02 is the only >22-word sentence. L01–L03, L07, L16–L17, L25, and L34, plus the headings/actions in F-1-15/F-1-16, are vague/mood/metaphor copy. L04–L06 and L11–L36, plus README product/privacy/pricing sentences, are claim-like and require the registry/tests above. No banned plain-words term was found.

## Claims, tests, structure, and history

- Claims: not runnable as specified because the registry is absent. This is a blocking missing-evidence result, not an untested pass.
- Fresh checkout: npm ci passed; npx vitest run tests/unit passed 6/6; Playwright passed 9 desktop + 8 mobile tests, with 3 deliberate cross-project skips; npm run build passed and made dist/ (21.38 kB JS, 16.24 kB CSS raw).
- Link crawl: root, Privacy, Terms, robots, sitemap, and Sociobot contact returned 200; Buy Plus returned 404. robots.txt and sitemap.xml exist.
- Identity: the warm original paper-cut system matches .factory/design.md and is distinct rather than generic. No AI/import/sync feature is implied by the brief beyond the missing try-out; no AI/key finding is raised.
- Earlier review/polish files: none exist. Every verification/handoff finding was rechecked: V1 target size (fresh live desktop/390 scan: zero undersized visible targets; both geometry tests pass), V2 nested landmark (zero live main aside; axe test passes), V3 offline stale-license fetch (navigator.onLine early exit; desktop regression passes), V2-1 invalid PDF (validatePdfFile validates non-empty %PDF- header; both picker tests pass), and V2-2 body prose size (desktop/mobile computed-style tests pass). All are fixed.

## What would make this perfect

Let a visitor inspect a complete isolated sample packet in one click; prove every retained promise; repair the paid action; then make demo/404/metadata and shared navigation as deliberate as the existing packet builder. Replace the hero slogans with the plain PDF-review job and one obvious first action.


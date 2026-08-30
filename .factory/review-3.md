# Adversarial first-read review 3

## Verdict: FAIL

The live product is clear, usable, isolated, and visually distinct, but this round is not a zero-finding pass. Two earlier findings are only partly fixed, route focus is incomplete, one numeric claim is unlisted, one registered claim is not fully asserted, and the displayed build identifier is stale.

## Cold visit

Fresh Chromium contexts opened `https://review-pdf-packet.sociobot.in/` at 390 × 844 and 1440 × 900 on 30 August 2026. Nothing was scrolled before recording the first screen.

- **What it does:** packages a PDF with comments, decisions, links, and attachments for external review.
- **For whom:** people sending a reviewed PDF to an external reviewer.
- **What to click first:** **Try it with sample data**, which opens a complete sample that can be inspected and reset.

The exact copy providing those answers is “Package a PDF for external review”, “For people sending a reviewed PDF, add comments, decisions, links, and attachments for the external reviewer.”, and “Try it with sample data”. All three answers are clear in both viewports. Root requests were same-origin, there was no horizontal overflow, and no console or page error occurred.

## Findings

### F-3-1 / F-1-20 (reopened) — BLOCKING — Demo reuses the home meta description

**Exact quote/location:** Live `/demo`, `<meta name="description">`: “Build a PDF review packet with comments, decisions, links, and attachments for an external reviewer.” This is byte-for-byte the root description. The Demo Open Graph and Twitter descriptions correctly say “Inspect a complete sample PDF review packet and reset it at any time.”

**Why this fails:** F-1-20 required unique route descriptions and was marked fixed. A search result or preview using the standard description presents Demo as the builder rather than the sample route, while the other metadata describes the route correctly. This is a half-fixed earlier finding, so the review instructions make it blocking.

**Concrete fix:** When demo mode is entered, also set `meta[name="description"]` to “Inspect a complete sample PDF review packet and reset it at any time.” Extend the metadata test to assert the exact standard description on every route, not merely that the element exists.

### F-3-2 / F-2-5 (reopened) — BLOCKING — Attachments still have two names

**Exact quote/location:** Landing “How to build a review packet”: “Record comments, decisions, links, and files.” Builder action: “Add files”. The same first screen, builder section, preview, export copy, README, and `.factory/copy-audit.md` call these items “attachments”.

**Why this fails:** F-2-5 found that one file type had two names, and polish round 2 claimed it was standardised on **attachments**. The remaining “files” wording leaves the same terminology defect partly fixed. It also contradicts the recorded terminology table (“Supplemental files → attachments”).

**Concrete fix:** Use “Record comments, decisions, links, and attachments.” and **Add attachments**. Add a copy test that rejects “supporting files” and standalone “files” when they refer to attachments.

### F-3-3 — Major — Legal and not-found routes do not move or announce focus

**Exact location/evidence:** After activating the header **Privacy** link from `/`, `document.activeElement` is `BODY` on `/privacy/` and there is no `aria-live` region. Browser Forward back to Privacy has the same result. Privacy, Terms, and 404 give their H1 `tabindex="-1"`, but no code focuses it or announces the new route. Demo and browser Back to home do perform both actions.

**Why this fails:** A keyboard or screen-reader visitor gets route feedback only for Demo and home. The required route behavior applies to every real route, including deep links and history navigation.

**Concrete fix:** Apply one route-focus helper to Demo, Privacy, Terms, and 404. On navigation or history restoration, focus the destination H1 and update a polite live region. Add link, Back, and Forward assertions for each route.

### F-3-4 — Major — The registered demo-content test does not prove its exact counts

**Exact quote/location:** `.factory/claims.json`, `demo-contents`: “The sample contains a PDF, two comments, one decision, a source link, and two attachments…” The tagged test checks one comment phrase, the word “Approved”, the first link value, and two attachment filenames. It does not assert exactly two comment items, exactly one decision item, or exactly one source link.

**Why this fails:** The claim is quantitative. A sample with one comment plus two decisions, extra links, or extra context could pass the current claim test. The live sample is correct, but the registered regression proof is incomplete.

**Concrete fix:** In `@claim:demo-contents`, assert one PDF, `.comment` count 2, `.decision` count 1, link-row count 1, and attachment-row count 2 before and after Reset.

### F-3-5 — Major — The 75 MB attachment limit is an unlisted numeric claim

**Exact quote/location:** Runtime attachment error in `src/main.ts`: “Attachments would exceed 75 MB in total. Remove a file or choose smaller files.” No `claims.json` entry or tagged test mentions the 75 MB boundary.

**Why this fails:** A numeric limit is a claim a user relies on. The current suite does not prove that exactly 75 MiB succeeds, that one additional byte fails, or that rejection preserves already accepted attachments.

**Concrete fix:** Add an `attachment-size-limit` claim and one tagged browser test covering 75 MiB, 75 MiB + 1 byte, and preservation of the existing attachment list.

### F-3-6 — Minor — The footer identifies an older build

**Exact quote/location:** Root, Demo, Privacy, Terms, and 404 footers say “Build 2e15e23a6a15”. That commit predates the live repair commits `d6e5c6a`, `0b1c02c`, and `d7dbf49`; the reviewed repository is `d8baf8754b37de1338977e469f2455c27d186bb1`.

**Why this matters:** The required build identifier cannot identify the deployed artifact and makes incident or evidence correlation unreliable.

**Concrete fix:** Inject the current release SHA during the production build and render the same value on app, legal, and 404 pages. Add a deployment check that compares the footer value with the released commit.

## Copy audit

Counts treat hyphenated words, URLs, paths, and placeholders as one word and ignore punctuation-only separators. No sentence exceeds 22 words. No banned marketing adjective, metaphor heading, or mood slogan appears. F-3-2 is the terminology failure; F-3-5 is the unlisted claim.

### Landing and demo prose

| ID | Words | Exact copy | Result |
| --- | ---: | --- | --- |
| L01 | 6 | Package a PDF for external review | Clear headline |
| L02 | 16 | For people sending a reviewed PDF, add comments, decisions, links, and attachments for the external reviewer. | Clear |
| L03 | 10 | Open a complete sample packet you can inspect and reset. | `demo-contents` claim |
| L04 | 5 | Files stay in this browser. | `local-processing` claim |
| L05 | 10 | Exports a folder with the PDF, context, links, and attachments. | `packet-export` claim |
| L06 | 9 | Sample data is saved separately from your real drafts. | `demo-isolation` claim |
| L07 | 8 | A PDF, review context, and attachments travel together. | `packet-export` claim |
| L08 | 5 | Choose the document to share. | Clear |
| L09 | 6 | Record comments, decisions, links, and files. | F-3-2 |
| L10 | 7 | Share the exported folder with your reviewer. | Clear |
| L11 | 6 | Text drafts stay on this device. | `text-drafts` claim |
| L12 | 8 | Selected files are not saved after a refresh. | `text-drafts` claim |
| L13 | 8 | This is the first title your reviewer sees. | Covered by export/cover behavior |
| L14 | 10 | or drop it here · PDF only · up to 50 MB | `pdf-size-limit` claim |
| L15 | 10 | Add the details an external reviewer needs beside the PDF. | Clear |
| L16 | 8 | Add the notes your reviewer needs to act. | Clear empty-state instruction |
| L17 | 8 | Source links are included without copying their content. | `source-links` claim |
| L18 | 6 | Add attachments to the exported packet. | Clear |
| L19 | 10 | Exports a folder with the PDF, context, links, and attachments. | `packet-export` claim |
| L20 | 12 | I checked the recipients and removed sensitive material they should not receive. | Clear confirmation |
| L21 | 8 | Check every recipient before sharing the exported folder. | Clear safety instruction |
| L22 | 7 | The exported packet starts with this cover. | `cover-order` claim |
| L23 | 7 | Local PDF review packets for external reviewers. | Clear footer line |
| L24 | 9 | Demo — sample data; saved separately from your real drafts. | `demo-isolation` claim |
| L25 | 11 | Explore the sample packet, reset it, or open an empty builder. | `demo-contents` claim |
| L26 | 5 | Inspect a sample review packet | Clear Demo H1 |
| L27 | 9 | Review the PDF, comments, decision, link, and attachments below. | Clear |
| L28 | 4 | Please confirm annual pricing. | Clear compact sample |
| L29 | 10 | Please confirm that annual pricing matches the approved sales sheet. | Clear sample comment |
| L30 | 9 | Check whether the partner announcement date can remain public. | Clear sample comment |
| L31 | 11 | Approved: use the revised customer proof point in the opening summary. | Clear sample decision |
| L32 | 2 | You’re offline. | Clear status |
| L33 | 10 | The sample remains available after its first load while offline. | `offline-demo` claim |

### Runtime messages

| Words | Exact copy or template | Result |
| ---: | --- | --- |
| 2 | PDF removed. | Clear |
| 2 | Comment removed. | Clear |
| 2 | Decision removed. | Clear |
| 2 | Attachment removed. | Clear |
| 2 | Removal undone. | Clear |
| 3 | `{filename} is ready.` | Clear status |
| 6 | That file is not a PDF. | Clear error |
| 6 | Choose a file ending in .pdf. | Clear recovery |
| 4 | That PDF is empty. | Clear error |
| 6 | Choose a PDF with document content. | Clear recovery |
| 8 | That file is not marked as a PDF. | Clear error |
| 5 | Choose the original PDF file. | Clear recovery; used by two validation errors |
| 9 | That file does not contain a readable PDF header. | Clear error |
| 7 | That PDF is larger than 50 MB. | `pdf-size-limit` claim |
| 4 | Choose a smaller PDF. | Clear recovery |
| 7 | Attachments would exceed 75 MB in total. | F-3-5 |
| 7 | Remove a file or choose smaller files. | Clear recovery; terminology follows F-3-2 |
| 3 | `{count} attachment(s) added.` | Clear status |
| 6 | Write the comment or decision first. | Clear error |
| 6 | Review context added to the packet. | Clear status |
| 3 | Source link removed. | Clear status |
| 5 | Sample review packet is ready. | Clear status |
| 6 | Add a packet title before exporting. | Clear error |
| 6 | Add the reviewed PDF before exporting. | Clear error |
| 7 | Use a complete http:// or https:// address. | Clear recovery |
| 7 | Fix the highlighted source link before exporting. | Clear error |
| 9 | Confirm that you checked the recipients and sensitive contents. | Clear error |
| 4 | Assembling your review packet. | Clear status |
| 2 | Packet downloaded. | Clear status |
| 6 | Open index.html inside the unzipped folder. | Clear next step |
| 6 | The packet could not be built. | Clear error |
| 7 | Try again or remove very large attachments. | Clear recovery |
| 3 | Demo route loaded. | Clear announcement |
| 4 | Review Packet home loaded. | Clear announcement |

### README sentences

| ID | Words | Exact sentence | Result |
| --- | ---: | --- | --- |
| R01 | 10 | Review Packet packages a PDF with review context and attachments. | Clear |
| R02 | 12 | It is for people sending a reviewed document to an external reviewer. | Clear |
| R03 | 14 | It keeps comments, decisions, and attachments out of email without sharing the source workspace. | Clear |
| R04 | 6 | Try the complete sample at https://review-pdf-packet.sociobot.in/demo. | Clear instruction |
| R05 | 14 | It includes a PDF, two comments, one decision, a source link, and two attachments. | F-3-4 test gap |
| R06 | 5 | Reset demo restores the sample. | `demo-contents` claim |
| R07 | 11 | Open empty builder removes demo data and opens an empty builder. | `demo-contents` claim |
| R08 | 6 | Demo text uses `demo:review-packet:*` storage keys. | `demo-isolation` claim |
| R09 | 5 | Normal drafts use `review-packet:*` keys. | `demo-isolation` claim |
| R10 | 12 | Selected files stay in memory and are not saved after a refresh. | `text-drafts` claim |
| R11 | 12 | Review Packet creates a ZIP with `index.html`, `print.css`, your PDF, and attachments. | `packet-export` claim |
| R12 | 5 | Files stay in this browser. | `local-processing` claim |
| R13 | 5 | Requires Node.js 20 or newer. | Clear requirement |
| R14 | 5 | Open the printed local URL. | Clear instruction |
| R15 | 7 | No backend or environment variables are required. | Clear setup fact |
| R16 | 13 | Run every visitor-facing claim from a clean checkout with the commands in `.factory/claims.json`. | Clear test instruction |
| R17 | 5 | The production build writes `dist/index.html`. | Clear build fact |
| R18 | 7 | Deploy `dist/` to Azure Static Web Apps. | Clear deployment instruction |
| R19 | 8 | `public/staticwebapp.config.json` provides routing, security headers, and cache policy. | Clear deployment fact |
| R20 | 6 | The factory manages deployment and DNS. | Clear ownership statement |
| R21 | 1 | MIT. | Clear license statement |
| R22 | 2 | See LICENSE. | Clear instruction |

### Headings, labels, and actions

The headings and empty-state labels name their content: **Inspect a sample review packet**, **How to build a review packet**, **Packet builder**, **Build a review packet**, **Document**, **Review context**, **No review context yet**, **Source links**, **Attachments**, **Export**, **Download a review packet**, and **Packet preview**. There are no mood headings. Actions use result-naming verbs: **Try it with sample data**, **Reset demo**, **Open empty builder**, **Choose the reviewed PDF**, **Add review context**, **Add source link**, **Download review packet**, **Remove**, and **Undo**. Each Remove control has an object-specific accessible name. **Add files** is the terminology exception in F-3-2.

## Demo, sandbox, and privacy

- One click from root opened `/demo`. At 390 px, `northstar-launch-review.pdf` ended at y=409, “Comment · Page 3, pricing table” at y=478, and “2 files included” at y=571, all inside the 844 px first viewport.
- The focused Demo H1 was “Inspect a sample review packet”. The banner, Reset demo, and Open empty builder were visible.
- The live sample contained three context rows, two attachment rows, and one source-link row. Source inspection confirmed two comments and one decision.
- A real draft sentinel under `review-packet:draft:v1` survived entry, edits, Reset, and exit. Demo text used only `demo:review-packet:draft:v1`; exiting removed that key and restored the real draft.
- Reset restored “Northstar launch review”. Open empty builder removed demo storage. The apparent non-empty title after this review's exit test was the deliberately seeded real-draft sentinel, confirming isolation rather than contamination.
- The recorded live entry, Reset, exit, and history flow produced no cross-origin requests. Root and Demo had no console or page errors.
- After a first online Demo load, a live offline reload retained the banner, named PDF, both comments, and decision.

## Claims and clean-run evidence

Fresh clone: `/tmp/review-pdf-packet-review-3-8nJ7TY`, commit `d8baf8754b37de1338977e469f2455c27d186bb1`. Every command listed in `.factory/claims.json` ran separately.

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS — 2 browser projects |
| `demo-contents` | PASS — 2 browser projects, with the coverage defect in F-3-4 |
| `local-processing` | PASS — 2 browser projects |
| `text-drafts` | PASS — 2 browser projects |
| `pdf-size-limit` | PASS — 2 browser projects |
| `packet-export` | PASS — 2 browser projects |
| `offline-demo` | PASS — 1 browser project; 1 intended mobile skip |
| `source-links` | PASS — 2 browser projects |
| `cover-order` | PASS — 2 browser projects |

`npm test` passed: 6 unit tests and 22 browser tests, with 2 intentional project-specific skips. `npm run build` passed and produced `dist/index.html`; production JavaScript is 20.85 kB raw / 7.79 kB gzip, and CSS is 18.82 kB raw / 5.18 kB gzip.

## Structure, links, accessibility, and identity

- Root, Demo, Privacy, Terms, and an unknown route have `lang="en"`, one H1, one main landmark, canonical/OG/favicon metadata, and route titles. The standard Demo description defect is F-3-1.
- The unknown route returns HTTP 404 and the designed paper-style not-found page. Its main-document 404 produces Chromium's expected failed-resource console line; no subresource or script error occurs.
- Every unique link target across the pages returned 200: root, Demo, Privacy, Terms, and `https://sociobot.in/`. The `/#builder` fragment resolves to the existing builder section.
- Root, Demo, Privacy, Terms, and 404 had zero axe violations. The worker URL verifier passed all four 200 routes with one H1, `lang`, main, image alt, labelled buttons, and no console/page errors. Route focus remains incomplete as F-3-3.
- The 390 px root has no horizontal overflow. Focus styling, 44 px targets, reduced motion, file validation, keyboard entry, and undo are covered by the passing browser suite and confirmed in source.
- The warm paper-cut dossier, Georgia/system type pairing, layered tabs, physical edges, and original on-thesis artwork match `.factory/design.md`. It is recognisable and is not a generic SaaS template. The social image is 1200 × 630 and the touch icon is 180 × 180.

## Earlier finding verification

Every earlier review, polish report, and cumulative handoff was read. Each result below was checked against live behavior and source.

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | Fixed: one-click isolated Demo, visible first-viewport sample, Reset, and exit all work. |
| F-1-2 | Fixed as to registry presence and runnable listed tests; F-3-4 and F-3-5 identify remaining coverage gaps. |
| F-1-3 | Fixed: the unsupported account-free exported-folder claim remains absent; offline Demo is tested. |
| F-1-4 | Fixed: live requests stay same-origin and selected files do not enter storage. |
| F-1-5 | Fixed: text returns after reload and selected files do not. |
| F-1-6 | Fixed: source content is neither fetched nor copied. |
| F-1-7 | Fixed: the ZIP contains the PDF, context, link, stylesheet, and both attachments. |
| F-1-8 | Fixed: live and clean-suite offline Demo reloads pass. |
| F-1-9 | Fixed: the Plus snapshot claim remains absent. |
| F-1-10 | Fixed: account-free/readability, encryption, and retention marketing claims remain absent. |
| F-1-11 | Fixed: cover order claim passes. |
| F-1-12 | Fixed: no price, entitlement, subscription, or checkout offer is shown. |
| F-1-13 | Fixed: no dead checkout, merchant, or refund claim remains. |
| F-1-14 | Fixed: visitor-facing provenance marketing remains absent; provenance stays in design documentation. |
| F-1-15 | Fixed: root first screen states the job, audience, and sample action. |
| F-1-16 | Fixed except for the terminology-specific F-3-2; headings and remaining actions are concrete. |
| F-1-17 | Fixed: README documents Demo and has no sentence over 22 words. |
| F-1-18 | Fixed: the dead purchase link remains absent. |
| F-1-19 | Fixed for genuine Demo/404 routes and Demo/Home history behavior; F-3-3 covers the broader legal-route focus gap. |
| F-1-20 | Reopened as F-3-1: Demo's standard description is still the root description. |
| F-1-21 | Fixed: all routes share the same header-link order and required footer contents. |
| F-2-1 | Fixed: realistic Demo content is visible in the first 390 px viewport. |
| F-2-2 | Fixed: Back to home focuses its H1 and announces the route. |
| F-2-3 | Fixed: 404 includes Try sample, Builder, and Privacy in the shared order. |
| F-2-4 | Fixed for every quoted round-2 claim; F-3-4 and F-3-5 are separate remaining coverage defects. |
| F-2-5 | Reopened as F-3-2: “supporting files” is gone, but “files” still renames attachments. |
| F-2-6 | Fixed: **Open empty builder** names and performs its result. |

The earlier verification defects also remain fixed: no undersized visible targets, nested complementary landmark, stale offline license request, invalid-PDF acceptance, or sub-16 px body/safety prose was found by the current suite and source check.

## Missed leverage

No additional AI, sync, or import feature is implied. The brief's valuable exchange format is the exported self-contained packet, which exists. AI would add a key, network disclosure, and cost to a job that is primarily deterministic packaging; it would not be justified here.

## What would make this perfect

Give Demo its own standard meta description, use **attachments** everywhere, move and announce focus on every route, fully assert the exact sample counts, register and test the 75 MiB attachment limit, and expose the actual release SHA in every footer. After those six fixes, rerun this entire checklist from a new clean clone and fresh live contexts.

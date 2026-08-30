# Adversarial first-read review 2

## Verdict: FAIL

The product has a clear landing screen and a working isolated sample, but it does not yet meet the required try-out and route-contract details. On a 390 px phone, entering the demo does not show the populated product in the first viewport. Back navigation does not restore focus or announce the destination, and the 404 header is not the shared header. There are also unregistered, and in one case misleading, visitor-reliance claims.

## Cold visit

Fresh Chromium contexts opened `https://review-pdf-packet.sociobot.in/` at 390 x 844 and 1440 x 900 on 2026-08-30 before scrolling. No console or page errors occurred on the root or demo routes, and all recorded requests were same-origin.

Before scrolling, the answer was clear in both viewports:

- **What it does:** packages a reviewed PDF with review context and attachments for an external reviewer.
- **For whom:** people sending a reviewed PDF to an external reviewer.
- **What to click first:** **Try it with sample data**, which says it opens a complete packet to inspect and reset.

The exact first-screen copy that supports this is: “Package a PDF for external review”; “For people sending a reviewed PDF, add comments, decisions, links, and files for the external reviewer.”; and “Try it with sample data”. The root first-read test therefore passes.

## Findings

### F-2-1 / F-1-1 (reopened) — BLOCKING — The demo first screen does not show the product in use

**Location/evidence:** At 390 x 844, direct `/demo` loads the required banner, then the full landing hero. The bottom of the viewport stops after “Sample data stays separate from your drafts.” The seeded `northstar-launch-review.pdf`, three context items, and two attachments are below the fold. The live first viewport is recorded at `/tmp/review2-phone-demo.png` during this review.

**Why this fails:** The prior repair added a real isolated demo, but the required first screen after one click must already show realistic sample data being used. A first-time phone visitor has to scroll past a second hero before seeing the value of the sample.

**Concrete fix:** On `/demo` at phone width, place a compact populated packet preview above the fold immediately after the banner (PDF name, one comment/decision, and attachment count), or route the demo directly to the populated builder with an appropriate compact header. Keep the banner, Reset demo, and Start for real controls visible and retain the separate `demo:review-packet:*` namespace. Add a 390 px Playwright assertion that the first viewport contains the seeded PDF and at least one seeded context item.

### F-2-2 / F-1-19 (reopened) — BLOCKING — Back navigation does not restore focus or announce the route

**Location/evidence:** From `/`, activating **Try it with sample data** correctly opens `/demo`, focuses `#hero-title`, and announces “Demo route loaded.” Calling browser Back returns to `/`, but `document.activeElement` is `BODY` and `#route-announcer` is empty. This reproduces in a fresh live browser context.

**Why this fails:** The earlier finding required route focus and back behaviour. A keyboard or screen-reader visitor returning from Demo receives neither a destination announcement nor a useful focus position.

**Concrete fix:** Handle `pageshow`/history restoration for the root route: move focus to the root `<h1>` (or the previously activated element when appropriate), restore the saved scroll position, and set the polite route announcer to “Review Packet home loaded.” Add a Playwright test that enters Demo, calls `page.goBack()`, then asserts root URL, focused root H1, and a non-empty route announcement.

### F-2-3 / F-1-21 (reopened) — BLOCKING — The 404 page does not use the shared header

**Location/evidence:** The root, `/demo`, `/privacy/`, and `/terms/` headers contain **Try sample**, **Builder**, and **Privacy**. `public/404.html` and live `/not-a-real-page` contain only **Try sample** and **Privacy**; **Builder** is absent.

**Why this fails:** The earlier repair claimed a common header on app, legal, and 404 routes. The route a lost visitor most needs to recover from is the only one missing the main-product link, so the shared site skeleton is still incomplete.

**Concrete fix:** Give the 404 header the same Builder link (`/#builder`) and the same link order as the other routes. Extend the existing metadata/skeleton test to compare the header link texts for root, demo, legal, and 404 pages.

### F-2-4 — Major — Several visitor-reliance claims are not listed in `claims.json`; one is misleading

**Exact quotes/locations:**

- Demo banner: “Demo — sample data, nothing is saved.”
- PDF picker help: “or drop it here · PDF only · up to 50 MB”.
- Export error: “Your work is safe—try again or remove very large attachments.”
- README: “The sample includes a PDF, two comments, one decision, a source link, and two attachments.”
- README: “Reset demo restores the sample.”
- README: “Start for real removes demo data and opens an empty builder.”
- README: “Demo text uses `demo:review-packet:*` storage keys. Normal drafts use `review-packet:*` keys.”

**Why this fails:** None of these exact claims appears in `.factory/claims.json`'s `where` fields. More importantly, “nothing is saved” is false as written: the live demo stores editable demo text under `demo:review-packet:draft:v1`; this review observed that key before Reset and Start for real. The registered `demo-isolation` test proves separation from real drafts, not that nothing is saved. The 50 MB limit and the export-failure safety assurance are also no longer protected by a tagged claim test.

**Concrete fix:** Rewrite the banner to “Demo — sample data; nothing is saved to your real drafts.” Add or expand claim entries and tagged observable tests for the banner/storage wording, the 50 MB PDF boundary, seeded demo contents and Reset, Start for real opening an empty builder, and the export failure/recovery guarantee. If an export failure cannot truthfully preserve the draft, replace “Your work is safe” with a precise recovery instruction that makes no guarantee. Add each relevant README location to the claim `where` values.

### F-2-5 — Minor — The same file type has two names

**Exact quotes/locations:** Hero figure caption: “A PDF, review context, and supporting files travel together.” README opening: “Review Packet packages a PDF with review context and supporting files.” The product facts and builder instead use “attachments”.

**Why this matters:** The copy audit defines the product term as “attachments,” but the landing and README use “supporting files” for the same thing. This creates an unnecessary term change for a first-time visitor.

**Concrete fix:** Use “attachments” throughout: “A PDF, review context, and attachments travel together.” and “Review Packet packages a PDF with review context and attachments.”

### F-2-6 — Minor — “Start for real” does not name its result

**Location:** Demo-banner action.

**Why this matters:** “Start for real” is an idiom rather than an outcome. It leaves a visitor to infer whether it keeps the sample, creates an account, or opens the builder.

**Concrete fix:** Rename it to **Open empty builder** and keep the adjacent explanatory sentence explicit that it removes demo data.

## Copy audit

Counts use whitespace-delimited words, treating hyphenated words, URLs, and storage-key fragments as one word. Controls and headings that are fragments are recorded separately below; there are no sentences over 22 words. Claims and wording defects are flagged in F-2-4 through F-2-6.

### Landing page prose, dynamic messages, and captions

| ID | Words | Sentence/copy | Audit result |
| --- | ---: | --- | --- |
| L01 | 6 | Package a PDF for external review | Clear H1 |
| L02 | 16 | For people sending a reviewed PDF, add comments, decisions, links, and files for the external reviewer. | Clear |
| L03 | 10 | Open a complete sample packet you can inspect and reset. | Clear |
| L04 | 5 | Files stay in this browser. | Listed claim |
| L05 | 10 | Exports a folder with the PDF, context, links, and attachments. | Listed claim |
| L06 | 7 | Sample data stays separate from your drafts. | Listed claim |
| L07 | 9 | A PDF, review context, and supporting files travel together. | F-2-5 terminology |
| L08 | 5 | Choose the document to share. | Clear |
| L09 | 6 | Record comments, decisions, links, and files. | Clear |
| L10 | 7 | Share the exported folder with your reviewer. | Clear |
| L11 | 6 | Text drafts stay on this device. | Listed claim |
| L12 | 8 | Selected files are not saved after a refresh. | Listed claim |
| L13 | 10 | The sample remains available after its first load while offline. | Listed claim |
| L14 | 8 | This is the first title your reviewer sees. | Covered by cover-order claim |
| L15 | 10 | or drop it here · PDF only · up to 50 MB | F-2-4 unlisted numeric claim |
| L16 | 10 | Add the details an external reviewer needs beside the PDF. | Clear |
| L17 | 8 | Add the notes your reviewer needs to act. | Clear |
| L18 | 8 | Source links are included without copying their content. | Listed claim |
| L19 | 7 | Add supporting files to the exported packet. | F-2-5 terminology |
| L20 | 10 | Exports a folder with the PDF, context, links, and attachments. | Listed claim |
| L21 | 12 | I checked the recipients and removed sensitive material they should not receive. | Clear confirmation |
| L22 | 8 | Check every recipient before sharing the exported folder. | Clear safety instruction |
| L23 | 7 | The exported packet starts with this cover. | Listed claim |
| L24 | 7 | Local PDF review packets for external reviewers. | Clear footer one-liner |
| L25 | 6 | Demo — sample data, nothing is saved. | F-2-4 misleading/unlisted claim |
| L26 | 13 | Explore the sample packet, then reset it or start with your own files. | F-2-6 action wording |
| L27 | 5 | Sample review packet is ready. | Clear status |
| L28 | 2 | Packet downloaded. | Clear status |
| L29 | 7 | Open index.html inside the unzipped folder. | Clear instruction |
| L30 | 6 | The packet could not be built. | Clear error start |
| L31 | 11 | Your work is safe—try again or remove very large attachments. | F-2-4 unsupported assurance |

### Landing headings and actions (fragments, not sentences)

| Copy | Audit result |
| --- | --- |
| Review Packet | Product label; clear in context |
| How to build a review packet | Informative section heading |
| Packet builder | Informative section heading |
| Build a review packet | Informative section heading |
| Document / Review context / Source links / Attachments / Export | Informative field and section headings |
| Download a review packet | Informative section heading |
| Try it with sample data / Reset demo / Add review context / Add source link / Add files / Download review packet | Result-naming actions |
| Start for real | F-2-6; replace with **Open empty builder** |

### README sentences

| ID | Words | Sentence | Audit result |
| --- | ---: | --- | --- |
| R01 | 11 | Review Packet packages a PDF with review context and supporting files. | F-2-5 terminology |
| R02 | 12 | It is for people sending a reviewed document to an external reviewer. | Clear |
| R03 | 14 | It keeps comments, decisions, and files out of email without sharing the source workspace. | Clear product description |
| R04 | 10 | Try the complete sample at `https://review-pdf-packet.sociobot.in/demo`. | Clear instruction |
| R05 | 15 | The sample includes a PDF, two comments, one decision, a source link, and two attachments. | F-2-4 unlisted claim |
| R06 | 5 | Reset demo restores the sample. | F-2-4 unlisted claim |
| R07 | 11 | Start for real removes demo data and opens an empty builder. | F-2-4 unlisted claim; F-2-6 wording |
| R08 | 7 | Demo text uses `demo:review-packet:*` storage keys. | F-2-4 unlisted claim |
| R09 | 5 | Normal drafts use `review-packet:*` keys. | F-2-4 unlisted claim |
| R10 | 12 | Selected files stay in memory and are not saved after a refresh. | Listed `text-drafts` claim |
| R11 | 14 | Review Packet creates a ZIP with `index.html`, `print.css`, your PDF, and attachments. | Listed `packet-export` claim |
| R12 | 5 | Files stay in this browser. | Listed `local-processing` claim |
| R13 | 6 | Requires Node.js 20 or newer. | Clear setup requirement |
| R14 | 5 | Open the printed local URL. | Clear instruction |
| R15 | 7 | No backend or environment variables are required. | Developer setup statement |
| R16 | 15 | Run every visitor-facing claim from a clean checkout with the commands in `.factory/claims.json`. | Clear instruction |
| R17 | 7 | The production build writes `dist/index.html`. | Clear build statement |
| R18 | 7 | Deploy `dist/` to Azure Static Web Apps. | Clear deployment instruction |
| R19 | 11 | `public/staticwebapp.config.json` provides routing, security headers, and cache policy. | Clear deployment statement |
| R20 | 1 | MIT. | Clear license statement |
| R21 | 2 | See LICENSE. | Clear instruction |

No banned plain-words marketing adjective was found. The only terminology inconsistency is “supporting files” versus “attachments”; no mood or metaphor heading remains.

## Demo, sandbox, claims, and privacy checks

- Direct `/demo` is a real route and also works via `?demo=1`. It seeds `northstar-launch-review.pdf`, two comments, one decision, one source link, and two text attachments.
- The persistent banner, Reset demo, and Start for real controls are present. Reset restored `Northstar launch review`; Start for real removed the demo key and opened an empty builder.
- In a fresh live context, demo requests were only to `https://review-pdf-packet.sociobot.in`. Demo storage contained only `demo:review-packet:draft:v1`; after Start for real it was empty. The registered local-processing test additionally verifies a selected file is neither sent nor stored.
- `.factory/claims.json` contains seven registered claims. From a clean clone at `/tmp/review-pdf-packet-review-2-SgCKrl`, all listed commands passed: `demo-isolation`, `local-processing`, `text-drafts`, `packet-export`, `offline-demo`, `source-links`, and `cover-order`. The final Playwright run recorded `{"status":"passed","failedTests":[]}`.
- `npm test` passed: Vitest 6/6; Playwright 17 passed with one intentional mobile skip. `npm run build` passed and wrote `dist/` (JavaScript gzip 7.63 kB; CSS gzip 4.97 kB).
- The registered privacy/offline behavior is therefore confirmed. F-2-4 is a registry completeness and copy-accuracy failure, not a failed registered claim command.

## Structure, links, accessibility, and identity

- Root, Demo, Privacy, Terms, `/404`, and an unknown URL were checked live. Titles, descriptions, canonical links, OG/Twitter metadata, `lang`, one H1, a main landmark, favicon, robots, and sitemap are present. Unknown URLs return the designed 404 document with HTTP 404.
- All crawled header/footer/content links returned HTTP 200, including the external `https://sociobot.in/` link. No paid checkout link remains.
- Direct Demo focuses its H1 and announces its route. The Back failure is recorded in F-2-2. The 404 header inconsistency is recorded in F-2-3.
- The warm paper-cut artwork, editorial Georgia/system type pairing, tactile layers, and explicit warm palette match `.factory/design.md` and are distinct from a generic SaaS template. No AI, import, export, or sync feature obviously implied by the brief is missing: the requested portable-folder export exists, and AI would not improve this local packet-building job enough to justify an added key-bearing feature.

## Earlier finding verification

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and handoff was read. The live site and source were checked, rather than relying on the earlier status labels.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Reopened as F-2-1: demo exists and is isolated, but its first phone screen does not show the sample in use. |
| F-1-2 | Fixed: claims registry exists and every listed command passed from the clean clone. F-2-4 identifies new registry gaps. |
| F-1-3 | Fixed: unsupported account-free/offline-export promise remains removed; offline sample claim is registered and passes. |
| F-1-4 | Fixed: live request log is same-origin and the registered local-processing test passes. |
| F-1-5 | Fixed: registered text-draft test passes; selected files do not survive refresh. |
| F-1-6 | Fixed: registered source-link test passes without fetching the source content. |
| F-1-7 | Fixed: registered export test passes for PDF, context, link, stylesheet, and attachments. |
| F-1-8 | Fixed: registered offline-demo test passes after first online load. |
| F-1-9 | Fixed: the unconfigured Plus snapshot offer is absent. |
| F-1-10 | Fixed: the prior account-free/readability and retention marketing claims remain removed. |
| F-1-11 | Fixed: registered cover-order test passes. |
| F-1-12 | Fixed: no unconfigured price, entitlement, subscription, or checkout offer appears. |
| F-1-13 | Fixed: no dead checkout, merchant, or refund claim appears. |
| F-1-14 | Fixed: visitor-facing provenance marketing remains removed; provenance is documented in design.md. |
| F-1-15 | Fixed: the root first screen names the PDF-review job, audience, and clear first action. |
| F-1-16 | Fixed: remaining headings/actions name real sections and outcomes, except F-2-6. |
| F-1-17 | Fixed: README stays below 22 words per sentence and documents the demo. |
| F-1-18 | Fixed: dead Buy Plus action remains removed. |
| F-1-19 | Reopened as F-2-2: demo route focus works, but Back focus and route announcement do not. |
| F-1-20 | Fixed: each checked route has its required metadata and product social art. |
| F-1-21 | Reopened as F-2-3: 404 omits the shared Builder link. |

## What would make this perfect

Make Demo immediately visual at 390 px, make browser history as accessible as direct navigation, and use one identical recovery header everywhere. Then make every retained promise exact, tested, and named consistently: a demo that saves only to its isolated draft namespace, attachments called attachments, and an **Open empty builder** action that describes what it does.

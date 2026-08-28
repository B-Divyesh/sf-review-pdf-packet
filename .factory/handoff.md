# Review Packet v1 handoff

## What shipped

- A responsive, local-first Vite + TypeScript packet builder for one reviewed PDF, structured comments and decisions, source links, and supporting attachments.
- A real ZIP export containing a standalone `index.html`, print stylesheet, original PDF, and attachment folder. The generated review page is escaped against markup injection, works without this website, embeds the PDF when supported, and includes readable fallbacks.
- File/type/size/link validation, explicit sensitive-data confirmation, actionable empty and error states, keyboard paths, removal with undo, text-draft persistence, mobile layout, and offline shell caching.
- Review Packet Plus license handling per the Sociobot contract: checkout link, return-token capture and URL cleanup, local token storage, once-daily verification, cached offline unlock, revocation handling, and paste-to-restore. Plus adds local text snapshots and a custom cover note; core export and accessibility remain free.
- Paper-cut diorama identity and an original generated hero asset. Full direction, prompt, review, palette, type, spacing, motion, and provenance are in `.factory/design.md`.
- Privacy and terms pages, MIT license, security/cache headers, robots/sitemap files, and product documentation.

## Run and verify

```sh
npm install
npm test
npm run build
```

The exact build command is `npm run build`; deploy `dist/`. The final local run produced `dist/index.html` at the root.

Verification on 2026-08-28:

- `npm test`: 5 unit tests and 10 applicable Playwright tests passed across desktop Chromium and a 390px mobile viewport; 2 project-inapplicable cases skipped by design.
- Covered: successful packet download, ZIP structure/checksum, output escaping, validation/focus, keyboard context entry, mobile overflow, serious/critical axe findings, console/page errors, and an interactive offline reload.
- `npm run build`: passed. Initial JS 20,692 bytes raw / 7.78 KB gzip; CSS 15,835 bytes raw / 4.67 KB gzip; hero WebP 51,004 bytes.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, title and `lang` present, exactly one `h1`, main landmark present, no missing alt text, no unlabeled buttons, and zero console/page errors. Measured local load: 524 ms.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0, total blocking time 10 ms.
- `npm audit --omit=dev`: zero vulnerabilities.
- Visual inspection completed at 1440px desktop and 390px mobile.

## Known constraints and next steps

- The export intentionally uses uncompressed ZIP entries to avoid a large runtime dependency; its size is approximately the sum of the chosen files. The UI caps the PDF at 50 MB and attachments at 75 MB total to keep browser memory use predictable.
- Files are deliberately not persisted between reloads; text is. Users re-add the PDF and attachments after a refresh or snapshot restore.
- Exported folders are not encrypted or a legal retention system, and the interface says so before download.
- The factory must register `review-pdf-packet`, configure the production return URL, and ensure the hosted one-time price matches the displayed $12 before release. No product ID or payment-provider secret is embedded here.
- Real payment completion was not exercised because factory billing registration happens after handoff; callback parsing, caching, verification requests, restore UI, and failure/offline states are implemented.

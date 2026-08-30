# Review Packet

Review Packet packages a PDF with review context and attachments. It is for people sending a reviewed document to an external reviewer. It keeps comments, decisions, and attachments out of email without sharing the source workspace.

Try the complete sample at <https://review-pdf-packet.sociobot.in/demo>. It includes a PDF, two comments, one decision, a source link, and two attachments. **Reset demo** restores the sample. **Open empty builder** removes demo data and opens an empty builder. Demo text uses `demo:review-packet:*` storage keys. Normal drafts use `review-packet:*` keys. Selected files stay in memory and are not saved after a refresh.

Review Packet creates a ZIP with `index.html`, `print.css`, your PDF, and attachments. Attachments can total up to 75 MB. Files stay in this browser.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the printed local URL. No backend or environment variables are required.

## Test and build

```sh
npm test
npm run build
```

Run every visitor-facing claim from a clean checkout with the commands in [.factory/claims.json](.factory/claims.json). The production build writes `dist/index.html`.

## Deploy

Deploy `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` provides routing, security headers, and cache policy. The factory manages deployment and DNS.

## Product notes

- Scope: [.factory/brief.json](.factory/brief.json)
- Visual system and asset provenance: [.factory/design.md](.factory/design.md)
- Demo contract: [.factory/demo.md](.factory/demo.md)
- Claims and tests: [.factory/claims.json](.factory/claims.json)
- Privacy: [/privacy/](/privacy/)
- Terms: [/terms/](/terms/)

## License

MIT. See [LICENSE](LICENSE).

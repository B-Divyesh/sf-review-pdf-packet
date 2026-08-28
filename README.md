# Review Packet

Review Packet turns a reviewed PDF, structured comments and decisions, source links, and supporting files into one portable offline folder. It is for professionals who need to hand work to an external reviewer without granting access to the source workspace or rebuilding the context in email.

The builder runs entirely in the browser. It exports a standards-based ZIP containing `index.html`, `print.css`, the original PDF, and attachments. Text drafts stay in local storage; selected files remain only in memory. The complete builder and export are free. A one-time Plus license adds reusable text snapshots and a custom cover note through the Sociobot billing API.

Live: <https://review-pdf-packet.sociobot.in>

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the printed local URL. No backend or environment variables are required.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs unit coverage for safe export generation and the ZIP writer, then Playwright keyboard/mobile/accessibility flows. The exact production build command is `npm run build`; output lands in `dist/` with `dist/index.html` at its root.

## Deploy

Deploy the contents of `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` supplies security and cache headers. Product registration, checkout configuration, DNS, and billing are factory concerns and are intentionally not managed here.

## Product notes

- Scope and evidence: [.factory/brief.json](.factory/brief.json)
- Visual system and image provenance: [.factory/design.md](.factory/design.md)
- Verification and known gaps: [.factory/handoff.md](.factory/handoff.md)
- Privacy and terms are available at `/privacy/` and `/terms/`.

## License

MIT. See [LICENSE](LICENSE).

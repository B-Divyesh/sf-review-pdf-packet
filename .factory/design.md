# Review Packet visual thesis

## Direction: paper-cut diorama

Review Packet should feel like opening a carefully assembled physical handoff folder: a main sheet, clipped notes, coloured decision tabs, and a pocket of attachments. Layering explains the product—the source document sits at the back, context is attached in front, and the finished packet gathers those layers into one portable object. It is tactile and editorial rather than a generic SaaS dashboard.

The app uses an explicit warm-light treatment only. A dark theme would undermine the paper metaphor and make exported/printed output less predictable; all surfaces and controls are painted explicitly.

## Palette

- `paper`: `#F6F0E2`, the warm canvas.
- `sheet`: `#FFFDF7`, the document surface.
- `ink`: `#20251F`, body copy (13.4:1 on sheet).
- `muted-ink`: `#5D625A`, supporting copy (6.1:1 on sheet).
- `forest`: `#285943`, structural accent, focus and links (7.4:1 on sheet).
- `marigold`: `#E8A72C`, physical tabs and highlights; never used alone for text.
- `coral`: `#B54533`, comment markers and destructive actions (5.2:1 on sheet).
- `sky`: `#BFD8D2`, secondary paper layer.
- `success`: `#286243`; `warning`: `#8A5900`; `danger`: `#A33A2B`.

Subtle shadows use neutral transparent ink, never glow. Dashed edges signal “drop or attach”; solid cut edges signal committed content.

## Typography and spacing

No font files or external requests. Display type uses Georgia with a compact editorial rhythm; utility copy uses the system sans stack. This pairing resembles a marked-up manuscript plus the precise labels on a filing system while keeping the first load tiny.

Type steps: 14, 16, 19, 24, 34, and fluid 48–68px. Body is at least 16px with 1.55 line height. Labels use restrained uppercase tracking. Long copy is capped at 68 characters.

Spacing follows a 4/8px rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Interactive targets are at least 44px. On phones, the two-column workbench becomes a single ordered stack; decoration compresses while all builder actions remain.

## Interaction grammar

- A step rail reads like numbered index tabs: Document → Context → Export.
- Imported files become layered paper slips with folded corners and clear remove actions.
- Comments and decisions share one context stack but use distinct stamped shapes and visible labels, never colour alone.
- The preview is a miniature packet cover rather than a duplicate form.
- Feedback is immediate in a polite live region. Destructive removal offers an Undo action.
- Primary actions use dark forest “ink”; secondary actions are unfilled paper controls.

## Motion policy

Layers enter from their physical origin with 180–240ms transform/opacity transitions; the export progress indicator uses opacity and width. No looping decorative motion. With `prefers-reduced-motion`, transforms and smooth scrolling are removed and state changes are instant or opacity-only.

## Illustration and asset plan

The hero illustration is an original AI-generated, text-free paper-cut diorama: a warm cream dossier, deep green cover sheet, coral comment tabs, amber decision slip, teal attachment pocket, and a tiny folded paper arrow carrying the packet outward. It demonstrates “context travelling with the document,” not an invented feature. It is exported as WebP under 300 KB with explicit dimensions. Interface icons and the export packet artwork are original inline CSS/SVG geometry authored for this product.

Art-direction prompt: “Editorial paper-cut diorama of a professional document review handoff: layered cream report pages, deep forest green folder, coral annotation tabs, warm marigold decision card, muted teal attachment pocket, a folded paper arrow suggesting a packet travelling outward; tactile cut-paper edges, subtle fibres, soft studio side light, restrained shadows, straight-on three-quarter view, warm cream background, sophisticated and minimal, no people, no screens, no text, no letters, no watermark, no logos, no brands.”

Negative list: legible text, logos, people, hands, devices, photorealistic office clutter, glassmorphism, gradients, neon, watermark, legal seals.

## Provenance

- `public/review-packet-diorama.webp`: generated for this product with Azure OpenAI image generation (`factory-image`) on 2026-08-28 from the art-direction prompt above; original generated asset. Reviewed for text artefacts, unintended symbols, seams, brands, and misleading UI. Optimised locally to WebP.
- Interface marks and exported packet visuals: hand-authored CSS/SVG by the builder, 2026-08-28, released with the project under MIT.

import type { PacketState } from './types';
import { createZip, type ZipEntry } from './zip';
import { packetSlug, safeFileName } from './model';

const enc = new TextEncoder();

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char] as string);
}

export function validHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

function uniqueFileNames(files: File[]): string[] {
  const used = new Set<string>();
  return files.map((file, index) => {
    const safe = safeFileName(file.name, `attachment-${index + 1}`);
    let candidate = safe;
    let counter = 2;
    const dot = safe.lastIndexOf('.');
    const stem = dot > 0 ? safe.slice(0, dot) : safe;
    const ext = dot > 0 ? safe.slice(dot) : '';
    while (used.has(candidate.toLowerCase())) candidate = `${stem}-${counter++}${ext}`;
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

export const packetPrintCss = `
@page { margin: 18mm; }
* { box-sizing: border-box; }
body { margin: 0; color: #20251f; background: #f6f0e2; font: 16px/1.55 system-ui, sans-serif; }
main { width: min(920px, calc(100% - 32px)); margin: 40px auto; }
h1, h2 { font-family: Georgia, serif; font-weight: 500; line-height: 1.1; }
h1 { max-width: 700px; margin: 18px 0; font-size: clamp(38px, 7vw, 64px); }
h2 { font-size: 28px; }
a { color: #193b2c; text-underline-offset: 3px; }
.cover, section { background: #fffdf7; border: 1px solid #cfc6b2; }
.cover { min-height: 520px; padding: 64px; border-top: 14px solid #285943; position: relative; }
.cover:after { content: ''; position: absolute; right: -1px; top: 90px; width: 32px; height: 64px; background: #c95745; }
.kicker, .tag { color: #285943; font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.summary { display: flex; flex-wrap: wrap; gap: 12px 28px; margin-top: 56px; padding-top: 20px; border-top: 1px solid #cfc6b2; }
.summary span { font-weight: 700; }
.note { max-width: 680px; margin-top: 28px; padding: 18px; background: #eef4f0; border-left: 5px solid #285943; white-space: pre-wrap; }
section { margin-top: 24px; padding: 36px; }
.context-list { list-style: none; padding: 0; }
.context-list li { break-inside: avoid; margin: 16px 0; padding: 18px; background: #f9f5ea; border-left: 6px solid #c95745; }
.context-list li.decision { border-left-color: #e8a72c; }
.context-list p { margin: 6px 0 0; white-space: pre-wrap; }
.location { color: #5d625a; font-size: 14px; }
.file-list li, .link-list li { margin: 12px 0; }
.button-link { display: inline-block; min-height: 44px; padding: 10px 16px; background: #285943; color: white; text-decoration: none; }
.notice { margin-top: 24px; padding: 16px; background: #fff2ce; border-left: 5px solid #8a5900; }
footer { margin: 32px 0; color: #5d625a; font-size: 13px; }
@media print { body { background: white; } main { width: 100%; margin: 0; } .cover, section { border-color: #777; box-shadow: none; } .cover { min-height: 245mm; page-break-after: always; } section { break-inside: avoid; } a { color: #20251f; } }
`;

export function renderPacketHtml(state: PacketState, pdfName: string, attachmentNames: string[]): string {
  const title = escapeHtml(state.title.trim());
  const prepared = state.preparedBy.trim() ? `Prepared by ${escapeHtml(state.preparedBy.trim())}` : 'Prepared for external review';
  const contextItems = state.context.length
    ? `<ol class="context-list">${state.context.map((item) => `<li class="${item.kind}"><span class="tag">${item.kind}</span>${item.location ? `<div class="location">${escapeHtml(item.location)}</div>` : ''}<p>${escapeHtml(item.text)}</p></li>`).join('')}</ol>`
    : '<p>No comments or decisions were included.</p>';
  const links = state.links
    .map((link) => ({ ...link, safeUrl: validHttpUrl(link.url) }))
    .filter((link) => link.safeUrl)
    .map((link) => `<li><a href="${escapeHtml(link.safeUrl!)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label.trim() || link.safeUrl!)}</a><br><small>${escapeHtml(link.safeUrl!)}</small></li>`)
    .join('');
  const attachments = attachmentNames.map((name, i) => `<li><a href="attachments/${encodeURIComponent(name)}" download>${escapeHtml(state.attachments[i].name)}</a></li>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self' data:; object-src 'self'; frame-src 'self';"><title>${title} — Review packet</title><link rel="stylesheet" href="print.css"></head>
<body><main><article class="cover"><p class="kicker">Review packet</p><h1>${title}</h1><p>${prepared}<br>${escapeHtml(new Date().toLocaleDateString(undefined, { dateStyle: 'long' }))}</p>${state.handoffNote.trim() ? `<div class="note"><strong>Handoff note</strong><br>${escapeHtml(state.handoffNote.trim())}</div>` : ''}<div class="summary"><span>${state.context.length} context item${state.context.length === 1 ? '' : 's'}</span><span>${state.links.filter((link) => validHttpUrl(link.url)).length} source link${state.links.filter((link) => validHttpUrl(link.url)).length === 1 ? '' : 's'}</span><span>${attachmentNames.length} attachment${attachmentNames.length === 1 ? '' : 's'}</span></div></article>
<section><h2>Reviewed document</h2><p><a class="button-link" href="${encodeURIComponent(pdfName)}">Open ${escapeHtml(state.pdf?.name ?? 'PDF')}</a></p><p>If your browser does not open the PDF here, open the PDF file beside this index.</p><object data="${encodeURIComponent(pdfName)}" type="application/pdf" width="100%" height="760"><p>Preview unavailable. <a href="${encodeURIComponent(pdfName)}">Open the PDF</a>.</p></object></section>
<section><h2>Comments and decisions</h2>${contextItems}</section>
${links ? `<section><h2>Source links</h2><ul class="link-list">${links}</ul><p class="notice">Links may require access to their original workspace. The linked content is not copied into this packet.</p></section>` : ''}
${attachments ? `<section><h2>Attachments</h2><ul class="file-list">${attachments}</ul></section>` : ''}
<footer>This packet was assembled with Review Packet. Anyone with this folder can read its contents; keep it with the same care as the source document.</footer></main></body></html>`;
}

export async function buildPacketZip(state: PacketState): Promise<Blob> {
  if (!state.pdf) throw new Error('A PDF is required.');
  const attachmentNames = uniqueFileNames(state.attachments);
  const pdfName = safeFileName(state.pdf.name, 'document.pdf').toLowerCase().endsWith('.pdf') ? safeFileName(state.pdf.name, 'document.pdf') : `${safeFileName(state.pdf.name, 'document')}.pdf`;
  const entries: ZipEntry[] = [
    { name: 'index.html', data: enc.encode(renderPacketHtml(state, pdfName, attachmentNames)) },
    { name: 'print.css', data: enc.encode(packetPrintCss.trim()) },
    { name: pdfName, data: new Uint8Array(await state.pdf.arrayBuffer()) },
  ];
  for (let i = 0; i < state.attachments.length; i++) entries.push({ name: `attachments/${attachmentNames[i]}`, data: new Uint8Array(await state.attachments[i].arrayBuffer()) });
  return createZip(entries);
}

export function downloadPacket(blob: Blob, title: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `${packetSlug(title)}-review-packet.zip`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

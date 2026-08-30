import './style.css';
import { buildPacketZip, downloadPacket, validHttpUrl } from './export';
import { clearDemoStorage, formatBytes, isDemoMode, loadDraft, makeId, saveDraft } from './model';
import { validatePdfFile } from './pdf-validation';
import type { ContextItem, PacketState, PacketTextState } from './types';

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

const demo = isDemoMode();
const form = byId<HTMLFormElement>('packet-form');
const titleInput = byId<HTMLInputElement>('packet-title');
const preparedInput = byId<HTMLInputElement>('prepared-by');
const pdfInput = byId<HTMLInputElement>('pdf-input');
const attachmentInput = byId<HTMLInputElement>('attachment-input');
const contextKind = byId<HTMLSelectElement>('context-kind');
const contextLocation = byId<HTMLInputElement>('context-location');
const contextText = byId<HTMLTextAreaElement>('context-text');
const contextError = byId<HTMLElement>('context-error');
const exportError = byId<HTMLElement>('export-error');
const status = byId<HTMLElement>('status');
const offlineBanner = byId<HTMLElement>('offline-banner');

const DEMO_TEXT: PacketTextState = {
  title: 'Northstar launch review',
  preparedBy: 'Maya Chen, Product Operations',
  handoffNote: '',
  context: [
    { id: 'demo-comment-1', kind: 'comment', location: 'Page 3, pricing table', text: 'Please confirm that annual pricing matches the approved sales sheet.' },
    { id: 'demo-comment-2', kind: 'comment', location: 'Page 5, launch timeline', text: 'Check whether the partner announcement date can remain public.' },
    { id: 'demo-decision-1', kind: 'decision', location: 'Page 2, positioning', text: 'Approved: use the revised customer proof point in the opening summary.' },
  ],
  links: [{ id: 'demo-link-1', label: 'Authorised launch brief', url: 'https://example.com/northstar-launch-brief' }],
};

function sampleFiles(): { pdf: File; attachments: File[] } {
  const pdf = new File([new Blob(['%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF'], { type: 'application/pdf' })], 'northstar-launch-review.pdf', { type: 'application/pdf' });
  const attachments = [
    new File(['Launch review checklist\n- Verify claims\n- Confirm owners\n'], 'launch-review-checklist.txt', { type: 'text/plain' }),
    new File(['Partner announcement: 14 October\nSales enablement: 21 October\n'], 'launch-timeline.txt', { type: 'text/plain' }),
  ];
  return { pdf, attachments };
}

const savedDemoDraft = demo ? loadDraft() : null;
const restored = demo ? (savedDemoDraft?.title ? savedDemoDraft : structuredClone(DEMO_TEXT)) : loadDraft();
const state: PacketState = { ...restored, pdf: null, attachments: [] };
let removed: { type: 'context'; item: ContextItem; index: number } | { type: 'attachment'; item: File; index: number } | { type: 'pdf'; item: File } | null = null;
let persistTimer = 0;
let toastTimer = 0;

function textState(): PacketTextState { return { title: state.title, preparedBy: state.preparedBy, handoffNote: '', context: state.context, links: state.links }; }
function persist(): void { window.clearTimeout(persistTimer); persistTimer = window.setTimeout(() => saveDraft(textState()), 180); }
function announce(message: string): void { status.textContent = message; }
function setText(id: string, text: string): void { byId(id).textContent = text; }
function updatePreview(): void {
  setText('preview-title', state.title.trim() || 'Untitled packet');
  setText('preview-byline', state.preparedBy.trim() ? `Prepared by ${state.preparedBy.trim()}` : 'Prepared for external review');
  setText('preview-pdf', state.pdf?.name ?? 'Not added');
  setText('preview-context', `${state.context.length} item${state.context.length === 1 ? '' : 's'}`);
  setText('preview-attachments', `${state.attachments.length} file${state.attachments.length === 1 ? '' : 's'}`);
}
function makeRemoveButton(label: string, action: () => void): HTMLButtonElement { const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-button'; button.setAttribute('aria-label', label); button.textContent = 'Remove'; button.addEventListener('click', action); return button; }
function showUndo(message: string): void { window.clearTimeout(toastTimer); setText('toast-text', message); byId('toast').hidden = false; toastTimer = window.setTimeout(() => { byId('toast').hidden = true; removed = null; }, 6000); }

function renderPdf(): void {
  const list = byId('pdf-list'); list.replaceChildren(); if (!state.pdf) return;
  const row = document.createElement('div'); row.className = 'file-row'; const info = document.createElement('p'); const name = document.createElement('strong'); name.textContent = state.pdf.name; const size = document.createElement('small'); size.textContent = `${formatBytes(state.pdf.size)} · ready to package`; info.append(name, size);
  row.append(info, makeRemoveButton(`Remove ${state.pdf.name}`, () => { removed = { type: 'pdf', item: state.pdf! }; state.pdf = null; pdfInput.value = ''; renderPdf(); updatePreview(); showUndo('PDF removed.'); })); list.append(row);
}
async function acceptPdf(file?: File): Promise<void> { if (!file) return; const validation = await validatePdfFile(file); if (!validation.valid) { announce(validation.message); return; } if (file.size > 50 * 1024 * 1024) { announce('That PDF is larger than 50 MB. Choose a smaller PDF.'); return; } state.pdf = file; renderPdf(); updatePreview(); announce(`${file.name} is ready.`); }
function renderContext(): void {
  const list = byId<HTMLOListElement>('context-list'); list.replaceChildren(); byId('context-empty').hidden = state.context.length > 0;
  state.context.forEach((item, index) => { const card = document.createElement('li'); card.className = `context-card ${item.kind}`; const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = item.kind; card.append(tag); if (item.location) { const loc = document.createElement('small'); loc.textContent = item.location; card.append(loc); } const copy = document.createElement('p'); copy.textContent = item.text; card.append(copy); card.append(makeRemoveButton(`Remove ${item.kind}`, () => { removed = { type: 'context', item, index }; state.context.splice(index, 1); renderContext(); updatePreview(); persist(); showUndo(`${item.kind === 'comment' ? 'Comment' : 'Decision'} removed.`); })); list.append(card); });
}
function renderAttachments(): void {
  const list = byId('attachment-list'); list.replaceChildren(); state.attachments.forEach((file, index) => { const row = document.createElement('div'); row.className = 'file-row'; const info = document.createElement('p'); const name = document.createElement('strong'); name.textContent = file.name; const size = document.createElement('small'); size.textContent = formatBytes(file.size); info.append(name, size); row.append(info, makeRemoveButton(`Remove ${file.name}`, () => { removed = { type: 'attachment', item: file, index }; state.attachments.splice(index, 1); renderAttachments(); updatePreview(); showUndo('Attachment removed.'); })); list.append(row); });
}
function renderLinks(): void {
  const list = byId('links-list'); list.replaceChildren(); state.links.forEach((link, index) => { const row = document.createElement('div'); row.className = 'link-row'; const label = document.createElement('label'); label.textContent = 'Link label'; const labelInput = document.createElement('input'); labelInput.value = link.label; labelInput.maxLength = 80; labelInput.placeholder = 'e.g. Source brief'; const urlLabel = document.createElement('label'); urlLabel.textContent = 'Web address'; const urlInput = document.createElement('input'); urlInput.value = link.url; urlInput.type = 'url'; urlInput.placeholder = 'https://…'; const errorId = `link-error-${link.id}`; const error = document.createElement('small'); error.className = 'field-error'; error.id = errorId; urlInput.setAttribute('aria-describedby', errorId); labelInput.addEventListener('input', () => { link.label = labelInput.value; persist(); }); urlInput.addEventListener('input', () => { link.url = urlInput.value; urlInput.removeAttribute('aria-invalid'); error.textContent = ''; persist(); }); label.append(labelInput); urlLabel.append(urlInput, error); row.append(label, urlLabel, makeRemoveButton('Remove source link', () => { state.links.splice(index, 1); renderLinks(); persist(); announce('Source link removed.'); })); list.append(row); });
}
function seedDemo(): void { const sample = sampleFiles(); Object.assign(state, structuredClone(DEMO_TEXT), sample); titleInput.value = state.title; preparedInput.value = state.preparedBy; renderPdf(); renderContext(); renderAttachments(); renderLinks(); updatePreview(); saveDraft(textState()); announce('Sample review packet is ready.'); }
function restoreDemoFiles(): void { const sample = sampleFiles(); state.pdf = sample.pdf; state.attachments = sample.attachments; renderPdf(); renderContext(); renderAttachments(); renderLinks(); updatePreview(); announce('Sample review packet is ready.'); }

titleInput.value = state.title; preparedInput.value = state.preparedBy;
for (const input of [titleInput, preparedInput]) input.addEventListener('input', () => { state.title = titleInput.value; state.preparedBy = preparedInput.value; titleInput.removeAttribute('aria-invalid'); exportError.textContent = ''; updatePreview(); persist(); });
pdfInput.addEventListener('change', () => { void acceptPdf(pdfInput.files?.[0]); });
attachmentInput.addEventListener('change', () => { const incoming = [...(attachmentInput.files ?? [])]; const total = [...state.attachments, ...incoming].reduce((sum, file) => sum + file.size, 0); if (total > 75 * 1024 * 1024) { announce('Attachments would exceed 75 MB in total. Remove a file or choose smaller files.'); return; } state.attachments.push(...incoming); attachmentInput.value = ''; renderAttachments(); updatePreview(); if (incoming.length) announce(`${incoming.length} attachment${incoming.length === 1 ? '' : 's'} added.`); });
const drop = byId('pdf-drop'); for (const eventName of ['dragenter', 'dragover']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.add('dragging'); }); for (const eventName of ['dragleave', 'drop']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.remove('dragging'); }); drop.addEventListener('drop', (event) => { void acceptPdf((event as DragEvent).dataTransfer?.files[0]); });
byId('add-context').addEventListener('click', () => { const text = contextText.value.trim(); if (!text) { contextText.setAttribute('aria-invalid', 'true'); contextError.textContent = 'Write the comment or decision first.'; contextText.focus(); return; } state.context.push({ id: makeId(), kind: contextKind.value as ContextItem['kind'], location: contextLocation.value.trim(), text }); contextText.value = ''; contextLocation.value = ''; contextText.removeAttribute('aria-invalid'); contextError.textContent = ''; renderContext(); updatePreview(); persist(); announce('Review context added to the packet.'); contextText.focus(); });
contextText.addEventListener('input', () => { contextText.removeAttribute('aria-invalid'); contextError.textContent = ''; });
byId('add-link').addEventListener('click', () => { state.links.push({ id: makeId(), label: '', url: '' }); renderLinks(); const inputs = byId('links-list').querySelectorAll('input'); (inputs[inputs.length - 2] as HTMLInputElement | undefined)?.focus(); persist(); });
byId('undo-button').addEventListener('click', () => { if (!removed) return; if (removed.type === 'context') { state.context.splice(removed.index, 0, removed.item); renderContext(); persist(); } if (removed.type === 'attachment') { state.attachments.splice(removed.index, 0, removed.item); renderAttachments(); } if (removed.type === 'pdf') { state.pdf = removed.item; renderPdf(); } updatePreview(); removed = null; byId('toast').hidden = true; announce('Removal undone.'); });
form.addEventListener('submit', async (event) => { event.preventDefault(); exportError.textContent = ''; if (!state.title.trim()) { titleInput.setAttribute('aria-invalid', 'true'); exportError.textContent = 'Add a packet title before exporting.'; titleInput.focus(); return; } if (!state.pdf) { exportError.textContent = 'Add the reviewed PDF before exporting.'; pdfInput.focus(); return; } const badLink = state.links.find((link) => link.url.trim() && !validHttpUrl(link.url)); if (badLink) { const input = byId('links-list').querySelectorAll<HTMLInputElement>('input[type="url"]')[state.links.indexOf(badLink)]; input.setAttribute('aria-invalid', 'true'); const error = input.parentElement?.querySelector('.field-error'); if (error) error.textContent = 'Use a complete http:// or https:// address.'; exportError.textContent = 'Fix the highlighted source link before exporting.'; input.focus(); return; } if (!byId<HTMLInputElement>('sensitive-check').checked) { exportError.textContent = 'Confirm that you checked the recipients and sensitive contents.'; byId<HTMLInputElement>('sensitive-check').focus(); return; } const button = byId<HTMLButtonElement>('export-button'); button.disabled = true; button.textContent = 'Assembling packet…'; announce('Assembling your review packet.'); try { const blob = await buildPacketZip(state); downloadPacket(blob, state.title); announce('Packet downloaded. Open index.html inside the unzipped folder.'); } catch { exportError.textContent = 'The packet could not be built. Try again or remove very large attachments.'; } finally { button.disabled = false; button.textContent = 'Download review packet'; } });
function updateOnlineState(): void { offlineBanner.hidden = navigator.onLine; }
window.addEventListener('online', () => { offlineBanner.hidden = true; }); window.addEventListener('offline', () => { offlineBanner.hidden = false; }); updateOnlineState();
if (demo) {
  const rootTitle = byId('hero-title');
  const demoRouteTitle = document.createElement('h2');
  for (const attribute of rootTitle.attributes) demoRouteTitle.setAttribute(attribute.name, attribute.value);
  demoRouteTitle.textContent = rootTitle.textContent;
  rootTitle.replaceWith(demoRouteTitle);
  const previewTitle = byId('demo-preview-title');
  const demoHeading = document.createElement('h1');
  for (const attribute of previewTitle.attributes) demoHeading.setAttribute(attribute.name, attribute.value);
  demoHeading.textContent = previewTitle.textContent;
  previewTitle.replaceWith(demoHeading);
  byId('demo-banner').hidden = false;
  byId('demo-first-preview').hidden = false;
  document.title = 'Demo — Review Packet';
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://review-pdf-packet.sociobot.in/demo');
  for (const [selector, value] of [['meta[property="og:title"]', 'Demo — Review Packet'], ['meta[property="og:description"]', 'Inspect a complete sample PDF review packet and reset it at any time.'], ['meta[name="twitter:title"]', 'Demo — Review Packet'], ['meta[name="twitter:description"]', 'Inspect a complete sample PDF review packet and reset it at any time.']] as const) document.querySelector(selector)?.setAttribute('content', value);
  byId('route-announcer').textContent = 'Demo route loaded.';
  if (savedDemoDraft?.title) restoreDemoFiles(); else seedDemo();
  requestAnimationFrame(() => byId('demo-preview-title').focus());
  byId('reset-demo').addEventListener('click', () => { clearDemoStorage(); seedDemo(); });
  byId('start-real').addEventListener('click', () => clearDemoStorage());
} else {
  renderPdf(); renderContext(); renderAttachments(); renderLinks(); updatePreview();
  const restoreHomeFocus = (): void => {
    sessionStorage.removeItem('review-packet:return-focus');
    byId('route-announcer').textContent = 'Review Packet home loaded.';
    requestAnimationFrame(() => byId('hero-title').focus());
  };
  if (sessionStorage.getItem('review-packet:return-focus') === '1') restoreHomeFocus();
  window.addEventListener('pagehide', () => sessionStorage.setItem('review-packet:return-focus', '1'));
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    restoreHomeFocus();
  });
}
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));

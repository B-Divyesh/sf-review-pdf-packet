import './style.css';
import { buildPacketZip, downloadPacket, validHttpUrl } from './export';
import { formatBytes, getSnapshots, loadDraft, makeId, saveDraft, saveSnapshot } from './model';
import { initialiseLicense, verifyLicense } from './license';
import type { ContextItem, PacketState, PacketTextState } from './types';

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

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
const handoffNote = byId<HTMLTextAreaElement>('handoff-note');

const restored = loadDraft();
const state: PacketState = { ...restored, pdf: null, attachments: [] };
let plusUnlocked = false;
let removed: { type: 'context'; item: ContextItem; index: number } | { type: 'attachment'; item: File; index: number } | { type: 'pdf'; item: File } | null = null;
let persistTimer = 0;
let toastTimer = 0;

function textState(): PacketTextState {
  return { title: state.title, preparedBy: state.preparedBy, handoffNote: state.handoffNote, context: state.context, links: state.links };
}

function persist(): void {
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => saveDraft(textState()), 180);
}

function announce(message: string): void {
  status.textContent = message;
}

function setText(id: string, text: string): void { byId(id).textContent = text; }

function updatePreview(): void {
  setText('preview-title', state.title.trim() || 'Untitled packet');
  setText('preview-byline', state.preparedBy.trim() ? `Prepared by ${state.preparedBy.trim()}` : 'Prepared for external review');
  setText('preview-pdf', state.pdf?.name ?? 'Not added');
  setText('preview-context', `${state.context.length} item${state.context.length === 1 ? '' : 's'}`);
  setText('preview-attachments', `${state.attachments.length} file${state.attachments.length === 1 ? '' : 's'}`);
}

function makeRemoveButton(label: string, action: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button';
  button.setAttribute('aria-label', label);
  button.textContent = 'Remove';
  button.addEventListener('click', action);
  return button;
}

function showUndo(message: string): void {
  window.clearTimeout(toastTimer);
  setText('toast-text', message);
  byId('toast').hidden = false;
  toastTimer = window.setTimeout(() => { byId('toast').hidden = true; removed = null; }, 6000);
}

function renderPdf(): void {
  const list = byId('pdf-list');
  list.replaceChildren();
  if (!state.pdf) return;
  const row = document.createElement('div');
  row.className = 'file-row';
  const info = document.createElement('p');
  const name = document.createElement('strong');
  name.textContent = state.pdf.name;
  const size = document.createElement('small');
  size.textContent = `${formatBytes(state.pdf.size)} · ready to package`;
  info.append(name, size);
  row.append(info, makeRemoveButton(`Remove ${state.pdf.name}`, () => {
    removed = { type: 'pdf', item: state.pdf! };
    state.pdf = null;
    pdfInput.value = '';
    renderPdf(); updatePreview(); showUndo('PDF removed.');
  }));
  list.append(row);
}

function isPdf(file: File): boolean { return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'); }

function acceptPdf(file?: File): void {
  if (!file) return;
  if (!isPdf(file)) { announce('That file is not a PDF. Choose a file ending in .pdf.'); return; }
  if (file.size > 50 * 1024 * 1024) { announce('That PDF is larger than 50 MB. Choose a smaller PDF.'); return; }
  state.pdf = file;
  renderPdf(); updatePreview(); announce(`${file.name} is ready.`);
}

function renderContext(): void {
  const list = byId<HTMLOListElement>('context-list');
  list.replaceChildren();
  byId('context-empty').hidden = state.context.length > 0;
  state.context.forEach((item, index) => {
    const card = document.createElement('li');
    card.className = `context-card ${item.kind}`;
    const tag = document.createElement('span');
    tag.className = 'tag'; tag.textContent = item.kind;
    card.append(tag);
    if (item.location) { const loc = document.createElement('small'); loc.textContent = item.location; card.append(loc); }
    const copy = document.createElement('p'); copy.textContent = item.text; card.append(copy);
    card.append(makeRemoveButton(`Remove ${item.kind}`, () => {
      removed = { type: 'context', item, index };
      state.context.splice(index, 1); renderContext(); updatePreview(); persist(); showUndo(`${item.kind === 'comment' ? 'Comment' : 'Decision'} removed.`);
    }));
    list.append(card);
  });
}

function renderAttachments(): void {
  const list = byId('attachment-list'); list.replaceChildren();
  state.attachments.forEach((file, index) => {
    const row = document.createElement('div'); row.className = 'file-row';
    const info = document.createElement('p');
    const name = document.createElement('strong'); name.textContent = file.name;
    const size = document.createElement('small'); size.textContent = formatBytes(file.size);
    info.append(name, size);
    row.append(info, makeRemoveButton(`Remove ${file.name}`, () => {
      removed = { type: 'attachment', item: file, index };
      state.attachments.splice(index, 1); renderAttachments(); updatePreview(); showUndo('Attachment removed.');
    }));
    list.append(row);
  });
}

function renderLinks(): void {
  const list = byId('links-list'); list.replaceChildren();
  state.links.forEach((link, index) => {
    const row = document.createElement('div'); row.className = 'link-row';
    const label = document.createElement('label'); label.textContent = 'Link label';
    const labelInput = document.createElement('input'); labelInput.value = link.label; labelInput.maxLength = 80; labelInput.placeholder = 'e.g. Source brief';
    const urlLabel = document.createElement('label'); urlLabel.textContent = 'Web address';
    const urlInput = document.createElement('input'); urlInput.value = link.url; urlInput.type = 'url'; urlInput.placeholder = 'https://…';
    const errorId = `link-error-${link.id}`;
    const error = document.createElement('small'); error.className = 'field-error'; error.id = errorId;
    urlInput.setAttribute('aria-describedby', errorId);
    labelInput.addEventListener('input', () => { link.label = labelInput.value; persist(); });
    urlInput.addEventListener('input', () => { link.url = urlInput.value; urlInput.removeAttribute('aria-invalid'); error.textContent = ''; persist(); });
    label.append(labelInput); urlLabel.append(urlInput, error);
    row.append(label, urlLabel, makeRemoveButton('Remove source link', () => { state.links.splice(index, 1); renderLinks(); persist(); announce('Source link removed.'); }));
    list.append(row);
  });
}

function renderSnapshots(): void {
  const select = byId<HTMLSelectElement>('snapshot-select');
  select.replaceChildren(new Option('Load a saved snapshot…', ''));
  for (const snapshot of getSnapshots()) select.add(new Option(`${snapshot.name} · ${new Date(snapshot.savedAt).toLocaleDateString()}`, snapshot.id));
}

function applyTextState(next: PacketTextState): void {
  state.title = next.title; state.preparedBy = next.preparedBy; state.handoffNote = next.handoffNote;
  state.context = structuredClone(next.context); state.links = structuredClone(next.links);
  titleInput.value = state.title; preparedInput.value = state.preparedBy; handoffNote.value = state.handoffNote;
  renderContext(); renderLinks(); updatePreview(); persist();
}

function setPlus(valid: boolean, message: string): void {
  plusUnlocked = valid;
  byId('plus-tools').hidden = !valid;
  setText('license-status', message);
  byId('buy-link').hidden = valid;
  byId('restore-button').textContent = valid ? 'Use another license' : 'Have a license?';
  if (valid) byId('license-button').textContent = 'Plus unlocked';
}

titleInput.value = state.title;
preparedInput.value = state.preparedBy;
handoffNote.value = state.handoffNote;
for (const input of [titleInput, preparedInput, handoffNote]) input.addEventListener('input', () => {
  state.title = titleInput.value; state.preparedBy = preparedInput.value; state.handoffNote = handoffNote.value;
  titleInput.removeAttribute('aria-invalid'); exportError.textContent = ''; updatePreview(); persist();
});

pdfInput.addEventListener('change', () => acceptPdf(pdfInput.files?.[0]));
attachmentInput.addEventListener('change', () => {
  const incoming = [...(attachmentInput.files ?? [])];
  const total = [...state.attachments, ...incoming].reduce((sum, file) => sum + file.size, 0);
  if (total > 75 * 1024 * 1024) { announce('Attachments would exceed 75 MB in total. Remove a file or choose smaller files.'); return; }
  state.attachments.push(...incoming); attachmentInput.value = ''; renderAttachments(); updatePreview();
  if (incoming.length) announce(`${incoming.length} attachment${incoming.length === 1 ? '' : 's'} added.`);
});

const drop = byId('pdf-drop');
for (const eventName of ['dragenter', 'dragover']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.add('dragging'); });
for (const eventName of ['dragleave', 'drop']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.remove('dragging'); });
drop.addEventListener('drop', (event) => acceptPdf((event as DragEvent).dataTransfer?.files[0]));

byId('add-context').addEventListener('click', () => {
  const text = contextText.value.trim();
  if (!text) { contextText.setAttribute('aria-invalid', 'true'); contextError.textContent = 'Write the comment or decision first.'; contextText.focus(); return; }
  state.context.push({ id: makeId(), kind: contextKind.value as ContextItem['kind'], location: contextLocation.value.trim(), text });
  contextText.value = ''; contextLocation.value = ''; contextText.removeAttribute('aria-invalid'); contextError.textContent = '';
  renderContext(); updatePreview(); persist(); announce('Context added to the packet.'); contextText.focus();
});
contextText.addEventListener('input', () => { contextText.removeAttribute('aria-invalid'); contextError.textContent = ''; });
byId('add-link').addEventListener('click', () => { state.links.push({ id: makeId(), label: '', url: '' }); renderLinks(); listLastLinkFocus(); persist(); });
function listLastLinkFocus(): void { const inputs = byId('links-list').querySelectorAll('input'); (inputs[inputs.length - 2] as HTMLInputElement | undefined)?.focus(); }

byId('undo-button').addEventListener('click', () => {
  if (!removed) return;
  if (removed.type === 'context') { state.context.splice(removed.index, 0, removed.item); renderContext(); persist(); }
  if (removed.type === 'attachment') { state.attachments.splice(removed.index, 0, removed.item); renderAttachments(); }
  if (removed.type === 'pdf') { state.pdf = removed.item; renderPdf(); }
  updatePreview(); removed = null; byId('toast').hidden = true; announce('Removal undone.');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault(); exportError.textContent = '';
  if (!state.title.trim()) { titleInput.setAttribute('aria-invalid', 'true'); exportError.textContent = 'Add a packet title before exporting.'; titleInput.focus(); return; }
  if (!state.pdf) { exportError.textContent = 'Add the reviewed PDF before exporting.'; pdfInput.focus(); return; }
  const badLink = state.links.find((link) => link.url.trim() && !validHttpUrl(link.url));
  if (badLink) {
    const input = byId('links-list').querySelectorAll<HTMLInputElement>('input[type="url"]')[state.links.indexOf(badLink)];
    input.setAttribute('aria-invalid', 'true'); const error = input.parentElement?.querySelector('.field-error'); if (error) error.textContent = 'Use a complete http:// or https:// address.';
    exportError.textContent = 'Fix the highlighted source link before exporting.'; input.focus(); return;
  }
  if (!byId<HTMLInputElement>('sensitive-check').checked) { exportError.textContent = 'Confirm that you checked the recipients and sensitive contents.'; byId<HTMLInputElement>('sensitive-check').focus(); return; }
  const button = byId<HTMLButtonElement>('export-button'); button.disabled = true; button.textContent = 'Assembling packet…'; announce('Assembling your offline packet.');
  try {
    const exportState = { ...state, handoffNote: plusUnlocked ? state.handoffNote : '' };
    const blob = await buildPacketZip(exportState); downloadPacket(blob, state.title); announce('Packet downloaded. Open index.html inside the unzipped folder to review it.');
  } catch { exportError.textContent = 'The packet could not be built. Your work is safe—try again or remove very large attachments.'; }
  finally { button.disabled = false; button.textContent = 'Download review packet'; }
});

byId('license-button').addEventListener('click', () => byId('plus').scrollIntoView({ behavior: 'smooth' }));
byId('restore-button').addEventListener('click', () => { const restore = byId<HTMLFormElement>('restore-form'); restore.hidden = !restore.hidden; if (!restore.hidden) byId<HTMLInputElement>('license-input').focus(); });
byId('restore-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const token = byId<HTMLInputElement>('license-input').value.trim();
  if (!token) { setText('license-status', 'Paste your license token first.'); return; }
  setText('license-status', 'Checking your license…');
  try { const result = await verifyLicense(token, true); setPlus(result.valid, result.valid ? 'Plus is unlocked on this device.' : 'That license is not active for Review Packet.'); }
  catch { setText('license-status', 'Could not check the license. Check your connection and try again.'); }
});
byId('save-snapshot').addEventListener('click', () => {
  if (!plusUnlocked) return;
  const name = window.prompt('Name this text snapshot', state.title.trim() || 'Untitled packet')?.trim();
  if (!name) return;
  saveSnapshot(name.slice(0, 80), textState()); renderSnapshots(); announce(`Saved “${name.slice(0, 80)}”.`);
});
byId('snapshot-select').addEventListener('change', () => {
  const select = byId<HTMLSelectElement>('snapshot-select'); const snapshot = getSnapshots().find((item) => item.id === select.value);
  if (snapshot) { applyTextState(snapshot.state); announce(`Loaded “${snapshot.name}”. Re-add its PDF and attachments before export.`); }
  select.value = '';
});

function updateOnlineState(): void { offlineBanner.hidden = navigator.onLine; }
window.addEventListener('online', () => { offlineBanner.hidden = true; });
window.addEventListener('offline', () => { offlineBanner.hidden = false; });
updateOnlineState();

renderPdf(); renderContext(); renderAttachments(); renderLinks(); renderSnapshots(); updatePreview();
void initialiseLicense(setPlus);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));

import type { PacketTextState } from './types';

export const EMPTY_STATE: PacketTextState = {
  title: '',
  preparedBy: '',
  handoffNote: '',
  context: [],
  links: [],
};

export function makeId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function safeFileName(name: string, fallback = 'file'): string {
  const clean = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
  return clean || fallback;
}

export function packetSlug(title: string): string {
  const clean = safeFileName(title.toLowerCase(), 'review-packet')
    .replace(/\.[^.]+$/, '')
    .replace(/_+/g, '-');
  return clean || 'review-packet';
}

const NORMAL_PREFIX = 'review-packet:';
const DEMO_PREFIX = 'demo:review-packet:';

export function isDemoMode(): boolean {
  const url = new URL(window.location.href);
  return url.pathname === '/demo' || url.searchParams.get('demo') === '1';
}

function storagePrefix(): string { return isDemoMode() ? DEMO_PREFIX : NORMAL_PREFIX; }
function draftKey(): string { return `${storagePrefix()}draft:v1`; }
function snapshotKey(): string { return `${storagePrefix()}snapshots:v1`; }

export function clearDemoStorage(): void {
  for (const key of Object.keys(localStorage)) if (key.startsWith(DEMO_PREFIX)) localStorage.removeItem(key);
}

export function saveDraft(state: PacketTextState): void {
  try { localStorage.setItem(draftKey(), JSON.stringify(state)); }
  catch { /* The builder remains usable when storage is blocked or full. */ }
}

export function loadDraft(): PacketTextState {
  try {
    const raw = localStorage.getItem(draftKey());
    if (!raw) return structuredClone(EMPTY_STATE);
    const parsed = JSON.parse(raw) as Partial<PacketTextState>;
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      preparedBy: typeof parsed.preparedBy === 'string' ? parsed.preparedBy : '',
      handoffNote: typeof parsed.handoffNote === 'string' ? parsed.handoffNote : '',
      context: Array.isArray(parsed.context) ? parsed.context : [],
      links: Array.isArray(parsed.links) ? parsed.links : [],
    };
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}

export interface Snapshot { id: string; name: string; savedAt: string; state: PacketTextState }

export function getSnapshots(): Snapshot[] {
  try { return JSON.parse(localStorage.getItem(snapshotKey()) ?? '[]') as Snapshot[]; }
  catch { return []; }
}

export function saveSnapshot(name: string, state: PacketTextState): Snapshot {
  const snapshot = { id: makeId(), name, savedAt: new Date().toISOString(), state: structuredClone(state) };
  localStorage.setItem(snapshotKey(), JSON.stringify([snapshot, ...getSnapshots()]));
  return snapshot;
}

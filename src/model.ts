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

const DRAFT_KEY = 'review-packet:draft:v1';
const SNAPSHOT_KEY = 'review-packet:snapshots:v1';

export function saveDraft(state: PacketTextState): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

export function loadDraft(): PacketTextState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
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
  try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) ?? '[]') as Snapshot[]; }
  catch { return []; }
}

export function saveSnapshot(name: string, state: PacketTextState): Snapshot {
  const snapshot = { id: makeId(), name, savedAt: new Date().toISOString(), state: structuredClone(state) };
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify([snapshot, ...getSnapshots()]));
  return snapshot;
}

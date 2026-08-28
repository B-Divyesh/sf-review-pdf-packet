export type ContextKind = 'comment' | 'decision';

export interface ContextItem {
  id: string;
  kind: ContextKind;
  location: string;
  text: string;
}

export interface SourceLink {
  id: string;
  label: string;
  url: string;
}

export interface PacketTextState {
  title: string;
  preparedBy: string;
  handoffNote: string;
  context: ContextItem[];
  links: SourceLink[];
}

export interface PacketState extends PacketTextState {
  pdf: File | null;
  attachments: File[];
}

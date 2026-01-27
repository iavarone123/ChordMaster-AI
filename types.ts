
export type FretValue = number | 'x' | null;

export interface ChordData {
  name: string;
  freets?: FretValue[]; // Legacy support
  frets: FretValue[]; // [E, A, D, G, B, e]
  fingers?: (number | null)[];
  barre?: number;
  baseFret?: number;
}

export interface ChordSlot {
  name: string;
  voicings: ChordData[];
}

export interface Progression {
  id: string;
  title: string;
  description: string;
  chordSlots: ChordSlot[];
  key: string;
  scale?: string;
  mood: string;
}

export enum AppSection {
  Search = 'search',
  Library = 'library',
  Generator = 'generator'
}

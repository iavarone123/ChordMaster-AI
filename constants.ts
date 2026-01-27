
import { ChordData } from './types';

export const COMMON_CHORDS: ChordData[] = [
  { name: 'C Major', frets: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] },
  { name: 'G Major', frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4] },
  { name: 'D Major', frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  { name: 'A Major', frets: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
  { name: 'E Major', frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
  { name: 'A Minor', frets: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
  { name: 'E Minor', frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] },
  { name: 'D Minor', frets: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
  { name: 'F Major', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 },
  { name: 'B Minor', frets: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: 2, baseFret: 2 },
];

export const MOODS = [
  "Happy & Uplifting",
  "Sad & Melancholy",
  "Dark & Heavy",
  "Dreamy & Ethereal",
  "Jazzy & Sophisticated",
  "Bluesy & Raw",
  "Rocking & Energetic"
];

export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const SCALES = [
  "Major",
  "Minor",
  "Dorian",
  "Phrygian",
  "Phrygian Dominant",
  "Lydian",
  "Mixolydian",
  "Locrian"
];

import { NotesGrid } from "@/lib/types";

export function range(length: number) {
  return Array.from({ length }, (_, index) => index);
}

export function cloneValues(values: (number | null)[][]) {
  return values.map((row) => [...row]);
}

export function createEmptyGrid<T>(factory: () => T): T[][] {
  return range(9).map(() => range(9).map(factory));
}

export function cloneNotes(notes: NotesGrid): NotesGrid {
  return notes.map((row) => row.map((entry) => new Set(entry)));
}

export function serializeNotes(notes: NotesGrid) {
  return notes.map((row) => row.map((entry) => [...entry].sort((a, b) => a - b)));
}

export function deserializeNotes(notes: number[][][]) {
  return notes.map((row) => row.map((entry) => new Set(entry)));
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

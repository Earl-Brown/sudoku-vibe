export type CellValue = number | null;

export type Position = {
  row: number;
  col: number;
};

export type Cage = {
  id: string;
  sum: number;
  cells: Position[];
};

export type PuzzleDefinition = {
  id: string;
  name: string;
  complexity: string;
  source: string;
  givens: Position[];
  extraGivens: Position[];
  cages: Cage[];
  solution: number[][];
};

export type PlayDifficulty = "low" | "medium" | "high" | "killer";

export type NotesGrid = Set<number>[][];

export type Snapshot = {
  values: CellValue[][];
  notes: NotesGrid;
};

export type ValidationIssue = {
  row: number;
  col: number;
  reason: "row" | "column" | "box" | "cage-sum" | "cage-repeat" | "solution";
};

export type ValidationResult = {
  issues: ValidationIssue[];
  cageState: Record<string, "idle" | "invalid" | "complete">;
  isSolved: boolean;
};

export type GameState = {
  puzzleId: string;
  playDifficulty: PlayDifficulty;
  values: CellValue[][];
  notes: NotesGrid;
  selectedCell: Position | null;
  selectedDigit: number | null;
  eraseMode: boolean;
  noteMode: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  history: Snapshot[];
  future: Snapshot[];
  validation: ValidationResult;
};

export type PersistedGameState = {
  puzzleId: string;
  playDifficulty: PlayDifficulty;
  values: CellValue[][];
  notes: number[][][];
  isPaused: boolean;
  elapsedSeconds: number;
};

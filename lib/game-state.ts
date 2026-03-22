import { createStartingValues, getPuzzleById, isGivenCell } from "@/lib/puzzles";
import {
  CellValue,
  GameState,
  NotesGrid,
  PersistedGameState,
  PlayDifficulty,
  Position,
  Snapshot
} from "@/lib/types";
import { cloneNotes, cloneValues, createEmptyGrid, deserializeNotes, serializeNotes } from "@/lib/utils";
import { validateBoard } from "@/lib/validation";

export const STORAGE_KEY = "killer-sudoku-state-v2";
export const DEFAULT_PLAY_DIFFICULTY: PlayDifficulty = "medium";

export function createEmptyValues() {
  return createEmptyGrid<CellValue>(() => null);
}

export function createEmptyNotes(): NotesGrid {
  return createEmptyGrid(() => new Set<number>());
}

function makeSnapshot(values: CellValue[][], notes: NotesGrid): Snapshot {
  return {
    values: cloneValues(values),
    notes: cloneNotes(notes)
  };
}

export function createInitialState(
  puzzleId: string,
  playDifficulty: PlayDifficulty = DEFAULT_PLAY_DIFFICULTY
): GameState {
  const puzzle = getPuzzleById(puzzleId);
  const values = createStartingValues(puzzle.id, playDifficulty);
  const notes = createEmptyNotes();

  return {
    puzzleId: puzzle.id,
    playDifficulty,
    values,
    notes,
    selectedCell: null,
    selectedDigit: null,
    noteMode: false,
    isPaused: false,
    elapsedSeconds: 0,
    history: [],
    future: [],
    validation: validateBoard(values, puzzle)
  };
}

export function createStateFromPersisted(payload: PersistedGameState): GameState {
  const puzzle = getPuzzleById(payload.puzzleId);
  const playDifficulty = payload.playDifficulty ?? DEFAULT_PLAY_DIFFICULTY;
  const values = payload.values;
  const notes = deserializeNotes(payload.notes);

  return {
    puzzleId: puzzle.id,
    playDifficulty,
    values,
    notes,
    selectedCell: null,
    selectedDigit: null,
    noteMode: false,
    isPaused: payload.isPaused ?? false,
    elapsedSeconds: payload.elapsedSeconds,
    history: [],
    future: [],
    validation: validateBoard(values, puzzle)
  };
}

export function toPersistedState(state: GameState): PersistedGameState {
  return {
    puzzleId: state.puzzleId,
    playDifficulty: state.playDifficulty,
    values: state.values,
    notes: serializeNotes(state.notes),
    isPaused: state.isPaused,
    elapsedSeconds: state.elapsedSeconds
  };
}

export function loadPersistedState() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedGameState;
    return createStateFromPersisted(parsed);
  } catch {
    return null;
  }
}

export function savePersistedState(state: GameState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistedState(state)));
}

export function getCompletedDigits(state: GameState) {
  const puzzle = getPuzzleById(state.puzzleId);
  const completedDigits = new Set<number>();

  for (let digit = 1; digit <= 9; digit += 1) {
    const solvedCells = puzzle.solution.flatMap((row, rowIndex) =>
      row.flatMap((value, colIndex) => (value === digit ? [{ row: rowIndex, col: colIndex }] : []))
    );

    if (solvedCells.every((cell) => state.values[cell.row][cell.col] === digit)) {
      completedDigits.add(digit);
    }
  }

  return completedDigits;
}

export function selectDigit(state: GameState, digit: number | null): GameState {
  if (state.isPaused) {
    return state;
  }

  if (digit !== null && getCompletedDigits(state).has(digit)) {
    return state;
  }

  const nextDigit = state.selectedDigit === digit ? null : digit;

  return {
    ...state,
    selectedDigit: nextDigit,
    selectedCell: null
  };
}

export function selectCell(state: GameState, cell: Position | null): GameState {
  if (state.isPaused) {
    return state;
  }

  if (!cell) {
    return {
      ...state,
      selectedCell: null
    };
  }

  const nextState = {
    ...state,
    selectedCell: cell
  };

  if (state.selectedDigit === null || state.validation.isSolved) {
    return nextState;
  }

  if (isGivenCell(state.puzzleId, state.playDifficulty, cell.row, cell.col)) {
    return nextState;
  }

  return applyDigitToCell(nextState, cell.row, cell.col, state.selectedDigit);
}

export function toggleNoteMode(state: GameState): GameState {
  if (state.isPaused) {
    return state;
  }

  return {
    ...state,
    noteMode: !state.noteMode
  };
}

export function togglePause(state: GameState): GameState {
  return {
    ...state,
    isPaused: !state.isPaused,
    selectedCell: !state.isPaused ? null : state.selectedCell
  };
}

export function tick(state: GameState): GameState {
  if (state.validation.isSolved || state.isPaused) {
    return state;
  }

  return {
    ...state,
    elapsedSeconds: state.elapsedSeconds + 1
  };
}

function applySnapshot(state: GameState, snapshot: Snapshot, history: Snapshot[], future: Snapshot[]): GameState {
  const puzzle = getPuzzleById(state.puzzleId);
  const nextState = {
    ...state,
    values: cloneValues(snapshot.values),
    notes: cloneNotes(snapshot.notes),
    history,
    future,
    validation: validateBoard(snapshot.values, puzzle)
  };

  if (nextState.selectedDigit !== null && getCompletedDigits(nextState).has(nextState.selectedDigit)) {
    return {
      ...nextState,
      selectedDigit: null
    };
  }

  return nextState;
}

function commitMutation(
  state: GameState,
  updater: (draft: { values: CellValue[][]; notes: NotesGrid }) => boolean
): GameState {
  if (state.isPaused) {
    return state;
  }

  const draftValues = cloneValues(state.values);
  const draftNotes = cloneNotes(state.notes);
  const changed = updater({ values: draftValues, notes: draftNotes });

  if (!changed) {
    return state;
  }

  const puzzle = getPuzzleById(state.puzzleId);
  const nextState = {
    ...state,
    values: draftValues,
    notes: draftNotes,
    history: [...state.history, makeSnapshot(state.values, state.notes)],
    future: [],
    validation: validateBoard(draftValues, puzzle)
  };

  if (nextState.selectedDigit !== null && getCompletedDigits(nextState).has(nextState.selectedDigit)) {
    return {
      ...nextState,
      selectedDigit: null
    };
  }

  return nextState;
}

function applyDigitToCell(state: GameState, row: number, col: number, digit: number): GameState {
  return commitMutation(state, (draft) => {
    if (state.noteMode) {
      const notes = draft.notes[row][col];
      if (notes.has(digit)) {
        notes.delete(digit);
      } else {
        notes.add(digit);
      }
      return true;
    }

    if (draft.values[row][col] === digit) {
      return false;
    }

    draft.values[row][col] = digit;
    draft.notes[row][col].clear();
    return true;
  });
}

export function enterDigit(state: GameState, digit: number): GameState {
  return selectDigit(state, digit);
}

export function clearCell(state: GameState): GameState {
  if (!state.selectedCell || state.validation.isSolved || state.isPaused) {
    return state;
  }

  const { row, col } = state.selectedCell;
  if (isGivenCell(state.puzzleId, state.playDifficulty, row, col)) {
    return state;
  }

  return commitMutation(state, (draft) => {
    if (state.noteMode && draft.notes[row][col].size > 0) {
      draft.notes[row][col].clear();
      return true;
    }

    if (draft.values[row][col] === null) {
      return false;
    }

    draft.values[row][col] = null;
    draft.notes[row][col].clear();
    return true;
  });
}

export function undo(state: GameState): GameState {
  if (state.isPaused) {
    return state;
  }

  const previous = state.history[state.history.length - 1];
  if (!previous) {
    return state;
  }

  return applySnapshot(
    state,
    previous,
    state.history.slice(0, -1),
    [makeSnapshot(state.values, state.notes), ...state.future]
  );
}

export function redo(state: GameState): GameState {
  if (state.isPaused) {
    return state;
  }

  const [next, ...remaining] = state.future;
  if (!next) {
    return state;
  }

  return applySnapshot(
    state,
    next,
    [...state.history, makeSnapshot(state.values, state.notes)],
    remaining
  );
}

export function resetPuzzle(state: GameState): GameState {
  return createInitialState(state.puzzleId, state.playDifficulty);
}

export function switchPuzzle(state: GameState, puzzleId: string): GameState {
  return createInitialState(puzzleId, state.playDifficulty);
}

export function switchPlayDifficulty(state: GameState, playDifficulty: PlayDifficulty): GameState {
  return createInitialState(state.puzzleId, playDifficulty);
}


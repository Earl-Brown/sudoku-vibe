import { describe, expect, it } from "vitest";
import {
  clearCell,
  createInitialState,
  enterDigit,
  getCompletedDigits,
  redo,
  selectCell,
  switchPlayDifficulty,
  toggleNoteMode,
  undo
} from "@/lib/game-state";
import { getGivenPositions, puzzles } from "@/lib/puzzles";

const firstPuzzle = puzzles[0];

describe("game-state", () => {
  it("supports value entry and undo/redo", () => {
    let state = createInitialState(firstPuzzle.id, "killer");
    state = enterDigit(state, 5);
    state = selectCell(state, { row: 0, col: 0 });

    expect(state.values[0][0]).toBe(5);

    state = undo(state);
    expect(state.values[0][0]).toBeNull();

    state = redo(state);
    expect(state.values[0][0]).toBe(5);
  });

  it("supports note mode placement after choosing a number", () => {
    let state = createInitialState(firstPuzzle.id, "killer");
    state = toggleNoteMode(state);
    state = enterDigit(state, 3);
    state = selectCell(state, { row: 0, col: 0 });
    state = enterDigit(state, 7);
    state = selectCell(state, { row: 0, col: 0 });

    expect([...state.notes[0][0]].sort((a, b) => a - b)).toEqual([3, 7]);

    state = clearCell(state);
    expect(state.notes[0][0].size).toBe(0);
  });

  it("changing the selected number does not overwrite the current cell", () => {
    let state = createInitialState(firstPuzzle.id, "killer");
    state = enterDigit(state, 4);
    state = selectCell(state, { row: 0, col: 0 });

    expect(state.values[0][0]).toBe(4);

    state = enterDigit(state, 7);
    expect(state.values[0][0]).toBe(4);
    expect(state.selectedDigit).toBe(7);
  });

  it("clears the active cell when changing the selected number", () => {
    let state = createInitialState(firstPuzzle.id, "killer");
    state = enterDigit(state, 4);
    state = selectCell(state, { row: 0, col: 0 });

    expect(state.selectedCell).toEqual({ row: 0, col: 0 });

    state = enterDigit(state, 7);

    expect(state.selectedDigit).toBe(7);
    expect(state.selectedCell).toBeNull();
  });
  it("pre-fills givens for lower difficulties and locks them", () => {
    const firstGiven = getGivenPositions(firstPuzzle.id, "low")[0];
    const expectedDigit = firstPuzzle.solution[firstGiven.row][firstGiven.col];

    let state = createInitialState(firstPuzzle.id, "low");

    expect(state.values[firstGiven.row][firstGiven.col]).toBe(expectedDigit);

    state = enterDigit(state, expectedDigit === 9 ? 8 : 9);
    state = selectCell(state, firstGiven);
    expect(state.values[firstGiven.row][firstGiven.col]).toBe(expectedDigit);

    state = switchPlayDifficulty(state, "killer");
    expect(state.values[firstGiven.row][firstGiven.col]).toBeNull();
  });

  it("marks a digit complete only when all correct placements are filled", () => {
    let state = createInitialState(firstPuzzle.id, "killer");
    const digit = 1;
    const correctCells = firstPuzzle.solution.flatMap((row, rowIndex) =>
      row.flatMap((value, colIndex) => (value === digit ? [{ row: rowIndex, col: colIndex }] : []))
    );

    state = enterDigit(state, digit);

    correctCells.slice(0, -1).forEach((cell) => {
      state = selectCell(state, cell);
    });

    expect(getCompletedDigits(state).has(digit)).toBe(false);
    expect(state.selectedDigit).toBe(digit);

    state = selectCell(state, correctCells[correctCells.length - 1]);

    expect(getCompletedDigits(state).has(digit)).toBe(true);
    expect(state.selectedDigit).toBeNull();
    expect(enterDigit(state, digit).selectedDigit).toBeNull();
  });
});


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

describe("game-state", () => {
  it("supports value entry and undo/redo", () => {
    let state = createInitialState("sunrise", "killer");
    state = enterDigit(state, 5);
    state = selectCell(state, { row: 0, col: 0 });

    expect(state.values[0][0]).toBe(5);

    state = undo(state);
    expect(state.values[0][0]).toBeNull();

    state = redo(state);
    expect(state.values[0][0]).toBe(5);
  });

  it("supports note mode placement after choosing a number", () => {
    let state = createInitialState("sunrise", "killer");
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
    let state = createInitialState("sunrise", "killer");
    state = enterDigit(state, 4);
    state = selectCell(state, { row: 0, col: 0 });

    expect(state.values[0][0]).toBe(4);

    state = enterDigit(state, 7);
    expect(state.values[0][0]).toBe(4);
    expect(state.selectedDigit).toBe(7);
  });

  it("pre-fills givens for lower difficulties and locks them", () => {
    let state = createInitialState("sunrise", "low");

    expect(state.values[0][0]).toBe(1);

    state = enterDigit(state, 9);
    state = selectCell(state, { row: 0, col: 0 });
    expect(state.values[0][0]).toBe(1);

    state = switchPlayDifficulty(state, "killer");
    expect(state.values[0][0]).toBeNull();
  });

  it("marks a digit complete only when all correct placements are filled", () => {
    let state = createInitialState("sunrise", "killer");
    const correctTwos = [
      { row: 0, col: 1 },
      { row: 1, col: 7 },
      { row: 2, col: 4 },
      { row: 3, col: 0 },
      { row: 4, col: 6 },
      { row: 5, col: 3 },
      { row: 6, col: 8 },
      { row: 7, col: 5 },
      { row: 8, col: 2 }
    ];

    state = enterDigit(state, 2);

    correctTwos.slice(0, -1).forEach((cell) => {
      state = selectCell(state, cell);
    });

    expect(getCompletedDigits(state).has(2)).toBe(false);
    expect(state.selectedDigit).toBe(2);

    state = selectCell(state, correctTwos[correctTwos.length - 1]);

    expect(getCompletedDigits(state).has(2)).toBe(true);
    expect(state.selectedDigit).toBeNull();
    expect(enterDigit(state, 2).selectedDigit).toBeNull();
  });
});

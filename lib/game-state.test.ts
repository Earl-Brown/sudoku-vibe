import { describe, expect, it } from "vitest";
import {
  clearCell,
  createInitialState,
  enterDigit,
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
});

import { describe, expect, it } from "vitest";
import { createStartingValues, puzzles } from "@/lib/puzzles";
import { findPuzzleSolutions, getCandidates, solvePuzzle } from "@/lib/solver";
import { validateBoard } from "@/lib/validation";

const samplePuzzles = puzzles.slice(0, 4);

describe("solver", () => {
  it("produces a valid solved board for sampled Royle puzzles in killer mode", () => {
    samplePuzzles.forEach((puzzle) => {
      const solved = solvePuzzle(createStartingValues(puzzle.id, "killer"), puzzle);
      expect(solved, `${puzzle.id} should be solvable`).not.toBeNull();
      expect(validateBoard(solved!, puzzle).isSolved, `${puzzle.id} solution should validate`).toBe(true);
    });
  });

  it("solves sampled puzzles with starter digits for every difficulty", () => {
    const difficulties = ["low", "medium", "high", "killer"] as const;

    samplePuzzles.forEach((puzzle) => {
      difficulties.forEach((difficulty) => {
        const solved = solvePuzzle(createStartingValues(puzzle.id, difficulty), puzzle);
        expect(solved, `${puzzle.id} should solve on ${difficulty}`).not.toBeNull();
        expect(validateBoard(solved!, puzzle).isSolved, `${puzzle.id} ${difficulty} solve should validate`).toBe(true);
      });
    });
  });

  it("returns the solved value as the only candidate when one cell is missing", () => {
    const puzzle = puzzles[0];
    const values = puzzle.solution.map((row) => [...row]);
    values[0][0] = null;

    expect(getCandidates(values, puzzle, 0, 0)).toEqual([puzzle.solution[0][0]]);
  });

  it("returns no solutions for a contradictory board", () => {
    const puzzle = puzzles[0];
    const values = createStartingValues(puzzle.id, "killer");
    values[0][0] = 9;
    values[0][1] = 9;

    expect(findPuzzleSolutions(values, puzzle, { solutionLimit: 2 })).toEqual([]);
  });
});

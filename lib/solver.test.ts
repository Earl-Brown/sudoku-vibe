import { describe, expect, it } from "vitest";
import { createStartingValues, puzzles } from "@/lib/puzzles";
import { findPuzzleSolutions, getCandidates, solvePuzzle } from "@/lib/solver";
import { validateBoard } from "@/lib/validation";

describe("solver", () => {
  it("produces a valid solved board for every preset puzzle in killer mode", () => {
    puzzles.forEach((puzzle) => {
      const solved = solvePuzzle(createStartingValues(puzzle.id, "killer"), puzzle);
      expect(solved, `${puzzle.id} should be solvable`).not.toBeNull();
      expect(validateBoard(solved!, puzzle).isSolved, `${puzzle.id} solution should validate`).toBe(true);
    });
  });

  it("solves puzzles with starter digits for every difficulty", () => {
    const difficulties = ["low", "medium", "high", "killer"] as const;

    puzzles.forEach((puzzle) => {
      difficulties.forEach((difficulty) => {
        const solved = solvePuzzle(createStartingValues(puzzle.id, difficulty), puzzle);
        expect(solved, `${puzzle.id} should solve on ${difficulty}`).not.toBeNull();
        expect(validateBoard(solved!, puzzle).isSolved, `${puzzle.id} ${difficulty} solve should validate`).toBe(true);
      });
    });
  });

  it("reports candidate digits consistent with cage and sudoku rules", () => {
    const puzzle = puzzles[0];
    const values = createStartingValues(puzzle.id, "killer");

    expect(getCandidates(values, puzzle, 3, 8)).toEqual([1]);
    expect(getCandidates(values, puzzle, 8, 3)).toEqual([3]);
  });

  it("returns no solutions for a contradictory board", () => {
    const puzzle = puzzles[0];
    const values = createStartingValues(puzzle.id, "killer");
    values[0][0] = 9;
    values[0][1] = 9;

    expect(findPuzzleSolutions(values, puzzle, { solutionLimit: 2 })).toEqual([]);
  });
});

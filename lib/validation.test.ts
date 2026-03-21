import { describe, expect, it } from "vitest";
import { createEmptyValues } from "@/lib/game-state";
import { puzzles, getPuzzleById } from "@/lib/puzzles";
import { validateBoard } from "@/lib/validation";

type Cell = { row: number; col: number };

function isConnected(cells: Cell[]) {
  if (cells.length <= 1) {
    return true;
  }

  const keys = new Set(cells.map((cell) => `${cell.row}-${cell.col}`));
  const queue: Cell[] = [cells[0]];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row}-${current.col}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    [
      { row: current.row - 1, col: current.col },
      { row: current.row + 1, col: current.col },
      { row: current.row, col: current.col - 1 },
      { row: current.row, col: current.col + 1 }
    ].forEach((neighbor) => {
      const neighborKey = `${neighbor.row}-${neighbor.col}`;
      if (keys.has(neighborKey) && !seen.has(neighborKey)) {
        queue.push(neighbor);
      }
    });
  }

  return seen.size === cells.length;
}

describe("validateBoard", () => {
  it("flags duplicate row values", () => {
    const values = createEmptyValues();
    values[0][0] = 4;
    values[0][1] = 4;

    const result = validateBoard(values, getPuzzleById("sunrise"));

    expect(result.issues.some((issue) => issue.reason === "row")).toBe(true);
  });

  it("flags cage overflow and repeat issues", () => {
    const values = createEmptyValues();
    values[0][0] = 8;
    values[0][1] = 8;

    const result = validateBoard(values, getPuzzleById("sunrise"));

    expect(result.issues.some((issue) => issue.reason === "cage-repeat")).toBe(true);
    expect(result.cageState["sunrise-cage-1"]).toBe("invalid");
  });

  it("marks every shipped puzzle solution as solved", () => {
    puzzles.forEach((puzzle) => {
      const result = validateBoard(puzzle.solution, puzzle);
      expect(result.isSolved, `${puzzle.id} solution should validate`).toBe(true);
    });
  });

  it("ensures every puzzle cell belongs to exactly one contiguous cage", () => {
    puzzles.forEach((puzzle) => {
      const seen = new Set<string>();

      puzzle.cages.forEach((cage) => {
        expect(isConnected(cage.cells), `${puzzle.id} has a non-contiguous cage`).toBe(true);

        cage.cells.forEach((cell) => {
          const key = `${cell.row}-${cell.col}`;
          expect(seen.has(key), `${puzzle.id} has duplicate cage coverage at ${key}`).toBe(false);
          seen.add(key);
        });
      });

      expect(seen.size, `${puzzle.id} should cover all 81 cells`).toBe(81);
    });
  });
});

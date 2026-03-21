import { PuzzleDefinition } from "@/lib/types";

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type Grid = (number | null)[][];
type Cell = { row: number; col: number };

type SolverOptions = {
  solutionLimit?: number;
};

function cloneGrid(values: Grid): Grid {
  return values.map((row) => [...row]);
}

function findCage(puzzle: PuzzleDefinition, row: number, col: number) {
  return puzzle.cages.find((cage) => cage.cells.some((cell) => cell.row === row && cell.col === col));
}

function getUsedDigits(values: Grid, row: number, col: number) {
  const used = new Set<number>();

  for (let index = 0; index < 9; index += 1) {
    const rowValue = values[row][index];
    const colValue = values[index][col];

    if (rowValue !== null) {
      used.add(rowValue);
    }

    if (colValue !== null) {
      used.add(colValue);
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      const value = values[r][c];
      if (value !== null) {
        used.add(value);
      }
    }
  }

  return used;
}

function satisfiesCage(values: Grid, puzzle: PuzzleDefinition, row: number, col: number, digit: number) {
  const cage = findCage(puzzle, row, col);
  if (!cage) {
    return false;
  }

  const usedDigits = new Set<number>();
  let currentSum = 0;
  let emptyCount = 0;

  cage.cells.forEach((cell) => {
    const isCurrent = cell.row === row && cell.col === col;
    const value = isCurrent ? digit : values[cell.row][cell.col];

    if (value === null) {
      emptyCount += 1;
      return;
    }

    if (usedDigits.has(value)) {
      currentSum = Number.POSITIVE_INFINITY;
      return;
    }

    usedDigits.add(value);
    currentSum += value;
  });

  if (currentSum > cage.sum) {
    return false;
  }

  if (emptyCount === 0) {
    return currentSum === cage.sum;
  }

  const remaining = cage.sum - currentSum;
  const available = DIGITS.filter((value) => !usedDigits.has(value));

  if (available.length < emptyCount) {
    return false;
  }

  const minPossible = available
    .slice()
    .sort((left, right) => left - right)
    .slice(0, emptyCount)
    .reduce((sum, value) => sum + value, 0);
  const maxPossible = available
    .slice()
    .sort((left, right) => right - left)
    .slice(0, emptyCount)
    .reduce((sum, value) => sum + value, 0);

  return remaining >= minPossible && remaining <= maxPossible;
}

export function getCandidates(values: Grid, puzzle: PuzzleDefinition, row: number, col: number) {
  if (values[row][col] !== null) {
    return [] as number[];
  }

  const used = getUsedDigits(values, row, col);

  return DIGITS.filter((digit) => !used.has(digit) && satisfiesCage(values, puzzle, row, col, digit));
}

function findBestCell(values: Grid, puzzle: PuzzleDefinition): { cell: Cell | null; candidates: number[] } {
  let bestCell: Cell | null = null;
  let bestCandidates: number[] = [];

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (values[row][col] !== null) {
        continue;
      }

      const candidates = getCandidates(values, puzzle, row, col);
      if (candidates.length === 0) {
        return { cell: { row, col }, candidates };
      }

      if (!bestCell || candidates.length < bestCandidates.length) {
        bestCell = { row, col };
        bestCandidates = candidates;
      }
    }
  }

  return { cell: bestCell, candidates: bestCandidates };
}

function search(values: Grid, puzzle: PuzzleDefinition, solutions: number[][][], limit: number) {
  if (solutions.length >= limit) {
    return;
  }

  const { cell, candidates } = findBestCell(values, puzzle);
  if (!cell) {
    solutions.push(values.map((row) => row.map((value) => value ?? 0)));
    return;
  }

  if (candidates.length === 0) {
    return;
  }

  for (const candidate of candidates) {
    values[cell.row][cell.col] = candidate;
    search(values, puzzle, solutions, limit);
    values[cell.row][cell.col] = null;

    if (solutions.length >= limit) {
      return;
    }
  }
}

export function solvePuzzle(values: Grid, puzzle: PuzzleDefinition) {
  const solutions = findPuzzleSolutions(values, puzzle, { solutionLimit: 1 });
  return solutions[0] ?? null;
}

export function findPuzzleSolutions(values: Grid, puzzle: PuzzleDefinition, options: SolverOptions = {}) {
  const limit = options.solutionLimit ?? 2;
  const working = cloneGrid(values);
  const solutions: number[][][] = [];
  search(working, puzzle, solutions, limit);
  return solutions;
}

export function hasUniqueSolution(values: Grid, puzzle: PuzzleDefinition) {
  return findPuzzleSolutions(values, puzzle, { solutionLimit: 2 }).length === 1;
}

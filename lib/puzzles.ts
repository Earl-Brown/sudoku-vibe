import { PlayDifficulty, Position, PuzzleDefinition } from "@/lib/types";

const baseSolution = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [4, 5, 6, 7, 8, 9, 1, 2, 3],
  [7, 8, 9, 1, 2, 3, 4, 5, 6],
  [2, 3, 4, 5, 6, 7, 8, 9, 1],
  [5, 6, 7, 8, 9, 1, 2, 3, 4],
  [8, 9, 1, 2, 3, 4, 5, 6, 7],
  [3, 4, 5, 6, 7, 8, 9, 1, 2],
  [6, 7, 8, 9, 1, 2, 3, 4, 5],
  [9, 1, 2, 3, 4, 5, 6, 7, 8]
];

const baseCageLayout: Position[][] = [
  [{ row: 0, col: 0 }, { row: 0, col: 1 }],
  [{ row: 0, col: 2 }, { row: 1, col: 2 }],
  [{ row: 0, col: 3 }, { row: 0, col: 4 }],
  [{ row: 0, col: 5 }, { row: 1, col: 5 }],
  [{ row: 0, col: 6 }, { row: 0, col: 7 }],
  [{ row: 0, col: 8 }, { row: 1, col: 8 }],
  [{ row: 1, col: 0 }, { row: 2, col: 0 }],
  [{ row: 1, col: 1 }, { row: 2, col: 1 }],
  [{ row: 1, col: 3 }, { row: 1, col: 4 }],
  [{ row: 1, col: 6 }, { row: 1, col: 7 }],
  [{ row: 2, col: 2 }, { row: 2, col: 3 }],
  [{ row: 2, col: 4 }, { row: 3, col: 4 }],
  [{ row: 2, col: 5 }, { row: 2, col: 6 }],
  [{ row: 2, col: 7 }, { row: 2, col: 8 }],
  [{ row: 3, col: 0 }, { row: 4, col: 0 }],
  [{ row: 3, col: 1 }, { row: 3, col: 2 }],
  [{ row: 3, col: 3 }, { row: 4, col: 3 }],
  [{ row: 3, col: 5 }, { row: 3, col: 6 }],
  [{ row: 3, col: 7 }, { row: 4, col: 7 }],
  [{ row: 3, col: 8 }],
  [{ row: 4, col: 1 }, { row: 5, col: 1 }],
  [{ row: 4, col: 2 }],
  [{ row: 4, col: 4 }],
  [{ row: 4, col: 5 }, { row: 4, col: 6 }],
  [{ row: 4, col: 8 }],
  [{ row: 5, col: 0 }, { row: 6, col: 0 }],
  [{ row: 5, col: 2 }, { row: 5, col: 3 }],
  [{ row: 5, col: 4 }, { row: 6, col: 4 }],
  [{ row: 5, col: 5 }, { row: 5, col: 6 }],
  [{ row: 5, col: 7 }, { row: 5, col: 8 }],
  [{ row: 6, col: 1 }, { row: 6, col: 2 }],
  [{ row: 6, col: 3 }, { row: 7, col: 3 }],
  [{ row: 6, col: 5 }, { row: 6, col: 6 }],
  [{ row: 6, col: 7 }, { row: 7, col: 7 }],
  [{ row: 6, col: 8 }, { row: 7, col: 8 }],
  [{ row: 7, col: 0 }, { row: 8, col: 0 }],
  [{ row: 7, col: 1 }, { row: 7, col: 2 }],
  [{ row: 7, col: 4 }, { row: 8, col: 4 }],
  [{ row: 7, col: 5 }, { row: 7, col: 6 }],
  [{ row: 8, col: 1 }, { row: 8, col: 2 }],
  [{ row: 8, col: 3 }],
  [{ row: 8, col: 5 }],
  [{ row: 8, col: 6 }, { row: 8, col: 7 }, { row: 8, col: 8 }]
];

const difficultySeeds: Record<Exclude<PlayDifficulty, "killer">, Position[]> = {
  low: [
    { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 0, col: 8 },
    { row: 1, col: 2 }, { row: 1, col: 6 },
    { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 2, col: 7 },
    { row: 3, col: 0 }, { row: 3, col: 4 }, { row: 3, col: 8 },
    { row: 4, col: 2 }, { row: 4, col: 6 },
    { row: 5, col: 0 }, { row: 5, col: 4 }, { row: 5, col: 8 },
    { row: 6, col: 1 }, { row: 6, col: 5 }, { row: 6, col: 7 },
    { row: 7, col: 2 }, { row: 7, col: 6 },
    { row: 8, col: 0 }, { row: 8, col: 4 }, { row: 8, col: 8 }
  ],
  medium: [
    { row: 0, col: 0 }, { row: 0, col: 8 },
    { row: 1, col: 3 }, { row: 1, col: 5 },
    { row: 2, col: 1 }, { row: 2, col: 7 },
    { row: 3, col: 4 },
    { row: 4, col: 0 }, { row: 4, col: 8 },
    { row: 5, col: 4 },
    { row: 6, col: 1 }, { row: 6, col: 7 },
    { row: 7, col: 3 }, { row: 7, col: 5 },
    { row: 8, col: 0 }, { row: 8, col: 8 }
  ],
  high: [
    { row: 0, col: 4 },
    { row: 1, col: 1 }, { row: 1, col: 7 },
    { row: 2, col: 3 },
    { row: 3, col: 0 }, { row: 3, col: 8 },
    { row: 4, col: 4 },
    { row: 5, col: 0 }, { row: 5, col: 8 },
    { row: 6, col: 5 },
    { row: 7, col: 1 }, { row: 7, col: 7 },
    { row: 8, col: 4 }
  ]
};

function transformSolution(solution: number[][], offset: number) {
  return solution.map((row) =>
    row.map((value) => ((value + offset - 1) % 9) + 1)
  );
}

function createPuzzle(
  id: string,
  name: string,
  complexity: PuzzleDefinition["complexity"],
  solution: number[][]
): PuzzleDefinition {
  const cages = baseCageLayout.map((cells, index) => ({
    id: `${id}-cage-${index + 1}`,
    sum: cells.reduce((total, cell) => total + solution[cell.row][cell.col], 0),
    cells
  }));

  return {
    id,
    name,
    complexity,
    cages,
    solution
  };
}

export const puzzles: PuzzleDefinition[] = [
  createPuzzle("sunrise", "Sunrise Grid", "Easy", baseSolution),
  createPuzzle("ridge", "Ridge Line", "Standard", transformSolution(baseSolution, 2)),
  createPuzzle("summit", "Summit Spiral", "Tricky", transformSolution(baseSolution, 4))
];

export function getPuzzleById(puzzleId: string) {
  return puzzles.find((puzzle) => puzzle.id === puzzleId) ?? puzzles[0];
}

export function getGivenPositions(playDifficulty: PlayDifficulty): Position[] {
  if (playDifficulty === "killer") {
    return [];
  }

  return difficultySeeds[playDifficulty];
}

export function createStartingValues(puzzleId: string, playDifficulty: PlayDifficulty) {
  const puzzle = getPuzzleById(puzzleId);
  const values = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null as number | null));

  getGivenPositions(playDifficulty).forEach(({ row, col }) => {
    values[row][col] = puzzle.solution[row][col];
  });

  return values;
}

export function isGivenCell(puzzleId: string, playDifficulty: PlayDifficulty, row: number, col: number) {
  return getGivenPositions(playDifficulty).some((cell) => cell.row === row && cell.col === col);
}

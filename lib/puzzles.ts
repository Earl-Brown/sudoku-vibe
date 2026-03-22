import { generatedRoylePuzzles } from "@/lib/generated/gordon-royle-puzzles";
import { PlayDifficulty, Position } from "@/lib/types";

const targetGivenCounts: Record<Exclude<PlayDifficulty, "killer">, number> = {
  low: 34,
  medium: 26,
  high: 17
};

function keyForCell(cell: Position) {
  return `${cell.row}-${cell.col}`;
}

export const puzzles = generatedRoylePuzzles;

export function getPuzzleById(puzzleId: string) {
  return puzzles.find((puzzle) => puzzle.id === puzzleId) ?? puzzles[0];
}

export function getGivenPositions(puzzleId: string, playDifficulty: PlayDifficulty): Position[] {
  if (playDifficulty === "killer") {
    return [];
  }

  const puzzle = getPuzzleById(puzzleId);
  const seen = new Set<string>();
  const positions: Position[] = [];

  puzzle.givens.forEach((cell) => {
    positions.push(cell);
    seen.add(keyForCell(cell));
  });

  const targetCount = targetGivenCounts[playDifficulty];
  for (const cell of puzzle.extraGivens) {
    if (positions.length >= targetCount) {
      break;
    }

    const key = keyForCell(cell);
    if (seen.has(key)) {
      continue;
    }

    positions.push(cell);
    seen.add(key);
  }

  return positions.sort((left, right) => left.row - right.row || left.col - right.col);
}

export function createStartingValues(puzzleId: string, playDifficulty: PlayDifficulty) {
  const puzzle = getPuzzleById(puzzleId);
  const values = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null as number | null));

  getGivenPositions(puzzle.id, playDifficulty).forEach(({ row, col }) => {
    values[row][col] = puzzle.solution[row][col];
  });

  return values;
}

export function isGivenCell(puzzleId: string, playDifficulty: PlayDifficulty, row: number, col: number) {
  return getGivenPositions(puzzleId, playDifficulty).some((cell) => cell.row === row && cell.col === col);
}

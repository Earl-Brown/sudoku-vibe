import { PuzzleDefinition, ValidationIssue, ValidationResult } from "@/lib/types";

function pushDuplicates(
  values: (number | null)[],
  coords: { row: number; col: number }[],
  reason: ValidationIssue["reason"]
) {
  const map = new Map<number, number[]>();

  values.forEach((value, index) => {
    if (value === null) {
      return;
    }

    const matches = map.get(value) ?? [];
    matches.push(index);
    map.set(value, matches);
  });

  const issues: ValidationIssue[] = [];

  for (const indexes of map.values()) {
    if (indexes.length < 2) {
      continue;
    }

    indexes.forEach((index) => {
      issues.push({
        row: coords[index].row,
        col: coords[index].col,
        reason
      });
    });
  }

  return issues;
}

export function validateBoard(values: (number | null)[][], puzzle: PuzzleDefinition): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (let row = 0; row < 9; row += 1) {
    issues.push(
      ...pushDuplicates(
        values[row],
        values[row].map((_, col) => ({ row, col })),
        "row"
      )
    );
  }

  for (let col = 0; col < 9; col += 1) {
    issues.push(
      ...pushDuplicates(
        values.map((row) => row[col]),
        values.map((_, row) => ({ row, col })),
        "column"
      )
    );
  }

  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      const coords = [];
      const boxValues = [];

      for (let row = boxRow * 3; row < boxRow * 3 + 3; row += 1) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col += 1) {
          coords.push({ row, col });
          boxValues.push(values[row][col]);
        }
      }

      issues.push(...pushDuplicates(boxValues, coords, "box"));
    }
  }

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = values[row][col];
      if (value !== null && value !== puzzle.solution[row][col]) {
        issues.push({ row, col, reason: "solution" });
      }
    }
  }

  const cageState: ValidationResult["cageState"] = {};

  puzzle.cages.forEach((cage) => {
    const cageValues = cage.cells.map((cell) => values[cell.row][cell.col]);
    const filledValues = cageValues.filter((value): value is number => value !== null);
    const total = filledValues.reduce((sum, value) => sum + value, 0);
    const repeatIssues = pushDuplicates(
      cageValues,
      cage.cells.map((cell) => ({ row: cell.row, col: cell.col })),
      "cage-repeat"
    );

    if (repeatIssues.length > 0) {
      issues.push(...repeatIssues);
      cageState[cage.id] = "invalid";
      return;
    }

    if (total > cage.sum) {
      cage.cells.forEach((cell) => {
        issues.push({ row: cell.row, col: cell.col, reason: "cage-sum" });
      });
      cageState[cage.id] = "invalid";
      return;
    }

    if (filledValues.length === cage.cells.length) {
      if (total !== cage.sum) {
        cage.cells.forEach((cell) => {
          issues.push({ row: cell.row, col: cell.col, reason: "cage-sum" });
        });
        cageState[cage.id] = "invalid";
      } else {
        cageState[cage.id] = "complete";
      }
      return;
    }

    cageState[cage.id] = "idle";
  });

  const isComplete = values.every((row) => row.every((value) => value !== null));

  return {
    issues,
    cageState,
    isSolved: isComplete && issues.length === 0
  };
}

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, "data", "gordon-royle-17.txt");
const OUTPUT_DIR = path.join(ROOT, "lib", "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "gordon-royle-puzzles.ts");
const CATALOG_SIZE = 12;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function createEmptyGrid(factory) {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, factory));
}

function cloneGrid(values) {
  return values.map((row) => [...row]);
}

function parsePuzzleString(line) {
  const chars = line.trim().split("");
  if (chars.length !== 81) {
    throw new Error(`Expected 81 characters, received ${chars.length}`);
  }

  const values = [];
  for (let row = 0; row < 9; row += 1) {
    values.push([]);
    for (let col = 0; col < 9; col += 1) {
      const char = chars[row * 9 + col];
      values[row].push(char === "0" ? null : Number(char));
    }
  }

  return values;
}

function isValidClassicPlacement(values, row, col, digit) {
  for (let index = 0; index < 9; index += 1) {
    if (values[row][index] === digit || values[index][col] === digit) {
      return false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (values[r][c] === digit) {
        return false;
      }
    }
  }

  return true;
}

function findBestClassicCell(values) {
  let best = null;
  let bestCandidates = null;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (values[row][col] !== null) {
        continue;
      }

      const candidates = DIGITS.filter((digit) => isValidClassicPlacement(values, row, col, digit));
      if (candidates.length === 0) {
        return { row, col, candidates };
      }

      if (!best || candidates.length < bestCandidates.length) {
        best = { row, col };
        bestCandidates = candidates;
      }
    }
  }

  return best ? { ...best, candidates: bestCandidates } : null;
}

function solveClassic(values) {
  const working = cloneGrid(values);

  function search() {
    const next = findBestClassicCell(working);
    if (!next) {
      return true;
    }

    const { row, col, candidates } = next;
    for (const candidate of candidates) {
      working[row][col] = candidate;
      if (search()) {
        return true;
      }
      working[row][col] = null;
    }

    return false;
  }

  if (!search()) {
    throw new Error("Classic puzzle did not solve");
  }

  return working;
}

function getGivenPositions(values) {
  const cells = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (values[row][col] !== null) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

function makeSeed(index) {
  return (index + 1) * 2654435761 % 4294967296;
}

function mulberry32(seed) {
  let current = seed >>> 0;
  return () => {
    current = (current + 0x6d2b79f5) >>> 0;
    let value = Math.imul(current ^ (current >>> 15), current | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function keyForCell(row, col) {
  return `${row}-${col}`;
}

function neighbors(cell) {
  return [
    { row: cell.row - 1, col: cell.col },
    { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 },
    { row: cell.row, col: cell.col + 1 }
  ].filter((neighbor) => neighbor.row >= 0 && neighbor.row < 9 && neighbor.col >= 0 && neighbor.col < 9);
}

function buildCageLookup(cages) {
  const lookup = new Map();
  cages.forEach((cage, cageIndex) => {
    cage.cells.forEach((cell) => {
      lookup.set(keyForCell(cell.row, cell.col), cageIndex);
    });
  });
  return lookup;
}

function createGeneratedCages(solution, puzzleId, seedIndex) {
  const allCells = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      allCells.push({ row, col });
    }
  }

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const random = mulberry32(makeSeed(seedIndex * 31 + attempt * 17));
    const pending = new Set(allCells.map((cell) => keyForCell(cell.row, cell.col)));
    const cages = [];
    let singletonBudget = Math.min(81, attempt * 6);

    while (pending.size > 0) {
      const remainingCells = allCells.filter((cell) => pending.has(keyForCell(cell.row, cell.col)));
      const start = remainingCells[Math.floor(random() * remainingCells.length)];
      pending.delete(keyForCell(start.row, start.col));

      const cage = [start];
      const usedDigits = new Set([solution[start.row][start.col]]);
      const sizeChoices = singletonBudget > 0 && random() < 0.22 ? [1] : [2, 2, 3, 3, 4];
      const targetSize = sizeChoices[Math.floor(random() * sizeChoices.length)];
      if (targetSize === 1 && singletonBudget > 0) {
        singletonBudget -= 1;
      }

      while (cage.length < targetSize) {
        const frontier = shuffle(
          cage.flatMap((cell) => neighbors(cell)).filter((neighbor) => {
            const neighborKey = keyForCell(neighbor.row, neighbor.col);
            if (!pending.has(neighborKey)) {
              return false;
            }

            const digit = solution[neighbor.row][neighbor.col];
            return !usedDigits.has(digit);
          }),
          random
        );

        const next = frontier[0];
        if (!next) {
          break;
        }

        pending.delete(keyForCell(next.row, next.col));
        usedDigits.add(solution[next.row][next.col]);
        cage.push(next);
      }

      cages.push(cage);
    }

    const normalized = cages.map((cells, cageIndex) => ({
      id: `${puzzleId}-cage-${cageIndex + 1}`,
      cells: cells.sort((left, right) => left.row - right.row || left.col - right.col),
      sum: cells.reduce((total, cell) => total + solution[cell.row][cell.col], 0)
    }));

    if (hasUniqueKillerSolution(normalized)) {
      return normalized;
    }
  }

  return allCells.map((cell, cageIndex) => ({
    id: `${puzzleId}-cage-${cageIndex + 1}`,
    cells: [cell],
    sum: solution[cell.row][cell.col]
  }));

  function hasUniqueKillerSolution(cages) {
    const lookup = buildCageLookup(cages);
    const values = createEmptyGrid(() => null);
    let solutions = 0;

    function getUsedDigits(row, col) {
      const used = new Set();
      for (let index = 0; index < 9; index += 1) {
        if (values[row][index] !== null) {
          used.add(values[row][index]);
        }
        if (values[index][col] !== null) {
          used.add(values[index][col]);
        }
      }

      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r += 1) {
        for (let c = boxCol; c < boxCol + 3; c += 1) {
          if (values[r][c] !== null) {
            used.add(values[r][c]);
          }
        }
      }
      return used;
    }

    function satisfiesCage(row, col, digit) {
      const cage = cages[lookup.get(keyForCell(row, col))];
      const usedDigits = new Set();
      let currentSum = 0;
      let emptyCount = 0;

      for (const cell of cage.cells) {
        const value = cell.row === row && cell.col === col ? digit : values[cell.row][cell.col];
        if (value === null) {
          emptyCount += 1;
          continue;
        }

        if (usedDigits.has(value)) {
          return false;
        }

        usedDigits.add(value);
        currentSum += value;
      }

      if (currentSum > cage.sum) {
        return false;
      }

      if (emptyCount === 0) {
        return currentSum === cage.sum;
      }

      const available = DIGITS.filter((value) => !usedDigits.has(value));
      if (available.length < emptyCount) {
        return false;
      }

      const ascending = [...available].sort((left, right) => left - right);
      const descending = [...ascending].reverse();
      const minPossible = ascending.slice(0, emptyCount).reduce((sum, value) => sum + value, 0);
      const maxPossible = descending.slice(0, emptyCount).reduce((sum, value) => sum + value, 0);
      const remainder = cage.sum - currentSum;
      return remainder >= minPossible && remainder <= maxPossible;
    }

    function findBestCell() {
      let best = null;
      let bestCandidates = null;

      for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
          if (values[row][col] !== null) {
            continue;
          }

          const used = getUsedDigits(row, col);
          const candidates = DIGITS.filter((digit) => !used.has(digit) && satisfiesCage(row, col, digit));
          if (candidates.length === 0) {
            return { row, col, candidates };
          }

          if (!best || candidates.length < bestCandidates.length) {
            best = { row, col };
            bestCandidates = candidates;
          }
        }
      }

      return best ? { ...best, candidates: bestCandidates } : null;
    }

    function search() {
      if (solutions > 1) {
        return;
      }

      const next = findBestCell();
      if (!next) {
        solutions += 1;
        return;
      }

      const { row, col, candidates } = next;
      for (const candidate of candidates) {
        values[row][col] = candidate;
        search();
        values[row][col] = null;
        if (solutions > 1) {
          return;
        }
      }
    }

    search();
    return solutions === 1;
  }
}

const extraClueOrder = [
  { row: 4, col: 4 },
  { row: 0, col: 4 },
  { row: 4, col: 0 },
  { row: 4, col: 8 },
  { row: 8, col: 4 },
  { row: 0, col: 0 },
  { row: 0, col: 8 },
  { row: 8, col: 0 },
  { row: 8, col: 8 },
  { row: 1, col: 3 },
  { row: 1, col: 5 },
  { row: 3, col: 1 },
  { row: 3, col: 7 },
  { row: 5, col: 1 },
  { row: 5, col: 7 },
  { row: 7, col: 3 },
  { row: 7, col: 5 },
  { row: 2, col: 2 },
  { row: 2, col: 6 },
  { row: 6, col: 2 },
  { row: 6, col: 6 },
  { row: 1, col: 1 },
  { row: 1, col: 7 },
  { row: 7, col: 1 },
  { row: 7, col: 7 },
  { row: 2, col: 4 },
  { row: 4, col: 2 },
  { row: 4, col: 6 },
  { row: 6, col: 4 },
  { row: 3, col: 3 },
  { row: 3, col: 5 },
  { row: 5, col: 3 },
  { row: 5, col: 5 },
  { row: 2, col: 0 },
  { row: 2, col: 8 },
  { row: 6, col: 0 },
  { row: 6, col: 8 }
];

function buildModule() {
  const sources = fs.readFileSync(SOURCE_FILE, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, CATALOG_SIZE);

  const puzzles = sources.map((source, index) => {
    const fileName = String(index).padStart(5, "0");
    const givens = parsePuzzleString(source);
    const solution = solveClassic(givens);
    const givenPositions = getGivenPositions(givens);
    const extraPositions = extraClueOrder.filter((cell) => givens[cell.row][cell.col] === null);
    const puzzleId = `royle-${fileName.replace(/\.txt$/, "")}`;
    const cages = createGeneratedCages(solution, puzzleId, index);

    return {
      id: puzzleId,
      name: `Royle ${fileName.replace(/\.txt$/, "")}`,
      complexity: "Minimal",
      source,
      givens: givenPositions,
      extraGivens: extraPositions,
      solution,
      cages
    };
  });

  const content = `import { PuzzleDefinition } from "@/lib/types";\n\nexport const generatedRoylePuzzles: PuzzleDefinition[] = ${JSON.stringify(puzzles, null, 2)};\n`;
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`Generated ${puzzles.length} Royle puzzles at ${path.relative(ROOT, OUTPUT_FILE)}`);
}

buildModule();


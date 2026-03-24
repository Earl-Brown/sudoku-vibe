import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GameApp } from "@/components/game-app";
import { createInitialState, savePersistedState } from "@/lib/game-state";
import { getGivenPositions, puzzles } from "@/lib/puzzles";
import { PlayDifficulty } from "@/lib/types";

function cellName(row: number, col: number) {
  return `Row ${row + 1} Column ${col + 1}`;
}

function renderApp(playDifficulty: PlayDifficulty = "medium") {
  savePersistedState(createInitialState(puzzles[0].id, playDifficulty));
  return render(<GameApp />);
}

function findGivenDigitWithMultipleVisibleCells() {
  const puzzle = puzzles[0];
  const givens = getGivenPositions(puzzle.id, "low");
  const counts = new Map<number, { row: number; col: number }[]>();

  givens.forEach((cell) => {
    const digit = puzzle.solution[cell.row][cell.col];
    const matches = counts.get(digit) ?? [];
    matches.push(cell);
    counts.set(digit, matches);
  });

  for (const [digit, cells] of counts.entries()) {
    if (cells.length >= 2) {
      return { digit, cells };
    }
  }

  throw new Error("Expected a visible digit with multiple low-difficulty givens");
}

describe("GameApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("loads the board and places a value after choosing a number in killer mode", async () => {
    const user = userEvent.setup();
    renderApp("killer");

    await user.click(screen.getByRole("button", { name: "5" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);

    expect(firstCell).toHaveTextContent("5");
  });

  it("changing the selected number does not rewrite the selected cell", async () => {
    const user = userEvent.setup();
    renderApp("killer");

    await user.click(screen.getByRole("button", { name: "4" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);
    expect(firstCell).toHaveTextContent("4");

    await user.click(screen.getByRole("button", { name: "7" }));

    expect(firstCell).toHaveTextContent("4");
  });

  it("clears matching values and replaces different non-given values with the selected digit", async () => {
    const user = userEvent.setup();
    renderApp("killer");

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    const secondCell = within(board).getByRole("button", { name: "Row 1 Column 2" });

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(firstCell);
    expect(firstCell).toHaveTextContent("5");

    await user.click(firstCell);
    expect(within(firstCell).queryByText("5", { selector: ".cell-value" })).toBeNull();

    await user.click(secondCell);
    expect(within(secondCell).getByText("5", { selector: ".cell-value" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "7" }));
    await user.click(secondCell);
    expect(within(secondCell).getByText("7", { selector: ".cell-value" })).toBeInTheDocument();
  });

  it("highlights only placed copies of the selected digit when no cell is active", async () => {
    const user = userEvent.setup();
    renderApp("low");

    const { digit, cells } = findGivenDigitWithMultipleVisibleCells();
    const [firstCellInfo, secondCellInfo] = cells;
    const visibleCellKeys = new Set(cells.map((cell) => `${cell.row}-${cell.col}`));
    const unrelated = puzzles[0].solution
      .flatMap((row, rowIndex) => row.map((_, colIndex) => ({ row: rowIndex, col: colIndex })))
      .find((cell) => !visibleCellKeys.has(`${cell.row}-${cell.col}`))!;

    await user.click(screen.getByRole("button", { name: String(digit) }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: cellName(firstCellInfo.row, firstCellInfo.col) });
    const secondCell = within(board).getByRole("button", { name: cellName(secondCellInfo.row, secondCellInfo.col) });
    const unrelatedCell = within(board).getByRole("button", { name: cellName(unrelated.row, unrelated.col) });

    expect(firstCell.className).toContain("peer");
    expect(secondCell.className).toContain("peer");
    expect(unrelatedCell.className).not.toContain("peer");
  });

  it("keeps only the selected cell highlighted when a cell is active", async () => {
    const user = userEvent.setup();
    renderApp("low");

    const puzzle = puzzles[0];
    const givenCell = getGivenPositions(puzzle.id, "low")[0];
    const digit = puzzle.solution[givenCell.row][givenCell.col];
    const peerCell = givenCell.col < 8 ? { row: givenCell.row, col: givenCell.col + 1 } : { row: givenCell.row, col: givenCell.col - 1 };

    await user.click(screen.getByRole("button", { name: String(digit) }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const selectedGivenCell = within(board).getByRole("button", { name: cellName(givenCell.row, givenCell.col) });
    const selectedRowPeer = within(board).getByRole("button", { name: cellName(peerCell.row, peerCell.col) });

    await user.click(selectedGivenCell);

    expect(selectedGivenCell.className).toContain("selected");
    expect(selectedRowPeer.className).not.toContain("peer");
  });

  it("renders cage overlay paths for the current puzzle", async () => {
    renderApp("killer");

    const overlay = await screen.findByLabelText("Killer cage overlay");
    const paths = overlay.querySelectorAll(".cage-path");
    const targetCage = puzzles[0].cages.find((cage) => cage.cells.some((cell) => cell.row === 0 && cell.col === 1));

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.length).toBe(puzzles[0].cages.length);
    expect(targetCage).toBeDefined();
    expect(overlay.querySelector(`[data-cage-id="${targetCage?.id}"]`)).not.toBeNull();
  });

  it("toggles pause state and blanks the board", async () => {
    const user = userEvent.setup();
    renderApp("killer");

    await user.click(screen.getByRole("button", { name: "5" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);
    expect(firstCell).toHaveTextContent("5");

    await user.click(screen.getByRole("button", { name: "Pause" }));

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(within(firstCell).queryByText("5", { selector: ".cell-value" })).toBeNull();
    expect(firstCell).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(firstCell).toHaveTextContent("5");
  });

  it("disables a completed number only after all correct placements are filled", async () => {
    const user = userEvent.setup();
    renderApp("killer");

    const puzzle = puzzles[0];
    const digit = 1;
    const digitCells = puzzle.solution.flatMap((row, rowIndex) =>
      row.flatMap((value, colIndex) => (value === digit ? [{ row: rowIndex, col: colIndex }] : []))
    );

    await user.click(screen.getByRole("button", { name: String(digit) }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });

    for (const cell of digitCells) {
      await user.click(within(board).getByRole("button", { name: cellName(cell.row, cell.col) }));
    }

    const completedButton = screen.getByRole("button", { name: `${digit} complete` });
    expect(completedButton).toBeDisabled();
    expect(completedButton).toHaveTextContent("Done");
  });

  it("latches erase without clearing until a cell is clicked", async () => {
    const user = userEvent.setup();
    renderApp("killer");

    await user.click(screen.getByRole("button", { name: "5" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);
    expect(firstCell).toHaveTextContent("5");

    await user.click(screen.getByRole("button", { name: "Erase" }));
    expect(firstCell).toHaveTextContent("5");

    await user.click(firstCell);
    expect(within(firstCell).queryByText("5", { selector: ".cell-value" })).toBeNull();
  });
});



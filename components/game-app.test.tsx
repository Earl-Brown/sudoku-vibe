import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GameApp } from "@/components/game-app";

describe("GameApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("loads the board and places a value after choosing a number in killer mode", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.selectOptions(screen.getByLabelText("Difficulty selector"), "killer");
    await user.click(screen.getByRole("button", { name: "5" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);

    expect(firstCell).toHaveTextContent("5");
  });

  it("changing the selected number does not rewrite the selected cell", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.selectOptions(screen.getByLabelText("Difficulty selector"), "killer");
    await user.click(screen.getByRole("button", { name: "4" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);
    expect(firstCell).toHaveTextContent("4");

    await user.click(screen.getByRole("button", { name: "7" }));

    expect(firstCell).toHaveTextContent("4");
    expect(screen.getByText("Ready to place 7.")).toBeInTheDocument();
  });

  it("highlights only placed copies of the selected digit when no cell is active", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.selectOptions(screen.getByLabelText("Difficulty selector"), "low");
    await user.click(screen.getByRole("button", { name: "8" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const selectedDigitCell = within(board).getByRole("button", { name: "Row 3 Column 2" });
    const rowOnlyCell = within(board).getByRole("button", { name: "Row 3 Column 6" });
    const boxOnlyCell = within(board).getByRole("button", { name: "Row 1 Column 3" });

    expect(selectedDigitCell.className).toContain("peer");
    expect(rowOnlyCell.className).not.toContain("peer");
    expect(boxOnlyCell.className).not.toContain("peer");
  });

  it("keeps selected-cell highlighting stable when a digit is also selected", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.selectOptions(screen.getByLabelText("Difficulty selector"), "low");
    await user.click(screen.getByRole("button", { name: "8" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const selectedGivenCell = within(board).getByRole("button", { name: "Row 4 Column 1" });
    const selectedRowPeer = within(board).getByRole("button", { name: "Row 4 Column 6" });
    const selectedDigitCell = within(board).getByRole("button", { name: "Row 3 Column 2" });

    await user.click(selectedGivenCell);

    expect(selectedGivenCell.className).toContain("selected");
    expect(selectedRowPeer.className).toContain("peer");
    expect(selectedDigitCell.className).toContain("peer");
  });

  it("toggles pause state and blanks the board", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.selectOptions(screen.getByLabelText("Difficulty selector"), "killer");
    await user.click(screen.getByRole("button", { name: "5" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const firstCell = within(board).getByRole("button", { name: "Row 1 Column 1" });
    await user.click(firstCell);
    expect(firstCell).toHaveTextContent("5");

    await user.click(screen.getByRole("button", { name: "Pause" }));

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(firstCell).not.toHaveTextContent("5");
    expect(firstCell).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Play" }));

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(firstCell).toHaveTextContent("5");
  });

  it("disables a completed number only after all correct placements are filled", async () => {
    const user = userEvent.setup();
    render(<GameApp />);

    await user.selectOptions(screen.getByLabelText("Difficulty selector"), "killer");
    await user.click(screen.getByRole("button", { name: "2" }));

    const board = await screen.findByRole("grid", { name: "Killer Sudoku board" });
    const twoCells = [
      "Row 1 Column 2",
      "Row 2 Column 8",
      "Row 3 Column 5",
      "Row 4 Column 1",
      "Row 5 Column 7",
      "Row 6 Column 4",
      "Row 7 Column 9",
      "Row 8 Column 6",
      "Row 9 Column 3"
    ];

    for (const cellName of twoCells) {
      await user.click(within(board).getByRole("button", { name: cellName }));
    }

    const completedButton = screen.getByRole("button", { name: "2 complete" });
    expect(completedButton).toBeDisabled();
    expect(completedButton).toHaveTextContent("Done");
    expect(screen.getByText("Pick a number to start placing values.")).toBeInTheDocument();
  });
});

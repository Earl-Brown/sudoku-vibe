import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "@/components/landing-page";
import { savePersistedState } from "@/lib/game-state";
import { puzzles } from "@/lib/puzzles";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("LandingPage", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the solo launcher card when no saved game exists", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: "Sudoku War" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Solo Campaign Launcher" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start solo run" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Medium: Balanced pressure/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue existing game" })).toBeNull();
    expect(screen.queryByText(/Resume:/)).toBeNull();
  });

  it("shows continue existing game when saved progress exists", () => {
    const puzzle = puzzles[0];
    savePersistedState({
      puzzleId: puzzle.id,
      playDifficulty: "high",
      values: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null)),
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      isPaused: false,
      elapsedSeconds: 42
    });

    render(<LandingPage />);

    expect(screen.getByRole("button", { name: "Continue existing game" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Resume: ${puzzle.name} - high`))).toBeInTheDocument();
  });

  it("starts a new game using the selected difficulty", async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<LandingPage />);

    await user.click(screen.getByRole("button", { name: /Killer: Pure cage combat/i }));
    await user.click(screen.getByRole("button", { name: "Start solo run" }));

    expect(push).toHaveBeenCalledWith("/v1.royle-00000?difficulty=killer");
  });

  it("resumes the saved game with the canonical slug and query", async () => {
    const user = userEvent.setup();
    const puzzle = puzzles[1];
    savePersistedState({
      puzzleId: puzzle.id,
      playDifficulty: "medium",
      values: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null)),
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      isPaused: false,
      elapsedSeconds: 17
    });

    render(<LandingPage />);

    await user.click(screen.getByRole("button", { name: "Continue existing game" }));

    expect(push).toHaveBeenCalledWith(`/v1.${puzzle.id}?difficulty=medium&resume=1`);
  });
});
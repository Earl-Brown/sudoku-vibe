import { describe, expect, it } from "vitest";
import {
  buildGameUrl,
  buildSoloLaunchUrl,
  createResumeLaunchSummary,
  createSoloLaunchConfig,
  CURRENT_CATALOG_VERSION,
  parseDifficultyParam,
  parseGameSlug
} from "@/lib/game-url";
import { puzzles } from "@/lib/puzzles";

describe("game-url", () => {
  it("parses a valid versioned game slug", () => {
    const puzzle = puzzles[0];
    const parsed = parseGameSlug(`${CURRENT_CATALOG_VERSION}.${puzzle.id}`);

    expect(parsed).toEqual({
      catalogVersion: CURRENT_CATALOG_VERSION,
      puzzleId: puzzle.id,
      isValid: true
    });
  });

  it("falls back safely for an invalid catalog version", () => {
    const puzzle = puzzles[0];
    const parsed = parseGameSlug(`v99.${puzzle.id}`);

    expect(parsed.catalogVersion).toBe(CURRENT_CATALOG_VERSION);
    expect(parsed.puzzleId).toBe(puzzle.id);
    expect(parsed.isValid).toBe(false);
  });

  it("falls back safely for an invalid puzzle id", () => {
    const parsed = parseGameSlug(`${CURRENT_CATALOG_VERSION}.not-a-real-puzzle`);

    expect(parsed.catalogVersion).toBe(CURRENT_CATALOG_VERSION);
    expect(parsed.puzzleId).toBe(puzzles[0].id);
    expect(parsed.isValid).toBe(false);
  });

  it("builds a canonical game url with difficulty in the query string", () => {
    const puzzle = puzzles[0];

    expect(buildGameUrl({ puzzleId: puzzle.id, playDifficulty: "medium" })).toBe(
      `/${CURRENT_CATALOG_VERSION}.${puzzle.id}?difficulty=medium`
    );
  });

  it("creates a solo launch config and url", () => {
    const puzzle = puzzles[0];
    const session = createSoloLaunchConfig({ puzzleId: puzzle.id, playDifficulty: "killer" });

    expect(session).toEqual({
      mode: "solo",
      puzzleId: puzzle.id,
      playDifficulty: "killer",
      catalogVersion: CURRENT_CATALOG_VERSION
    });
    expect(buildSoloLaunchUrl(session)).toBe(`/${CURRENT_CATALOG_VERSION}.${puzzle.id}?difficulty=killer`);
  });

  it("creates a resume summary from launch metadata", () => {
    const puzzle = puzzles[0];
    const summary = createResumeLaunchSummary({
      puzzleName: puzzle.name,
      puzzleId: puzzle.id,
      playDifficulty: "high"
    });

    expect(summary.label).toBe(`${puzzle.name} - high`);
    expect(summary.href).toBe(`/${CURRENT_CATALOG_VERSION}.${puzzle.id}?difficulty=high&resume=1`);
    expect(summary.session.mode).toBe("solo");
  });

  it("parses difficulty safely", () => {
    expect(parseDifficultyParam("killer")).toBe("killer");
    expect(parseDifficultyParam("wat", "high")).toBe("high");
  });
});
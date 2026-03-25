import { getPuzzleById, puzzles } from "@/lib/puzzles";
import { PlayDifficulty } from "@/lib/types";

export const CURRENT_CATALOG_VERSION = "v1";
export const DEFAULT_PRODUCT_MODE = "solo";

export type ParsedGameSlug = {
  catalogVersion: string;
  puzzleId: string;
  isValid: boolean;
};

export type SoloLaunchConfig = {
  mode: typeof DEFAULT_PRODUCT_MODE;
  puzzleId: string;
  playDifficulty: PlayDifficulty;
  catalogVersion: string;
};

export type ResumeLaunchSummary = {
  label: string;
  href: string;
  session: SoloLaunchConfig;
};

const playDifficulties: PlayDifficulty[] = ["low", "medium", "high", "killer"];

export function isPlayDifficulty(value: string | null | undefined): value is PlayDifficulty {
  return playDifficulties.includes(value as PlayDifficulty);
}

export function parseDifficultyParam(value: string | null | undefined, fallback: PlayDifficulty = "medium"): PlayDifficulty {
  return isPlayDifficulty(value) ? value : fallback;
}

export function parseGameSlug(gameSlug: string | null | undefined): ParsedGameSlug {
  const fallbackPuzzleId = puzzles[0]?.id ?? "royle-00000";
  const match = gameSlug?.match(/^(v\d+)\.(.+)$/);

  if (!match) {
    return {
      catalogVersion: CURRENT_CATALOG_VERSION,
      puzzleId: fallbackPuzzleId,
      isValid: false
    };
  }

  const [, catalogVersion, rawPuzzleId] = match;
  const resolvedPuzzle = puzzles.find((puzzle) => puzzle.id === rawPuzzleId);

  if (!resolvedPuzzle || catalogVersion !== CURRENT_CATALOG_VERSION) {
    return {
      catalogVersion: CURRENT_CATALOG_VERSION,
      puzzleId: resolvedPuzzle?.id ?? fallbackPuzzleId,
      isValid: false
    };
  }

  return {
    catalogVersion,
    puzzleId: resolvedPuzzle.id,
    isValid: true
  };
}

export function buildGameSlug(
  puzzleId: string,
  catalogVersion: string = CURRENT_CATALOG_VERSION
) {
  const resolvedPuzzleId = getPuzzleById(puzzleId).id;
  return `${catalogVersion}.${resolvedPuzzleId}`;
}

export function buildGamePath(
  puzzleId: string,
  catalogVersion: string = CURRENT_CATALOG_VERSION
) {
  return `/${buildGameSlug(puzzleId, catalogVersion)}`;
}

export function buildGameUrl(args: {
  puzzleId: string;
  playDifficulty: PlayDifficulty;
  catalogVersion?: string;
}) {
  const params = new URLSearchParams({
    difficulty: args.playDifficulty
  });

  return `${buildGamePath(args.puzzleId, args.catalogVersion)}?${params.toString()}`;
}

export function createSoloLaunchConfig(args: {
  puzzleId: string;
  playDifficulty: PlayDifficulty;
  catalogVersion?: string;
}): SoloLaunchConfig {
  return {
    mode: DEFAULT_PRODUCT_MODE,
    puzzleId: getPuzzleById(args.puzzleId).id,
    playDifficulty: args.playDifficulty,
    catalogVersion: args.catalogVersion ?? CURRENT_CATALOG_VERSION
  };
}

export function buildSoloLaunchUrl(session: SoloLaunchConfig) {
  return buildGameUrl({
    puzzleId: session.puzzleId,
    playDifficulty: session.playDifficulty,
    catalogVersion: session.catalogVersion
  });
}

export function createResumeLaunchSummary(args: {
  puzzleName: string;
  puzzleId: string;
  playDifficulty: PlayDifficulty;
  catalogVersion?: string;
}): ResumeLaunchSummary {
  const session = createSoloLaunchConfig({
    puzzleId: args.puzzleId,
    playDifficulty: args.playDifficulty,
    catalogVersion: args.catalogVersion
  });
  const params = new URLSearchParams({
    difficulty: session.playDifficulty,
    resume: "1"
  });

  return {
    label: `${args.puzzleName} - ${args.playDifficulty}`,
    href: `${buildGamePath(session.puzzleId, session.catalogVersion)}?${params.toString()}`,
    session
  };
}
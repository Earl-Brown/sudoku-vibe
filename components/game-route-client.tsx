"use client";

import { useSearchParams } from "next/navigation";
import { GameApp } from "@/components/game-app";
import { parseDifficultyParam } from "@/lib/game-url";

type GameRouteClientProps = {
  puzzleId: string;
};

export function GameRouteClient({ puzzleId }: GameRouteClientProps) {
  const searchParams = useSearchParams();
  const difficulty = parseDifficultyParam(searchParams.get("difficulty"));
  const isResumeLaunch = searchParams.get("resume") === "1";

  return (
    <GameApp
      initialPuzzleId={puzzleId}
      initialPlayDifficulty={difficulty}
      preferRouteState={!isResumeLaunch}
    />
  );
}
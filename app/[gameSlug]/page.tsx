import { Suspense } from "react";
import { GameRouteClient } from "@/components/game-route-client";
import { CURRENT_CATALOG_VERSION, parseGameSlug } from "@/lib/game-url";
import { puzzles } from "@/lib/puzzles";

export function generateStaticParams() {
  return puzzles.map((puzzle) => ({
    gameSlug: `${CURRENT_CATALOG_VERSION}.${puzzle.id}`
  }));
}

export default async function GamePage({
  params
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const parsed = parseGameSlug(gameSlug);

  return (
    <Suspense fallback={<main className="shell loading">Loading puzzle table...</main>}>
      <GameRouteClient puzzleId={parsed.puzzleId} />
    </Suspense>
  );
}
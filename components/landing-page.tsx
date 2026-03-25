"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildSoloLaunchUrl,
  createResumeLaunchSummary,
  createSoloLaunchConfig,
  ResumeLaunchSummary
} from "@/lib/game-url";
import { loadPersistedState } from "@/lib/game-state";
import { getPuzzleById, getRandomPuzzleId } from "@/lib/puzzles";
import { PlayDifficulty } from "@/lib/types";

const difficulties: Array<{ value: PlayDifficulty; label: string; copy: string }> = [
  { value: "low", label: "Low", copy: "A forgiving opening with extra givens and steady momentum." },
  { value: "medium", label: "Medium", copy: "Balanced pressure for the main solo progression loop." },
  { value: "high", label: "High", copy: "Sharper deduction with fewer givens and tighter decisions." },
  { value: "killer", label: "Killer", copy: "Pure cage combat: no givens, only logic and nerve." }
];

export function LandingPage() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<PlayDifficulty>("medium");
  const [resumeSummary, setResumeSummary] = useState<ResumeLaunchSummary | null>(null);

  useEffect(() => {
    const persisted = loadPersistedState();
    if (!persisted) {
      return;
    }

    const puzzle = getPuzzleById(persisted.puzzleId);
    setResumeSummary(
      createResumeLaunchSummary({
        puzzleName: puzzle.name,
        puzzleId: puzzle.id,
        playDifficulty: persisted.playDifficulty
      })
    );
  }, []);

  function startSoloGame() {
    const session = createSoloLaunchConfig({
      puzzleId: getRandomPuzzleId(),
      playDifficulty: selectedDifficulty
    });

    router.push(buildSoloLaunchUrl(session));
  }

  return (
    <main className="landing-shell">
      <section className="landing-page landing-page-minimal">
        <section className="setup-panel open solo-launch-card">
          <div className="setup-header">
            <div>
              <h1>Sudoku War</h1>
              <h2>Solo Campaign Launcher</h2>
            </div>
          </div>

          {resumeSummary ? <p className="landing-resume">Resume: {resumeSummary.label}</p> : null}

          {resumeSummary ? (
            <button type="button" className="landing-primary continue-action" onClick={() => router.push(resumeSummary.href)}>
              Continue existing game
            </button>
          ) : null}

          <div className="difficulty-pill-row" role="group" aria-label="Choose difficulty">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.value}
                type="button"
                className={`difficulty-pill ${selectedDifficulty === difficulty.value ? "active" : ""}`.trim()}
                onClick={() => setSelectedDifficulty(difficulty.value)}
                title={difficulty.copy}
                aria-label={`${difficulty.label}: ${difficulty.copy}`}
              >
                {difficulty.label}
              </button>
            ))}
          </div>

          <div className="setup-actions">
            <button type="button" className="landing-secondary launch-action" onClick={startSoloGame}>
              Start solo run
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
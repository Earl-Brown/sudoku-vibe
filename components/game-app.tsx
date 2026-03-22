"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getGivenPositions, getPuzzleById, getRandomPuzzleId, isGivenCell, puzzles } from "@/lib/puzzles";
import {
  clearCell,
  createInitialState,
  DEFAULT_PLAY_DIFFICULTY,
  enterDigit,
  getCompletedDigits,
  loadPersistedState,
  redo,
  resetPuzzle,
  savePersistedState,
  selectCell,
  switchPlayDifficulty,
  switchPuzzle,
  tick,
  toggleNoteMode,
  togglePause,
  undo
} from "@/lib/game-state";
import { GameState, PlayDifficulty, ValidationIssue } from "@/lib/types";
import { formatTime, range } from "@/lib/utils";

const playDifficultyLabels: Record<PlayDifficulty, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  killer: "Killer"
};

const legendItems = [
  { label: "Selected cell", className: "legend-swatch selected" },
  { label: "Related row, column, or box", className: "legend-swatch peer" },
  { label: "Starter digit", className: "legend-swatch given" },
  { label: "Rule conflict", className: "legend-swatch invalid" },
  { label: "Complete cage", className: "legend-swatch cage-complete" },
  { label: "Cage outline", className: "legend-swatch cage-border" },
  { label: "3x3 box border", className: "legend-swatch box-border" }
];

const issueLabels: Record<ValidationIssue["reason"], string> = {
  row: "Duplicates a number in this row",
  column: "Duplicates a number in this column",
  box: "Duplicates a number in this 3x3 box",
  "cage-sum": "Breaks this cage total",
  "cage-repeat": "Repeats a number inside this cage"
};

function keyForCell(row: number, col: number) {
  return `${row}-${col}`;
}

function getCellIssues(state: GameState, row: number, col: number) {
  return state.validation.issues.filter((issue) => issue.row === row && issue.col === col);
}

function getCellTooltip(state: GameState, row: number, col: number) {
  const issues = getCellIssues(state, row, col);

  if (issues.length === 0) {
    return undefined;
  }

  const messages = [...new Set(issues.map((issue) => issueLabels[issue.reason]))];
  return `Rule conflict: ${messages.join("; ")}`;
}

function useHydratedGameState() {
  const [state, setState] = useState<GameState>(() => createInitialState(puzzles[0].id, DEFAULT_PLAY_DIFFICULTY));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      setState(persisted);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      savePersistedState(state);
    }
  }, [ready, state]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const interval = window.setInterval(() => {
      setState((current) => tick(current));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key >= "1" && event.key <= "9") {
        setState((current) => enterDigit(current, Number(event.key)));
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
        setState((current) => clearCell(current));
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        setState((current) => togglePause(current));
        return;
      }

      if (event.key.toLowerCase() === "n") {
        setState((current) => toggleNoteMode(current));
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        setState((current) => redo(current));
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        setState((current) => undo(current));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ready]);

  return { ready, state, setState };
}

function getCageIdMap(puzzleId: string) {
  const puzzle = getPuzzleById(puzzleId);
  const map = new Map<string, string>();

  puzzle.cages.forEach((cage) => {
    cage.cells.forEach((cell) => {
      map.set(keyForCell(cell.row, cell.col), cage.id);
    });
  });

  return map;
}

function getCageLabelMap(puzzleId: string) {
  const puzzle = getPuzzleById(puzzleId);
  const map = new Map<string, number>();

  puzzle.cages.forEach((cage) => {
    const topLeft = [...cage.cells].sort((left, right) => left.row - right.row || left.col - right.col)[0];
    map.set(keyForCell(topLeft.row, topLeft.col), cage.sum);
  });

  return map;
}

function getSelectedDigitCells(state: GameState) {
  const cells = new Set<string>();

  if (state.selectedDigit === null) {
    return cells;
  }

  range(9).forEach((row) => {
    range(9).forEach((col) => {
      if (state.values[row][col] === state.selectedDigit) {
        cells.add(keyForCell(row, col));
      }
    });
  });

  return cells;
}

function buildCellClassNames(
  state: GameState,
  row: number,
  col: number,
  selectedDigitCells: Set<string>
) {
  const classes = ["cell"];
  const selected = state.selectedCell;
  const isSelectedDigitCell = selectedDigitCells.has(keyForCell(row, col));

  if (selected?.row === row && selected?.col === col) {
    classes.push("selected");
  } else if (selected && (selected.row === row || selected.col === col)) {
    classes.push("peer");
  } else if (
    selected &&
    Math.floor(selected.row / 3) === Math.floor(row / 3) &&
    Math.floor(selected.col / 3) === Math.floor(col / 3)
  ) {
    classes.push("peer");
  } else if (isSelectedDigitCell) {
    classes.push("peer");
  }

  if (getCellIssues(state, row, col).length > 0) {
    classes.push("invalid");
  }

  if (isGivenCell(state.puzzleId, state.playDifficulty, row, col)) {
    classes.push("given");
  }

  return classes.join(" ");
}

export function GameApp() {
  const { ready, state, setState } = useHydratedGameState();
  const puzzle = getPuzzleById(state.puzzleId);
  const cageIdMap = useMemo(() => getCageIdMap(state.puzzleId), [state.puzzleId]);
  const cageLabelMap = useMemo(() => getCageLabelMap(state.puzzleId), [state.puzzleId]);
  const completedDigits = useMemo(() => getCompletedDigits(state), [state]);
  const selectedDigitCells = useMemo(() => getSelectedDigitCells(state), [state]);
  const givenCount = getGivenPositions(state.puzzleId, state.playDifficulty).length;

  if (!ready) {
    return <main className="shell loading">Loading puzzle table...</main>;
  }

  return (
    <main className="shell">
      <section className="hero">
        <h1>Killer Sudoku</h1>
      </section>

      <section className="workspace">
        <div className="board-panel">
          <div className={`board-shell ${state.isPaused ? "paused" : ""}`}>
            <div className="board" role="grid" aria-label="Killer Sudoku board" aria-hidden={state.isPaused}>
              {range(9).flatMap((row) =>
                range(9).map((col) => {
                  const value = state.values[row][col];
                  const notes = state.notes[row][col];
                  const cageId = cageIdMap.get(keyForCell(row, col));
                  const currentCageState = cageId ? state.validation.cageState[cageId] : "idle";
                  const tooltip = state.isPaused ? undefined : getCellTooltip(state, row, col);
                  const hasBoxTop = row % 3 === 0;
                  const hasBoxLeft = col % 3 === 0;
                  const hasBoxBottom = row === 8;
                  const hasBoxRight = col === 8;
                  const hasCageTop = row === 0 || cageIdMap.get(keyForCell(row - 1, col)) !== cageId;
                  const hasCageBottom = row === 8 && cageIdMap.get(keyForCell(row + 1, col)) !== cageId;
                  const hasCageLeft = col === 0 || cageIdMap.get(keyForCell(row, col - 1)) !== cageId;
                  const hasCageRight = col === 8 && cageIdMap.get(keyForCell(row, col + 1)) !== cageId;
                  const borderClasses = [
                    hasCageTop && !hasBoxTop ? "cage-top" : "",
                    hasCageBottom && !hasBoxBottom ? "cage-bottom" : "",
                    hasCageLeft && !hasBoxLeft ? "cage-left" : "",
                    hasCageRight && !hasBoxRight ? "cage-right" : "",
                    hasBoxTop ? (hasCageTop ? "box-top-overlap" : "box-top") : "",
                    hasBoxLeft ? (hasCageLeft ? "box-left-overlap" : "box-left") : "",
                    hasBoxBottom ? (hasCageBottom ? "box-bottom-overlap" : "box-bottom") : "",
                    hasBoxRight ? (hasCageRight ? "box-right-overlap" : "box-right") : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={keyForCell(row, col)}
                      type="button"
                      className={`${buildCellClassNames(state, row, col, selectedDigitCells)} ${borderClasses} cage-${currentCageState}`}
                      onClick={() => setState((current) => selectCell(current, { row, col }))}
                      aria-label={`Row ${row + 1} Column ${col + 1}`}
                      title={tooltip}
                      disabled={state.isPaused}
                    >
                      {state.isPaused ? null : cageLabelMap.has(keyForCell(row, col)) ? (
                        <span className="cage-label">{cageLabelMap.get(keyForCell(row, col))}</span>
                      ) : null}
                      {state.isPaused ? null : value ? (
                        <span className="cell-value">{value}</span>
                      ) : (
                        <span className="notes-grid">
                          {range(9).map((noteIndex) => (
                            <span key={noteIndex}>{notes.has(noteIndex + 1) ? noteIndex + 1 : ""}</span>
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {state.isPaused ? <div className="pause-overlay">Paused</div> : null}
          </div>

          <div className="toolbar toolbar-below">
            <label className="select-wrap">
              <span>Puzzle</span>
              <select
                aria-label="Puzzle selector"
                value={state.puzzleId}
                onChange={(event) => setState((current) => switchPuzzle(current, event.target.value))}
              >
                {puzzles.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-wrap">
              <span>Difficulty</span>
              <select
                aria-label="Difficulty selector"
                value={state.playDifficulty}
                onChange={(event) =>
                  setState((current) => switchPlayDifficulty(current, event.target.value as PlayDifficulty))
                }
              >
                {Object.entries(playDifficultyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => setState((current) => toggleNoteMode(current))} className={state.noteMode ? "active" : ""}>
              Notes {state.noteMode ? "On" : "Off"}
            </button>
            <button onClick={() => setState((current) => undo(current))} disabled={state.history.length === 0 || state.isPaused}>
              Undo
            </button>
            <button onClick={() => setState((current) => redo(current))} disabled={state.future.length === 0 || state.isPaused}>
              Redo
            </button>
            <button onClick={() => setState((current) => clearCell(current))} disabled={state.isPaused}>Erase</button>
            <div className="toolbar-timer">{formatTime(state.elapsedSeconds)}</div>
          </div>
        </div>

        <aside className="sidebar">
          <div className="panel">
            <div className="session-actions">
              <button onClick={() => setState((current) => switchPuzzle(current, getRandomPuzzleId(current.puzzleId)))}>
                New game
              </button>
              <button onClick={() => setState((current) => resetPuzzle(current))}>Reset</button>
              <button onClick={() => setState((current) => togglePause(current))}>
                {state.isPaused ? "Play" : "Pause"}
              </button>
            </div>
            <div className="keypad">
              {range(9).map((index) => {
                const digit = index + 1;
                const completed = completedDigits.has(digit);

                return (
                  <button
                    key={index}
                    className={`${state.selectedDigit === digit ? "active" : ""} ${completed ? "completed" : ""}`.trim()}
                    onClick={() => setState((current) => enterDigit(current, digit))}
                    disabled={completed || state.isPaused}
                    aria-label={completed ? `${digit} complete` : `${digit}`}
                  >
                    <span className="keypad-digit">{digit}</span>
                    {completed ? <span className="keypad-status">Done</span> : null}
                  </button>
                );
              })}
              <button className="wide" onClick={() => setState((current) => clearCell(current))} disabled={state.isPaused}>
                Clear cell
              </button>
            </div>
          </div>

          <details className="panel help-panel">
            <summary>Instructions</summary>
            <div className="help-panel-body">
              <p>{puzzle.name} uses a {puzzle.complexity.toLowerCase()} cage layout.</p>
              <p>
                {playDifficultyLabels[state.playDifficulty]} starts with {givenCount} pre-filled number{givenCount === 1 ? "" : "s"}.
              </p>
              <ul className="tips">
                <li>Each row, column, and 3x3 box must contain 1 through 9 exactly once.</li>
                <li>Cages must add up to their corner total and cannot repeat a digit.</li>
                <li>Low, Medium, and High include starter digits. Killer uses none.</li>
                <li>Select a number first, then click cells to place it. Choosing a new number never overwrites the current cell.</li>
                <li>Selected numbers light up their placed cells, and an active cell still highlights its related row, column, and box.</li>
                <li>Use Pause to blank the board and freeze play until you resume.</li>
                <li>A number locks itself once all nine correct placements are on the board.</li>
              </ul>
              <div className="legend-block">
                <h3>Legend</h3>
                <div className="legend-list">
                  {legendItems.map((item) => (
                    <div key={item.label} className="legend-item">
                      <span className={item.className} aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </aside>
      </section>
    </main>
  );
}






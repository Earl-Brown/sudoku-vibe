"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getPuzzleById, isGivenCell, puzzles } from "@/lib/puzzles";
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
  tick,
  toggleEraseMode,
  toggleNoteMode,
  togglePause,
  undo
} from "@/lib/game-state";
import { GameState, ValidationIssue } from "@/lib/types";
import { formatTime, range } from "@/lib/utils";

const issueLabels: Record<ValidationIssue["reason"], string> = {
  row: "Duplicates a number in this row",
  column: "Duplicates a number in this column",
  box: "Duplicates a number in this 3x3 box",
  "cage-sum": "Breaks this cage total",
  "cage-repeat": "Repeats a number inside this cage",
  solution: "Incorrect value for this cell"
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
  const cageIdMap = useMemo(() => getCageIdMap(state.puzzleId), [state.puzzleId]);
  const cageLabelMap = useMemo(() => getCageLabelMap(state.puzzleId), [state.puzzleId]);
  const completedDigits = useMemo(() => getCompletedDigits(state), [state]);
  const selectedDigitCells = useMemo(() => getSelectedDigitCells(state), [state]);

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
                  const hasCageBottom = row === 8 || cageIdMap.get(keyForCell(row + 1, col)) !== cageId;
                  const hasCageLeft = col === 0 || cageIdMap.get(keyForCell(row, col - 1)) !== cageId;
                  const hasCageRight = col === 8 || cageIdMap.get(keyForCell(row, col + 1)) !== cageId;
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

          <div className="keypad-block">
            <div className="keypad keypad-inline">
              {range(9).map((index) => {
                const digit = index + 1;
                const completed = completedDigits.has(digit);

                return (
                  <button
                    key={index}
                    type="button"
                    className={`digit-button digit-${digit} ${state.selectedDigit === digit ? "active" : ""} ${completed ? "completed" : ""}`.trim()}
                    onClick={() => setState((current) => enterDigit(current, digit))}
                    disabled={completed || state.isPaused}
                    aria-label={completed ? `${digit} complete` : `${digit}`}
                  >
                    <span className="keypad-digit">{digit}</span>
                    {completed ? <span className="keypad-status">Done</span> : null}
                  </button>
                );
              })}

              <button
                type="button"
                className="keypad-pause"
                onClick={() => setState((current) => togglePause(current))}
                aria-label={state.isPaused ? "Play" : "Pause"}
                title={state.isPaused ? "Play" : "Pause"}
              >
                {state.isPaused ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="pause-icon">
                    <path d="M8 6v12l10-6z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="pause-icon">
                    <path d="M8 5h3v14H8z" />
                    <path d="M13 5h3v14h-3z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className={`keypad-erase ${state.eraseMode ? "active" : ""}`.trim()}
                onClick={() => setState((current) => toggleEraseMode(current))}
                disabled={state.isPaused}
                aria-label="Erase"
                title="Erase"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="eraser-icon">
                  <path d="M3 15.5 12.5 6a2.8 2.8 0 0 1 4 0l4 4a2.8 2.8 0 0 1 0 4l-4.5 4.5H8a3 3 0 0 1-2.1-.9L3 15.5Z" />
                  <path d="M13 18.5h8" />
                </svg>
              </button>

              <button
                type="button"
                className="keypad-action keypad-reset"
                onClick={() => setState((current) => resetPuzzle(current))}
                disabled={state.isPaused}
              >
                Reset
              </button>
            </div>

            <div className="toolbar toolbar-below">
              <button type="button" onClick={() => setState((current) => toggleNoteMode(current))} className={state.noteMode ? "active" : ""}>
                Notes {state.noteMode ? "On" : "Off"}
              </button>
              <div className="toolbar-timer">{formatTime(state.elapsedSeconds)}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

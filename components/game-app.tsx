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

function IconButton({
  className,
  label,
  title,
  disabled,
  active,
  onClick,
  children
}: {
  className: string;
  label: string;
  title?: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${className} ${active ? "active" : ""}`.trim()}
      aria-label={label}
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
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

              <IconButton
                className="keypad-home"
                label="Home"
                disabled={state.isPaused}
                onClick={() => undefined}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="tool-icon">
                  <path d="M7.293 1.5a1 1 0 0 1 1.414 0L11 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l2.354 2.353a.5.5 0 0 1-.708.708L8 2.207l-5 5V13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 2 13.5V8.207l-.646.647a.5.5 0 1 1-.708-.708z" />
                  <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.354-5.854 1.5 1.5a.5.5 0 0 1-.708.708L13 11.707V14.5a.5.5 0 1 1-1 0v-2.793l-.646.647a.5.5 0 0 1-.708-.707l1.5-1.5a.5.5 0 0 1 .708 0Z" />
                </svg>
              </IconButton>

              <IconButton
                className="keypad-pause"
                label={state.isPaused ? "Play" : "Pause"}
                disabled={false}
                onClick={() => setState((current) => togglePause(current))}
              >
                {state.isPaused ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="tool-icon">
                    <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="tool-icon">
                    <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
                  </svg>
                )}
              </IconButton>

              <IconButton
                className="keypad-notes"
                label="Notes"
                active={state.noteMode}
                disabled={state.isPaused}
                onClick={() => setState((current) => toggleNoteMode(current))}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="tool-icon">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                </svg>
              </IconButton>

              <IconButton
                className="keypad-erase"
                label="Erase"
                active={state.eraseMode}
                disabled={state.isPaused}
                onClick={() => setState((current) => toggleEraseMode(current))}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="tool-icon">
                  <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z" />
                </svg>
              </IconButton>

              <IconButton
                className="keypad-reset"
                label="Reset"
                disabled={state.isPaused}
                onClick={() => setState((current) => resetPuzzle(current))}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className="tool-icon">
                  <path d="M9.302 1.256a1.5 1.5 0 0 0-2.604 0l-1.704 2.98a.5.5 0 0 0 .869.497l1.703-2.981a.5.5 0 0 1 .868 0l2.54 4.444-1.256-.337a.5.5 0 1 0-.26.966l2.415.647a.5.5 0 0 0 .613-.353l.647-2.415a.5.5 0 1 0-.966-.259l-.333 1.242zM2.973 7.773l-1.255.337a.5.5 0 1 1-.26-.966l2.416-.647a.5.5 0 0 1 .612.353l.647 2.415a.5.5 0 0 1-.966.259l-.333-1.242-2.545 4.454a.5.5 0 0 0 .434.748H5a.5.5 0 0 1 0 1H1.723A1.5 1.5 0 0 1 .421 12.24zm10.89 1.463a.5.5 0 1 0-.868.496l1.716 3.004a.5.5 0 0 1-.434.748h-5.57l.647-.646a.5.5 0 1 0-.708-.707l-1.5 1.5a.5.5 0 0 0 0 .707l1.5 1.5a.5.5 0 1 0 .708-.707l-.647-.647h5.57a1.5 1.5 0 0 0 1.302-2.244z" />
                </svg>
              </IconButton>
            </div>

            <div className="toolbar toolbar-below">
              <div className="toolbar-timer">{formatTime(state.elapsedSeconds)}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}




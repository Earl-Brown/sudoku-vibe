# Killer Sudoku

A fully offline Killer Sudoku web app built with Next.js and TypeScript.

## Features

- Royle-backed puzzle catalog generated from the Gordon Royle 17-clue Sudoku set
- Dynamically generated killer cages layered on top of solved Royle source grids
- Four play modes: Low, Medium, High, and Killer
- Pencil marks, undo/redo, erase, reset, pause, and local persistence
- Cage-sum and duplicate-rule validation
- Desktop and mobile-friendly responsive layout

## Puzzle source

The repository vendors the Gordon Royle 17-clue source set in [data/gordon-royle-17.txt](D:/temp/Codex/Killer Sudoku/data/gordon-royle-17.txt). The playable in-app catalog is generated from that source by [scripts/generate-royle-puzzles.cjs](D:/temp/Codex/Killer Sudoku/scripts/generate-royle-puzzles.cjs), which solves the classic grids, preserves the Royle givens, and generates killer cages for the runtime catalog in [lib/generated/gordon-royle-puzzles.ts](D:/temp/Codex/Killer Sudoku/lib/generated/gordon-royle-puzzles.ts).

## Scripts

- `npm install` to install dependencies
- `npm run generate:puzzles` to rebuild the generated Royle puzzle catalog from the vendored source data
- `npm run dev` to start the local development server
- `npm run build` to regenerate the puzzle catalog and produce the static production build
- `npm test` to regenerate the puzzle catalog and run the test suite

## Architecture

- `app/` contains the Next.js UI shell and global styles
- `components/` contains the interactive game client
- `data/` contains vendored puzzle-source data
- `lib/` contains generated puzzle definitions, runtime puzzle loading, validation, solver, and game-state logic
- `scripts/` contains the Royle catalog generator

## Runtime model

The app is client-side and offline-first. It does not require a backend, account system, or AI integration. Puzzle progress is stored locally in the browser.


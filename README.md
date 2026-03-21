# Killer Sudoku

A fully offline Killer Sudoku web app built with Next.js and TypeScript.

## Features

- Preset Killer Sudoku puzzles
- Pencil marks, undo/redo, erase, and reset controls
- Cage-sum and duplicate-rule validation
- Local progress persistence in browser storage
- Desktop and mobile-friendly responsive layout

## Scripts

- `npm install` to install dependencies
- `npm run dev` to start the local development server
- `npm run build` to generate the static production build
- `npm test` to run the test suite

## Architecture

- `app/` contains the Next.js UI shell and global styles
- `components/` contains the interactive game client
- `lib/` contains puzzles, validation, and game-state logic

## Runtime model

The app is client-side and offline-first. It does not require a backend, account system, or AI integration. Puzzle progress is stored locally in the browser.

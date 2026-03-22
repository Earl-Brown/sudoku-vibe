# Killer Sudoku

A vibe-coded, fully offline Killer Sudoku web app built with Next.js and TypeScript.

## Features

- Royle-backed puzzle catalog generated from the Gordon Royle 17-clue Sudoku set
- Dynamically generated killer cages layered on top of solved Royle source grids
- Four play modes: Low, Medium, High, and Killer
- Pencil marks, undo/redo, erase, reset, pause, and local persistence
- Cage-sum and duplicate-rule validation
- Desktop and mobile-friendly responsive layout

## Deployment

This app is configured for static deployment. Running `npm run build` generates a fully exportable site in [out](D:/temp/Codex/Killer Sudoku/out).

### GitHub Pages

A GitHub Pages workflow is included at [deploy-pages.yml](D:/temp/Codex/Killer Sudoku/.github/workflows/deploy-pages.yml).

To enable it:
- push the repository to GitHub
- in the repository settings, open `Pages`
- set `Source` to `GitHub Actions`
- push to `main` or `master`, or run the workflow manually from the `Actions` tab

Notes:
- the workflow runs `npm ci`, `npm test`, and `npm run build` before publishing
- `next.config.ts` automatically uses the repository name as the `basePath` on GitHub Actions for project Pages sites like `username.github.io/repo-name`
- user or organization sites like `username.github.io` keep the root path automatically

### Other static hosts

Typical deployment flow:
- run `npm install`
- run `npm run deploy:prepare`
- optionally run `npm run preview` and open `http://localhost:4173`
- upload the contents of [out](D:/temp/Codex/Killer Sudoku/out) to your static host

Static-host notes:
- GitHub Pages is supported by writing `.nojekyll` into the exported [out](D:/temp/Codex/Killer Sudoku/out) folder during the build finalization step, so `_next` assets are served correctly
- Netlify, Cloudflare Pages, Azure Static Web Apps, S3, and similar hosts can deploy the exported [out](D:/temp/Codex/Killer Sudoku/out) folder directly
- no server runtime, backend, or API routes are required

## Puzzle source

The repository vendors the Gordon Royle 17-clue source set in [data/gordon-royle-17.txt](D:/temp/Codex/Killer Sudoku/data/gordon-royle-17.txt). The playable in-app catalog is generated from that source by [scripts/generate-royle-puzzles.cjs](D:/temp/Codex/Killer Sudoku/scripts/generate-royle-puzzles.cjs), which solves the classic grids, preserves the Royle givens, and generates killer cages for the runtime catalog in [lib/generated/gordon-royle-puzzles.ts](D:/temp/Codex/Killer Sudoku/lib/generated/gordon-royle-puzzles.ts).

## Scripts

- `npm install` to install dependencies
- `npm run generate:puzzles` to rebuild the generated Royle puzzle catalog from the vendored source data
- `npm run dev` to start the local development server
- `npm run build` to regenerate the puzzle catalog and produce the static production build
- `npm run preview` to serve the exported `out/` folder locally for deployment verification
- `npm run deploy:prepare` to generate the deployment-ready static export
- `npm test` to regenerate the puzzle catalog and run the test suite

## Architecture

- `app/` contains the Next.js UI shell and global styles
- `components/` contains the interactive game client
- `data/` contains vendored puzzle-source data
- `lib/` contains generated puzzle definitions, runtime puzzle loading, validation, solver, and game-state logic
- `scripts/` contains the Royle catalog generator, export finalizer, and local static preview server

## Runtime model

The app is client-side and offline-first. It does not require a backend, account system, or AI integration. Puzzle progress is stored locally in the browser.

## To-Do

- Refactor the UI to be more mobile-friendly

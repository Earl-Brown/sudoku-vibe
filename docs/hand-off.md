# Project Hand-Off

## Current Snapshot

- Repository: `https://github.com/Earl-Brown/sudoku-vibe.git`
- Default working branch: `master`
- Framework: Next.js static export
- Deployment target: GitHub Pages
- Current HEAD: `16bf086` (`Expand project handoff log`)
- Latest gameplay/UI release tag: `0.9.2`

## Current Status

- GitHub Pages workflow is present at `.github/workflows/deploy-pages.yml`
- The site is configured to build as a static export
- The workflow build Node version is set to `24`
- The exported `out/` folder is finalized with `.nojekyll`
- `README.md` includes deployment guidance and a small project to-do list
- Ongoing project notes and issue history live in this file

## Useful Commands

```powershell
git status
git push
npm test
npm run build
npm run preview
```

## Open To-Dos

- Refactor the UI to be more mobile-friendly
- Remove the conflict tooltip from board cells
- Consider moving puzzle-set selection to a dedicated configuration page and making the active puzzle display read-only in the main UI

## Issue Log

Use this section to record issues, how they were fixed, and the commit that contains the final resolution.

### Resolved

#### 2026-03-21 - Git remote was missing

- Issue: The repo had no `origin`, so changing the remote URL failed because there was nothing to update yet.
- Resolution: Added `origin` for the GitHub repo and verified fetch/push URLs.
- Final commit: Not tied to a code commit. Repo configuration change only.

#### 2026-03-21 - Git reported dubious ownership for the repo

- Issue: Git blocked commands because `.git` was owned by the sandbox user while the active Windows user was different.
- Resolution: Added `D:/temp/Codex/Killer Sudoku` to Git `safe.directory`.
- Final commit: Not tied to a code commit. Local Git configuration change only.

#### 2026-03-21 - Initial playable offline app needed to be established

- Issue: The project needed a working offline Killer Sudoku baseline with gameplay, validation, persistence, and a testable UI.
- Resolution: Built the initial Next.js static-export app with puzzle play, controls, local persistence, validation, and test coverage.
- Final commit: `38332e3` (`Release v0.25`)

#### 2026-03-21 - Hand-authored puzzle data produced misleading cages and repeated bug fixes

- Issue: The original hand-built puzzle set accumulated cage-layout bugs, misleading totals, and inconsistent puzzle behavior that required repeated spot fixes.
- Resolution: Replaced the hand-authored source approach with a generated catalog derived from the Gordon Royle 17-clue dataset, preserving source givens and generating killer cages programmatically.
- Final commit: `c52bc01` (`Adopt Gordon Royle puzzle source`)

#### 2026-03-21 - The app needed an internal solver to validate puzzle generation and catch source mistakes

- Issue: Puzzle errors were hard to detect automatically without a solver-backed validation path.
- Resolution: Added solver-backed puzzle validation and integrated it into the generated puzzle-source flow so shipped puzzles are solver-checked during test/build.
- Final commit: `c52bc01` (`Adopt Gordon Royle puzzle source`)

#### 2026-03-21 - Switching selected digits left stale row, column, and 3x3 highlights behind

- Issue: Changing the selected number did not clear the active cell, so the previous row/column/box highlight stayed visible.
- Resolution: Cleared `selectedCell` when the selected digit changes and added a regression test.
- Final commit: `016503a` (`Clear active cell when switching digits`)

#### 2026-03-21 - The app had no fast way to start a different puzzle from the current catalog

- Issue: There was no dedicated “new random game” action for jumping to another available puzzle without using the dropdown.
- Resolution: Added random puzzle selection from the active catalog and integrated it into the main UI flow.
- Final commit: `321ffba` (`Release 0.9`)

#### 2026-03-21 - Session controls were in the wrong place for the current layout

- Issue: `New game`, `Reset`, and `Play/Pause` were living in the lower toolbar even though they behaved more like session controls than board-entry controls.
- Resolution: Moved those actions into the sidebar control panel and simplified the panel heading treatment.
- Final commit: `321ffba` (`Release 0.9`)

#### 2026-03-21 - Deployment prep for static hosting was incomplete

- Issue: The project needed explicit static-host preparation, local preview support, and export finalization before it was ready to ship.
- Resolution: Added export finalization, local static preview tooling, deployment-oriented package scripts, and deployment documentation.
- Final commit: `0b93648` (`Release 0.9.1`)

#### 2026-03-21 - Board borders were visually confusing where classic box lines and killer lines met

- Issue: Overlapping 3x3 box borders and killer cage borders were hard to read and sometimes looked too heavy.
- Resolution: Tuned the overlap behavior so shared seams use a clearer styling treatment and reduced visual ambiguity.
- Final commit: `9c88e2f` (`Tune overlapping board borders`)

#### 2026-03-21 - GitHub Pages deployment workflow was missing from the repo history

- Issue: The project needed an Actions workflow and matching export config for GitHub Pages deployment.
- Resolution: Added the Pages workflow, updated Next.js base-path handling for Pages, and documented deployment in the README.
- Final commit: `bc69b1c` (`Add GitHub Pages deployment setup`)

#### 2026-03-21 - Pages workflow needed a newer build Node version

- Issue: The Pages workflow was using Node `22` for the app build, and you wanted it updated while investigating deprecation warnings.
- Resolution: Updated the workflow build runtime from Node `22` to Node `24`.
- Final commit: `386e820` (`Update Pages workflow to Node 24`)

#### 2026-03-21 - Wrong entries could appear valid on lower-information clue levels

- Issue: A move like `Royle 00006` row 3 column 6 = `6` could look valid in Killer/High and only turn red in Medium/Low once extra givens exposed the contradiction.
- Resolution: Added solution-based validation so incorrect digits are flagged consistently across all clue levels, and added a regression test for the Royle 00006 case.
- Final commit: Included in the next release commit for this fix.

#### 2026-03-21 - Repository setup needed to be safer for multi-device development

- Issue: The repo needed additional infrastructure/setup hardening for work across multiple development devices.
- Resolution: Added infrastructure prep captured in the current HEAD commit.
- Final commit: `6345508` (`Infrastructure: multiple development device prep`)

### Template

#### YYYY-MM-DD - Short issue title

- Issue: What was broken or confusing.
- Resolution: What changed and why it fixed the problem.
- Final commit: `<hash>` (`Commit message`)



# Work Journal

This file is the portable running journal for cross-machine continuity.

## Entry Format

For each work block, capture:
- Date
- Focus
- Key decisions
- Changes made
- Verification
- Open questions / next steps
- Related commits

---

## 2026-03-25 - Sudoku War Product Pivot

### Focus
- Shift the product direction from a single-user Killer Sudoku app toward `Sudoku War`, a broader solo-plus-social puzzle platform.

### Key decisions
- `Sudoku War` is now the primary product identity.
- Solo remains the first and most immediate experience.
- Multiplayer, guilds, stakes, and rewards are future layers, not the first implementation slice.
- UX direction should gradually move toward a `math samurai` feel.
- User-specific rewards are part of the long-term roadmap.
- NFT-backed rewards remain only a future possibility, not a current implementation target.

### Changes made
- Added the product-direction brainstorm brief to the repo for future planning and cross-machine continuity.

### Verification
- Repo-tracked brainstorm brief added successfully.

### Open questions / next steps
- Continue refining the solo launcher and then move toward backend seams for future multiplayer.

### Related commits
- `8e4852c` - `Add Sudoku War product brief`

---

## 2026-03-25 - Sudoku War Solo Launcher

### Focus
- Replace the old landing/entry flow with a `Sudoku War` solo-first launcher.

### Key decisions
- Root page becomes the solo launch surface.
- Solo launch is local-first and does not require login.
- Initial launch setup exposes `difficulty` only.
- Launch metadata should be modeled explicitly so future fields like mode, tier, buy-in, and match/session ids can be added cleanly.
- Canonical game URLs remain versioned puzzle URLs.
- Resume behavior should be explicit and future-safe.

### Changes made
- Added a versioned launch utility layer for solo launch metadata and resume URL generation.
- Added the `Sudoku War` launcher page and route-aware game bootstrap flow.
- Added a client route wrapper so the static-export game page can read query-string difficulty safely.
- Rebranded the gameplay header to `Sudoku War`.
- Added landing-page and route utility tests.

### Verification
- `npm run build` passed.
- `npm test` passed.

### Open questions / next steps
- Keep simplifying the launcher UX.
- Continue aligning visuals with the `math samurai` direction.
- Begin thinking about how solo sessions should later map to server-side identities and multiplayer entry points.

### Related commits
- `4c547b9` - `Build Sudoku War solo launcher`

---

## 2026-03-25 - Solo Launcher UX Follow-Up

### Focus
- Simplify and tune the new solo launcher after live review.

### Key decisions
- Keep only the `Solo Campaign Launcher` card on the landing page.
- Continue should sit above the difficulty buttons when present.
- Difficulty selection should use compact buttons with tooltips.
- Resume should be explicit in the URL so routed launch can distinguish between fresh entry and resume entry.
- Given digits should remain visually distinct from user-entered digits.

### Changes made
- Removed the extra landing cards and reduced the launch page to a single launcher card.
- Changed difficulty selection from descriptive cards to tooltip-backed pill buttons.
- Fixed `Continue existing game` so it no longer starts a fresh board.
- Added explicit `resume=1` semantics to resume launch URLs.
- Restored given-digit styling to royal blue while keeping user-entered digits black.
- Adjusted launcher layout so `Continue` appears above the difficulty row and the difficulty buttons stay on one row.

### Verification
- `npm run build` passed after each launcher iteration.
- `npm test` passed with 36 tests after the latest launcher changes.
- Dev server flow on port `4000` remained usable throughout iterative UI review.

### Open questions / next steps
- Keep iterating on launcher visual polish.
- Decide when to introduce the next product slice after solo launch polish stabilizes.
- Consider whether the handoff doc should now reference this journal as the main ongoing context log.

### Related commits
- `4c547b9` - `Build Sudoku War solo launcher`
- Additional verified UI tweaks after that commit are currently in the working conversation context and may need a follow-up commit if not yet bundled.
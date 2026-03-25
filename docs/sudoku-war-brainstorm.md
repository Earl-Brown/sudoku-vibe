# Sudoku War Brainstorm Brief

## Summary

`Killer Sudoku` is evolving into `Sudoku War`: a more social, stake-driven version of the game that still works well for solo players. The guiding direction is:

- keep the core Sudoku solving fair and skill-based
- add social rivalry, stakes, and guild identity around the puzzle loop
- open monetization opportunities without locking the design into a rigid fairness policy too early
- build the system with configurable knobs so playtesting can drive balance

## Core Product Direction

The current product direction is:

- solo play remains important and should be a complete experience
- social features should enhance the game, not replace the core loop
- challenge modes should create tension through stakes and strike-outs
- guilds should matter, but solo players should not feel excluded

The basic model is:

- `Givens` control puzzle difficulty
- `Buy-in` controls access to higher-stakes content
- `Strikes` create failure pressure
- `Rewards` scale with difficulty, risk, and outcome

## Modes

### Solo

Solo is the backbone of the product.

- working tone: anti-war / opt-out / noncombatant identity
- candidate names:
  - `Peacenik`
  - `Conscientious Objector`
  - `Pacifist`
  - `Noncombatant`
- likely role:
  - primary progression loop
  - reliable coin earning
  - practice and retention mode

### Friendly Duel

Low-pressure social play.

- 1v1
- unrated
- untimed
- likely no ante in v1
- good for invitations, friends, and guildmates

### Challenge Duel

Competitive 1v1 play.

- 1v1
- ante / buy-in
- ranked or unranked
- timed or untimed
- stake-driven tension
- strike-out rules apply

### Guild Layer

Guilds are currently envisioned as a meta-layer rather than a separate puzzle mode.

- solo and duel play both feed guild progress
- guilds provide identity, shared goals, and social retention
- guild systems should be meaningful without making solo feel secondary

## Strikes And Failure Rules

### Strike Definition

A `strike` is a wrong guess in the game grid that produces a `rule conflict`.

This means:

- strikes are concrete and understandable
- they are tied directly to puzzle play
- they create tension without changing the underlying Sudoku rules

### Solo Strike-Out Behavior

When a player runs out of strikes in solo play:

- the game ends immediately
- the grid becomes blocked
- the visual behavior is similar to pause
- there is no way to resume
- the player sees a `Game Over` message

### Challenge Strike-Out Behavior

When a player runs out of strikes in a challenge:

- that player gets the same permanent blocked `Game Over` state
- the challenge remains open while the other player or players continue
- if all players strike out, the result is a draw
- otherwise, the player who survives the strike-out condition wins

## Economy And Monetization

### Currency

The in-game economy is based on `Coins`.

- coins can be earned through play
- coins can also be purchased

### Intended Economy Shape

Low-difficulty content:

- free to enter
- lower rewards
- little or no penalty pressure

Higher-difficulty / higher-stakes content:

- buy-in required
- stricter strike limits
- better rewards

### Fairness Direction

The current stance is:

- direct pay-to-win risk is relatively low because this is a mental skill game
- the fairness-sensitive area is not raw solving power, but retries, entries, and volume
- the design should stay flexible rather than overcommitting too early

Working compromise model:

- `Solo` can be more permissive about retries and monetized re-entry
- `Friendly` can stay forgiving and low-stakes
- `Challenge` should not allow paid retries to affect the outcome of an active match
- `Guild` scoring should be flexible in case paid retry volume needs to be capped or normalized later

## Recommended v1 Product Model

### Recommended v1 Modes

- `Solo: Peacenik`
  - main progression mode
  - primary coin earning source
  - can be the most monetization-flexible mode
- `1v1 Friendly Duel`
  - invite-based
  - unrated
  - untimed
  - low friction
- `1v1 Challenge Duel`
  - competitive mode
  - ante required
  - start unranked or ranked-lite if needed
  - keep timer rules configurable
- `Guilds`
  - lightweight in v1
  - identity and shared progress rather than deep war systems

### Recommended v1 Rules

- difficulty is driven mainly by number of givens
- strikes are wrong entries that create rule conflicts
- strike-out permanently locks the board and shows `Game Over`
- challenge matches continue until all players either finish or strike out

### Recommended v1 Economy

- low solo tier:
  - free entry
  - low rewards
  - little or no strike pressure
- mid solo tier:
  - small buy-in
  - moderate rewards
  - moderate strike limit
- high solo tier:
  - larger buy-in
  - better rewards
  - strict strike limit
- friendly duel:
  - no coin stakes by default in v1
- challenge duel:
  - fixed ante by tier
  - winner receives payout
  - draw may refund part or all of the ante

## Guild Direction

The strongest current guild concept is:

- guilds act as a wrapper around existing play rather than a mandatory mode
- solo and challenge performance can contribute to guild progress
- guilds can support:
  - shared goals
  - ladders
  - prestige
  - cosmetics
  - seasonal tracks

For v1, keep the guild system lightweight:

- guild name and identity
- shared contribution meter
- cosmetic or prestige-driven rewards
- configurable scoring rules

## Playtest Questions

These are intentionally unresolved and should be tested rather than fixed up front:

- should buy-in and strike budget be directly linked?
- should ranked challenge be timed, untimed, or both?
- how many strikes feel fair at each givens/difficulty level?
- should low-tier solo have unlimited strikes, a generous cap, or a soft-fail model?

## Design Requirements

The implementation should be designed for flexibility. The following should be configurable rather than hard-coded:

- buy-in amount
- strike limit
- whether buy-in affects strike limit
- whether retries are allowed
- retry cost
- timed vs untimed rules
- ranked rules
- guild scoring formulas
- draw refund behavior
- reward values by mode and tier

## Strong Working Summary

The current working model is:

- solo remains the backbone
- challenge creates competitive tension
- guilds provide social glue and long-term goals
- givens drive difficulty
- strikes drive pressure
- buy-ins drive stakes
- monetization should stay flexible, with stricter fairness controls in competitive contexts

This should be treated as a living brainstorm brief and a starting point for future product design, economy balancing, and technical planning.

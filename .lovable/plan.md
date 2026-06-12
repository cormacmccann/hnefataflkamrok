
# Plan: Impressive UI, Clearer Instructions, More Ancient Games

Three tracks. Track 3 is scoped honestly — some ancient games share Tafl's "custodial capture on a grid" engine and can ship playable now; others (race games, sowing games) need a brand-new engine and ship as lore first, playable in a phase 2.

---

## Track 1 — UI: more impressive + easier to use

### 1a. Landing / Game Setup (`GameSetup.tsx`)
- Replace the current flat carousel with a **cinematic hero variant card**: big variant name in display font, era subtitle, one-line origin, a "Play this saga" primary CTA, and a subtle parchment/wood texture matched to the variant's theme.
- Below the hero: a **snap-scrolling rail of variant medallions** (circular crest per variant) — tap to swap the hero. Active medallion gets a glowing ring + lift.
- Right-side settings condensed into a single **"Prepare your saga"** panel with 3 clear chips: Side (Attackers/Defenders/Random), Difficulty (Beginner → VALHALLA), Rule toggles (collapsed accordion: King armed, corner/edge escape, shieldwall).
- Add a sticky **"How to play"** ghost button next to "Start" that opens the new layered tutorial (Track 2).
- Mobile: hero card stacks above medallion rail; settings collapse into a bottom sheet.

### 1b. In-game Board & HUD
- `TurnIndicator.tsx`: convert to a slim top bar with two facing crests (attacker glyph vs defender crown), animated pulse on the active side, current move counter, and a tiny "objective" tooltip ("Defenders: escort the king to a corner").
- `GameControls.tsx` + `MoveHistory.tsx`: merge into a single floating **right-edge dock** on desktop / **bottom dock** on mobile with icons (Undo, Hint, History, Rules, Sound, Restart). Long-press / hover shows label.
- Add a one-shot **"first move" coachmark** on a player's first turn highlighting a movable piece.
- Stats bar: condense to 3 chips (pieces left attacker, pieces left defender, turn #).

### 1c. History Map & Lore (`TaflHistoryMap.tsx`)
- Add a **left-side scroll panel** with one card per variant (era, origin, archaeological find-site, one quote). Clicking a card flies the map to that marker and opens its popup.
- Switch markers to **custom variant-themed pins** (small circular crests matching the medallions).
- Animated dashed polylines redraw on variant select.
- Add a **decade timeline slider** at the bottom (~400 BCE → 1500 CE) that fades markers in/out based on their attested era.

### 1d. Global polish
- Single design-system pass: tighten spacing scale, unify shadow tokens, add a `--gradient-parchment` and `--gradient-rune` token, ensure all buttons use semantic variants (no raw color classes).

---

## Track 2 — Layered "How to play" instructions

New `RulesModal.tsx` becomes a **tabbed teaching surface** with three layered modes, in order:

1. **Quick-start card** (default tab) — one screen, illustrated, 5 panels:
   - Goal (per current variant)
   - Pieces (king, defender, attacker with the existing static images)
   - Movement (rook-like arrows on a mini diagram)
   - Capture (custodial sandwich diagram, before/after)
   - Win conditions (king-escape vs king-captured)
2. **Animated demo** tab — auto-playing 6–8 move sequence on a mini board with captioned narration ("Attacker moves… sandwiches a defender… captured!"). Uses existing `DemoMovePopup` machinery. Play/pause + step controls.
3. **Interactive guided tutorial** tab — live mini-board where the user is asked to perform actions in order: select a defender, make a legal move, perform a capture, escape the king. Valid targets are highlighted; wrong moves get a gentle nudge.

Each variant gets its own quick-start content (goal/win-condition strings already exist; we extend `VARIANT_CONFIGS` with `tutorialBullets`). All copy translated across the 6 languages already in `translations.ts`.

Entry points: "How to play" on setup, Rules icon in the in-game dock, and an auto-open on a player's very first session (localStorage flag).

---

## Track 3 — More ancient games (non-chess, non-tafl)

Honest scoping by engine compatibility:

### Ship playable now (custodial-capture grid games — reuse current engine with new configs)
- **Petteia / Πεττεία** (ancient Greek, ~6th c. BCE) — 8×8, two equal sides, custodial capture, win by immobilizing opponent. Plato & Polybius references.
- **Ludus Latrunculorum** (Roman, ~1st c. BCE–4th c. CE) — 8×8 (sizes varied), custodial capture, includes a special "dux" piece we can map to king-like mechanic. Find-sites: Corbridge, Vindolanda.

Both slot into `VARIANT_CONFIGS` with new themes, piece counts, and rule flags. AI uses the existing minimax with tuned heuristics.

### Ship as lore first (different engines — phase 2 to play)
Added as map pins + lore cards in the History Map, clearly labeled "Lore preview — playable coming soon":
- **Senet** (Egyptian, ~3100 BCE) — race game, casting sticks. Needs dice + track engine.
- **Liubo / 六博** (Han China, ~4th c. BCE) — race + capture hybrid, rules partially lost.
- **Patolli** (Aztec, pre-1500 CE) — race game on cross-shaped board, bean dice.
- **Bao / Mancala** (East Africa, attested ~7th c. CE) — sowing game, needs pit/seed engine.
- **Gonu / Go-variants from Korea** — territory; out of scope vs chess-exclusion spirit, include only as a lore footnote.

This gives the user 2 brand-new fully-playable historic games immediately, plus 4 educational lore entries that visibly expand the world and set up phase 2.

---

## Technical details

- Files to add: `src/components/game/tutorial/QuickStartCard.tsx`, `AnimatedDemo.tsx`, `GuidedTutorial.tsx`, `src/components/game/VariantMedallion.tsx`, `src/components/game/HistoryTimeline.tsx`.
- Files to edit: `GameSetup.tsx`, `RulesModal.tsx`, `TurnIndicator.tsx`, `GameControls.tsx`, `MoveHistory.tsx`, `TaflHistoryMap.tsx`, `Index.tsx`, `src/constants/game.ts` (add PETTEIA + LATRUNCULORUM configs/themes, plus a new `LORE_GAMES` array), `src/types/game.ts` (extend `GameVariant` enum + `tutorialBullets` field), `src/i18n/translations.ts` (6-language strings for new variants + new tutorial copy), `src/index.css` (new gradient/shadow tokens), `tailwind.config.ts` (new semantic colors if needed).
- No backend / Lovable Cloud changes. No schema changes. Existing game engine in `lib/` reused — Petteia/Latrunculorum only need new `VariantRules` + initial board setups.
- Localization: every new English string added to all 6 existing language keys.
- Accessibility: tutorial nav is keyboard-navigable; coachmarks dismissible; mini-board has aria labels.

---

## Out of scope (call out explicitly)
- Building a dice/race engine for Senet/Liubo/Patolli (phase 2).
- Building a mancala/sowing engine for Bao (phase 2).
- Online multiplayer (already deferred).
- Any change to existing Tafl game logic / AI heuristics beyond reusing them for the two new custodial-capture variants.

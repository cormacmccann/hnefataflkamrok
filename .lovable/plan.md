
# Plan: Make all 8 ancient games playable

Scope is large and honest — three brand-new engine families, plus AI, UI, 3D boards, and 6-language copy for each. I'll ship in 3 phases so you have something playable after each one rather than waiting for everything.

---

## Phase 1 — Custodial-capture family (reuses existing Tafl engine)

**Games:** Petteia (Greek, 8×8), Ludus Latrunculorum (Roman, 8×8 with "dux" piece).

**Work:**
- Extend `VARIANT_CONFIGS` in `src/constants/game.ts` with two new variants + themes (Greek marble/olive for Petteia, Roman bronze/legion-red for Latrunculorum).
- New rule flags on `VariantRules`: `equalSides` (no king), `immobilizationWin`, `duxPiece`.
- Patch `useGameLogic.ts` victory check: detect "no legal moves" as a loss for that side.
- AI: reuse minimax, new heuristic weights (no king-escape term; mobility + material).
- 3D: reuse square board; new piece colors/materials only.
- Tutorial + history map cards in all 6 languages.

**Deliverable:** 2 fully playable new variants alongside Tafl.

---

## Phase 2 — Race-game engine (dice + linear/branching tracks)

**Games:** Royal Game of Ur, Senet, Mehen, Patolli, Liubo.

**New shared engine** `src/lib/raceEngine.ts`:
- Generic track graph (nodes + directed edges) so each game just declares its board topology.
- Dice abstraction: 4 binary throwing-sticks (Ur, Senet), 6 sticks (Liubo), 5 marked beans (Patolli), 6 sticks for Mehen.
- Per-game special-square handlers (Senet's water/rebirth squares, Ur's rosettes for extra turns, Patolli's cross-arms, Mehen's spiral lion-attack).
- Capture/swap/safe-square rules per game.
- Bear-off / win condition per game.

**Per-game configs:**
- **Royal Game of Ur** — Finkel's reconstruction (2007 British Museum tablet). Solid rules, easy.
- **Senet** — Kendall/Bell reconstruction. Honest disclaimer: rules are educated reconstruction.
- **Mehen** — minimal speculative ruleset with an in-app "rules are lost — this is a modern reconstruction" notice.
- **Patolli** — Durán's chronicle-based ruleset, betting mechanic omitted.
- **Liubo** — partial reconstruction notice; play a simplified race based on surviving Han fragments.

**AI:** Race games are largely chance-driven; AI = expectimax 1–2 ply over dice distributions with a "racing + capture" heuristic.

**UI:** New `RaceBoard.tsx` (2D SVG, since 3D for snake/cross/serpentine tracks is a huge separate project). Dice-roll animation component.

**Deliverable:** 5 playable race games with clear authenticity disclaimers.

---

## Phase 3 — Sowing engine (Bao)

**Game:** Bao la Kiswahili.

**New engine** `src/lib/sowingEngine.ts`:
- 4 rows × 8 pits, seeds per pit, two phases (namua / mtaji).
- Multi-lap sowing with relay-capture (the hard part — Bao is famously the most complex traditional game).
- Special pit `nyumba` mechanics.

**AI:** Iterative-deepening minimax over sowing moves; Bao's branching factor is small so this works well.

**UI:** New `BaoBoard.tsx` 2D top-down with seed-drop animation.

**Deliverable:** Playable Bao with a "trainer mode" hint system because the rules are unforgiving.

---

## Cross-cutting work (each phase)

- Update `GameSetup.tsx` variant rail to group: **Tafl** / **Custodial** / **Race** / **Sowing**.
- `loreGames.ts` entries flip `status: 'lore'` → `'playable'` and link to the variant.
- Tutorial layered modal (`RulesModal.tsx`) gets per-game quick-start + animated demo.
- 6-language translation pass for every new string.
- History map: clicking a now-playable pin offers "Read lore" or "Play this game".

---

## Honest disclaimers shown in-game

For Senet, Mehen, Liubo, Patolli I'll show a small parchment notice: "Original rules are partly lost. This is a modern reconstruction based on [source]." This is more historically responsible than pretending we know.

---

## Out of scope

- Full 3D boards for race/sowing games (2D SVG only — 3D snake/cross boards are weeks of modeling each).
- Online multiplayer.
- Patolli betting mechanic.
- Variant-by-variant AI tuning beyond reasonable defaults.

---

## Suggested order

Start Phase 1 now (fastest payoff, biggest reuse). Phase 2 next session (largest single chunk — race engine is real work). Phase 3 last (Bao alone is engine + UI + AI).

**Confirm and I'll begin Phase 1 immediately.** If you'd rather I attempt all three phases in one go, say so — it will be a very large change touching ~25 files and I'll need to skip some polish.

# Tafl — "Next Level" Roadmap

This is a lot of work. I've grouped everything into **6 phases** that each ship a usable milestone. We can stop after any phase. I recommend approving phase-by-phase rather than all-at-once so we can react to what we learn.

---

## Phase 1 — Daily Puzzle + Citations (fastest wins)
**Why first:** highest impact-to-effort. Gives returning-visitor hook + scholarly credibility immediately.

- **Daily Puzzle widget** on landing page
  - New table `daily_puzzles` (date, variant_id, fen-style position, solution moves, difficulty)
  - New table `puzzle_attempts` (user_id, puzzle_id, solved, moves_taken, completed_at)
  - "Today's Saga" card in the editorial layout: shows mini-board, "White to escape in 3", streak counter
  - Solve flow reuses existing `Board3D` in a constrained mode
  - Seed ~60 hand-curated positions (one per variant × difficulty)
- **Citations panel** per variant
  - Extend `GAME_VARIANTS` with `sources: { title, author, year, url?, type: 'manuscript'|'archaeology'|'saga' }[]`
  - "Sources & Scholarship" expandable section in each variant card
  - Add real citations (Linnaeus 1732, CCCC MS 122, Ballinderry excavation, Robert ap Ifan 1587, etc.)
- **Historian Mode toggle** in settings — shows alternate ruleset interpretations side-by-side on variant info card

---

## Phase 2 — Ranked Online Play
**Why next:** retention engine. Tafl has no global ladder anywhere — we own the niche.

- **Matchmaking lobby** (`/lobby` route)
  - Queue per variant + time control (blitz/rapid/classical)
  - Edge function `match-make` pairs by ELO proximity
- **ELO/Glicko ratings**
  - New table `ratings` (user_id, variant_id, rating, rd, games_played)
  - New table `ranked_games` (room_id, winner_id, rating_changes, played_at)
  - Update on game completion via edge function
- **Leaderboards** page — global + per-variant + seasonal (reset quarterly)
- **Spectator mode** — already have room sync; add read-only viewer route `/watch/:code`

---

## Phase 3 — Smarter AI + Replays
**Why:** depth for solo players + shareability loop.

- **Stronger engine**
  - Iterative deepening + transposition table on existing minimax
  - Opening book seeded from historical/master games
  - Named AI personas with distinct evaluation weights: "Ivar the Boneless" (aggressive), "Gormflaith" (patient), "Bishop Israel" (positional)
- **Post-game analysis**
  - Win-probability graph overlay
  - Blunder detection (eval drop > threshold) with "best move was…" arrows
  - Reuses existing `MoveHistory`
- **Replay system**
  - PGN-like notation: `TGN` (Tafl Game Notation)
  - Save every completed game to `game_replays` table
  - Shareable URL `/replay/:id` with playback controls
  - Export/import `.tgn` file

---

## Phase 4 — Audio, Mobile, PWA Polish
**Why:** production feel + mobile install.

- **Per-variant ambient beds** (audio assets via lovable-assets)
  - Sámi joik for Tablut, Welsh harp for Tawlbwrdd, Gregorian for Alea, Norse for Hnefatafl, Celtic for Brandub/Fidchell
- **Haptics** on mobile for captures/moves (Vibration API + Capacitor-ready)
- **PWA manifest** (manifest-only, per skill guidance — no service worker unless requested)
  - Home-screen install, app icon, splash colors
- **Sound design pass** — distinct capture/move/throne sounds per variant theme

---

## Phase 5 — Growth & SEO
**Why:** distribution. The lore is already written; we just need to make it indexable.

- **Per-variant learn pages** — `/learn/hnefatafl`, `/learn/tablut`, etc.
  - Long-form historical article, rules, diagrams, citations, embedded playable mini-board
  - Proper SEO: unique title, meta, JSON-LD (`Game` + `Article` schema), canonical
- **OG share-card generator** — edge function renders board snapshot as PNG for `/replay/:id` and puzzle shares
- **Embed widget** — `<iframe src="/embed/hnefatafl">` for blogs/educators
- **Sitemap** + structured data so each variant page is discoverable

---

## Phase 6 — Lost-Games Expansion
**Why:** moat. Become the definitive platform.

- **Finish the stubs:** Mehen, Patolli, Senet engines (you have shells already in `src/lib/ancient/`)
- **New families:**
  - Nine Men's Morris (Roman/medieval)
  - Hounds & Jackals (Egyptian, ~2000 BCE)
  - Mancala-family additions beyond Bao
- Each gets the same treatment as tafl variants: 3D board, citations, lore card, era backdrop

---

## Out of Scope (call out)
- **Trained neural net AI** — mentioned in suggestions but requires training infra/dataset that's a project of its own. Phase 3 ships strong classical AI instead.
- **Twitch overlay** — defer until ranked play has actual viewer demand.
- **Real historian review** — that's outreach work the user does, not something I can build.

---

## Technical Notes

**New backend surface (Phases 1–3):**
- Tables: `daily_puzzles`, `puzzle_attempts`, `ratings`, `ranked_games`, `game_replays`, `variant_sources` (or inline in code)
- Edge functions: `match-make`, `submit-ranked-result`, `generate-og-card`
- All with RLS + GRANTs per project conventions

**New routes:**
- `/lobby`, `/leaderboard`, `/watch/:code`, `/replay/:id`, `/learn/:variant`, `/embed/:variant`

**Reuses heavily:**
- Existing `Scene3D`, `Board3D`, `CircularBoard3D`, `MoveHistory`, `useRoomSync`, `useGameLogic`

---

## Recommendation
Approve **Phase 1 only** to start. It's the most impactful and ships in one focused build. We review the result, then I plan Phase 2 with what we learned. "Do all 6 at once" is technically possible but the plan would be too large to execute well in a single pass — each phase deserves its own focused implementation cycle.

Reply with which phase(s) to start, or "phase 1" to go with the recommendation.

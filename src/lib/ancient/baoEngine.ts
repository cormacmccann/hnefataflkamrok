// Bao la Kiswahili — faithful (MVP) engine.
// Covers Kunamua (Phase 1), Mtaji (Phase 2), Nyumba (functional / inactive / destroyed),
// Kichwa entry of captured seeds, mandatory capture, multi-lap relay sowing,
// taxation when Nyumba is the only choice, and standard win conditions.
//
// Deferred (documented and left for v2):
//   - Blocking rule
//   - Long-sowing capture restriction (pits with >16 seeds)
//   - Functional Nyumba "stop or destroy and Safari" prompt: we implement the
//     simpler interpretation — landing the final seed of a relay in a functional
//     Nyumba always stops the move. (See `NYUMBA_LANDING_STOPS`.)

export type Player = 0 | 1;
export type Dir = 'fwd' | 'bwd';
export type Phase = 'kunamua' | 'mtaji';
export type NyumbaState = 'functional' | 'inactive' | 'destroyed';

// Board addressing:
//   rows 0..3:
//     row 0 = Player 2 outer
//     row 1 = Player 2 inner
//     row 2 = Player 1 inner
//     row 3 = Player 1 outer
//   cols 0..7, left-to-right in world coordinates.
export interface BaoState {
  pits: number[][];                 // pits[row][col], 4x8
  storage: [number, number];        // [P1 storage, P2 storage]
  nyumba: [NyumbaState, NyumbaState];
  turn: Player;
  phase: Phase;
  winner: Player | null;
  winReason: string | null;
  log: string[];
  highlightPath: Array<{ row: number; col: number }>; // last move's traversed pits (for animation)
  lastCapture: { row: number; col: number } | null;
}

export interface Move {
  /** Pit chosen to seed Phase 1 (drop storage seed there, then sow), or to lift in Phase 2. */
  startRing: number;             // 0..15 in current player's ring
  direction: Dir;
  /** When >1 Kichwa is valid for a capture, which one to enter from (ring index 0 or 7). */
  kichwaChoice?: 0 | 7;
  /** True only if the start pit is the Nyumba being used as last-resort (taxation). */
  taxation?: boolean;
}

export const NYUMBA_LANDING_STOPS = true; // simplified rule (see note above)

// ---------- ring / coordinate helpers ----------

/** Player p's ring index i -> board {row,col}.
 *  P1 ring: inner row (row 2) cols 0..7 (indices 0..7), then outer row (row 3) cols 7..0 (indices 8..15).
 *  P2 ring mirrors so both players' rings are oriented identically from their own POV.
 */
export function ringPit(p: Player, i: number): { row: number; col: number } {
  const inner = p === 0 ? 2 : 1;
  const outer = p === 0 ? 3 : 0;
  if (i < 8) {
    const col = p === 0 ? i : 7 - i;
    return { row: inner, col };
  }
  const j = i - 8;
  const col = p === 0 ? 7 - j : j;
  return { row: outer, col };
}

export function pitToRing(p: Player, row: number, col: number): number | null {
  const inner = p === 0 ? 2 : 1;
  const outer = p === 0 ? 3 : 0;
  if (row === inner) return p === 0 ? col : 7 - col;
  if (row === outer) return p === 0 ? 15 - col : 8 + col;
  return null;
}

export const NYUMBA_RING = 4;          // 5th inner pit from ring index 0 — symmetric per player
export const KICHWA_RING: [0, 7] = [0, 7];
export const INNER_RING_MAX = 7;       // ring indices 0..7 are inner row

export function isInnerRing(i: number): boolean { return i < 8; }

export function oppositeInnerPit(p: Player, ringIndex: number): { row: number; col: number } | null {
  if (!isInnerRing(ringIndex)) return null;
  const { col } = ringPit(p, ringIndex);
  const opp = (1 - p) as Player;
  const oppInner = opp === 0 ? 2 : 1;
  return { row: oppInner, col };
}

export function step(i: number, d: Dir): number {
  return d === 'fwd' ? (i + 1) % 16 : (i + 15) % 16;
}

// ---------- initial state ----------

export function initialBaoState(): BaoState {
  const pits = Array.from({ length: 4 }, () => Array(8).fill(0));
  // Standard "Sultani" / textbook opening: each side has 6 in Nyumba (col 4 from ring 0 POV),
  // 2 in the next two inner pits "to the right". For P1 ring indices 4,5,6 -> cols 4,5,6.
  // For P2 ring indices 4,5,6 -> cols 3,2,1 (mirrored). 22 seeds in storage per side.
  for (const p of [0, 1] as Player[]) {
    [
      { ri: 4, n: 6 },
      { ri: 5, n: 2 },
      { ri: 6, n: 2 },
    ].forEach(({ ri, n }) => {
      const { row, col } = ringPit(p, ri);
      pits[row][col] = n;
    });
  }
  return {
    pits,
    storage: [22, 22],
    nyumba: ['functional', 'functional'],
    turn: 0,
    phase: 'kunamua',
    winner: null,
    winReason: null,
    log: ['Bao la Kiswahili: Phase 1 (Kunamua). Player 1 begins.'],
    highlightPath: [],
    lastCapture: null,
  };
}

// ---------- pit-state helpers ----------

function clone(state: BaoState): BaoState {
  return {
    ...state,
    pits: state.pits.map((r) => [...r]),
    storage: [...state.storage] as [number, number],
    nyumba: [...state.nyumba] as [NyumbaState, NyumbaState],
    log: [...state.log],
    highlightPath: [],
  };
}

function getPit(state: BaoState, ri: number, p: Player): number {
  const { row, col } = ringPit(p, ri);
  return state.pits[row][col];
}

function setPit(state: BaoState, ri: number, p: Player, v: number) {
  const { row, col } = ringPit(p, ri);
  state.pits[row][col] = v;
}

function updateNyumbaStatus(state: BaoState, p: Player) {
  const seeds = getPit(state, NYUMBA_RING, p);
  const cur = state.nyumba[p];
  if (cur === 'destroyed') return;
  if (seeds >= 6) state.nyumba[p] = 'functional';
  else if (seeds === 0 && cur === 'functional') state.nyumba[p] = 'inactive'; // first time emptied while it was functional
  else if (seeds < 6) state.nyumba[p] = 'inactive';
}

// ---------- legal moves ----------

/** Enumerate all candidate moves (start pit + direction choices + kichwa choices) for the player.
 *  Then filter by mandatory-capture rule.
 */
export function legalMoves(state: BaoState): Move[] {
  if (state.winner !== null) return [];
  const p = state.turn;
  const moves: Move[] = [];

  // helper: which inner pits are non-empty (Phase 1 destinations)
  const innerNonEmpty: number[] = [];
  for (let i = 0; i < 8; i++) if (getPit(state, i, p) > 0) innerNonEmpty.push(i);

  // Phase 2 source pits: pits with >=2 seeds. Outer only allowed if no inner pit has >1.
  if (state.phase === 'mtaji') {
    const anyInnerMulti = innerNonEmpty.some((i) => getPit(state, i, p) >= 2);
    const sources: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (getPit(state, i, p) >= 2) {
        if (!isInnerRing(i) && anyInnerMulti) continue;
        sources.push(i);
      }
    }
    for (const s of sources) {
      for (const d of ['fwd', 'bwd'] as Dir[]) {
        // generate base move; kichwa is only chosen if needed (post-sow). For enumeration we add one move per direction.
        moves.push({ startRing: s, direction: d });
      }
    }
  } else {
    // Phase 1 Kunamua. If storage empty here we should already have transitioned, but guard:
    if (state.storage[p] === 0) {
      // technically we'd transition; let the caller advance and call again. Return empty for now to skip turn.
      return [];
    }
    // Destination = any non-empty inner pit, AND outer row if (a) no inner pit has seeds OR (b) you choose to drop on outer non-empty? Per spec: "The player places it into a non-empty pit on their side." Some sources restrict to inner row; we accept any non-empty pit on the player's side.
    const destinations: number[] = [];
    for (let i = 0; i < 16; i++) {
      const cell = getPit(state, i, p);
      if (cell > 0) destinations.push(i);
    }
    // If no non-empty pit at all (extremely rare), player skips turn.
    if (destinations.length === 0) return [];

    // Nyumba restriction in Phase 1:
    //   The Nyumba may only be selected if (a) a capture is possible OR (b) it is the
    //   last remaining non-empty inner-row pit.
    const lastInnerIsNyumba = innerNonEmpty.length === 1 && innerNonEmpty[0] === NYUMBA_RING;

    for (const d of destinations) {
      for (const dir of ['fwd', 'bwd'] as Dir[]) {
        if (d === NYUMBA_RING && state.nyumba[p] === 'functional') {
          // try as capture
          const sim = simulateMove(state, { startRing: d, direction: dir });
          if (sim.firstSowingIsCapture) {
            moves.push({ startRing: d, direction: dir });
          } else if (lastInnerIsNyumba) {
            moves.push({ startRing: d, direction: dir, taxation: true });
          }
          continue;
        }
        moves.push({ startRing: d, direction: dir });
      }
    }
  }

  // Mandatory capture: simulate each candidate; if any is a capture, drop the rest.
  const captureMoves: Move[] = [];
  const allSims = moves.map((m) => ({ m, sim: simulateMove(state, m) }));
  for (const { m, sim } of allSims) if (sim.firstSowingIsCapture) captureMoves.push(m);

  // Expand kichwa choices for capture moves where the capture lands in middle cols (cols 1..6 of inner row from player POV).
  const expanded: Move[] = [];
  const baseList = captureMoves.length > 0 ? captureMoves : moves;
  for (const m of baseList) {
    const sim = simulateMove(state, m);
    if (sim.firstSowingIsCapture && sim.captureRingIndex !== null) {
      const r = sim.captureRingIndex;
      // ring index in inner row: 0..7. ring index 0 -> kichwa 0 forced (dir fwd). ring index 7 -> kichwa 7 forced (dir bwd). middle -> choice.
      if (r === 0) expanded.push({ ...m, kichwaChoice: 0 });
      else if (r === 7) expanded.push({ ...m, kichwaChoice: 7 });
      else {
        expanded.push({ ...m, kichwaChoice: 0 });
        expanded.push({ ...m, kichwaChoice: 7 });
      }
    } else {
      expanded.push(m);
    }
  }
  return expanded;
}

// ---------- sowing simulation ----------

interface SimResult {
  firstSowingIsCapture: boolean;
  captureRingIndex: number | null; // ring index where the first capture happens
}

function simulateMove(state: BaoState, move: Move): SimResult {
  // Run the move with a dummy kichwa preference of 0 just to detect first-capture; we don't apply state.
  const tmp = clone(state);
  const p = tmp.turn;
  let seeds: number;
  let i: number;
  let dir = move.direction;

  if (tmp.phase === 'kunamua') {
    if (tmp.storage[p] <= 0) return { firstSowingIsCapture: false, captureRingIndex: null };
    tmp.storage[p] -= 1;
    setPit(tmp, move.startRing, p, getPit(tmp, move.startRing, p) + 1);
  }

  if (move.taxation) {
    // remove only 2 seeds for taxation
    const cur = getPit(tmp, move.startRing, p);
    if (cur < 2) return { firstSowingIsCapture: false, captureRingIndex: null };
    setPit(tmp, move.startRing, p, cur - 2);
    seeds = 2;
    i = move.startRing;
  } else {
    seeds = getPit(tmp, move.startRing, p);
    if (seeds < 1) return { firstSowingIsCapture: false, captureRingIndex: null };
    setPit(tmp, move.startRing, p, 0);
    i = move.startRing;
  }

  let captureRing: number | null = null;
  let safety = 500;
  while (seeds > 0 && safety-- > 0) {
    i = step(i, dir);
    setPit(tmp, i, p, getPit(tmp, i, p) + 1);
    seeds -= 1;
    if (seeds === 0) {
      // landed: check capture
      if (isInnerRing(i) && getPit(tmp, i, p) > 1) {
        const opp = oppositeInnerPit(p, i)!;
        const oppSeeds = tmp.pits[opp.row][opp.col];
        if (oppSeeds > 0) {
          captureRing = i;
          return { firstSowingIsCapture: true, captureRingIndex: captureRing };
        }
        // relay: pick up and continue (this is a non-capture relay; the move continues but the
        // "first sowing" itself was not a capture).
        seeds = getPit(tmp, i, p);
        setPit(tmp, i, p, 0);
      }
      // landed in empty pit -> move ends without capture
    }
  }
  return { firstSowingIsCapture: false, captureRingIndex: null };
}

// ---------- apply move ----------

export interface ApplyResult {
  state: BaoState;
}

export function applyMove(state: BaoState, move: Move): ApplyResult {
  const next = clone(state);
  const p = next.turn;
  const path: Array<{ row: number; col: number }> = [];

  next.lastCapture = null;

  // Phase 1 — place storage seed first
  if (next.phase === 'kunamua') {
    if (next.storage[p] <= 0) {
      // nothing to drop; pass
      next.log.push(`Player ${p + 1}: no seeds in storage — passing.`);
      finishTurn(next);
      return { state: next };
    }
    next.storage[p] -= 1;
    setPit(next, move.startRing, p, getPit(next, move.startRing, p) + 1);
    const sp = ringPit(p, move.startRing);
    path.push(sp);
    next.log.push(`Player ${p + 1} places a seed into ${pitLabel(p, move.startRing)}.`);
  }

  // Determine whether this is a capture move (first sowing must capture)
  const sim = simulateMove(state, move);
  const isCaptureMove = sim.firstSowingIsCapture;

  // Lift seeds (or taxation)
  let seeds: number;
  let i: number;
  let dir = move.direction;
  if (move.taxation) {
    const cur = getPit(next, move.startRing, p);
    setPit(next, move.startRing, p, cur - 2);
    seeds = 2;
    i = move.startRing;
    next.log.push(`Player ${p + 1}: taxation — 2 seeds taken from Nyumba.`);
  } else {
    seeds = getPit(next, move.startRing, p);
    setPit(next, move.startRing, p, 0);
    i = move.startRing;
    if (next.phase === 'mtaji') {
      next.log.push(`Player ${p + 1} sows from ${pitLabel(p, move.startRing)} (${seeds} seeds, ${dir === 'fwd' ? '→' : '←'}).`);
    }
  }

  // Main sowing loop with relay & captures
  let safety = 2000;
  let firstSowing = true;
  while (seeds > 0 && safety-- > 0) {
    i = step(i, dir);
    setPit(next, i, p, getPit(next, i, p) + 1);
    path.push(ringPit(p, i));
    seeds -= 1;

    if (seeds === 0) {
      // landed
      const landed = getPit(next, i, p);

      // Functional-Nyumba landing stop rule (simplified)
      if (NYUMBA_LANDING_STOPS && i === NYUMBA_RING && next.nyumba[p] === 'functional' && !isCaptureMove) {
        next.log.push(`Player ${p + 1}: final seed rests in the functional Nyumba — the move stops.`);
        break;
      }

      // Capture?
      if (isInnerRing(i) && landed > 1) {
        const opp = oppositeInnerPit(p, i)!;
        const oppSeeds = next.pits[opp.row][opp.col];
        if (isCaptureMove && oppSeeds > 0) {
          // Capture: take opp seeds, re-sow from kichwa toward Nyumba.
          next.pits[opp.row][opp.col] = 0;
          next.lastCapture = { row: opp.row, col: opp.col };
          next.log.push(`Player ${p + 1} captures ${oppSeeds} seed${oppSeeds === 1 ? '' : 's'} from the opponent's inner pit (col ${opp.col + 1}).`);

          // Decide kichwa:
          let kichwa: 0 | 7;
          if (i === 0) kichwa = 0;
          else if (i === 7) kichwa = 7;
          else kichwa = (move.kichwaChoice ?? 0);
          const newDir: Dir = kichwa === 0 ? 'fwd' : 'bwd';
          dir = newDir;
          i = kichwa;
          // Place all captured seeds AT kichwa, then continue sowing from there.
          // Bao rule: re-sowing starts BY DROPPING the first captured seed in the kichwa pit itself,
          // i.e. the seeds are sown beginning at the kichwa (first seed lands in kichwa, then onwards).
          // Implementation: set seeds = oppSeeds, then on next loop iteration step() advances; so seed
          // would land *after* kichwa. Instead, drop one in kichwa first, decrement, then continue.
          if (oppSeeds > 0) {
            setPit(next, kichwa, p, getPit(next, kichwa, p) + 1);
            path.push(ringPit(p, kichwa));
            seeds = oppSeeds - 1;
            // After dropping one in kichwa, treat as if last landed in kichwa.
            const kLanded = getPit(next, kichwa, p);
            if (seeds === 0) {
              // entire capture re-sowing was one seed; check stop/relay
              if (isInnerRing(kichwa) && kLanded > 1) {
                const opp2 = oppositeInnerPit(p, kichwa)!;
                if (next.pits[opp2.row][opp2.col] > 0) {
                  // second capture chain
                  // loop will continue thanks to seeds=0 -> but we'll process below
                  // simulate by setting seeds back: we need to do a chained capture.
                  const cap2 = next.pits[opp2.row][opp2.col];
                  next.pits[opp2.row][opp2.col] = 0;
                  next.lastCapture = { row: opp2.row, col: opp2.col };
                  next.log.push(`Player ${p + 1} chains a capture for ${cap2}.`);
                  seeds = cap2 - 1;
                  setPit(next, kichwa, p, getPit(next, kichwa, p) + 1);
                  path.push(ringPit(p, kichwa));
                }
              }
            }
          }
          firstSowing = false;
          continue;
        }
        if (oppSeeds === 0 || !isCaptureMove) {
          // relay (non-capture continuation): pick up and continue sowing in same direction
          seeds = getPit(next, i, p);
          setPit(next, i, p, 0);
          firstSowing = false;
          continue;
        }
      }
      // landed in empty pit -> move ends
      break;
    }
  }

  // Nyumba destruction check: if opp emptied our Nyumba via capture this turn, mark destroyed.
  // (Standard rule: only the opponent's capture of seeds from the Nyumba destroys it.)
  for (const pl of [0, 1] as Player[]) {
    const seedsInNyumba = getPit(next, NYUMBA_RING, pl);
    if (next.nyumba[pl] !== 'destroyed') {
      if (seedsInNyumba === 0 && next.lastCapture) {
        const opp = oppositeInnerPit(pl, NYUMBA_RING)!;
        // if the captured cell was the player's Nyumba's opposite is NOT this — we check pl's own Nyumba being emptied via opp's capture: that would happen if (1-pl) just captured from pl's Nyumba.
        // Simpler check: if it's not the mover and their Nyumba is now 0 and we just captured, treat as destroyed.
        if (pl !== p) {
          next.nyumba[pl] = 'destroyed';
          next.log.push(`Player ${pl + 1}'s Nyumba has been destroyed!`);
        }
      } else {
        updateNyumbaStatus(next, pl);
      }
    }
  }

  next.highlightPath = path;

  // Phase transition
  if (next.phase === 'kunamua' && next.storage[0] === 0 && next.storage[1] === 0) {
    next.phase = 'mtaji';
    next.log.push('All storage seeds are in play. Phase 2 (Mtaji) begins.');
  }

  // Win checks
  checkWin(next);

  if (next.winner === null) finishTurn(next);
  return { state: next };
}

function finishTurn(state: BaoState) {
  state.turn = (1 - state.turn) as Player;
}

function checkWin(state: BaoState) {
  for (const opp of [0, 1] as Player[]) {
    // 1. inner row empty
    const innerRow = opp === 0 ? 2 : 1;
    const innerEmpty = state.pits[innerRow].every((v) => v === 0);
    if (innerEmpty && state.phase === 'mtaji') {
      const winner = (1 - opp) as Player;
      state.winner = winner;
      state.winReason = `Player ${winner + 1} wins — Player ${opp + 1}'s inner row is empty.`;
      state.log.push(state.winReason);
      return;
    }
  }
  // 2. opponent (whose turn would be next) has no legal move
  const wouldBeTurn = (1 - state.turn) as Player;
  const probe = { ...state, turn: wouldBeTurn };
  const oppMoves = legalMoves(probe);
  if (oppMoves.length === 0 && state.phase === 'mtaji') {
    state.winner = state.turn;
    state.winReason = `Player ${state.turn + 1} wins — Player ${wouldBeTurn + 1} has no legal move.`;
    state.log.push(state.winReason);
  }
}

// ---------- labels ----------

function pitLabel(p: Player, ri: number): string {
  if (ri === NYUMBA_RING) return 'Nyumba';
  if (ri === 0) return 'Kichwa (left)';
  if (ri === 7) return 'Kichwa (right)';
  return isInnerRing(ri) ? `inner pit ${ri + 1}` : `outer pit ${ri - 7}`;
}

// ---------- view-model helpers (used by UI) ----------

export interface LegalPitView {
  ringIndex: number;
  row: number;
  col: number;
  isCapture: boolean;
  taxation: boolean;
  moves: Move[]; // one per direction/kichwa combo
}

export function legalPits(state: BaoState): LegalPitView[] {
  const moves = legalMoves(state);
  const byPit = new Map<number, Move[]>();
  for (const m of moves) {
    const arr = byPit.get(m.startRing) ?? [];
    arr.push(m);
    byPit.set(m.startRing, arr);
  }
  const result: LegalPitView[] = [];
  for (const [ri, ms] of byPit.entries()) {
    const { row, col } = ringPit(state.turn, ri);
    const isCapture = ms.some((m) => simulateMove(state, m).firstSowingIsCapture);
    const taxation = ms.every((m) => m.taxation);
    result.push({ ringIndex: ri, row, col, isCapture, taxation, moves: ms });
  }
  return result;
}

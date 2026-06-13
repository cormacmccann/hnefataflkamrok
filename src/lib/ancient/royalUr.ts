// Royal Game of Ur — logic engine
// Based on Irving Finkel's reconstruction (British Museum, tablet BM 33333+).
// 20-square H-board, 7 tokens per side, 4 binary tetrahedral dice (roll 0–4).

export type UrPlayer = 'white' | 'black';

// Each player's path of 14 squares. Shared middle squares appear in both paths.
// Squares are referenced by string ids tied to render coordinates.
// Layout (row, col), 3 rows × 8 cols with two gaps on row 0/2:
//   row 0 (white): w0 w1 w2 w3  .  .  w12 w13
//   row 1 shared:  s0 s1 s2 s3 s4 s5 s6 s7
//   row 2 (black): b0 b1 b2 b3  .  .  b12 b13
// White path (14): w3 w2 w1 w0 s0 s1 s2 s3 s4 s5 s6 s7 w13 w12  → off
// Black path (14): b3 b2 b1 b0 s0 s1 s2 s3 s4 s5 s6 s7 b13 b12 → off
// Rosettes (extra turn + safe on shared): path indices 3 (own), 7 (shared centre), 13 (own).

export const WHITE_PATH = [
  'w3','w2','w1','w0',
  's0','s1','s2','s3','s4','s5','s6','s7',
  'w13','w12',
] as const;

export const BLACK_PATH = [
  'b3','b2','b1','b0',
  's0','s1','s2','s3','s4','s5','s6','s7',
  'b13','b12',
] as const;

export const ROSETTES = new Set([3, 7, 13]); // path indices
export const SHARED_RANGE: [number, number] = [4, 11]; // indices on path that are shared squares

export type SquareId =
  | 'w0'|'w1'|'w2'|'w3'|'w12'|'w13'
  | 'b0'|'b1'|'b2'|'b3'|'b12'|'b13'
  | 's0'|'s1'|'s2'|'s3'|'s4'|'s5'|'s6'|'s7';

// Render coords (row, col) on a 3×8 grid (gap cells excluded by not being in maps)
export const SQUARE_COORDS: Record<SquareId, { row: number; col: number }> = {
  w3: { row: 0, col: 0 }, w2: { row: 0, col: 1 }, w1: { row: 0, col: 2 }, w0: { row: 0, col: 3 },
  w13: { row: 0, col: 6 }, w12: { row: 0, col: 7 },
  s0: { row: 1, col: 3 }, s1: { row: 1, col: 2 }, s2: { row: 1, col: 1 }, s3: { row: 1, col: 0 },
  s4: { row: 1, col: 7 }, s5: { row: 1, col: 6 }, s6: { row: 1, col: 5 }, s7: { row: 1, col: 4 },
  b3: { row: 2, col: 0 }, b2: { row: 2, col: 1 }, b1: { row: 2, col: 2 }, b0: { row: 2, col: 3 },
  b13: { row: 2, col: 6 }, b12: { row: 2, col: 7 },
};
// Note: shared row mapping is canonical to BM 12345 (Finkel) — squares run right-to-left for white as they enter shared row, then forward. We use a renderer-friendly mapping above so the visible path flows left→right→loop.

export const ROSETTE_SQUARES = new Set<SquareId>(['w3', 'b3', 's7', 'w13', 'b13']);
// (path-index rosettes 3 = own w3/b3, 7 = shared s7 centre, 13 = own w13/b13)

export interface UrState {
  // -1 = at start (off-board, waiting to enter), 0..13 = path index, 14 = borne off
  white: number[]; // length 7
  black: number[]; // length 7
  turn: UrPlayer;
  dice: number;    // last roll, -1 if not yet rolled
  rolled: boolean;
  winner: UrPlayer | null;
  log: string[];
}

export function initialUrState(): UrState {
  return {
    white: Array(7).fill(-1),
    black: Array(7).fill(-1),
    turn: 'white',
    dice: -1,
    rolled: false,
    winner: null,
    log: ['White begins. Roll the sticks.'],
  };
}

export function rollDice(): number {
  // 4 binary tetrahedrons; count marked corners up
  let v = 0;
  for (let i = 0; i < 4; i++) v += Math.random() < 0.5 ? 1 : 0;
  return v;
}

function pathOf(p: UrPlayer) { return p === 'white' ? WHITE_PATH : BLACK_PATH; }

export interface UrMove {
  tokenIndex: number; // index in white[]/black[]
  fromPathIdx: number; // -1 if entering
  toPathIdx: number;   // 0..14 (14 = bear off)
}

export function legalMoves(state: UrState, roll: number): UrMove[] {
  if (roll === 0 || state.winner) return [];
  const me = state.turn === 'white' ? state.white : state.black;
  const them = state.turn === 'white' ? state.black : state.white;
  const myPath = pathOf(state.turn);
  const theirPath = pathOf(state.turn === 'white' ? 'black' : 'white');

  const occupiedByMe = new Set<string>();
  me.forEach((p) => { if (p >= 0 && p < 14) occupiedByMe.add(myPath[p]); });

  const moves: UrMove[] = [];
  for (let i = 0; i < me.length; i++) {
    const cur = me[i];
    if (cur === 14) continue; // already off
    const target = cur === -1 ? roll - 1 : cur + roll;
    if (target > 14) continue;
    if (target === 14) {
      // bear off — only with exact roll past index 13
      if (cur + roll === 14) moves.push({ tokenIndex: i, fromPathIdx: cur, toPathIdx: 14 });
      continue;
    }
    const sq = myPath[target];
    if (occupiedByMe.has(sq)) continue;
    // Central rosette s7 may hold only one piece, and is safe from capture
    if (sq === 's7') {
      // can't land on s7 if opponent already there
      const opponentOnCenter = them.some((p, idx) => p >= 0 && p < 14 && theirPath[p] === 's7');
      if (opponentOnCenter) continue;
    }
    moves.push({ tokenIndex: i, fromPathIdx: cur, toPathIdx: target });
  }
  return moves;
}

export function applyMove(state: UrState, move: UrMove): UrState {
  const next: UrState = {
    ...state,
    white: [...state.white],
    black: [...state.black],
    log: [...state.log],
  };
  const me = next.turn === 'white' ? next.white : next.black;
  const them = next.turn === 'white' ? next.black : next.white;
  const myPath = pathOf(next.turn);
  const theirPath = pathOf(next.turn === 'white' ? 'black' : 'white');

  me[move.tokenIndex] = move.toPathIdx;
  let captured = false;
  if (move.toPathIdx < 14) {
    const landSq = myPath[move.toPathIdx];
    // Capture if on shared range (not the safe central rosette)
    const sharedIdx = move.toPathIdx;
    if (sharedIdx >= SHARED_RANGE[0] && sharedIdx <= SHARED_RANGE[1] && landSq !== 's7') {
      for (let i = 0; i < them.length; i++) {
        const p = them[i];
        if (p >= 0 && p < 14 && theirPath[p] === landSq) {
          them[i] = -1;
          captured = true;
        }
      }
    }
  }

  // Win
  if (me.every((p) => p === 14)) {
    next.winner = next.turn;
    next.log.push(`${cap(next.turn)} bears off the last token — victory!`);
    return next;
  }

  // Extra turn on rosette
  const onRosette = move.toPathIdx < 14 && ROSETTES.has(move.toPathIdx);
  const moveDesc = describeMove(next.turn, move, captured, onRosette);
  next.log.push(moveDesc);

  if (!onRosette) next.turn = next.turn === 'white' ? 'black' : 'white';
  next.rolled = false;
  next.dice = -1;
  return next;
}

export function passTurn(state: UrState, reason = 'No legal move.'): UrState {
  if (state.winner) return state;
  return {
    ...state,
    turn: state.turn === 'white' ? 'black' : 'white',
    rolled: false,
    dice: -1,
    log: [...state.log, `${cap(state.turn)}: ${reason}`],
  };
}

function cap(p: UrPlayer) { return p === 'white' ? 'White' : 'Black'; }

function describeMove(p: UrPlayer, m: UrMove, captured: boolean, rosette: boolean) {
  const path = pathOf(p);
  const fromTxt = m.fromPathIdx === -1 ? 'entered' : `from ${path[m.fromPathIdx]}`;
  const toTxt = m.toPathIdx === 14 ? 'borne off' : `to ${path[m.toPathIdx]}`;
  const tags = [captured && '✦ capture', rosette && '✦ rosette · extra turn'].filter(Boolean).join(' ');
  return `${cap(p)} ${fromTxt} ${toTxt}. ${tags}`.trim();
}

// Simple AI: pick the move maximising expected value.
// Heuristic: prefer captures, then rosettes, then advance progress, prefer moving rearmost piece.
export function chooseAIMove(state: UrState, roll: number): UrMove | null {
  const moves = legalMoves(state, roll);
  if (moves.length === 0) return null;
  const me = state.turn === 'white' ? state.white : state.black;
  const them = state.turn === 'white' ? state.black : state.white;
  const myPath = pathOf(state.turn);
  const theirPath = pathOf(state.turn === 'white' ? 'black' : 'white');

  let best: UrMove | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    let score = 0;
    const landSq = m.toPathIdx < 14 ? myPath[m.toPathIdx] : null;
    if (m.toPathIdx === 14) score += 50;
    if (m.toPathIdx < 14 && ROSETTES.has(m.toPathIdx)) score += 25;
    if (landSq && m.toPathIdx >= SHARED_RANGE[0] && m.toPathIdx <= SHARED_RANGE[1] && landSq !== 's7') {
      const capCount = them.filter((p, i) => p >= 0 && p < 14 && theirPath[p] === landSq).length;
      score += capCount * 40;
    }
    score += m.toPathIdx; // progress
    if (m.fromPathIdx === -1) score += 5; // bring tokens into play
    if (Math.random() < 0.1) score += Math.random() * 5; // tie-break noise
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

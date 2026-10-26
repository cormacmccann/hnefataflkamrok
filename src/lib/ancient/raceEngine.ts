// Generic race-engine for ancient race-and-capture games:
// Senet, Patolli, Liubo, Mehen all reduce to:
//   - A linear path of N squares (index 0..N-1) per player (path may be shared per index)
//   - Each player has K tokens. Tokens start "off" (-1) or pre-seeded on path.
//   - A roll produces a non-negative integer.
//   - Move advances by exactly `roll` along the path; some squares trigger rules:
//       safe (no capture allowed here)
//       extraRoll (roll again)
//       sendBack (target index after landing)
//       exactToBearOff (only with exact total)
//   - Landing on enemy token at a non-safe square = capture (sent back to start, or to a "rebirth" square).
//   - Win = first player to bear off all tokens.

export type RacePlayer = 'white' | 'black';

export interface RaceSquare {
  safe?: boolean;
  extraRoll?: boolean;
  // If non-null, captured opponent landing here is sent to this index instead of -1.
  // If a friendly piece lands here, it might also trigger sendBack (e.g. Senet water).
  sendBackTo?: number;
  // True if both players cannot occupy this — landing here when occupied is forbidden.
  blocking?: boolean;
  label?: string;
}

export interface RaceConfig {
  id: string;
  name: string;
  pathLength: number;          // number of squares before bearing off
  tokensPerPlayer: number;
  squares: Partial<Record<number, RaceSquare>>;
  diceRoll: () => { value: number; faces: number[] }; // value 0..maxRoll
  exactBearOff: boolean;       // require exact roll to bear off
  extraTurnRolls?: number[];   // e.g. Senet rolls 1, 4 and 5
  // Optional initial token positions (path indices); default all at -1
  initialWhite?: number[];
  initialBlack?: number[];
  // Optional "rebirth" square index where captured tokens are sent (vs -1 start).
  rebirthIndex?: number;
  // Layout for 3D rendering: each square index maps to (x, z) on the board plane.
  layout: Array<{ x: number; z: number; index: number }>;
  // Optional special highlight squares list to color/render distinctly.
  specialIndices?: number[];
  rulesNote: string;
  // True when same path index = same physical square shared between players (e.g. Royal Ur middle row).
  // For these games we keep paths separate, so default false.
  sharedPath?: boolean;
}

export interface RaceState {
  cfg: RaceConfig;
  white: number[];
  black: number[];
  turn: RacePlayer;
  dice: number;
  diceFaces: number[];
  rolled: boolean;
  winner: RacePlayer | null;
  log: string[];
  extraTurn: boolean;
}

export function initialRaceState(cfg: RaceConfig): RaceState {
  return {
    cfg,
    white: cfg.initialWhite ? [...cfg.initialWhite] : Array(cfg.tokensPerPlayer).fill(-1),
    black: cfg.initialBlack ? [...cfg.initialBlack] : Array(cfg.tokensPerPlayer).fill(-1),
    turn: 'white',
    dice: -1,
    diceFaces: [],
    rolled: false,
    winner: null,
    log: [`${cfg.name}: White begins.`],
    extraTurn: false,
  };
}

export interface RaceMove {
  tokenIndex: number;
  from: number;
  to: number;        // pathLength = bear off
}

export function legalRaceMoves(state: RaceState, roll: number): RaceMove[] {
  if (!Number.isInteger(roll) || roll <= 0 || state.winner) return [];
  const me = state.turn === 'white' ? state.white : state.black;
  const them = state.turn === 'white' ? state.black : state.white;
  const myOccupied = new Set<number>();
  me.forEach((p) => { if (p >= 0 && p < state.cfg.pathLength) myOccupied.add(p); });

  const moves: RaceMove[] = [];
  for (let i = 0; i < me.length; i++) {
    const cur = me[i];
    if (cur === state.cfg.pathLength) continue;
    let target = cur === -1 ? roll - 1 : cur + roll;
    if (target > state.cfg.pathLength) {
      if (state.cfg.exactBearOff || cur === -1) continue;
      target = state.cfg.pathLength;
    }
    if (target === state.cfg.pathLength) {
      if (!state.cfg.exactBearOff || cur + roll === state.cfg.pathLength) {
        moves.push({ tokenIndex: i, from: cur, to: state.cfg.pathLength });
      }
      continue;
    }
    if (myOccupied.has(target)) continue;
    const sq = state.cfg.squares[target];
    // Blocked: opponent token on a safe square blocks landing
    const oppHere = them.some((p) => p === target);
    if (oppHere && sq?.safe) continue;
    moves.push({ tokenIndex: i, from: cur, to: target });
  }
  return moves;
}

export function applyRaceMove(state: RaceState, move: RaceMove): RaceState {
  if (!state.rolled || !legalRaceMoves(state, state.dice).some(m => m.tokenIndex === move.tokenIndex && m.from === move.from && m.to === move.to)) return state;
  const cfg = state.cfg;
  const next: RaceState = {
    ...state,
    white: [...state.white],
    black: [...state.black],
    log: [...state.log],
  };
  const me = next.turn === 'white' ? next.white : next.black;
  const them = next.turn === 'white' ? next.black : next.white;

  me[move.tokenIndex] = move.to;
  let captured = false;
  let sentBackNote = '';

  if (move.to < cfg.pathLength) {
    const sq = cfg.squares[move.to];
    // Capture
    if (!sq?.safe) {
      for (let i = 0; i < them.length; i++) {
        if (them[i] === move.to) {
          them[i] = cfg.rebirthIndex ?? -1;
          captured = true;
        }
      }
    }
    // sendBack triggers when landing here (affects mover)
    if (sq?.sendBackTo !== undefined && !captured) {
      const target = sq.sendBackTo;
      // Only send back if target square is empty for us
      if (!me.some((p, idx) => idx !== move.tokenIndex && p === target)) {
        me[move.tokenIndex] = target;
        sentBackNote = ` ↩ swept back to ${target + 1}`;
      }
    }
  }

  const tags: string[] = [];
  if (captured) tags.push('✦ capture');
  const extra = (move.to < cfg.pathLength && (cfg.squares[move.to]?.extraRoll ?? false)) || (cfg.extraTurnRolls?.includes(state.dice) ?? false);
  if (extra) tags.push('✦ extra roll');
  if (sentBackNote) tags.push(sentBackNote);

  next.log.push(
    `${cap(next.turn)} ${move.from === -1 ? 'entered' : `from ${move.from + 1}`} → ${move.to === cfg.pathLength ? 'borne off' : move.to + 1}${tags.length ? ' ' + tags.join(' ') : ''}`
  );

  if (me.every((p) => p === cfg.pathLength)) {
    next.winner = next.turn;
    next.log.push(`${cap(next.turn)} wins!`);
    return next;
  }

  next.extraTurn = extra;
  if (!extra) next.turn = next.turn === 'white' ? 'black' : 'white';
  next.rolled = false;
  next.dice = -1;
  next.diceFaces = [];
  return next;
}

export function passRaceTurn(state: RaceState, reason = 'no legal move'): RaceState {
  if (state.winner) return state;
  return {
    ...state,
    turn: state.turn === 'white' ? 'black' : 'white',
    rolled: false,
    dice: -1,
    diceFaces: [],
    extraTurn: false,
    log: [...state.log, `${cap(state.turn)}: ${reason}.`],
  };
}

function cap(p: RacePlayer) { return p === 'white' ? 'White' : 'Black'; }

// AI: greedy heuristic — captures > extra-roll > furthest progress > entry.
export function chooseAIRaceMove(state: RaceState, roll: number): RaceMove | null {
  const moves = legalRaceMoves(state, roll);
  if (moves.length === 0) return null;
  const cfg = state.cfg;
  const them = state.turn === 'white' ? state.black : state.white;
  let best = moves[0]; let bestScore = -Infinity;
  for (const m of moves) {
    let s = 0;
    if (m.to === cfg.pathLength) s += 80;
    else {
      const sq = cfg.squares[m.to];
      if (sq?.extraRoll) s += 30;
      if (sq?.safe) s += 8;
      if (them.includes(m.to) && !sq?.safe) s += 50;
      if (sq?.sendBackTo !== undefined) s -= 25;
    }
    s += m.to * 0.5;
    if (m.from === -1) s += 4;
    if (Math.random() < 0.08) s += Math.random() * 4;
    if (s > bestScore) { bestScore = s; best = m; }
  }
  return best;
}

// Generic 4-stick (binary) dice: count up-faces — 0..4
export function fourStickRoll(): { value: number; faces: number[] } {
  const faces = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 1 : 0));
  const sum = faces.reduce((a, b) => a + b, 0);
  // Senet convention: 0 ups = 5, otherwise the count.
  const value = sum === 0 ? 5 : sum;
  return { value, faces };
}

// 5-bean Patolli dice: 0..5 (5 marked beans, count marked-up faces; 0 = 10 in original; we use 0..5)
export function fiveBeanRoll(): { value: number; faces: number[] } {
  const faces = Array.from({ length: 5 }, () => (Math.random() < 0.5 ? 1 : 0));
  const value = faces.reduce((a, b) => a + b, 0);
  return { value: value === 0 ? 5 : value, faces };
}

// 6-stick Liubo dice: 0..6
export function sixStickRoll(): { value: number; faces: number[] } {
  const faces = Array.from({ length: 6 }, () => (Math.random() < 0.5 ? 1 : 0));
  const value = faces.reduce((a, b) => a + b, 0);
  return { value: value === 0 ? 6 : value, faces };
}

// Mehen — simplified modern interpretation of the ancient Egyptian coiled-snake game.
// Real rules are lost; this is a playable design inspired by Mehen's themes:
//  the soul's journey inward to Ra at the snake's head, then back outward to the tail,
//  with the lion as the dangerous capturing piece on the return journey.

export type PieceKind = 'pawn' | 'lion';
export type PieceStatus = 'off' | 'in' | 'out' | 'returned' | 'captured';

export interface Piece {
  id: string;
  player: number;
  kind: PieceKind;
  status: PieceStatus;
  pos: number;          // board index 0..N-1 when on board; outward pieces use outDist as well
  outDist: number;      // distance walked outward from the head (0 = at head)
}

export interface PlayerInfo {
  name: string;
  color: string;
  isAI: boolean;
  captures: number;
  finishedAt: number | null; // turn index when all pawns left the board
}

export interface MehenMove {
  pieceId: string;
  toPos: number;
  toOutDist: number;     // for outward pieces
  kind: 'enter' | 'inward' | 'arriveHead' | 'outward' | 'returnHome';
  captureId?: string;
  swapId?: string;
}

export interface MehenState {
  N: number;
  players: PlayerInfo[];
  pieces: Piece[];
  turn: number;
  dice: number;
  faces: number[];
  rolled: boolean;
  winner: number | null;
  endTie: number[] | null;
  log: string[];
  turnCount: number;
  lastMovedId: string | null;
}

export const MEHEN_PATH_LEN = 50;

export const MEHEN_PLAYER_COLORS = [
  '#D4A24C', // gold
  '#2D5B8C', // lapis
  '#A8392E', // faded red
  '#3F7A4F', // malachite
  '#E8DCC2', // ivory
  '#221912', // obsidian
];

export const MEHEN_PLAYER_NAMES = ['Ra', 'Thoth', 'Sekhmet', 'Anubis', 'Isis', 'Horus'];

export function castSticks(): { value: number; faces: number[] } {
  const faces = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 1 : 0));
  const ups = faces.reduce((a, b) => a + b, 0);
  return { value: ups === 0 ? 5 : ups, faces };
}

export function initialMehenState(slots: Array<{ isAI: boolean }>): MehenState {
  const players: PlayerInfo[] = slots.map((s, i) => ({
    name: MEHEN_PLAYER_NAMES[i] ?? `Player ${i + 1}`,
    color: MEHEN_PLAYER_COLORS[i],
    isAI: s.isAI,
    captures: 0,
    finishedAt: null,
  }));
  const pieces: Piece[] = [];
  players.forEach((_, p) => {
    for (let k = 0; k < 6; k++) {
      pieces.push({ id: `p${p}-pawn${k}`, player: p, kind: 'pawn', status: 'off', pos: -1, outDist: 0 });
    }
    pieces.push({ id: `p${p}-lion`, player: p, kind: 'lion', status: 'off', pos: -1, outDist: 0 });
  });
  return {
    N: MEHEN_PATH_LEN,
    players,
    pieces,
    turn: 0,
    dice: -1,
    faces: [],
    rolled: false,
    winner: null,
    endTie: null,
    log: [`${players[0].name}'s soul prepares to enter the coils of Mehen.`],
    turnCount: 0,
    lastMovedId: null,
  };
}

function playerActive(state: MehenState, pi: number): boolean {
  // active = still has any piece that isn't returned/captured
  return state.pieces.some(
    (p) => p.player === pi && p.kind === 'pawn' && p.status !== 'returned' && p.status !== 'captured'
  );
}

function lionUnlocked(state: MehenState, pi: number): boolean {
  // unlocked when all 6 pawns have reached the head (status 'in' && pos===N-1) or are already 'out'/'returned'/'captured'.
  return state.pieces
    .filter((p) => p.player === pi && p.kind === 'pawn')
    .every((p) => p.status !== 'off' && !(p.status === 'in' && p.pos < state.N - 1));
}

function pieceAtBoardPos(state: MehenState, pos: number, excludeId?: string): Piece | null {
  return state.pieces.find(
    (p) => p.id !== excludeId && (p.status === 'in' || p.status === 'out') && p.pos === pos
  ) ?? null;
}

export function legalMehenMoves(state: MehenState, roll: number): MehenMove[] {
  if (roll <= 0 || state.winner !== null) return [];
  const me = state.turn;
  const N = state.N;
  const moves: MehenMove[] = [];
  const unlocked = lionUnlocked(state, me);
  const headPos = N - 1;

  for (const p of state.pieces) {
    if (p.player !== me) continue;
    if (p.status === 'returned' || p.status === 'captured') continue;

    // Lion only moves once unlocked and during outward phase
    if (p.kind === 'lion') {
      if (!unlocked) continue;
      // Activate lion onto head if still off
      if (p.status === 'off') {
        // lion enters at head, then immediately moves outward by 2*roll
        const step = 2 * roll;
        const newOut = step;
        if (newOut >= N) {
          moves.push({ pieceId: p.id, toPos: -1, toOutDist: N, kind: 'returnHome' });
        } else {
          const targetPos = headPos - newOut;
          const blocker = pieceAtBoardPos(state, targetPos);
          if (blocker && blocker.player === me) continue;
          if (blocker) {
            // lion on opp pawn = capture; lion on opp lion = swap
            moves.push({
              pieceId: p.id, toPos: targetPos, toOutDist: newOut, kind: 'outward',
              ...(blocker.kind === 'pawn' ? { captureId: blocker.id } : { swapId: blocker.id }),
            });
          } else {
            moves.push({ pieceId: p.id, toPos: targetPos, toOutDist: newOut, kind: 'outward' });
          }
        }
        continue;
      }
      if (p.status === 'out') {
        const step = 2 * roll;
        const newOut = p.outDist + step;
        if (newOut >= N) {
          moves.push({ pieceId: p.id, toPos: -1, toOutDist: N, kind: 'returnHome' });
        } else {
          const targetPos = headPos - newOut;
          const blocker = pieceAtBoardPos(state, targetPos, p.id);
          if (blocker && blocker.player === me) continue;
          if (blocker) {
            moves.push({
              pieceId: p.id, toPos: targetPos, toOutDist: newOut, kind: 'outward',
              ...(blocker.kind === 'pawn' ? { captureId: blocker.id } : { swapId: blocker.id }),
            });
          } else {
            moves.push({ pieceId: p.id, toPos: targetPos, toOutDist: newOut, kind: 'outward' });
          }
        }
      }
      continue;
    }

    // Pawn moves
    if (p.status === 'off') {
      // enter the board at pos = roll - 1
      const target = roll - 1;
      if (target >= headPos) continue; // can't enter directly to head
      const blocker = pieceAtBoardPos(state, target);
      if (blocker && blocker.player === me) continue;
      moves.push({
        pieceId: p.id, toPos: target, toOutDist: 0, kind: 'enter',
        ...(blocker ? { swapId: blocker.id } : {}),
      });
      continue;
    }

    if (p.status === 'in') {
      // pawn at head waits for lion unlock; it can't move inward anymore
      if (p.pos === headPos) continue;
      const target = p.pos + roll;
      if (target > headPos) continue; // exact required to land on head
      if (target === headPos) {
        // any number of pawns may rest at the head
        moves.push({ pieceId: p.id, toPos: headPos, toOutDist: 0, kind: 'arriveHead' });
        continue;
      }
      const blocker = pieceAtBoardPos(state, target, p.id);
      if (blocker && blocker.player === me) continue;
      moves.push({
        pieceId: p.id, toPos: target, toOutDist: 0, kind: 'inward',
        ...(blocker ? { swapId: blocker.id } : {}),
      });
      continue;
    }

    if (p.status === 'out') {
      const newOut = p.outDist + roll;
      if (newOut >= N) {
        moves.push({ pieceId: p.id, toPos: -1, toOutDist: N, kind: 'returnHome' });
      } else {
        const targetPos = headPos - newOut;
        const blocker = pieceAtBoardPos(state, targetPos, p.id);
        if (blocker && blocker.player === me) continue;
        // pawns cannot capture; pawn-on-pawn or pawn-on-lion = swap
        moves.push({
          pieceId: p.id, toPos: targetPos, toOutDist: newOut, kind: 'outward',
          ...(blocker ? { swapId: blocker.id } : {}),
        });
      }
    }
  }
  return moves;
}

export function applyMehenMove(state: MehenState, move: MehenMove): MehenState {
  const valid = state.rolled && legalMehenMoves(state, state.dice).some(m => m.pieceId === move.pieceId && m.toPos === move.toPos && m.toOutDist === move.toOutDist && m.kind === move.kind && m.captureId === move.captureId && m.swapId === move.swapId);
  if (!valid) return state;
  const next: MehenState = {
    ...state,
    players: state.players.map((p) => ({ ...p })),
    pieces: state.pieces.map((p) => ({ ...p })),
    log: [...state.log],
  };
  const N = next.N;
  const headPos = N - 1;
  const piece = next.pieces.find((p) => p.id === move.pieceId)!;
  const playerName = next.players[piece.player].name;
  const oldPos = piece.pos;
  const oldStatus = piece.status;

  // Resolve capture first
  if (move.captureId) {
    const victim = next.pieces.find((p) => p.id === move.captureId)!;
    victim.status = 'captured'; victim.pos = -1; victim.outDist = 0;
    next.players[piece.player].captures += 1;
    next.log.push(`${playerName}'s lion devours ${next.players[victim.player].name}'s pawn!`);
  }

  // Resolve swap: opponent piece on target slides back to mover's previous board square.
  if (move.swapId) {
    const other = next.pieces.find((p) => p.id === move.swapId)!;
    const fallbackPos = oldStatus === 'off' ? headPos : oldPos;
    other.pos = fallbackPos;
    if (other.status === 'out') {
      other.outDist = Math.max(0, headPos - fallbackPos);
    }
    next.log.push(`Pieces swap places in the coils of Mehen.`);
  }

  // Apply the move
  if (move.kind === 'enter') {
    piece.status = 'in';
    piece.pos = move.toPos;
    piece.outDist = 0;
    next.log.push(`${playerName}: a soul enters the coils.`);
  } else if (move.kind === 'inward') {
    piece.pos = move.toPos;
  } else if (move.kind === 'arriveHead') {
    piece.pos = headPos;
    next.log.push(`${playerName}: a soul reaches the head of Mehen — Ra is close.`);
    if (lionUnlocked(next, piece.player)) {
      next.pieces.forEach((p) => {
        if (p.player === piece.player && p.kind === 'pawn' && p.status === 'in') {
          p.status = 'out'; p.outDist = 0; p.pos = headPos;
        }
      });
      const lion = next.pieces.find((p) => p.id === `p${piece.player}-lion`)!;
      if (lion.status === 'off') {
        lion.status = 'out'; lion.pos = headPos; lion.outDist = 0;
        next.log.push(`${playerName}: the lion awakens! The return journey begins.`);
      }
    }
  } else if (move.kind === 'outward') {
    if (piece.status === 'off') piece.status = 'out';
    piece.pos = move.toPos;
    piece.outDist = move.toOutDist;
  } else if (move.kind === 'returnHome') {
    piece.status = 'returned';
    piece.pos = -1;
    piece.outDist = N;
    next.log.push(`${playerName}: ${piece.kind === 'lion' ? 'the lion' : 'a soul'} returns safely to the world.`);
  }

  next.lastMovedId = piece.id;

  // Mark finished players
  next.players.forEach((pl, pi) => {
    if (pl.finishedAt === null && !playerActive(next, pi)) {
      pl.finishedAt = next.turnCount;
    }
  });

  // End check
  const allDone = next.players.every((pl) => pl.finishedAt !== null);
  if (allDone) {
    const maxCap = Math.max(...next.players.map((p) => p.captures));
    const topPlayers = next.players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.captures === maxCap);
    if (topPlayers.length === 1) {
      next.winner = topPlayers[0].i;
    } else {
      // tiebreaker: earliest finishedAt
      topPlayers.sort((a, b) => (a.p.finishedAt ?? 1e9) - (b.p.finishedAt ?? 1e9));
      next.winner = topPlayers[0].i;
      next.endTie = topPlayers.map((t) => t.i);
    }
    next.log.push(`The journey ends. ${next.players[next.winner].name} triumphs!`);
  }

  // Pass turn
  next.rolled = false;
  next.dice = -1;
  next.faces = [];
  next.turnCount += 1;
  if (next.winner === null) {
    let t = next.turn;
    for (let i = 0; i < next.players.length; i++) {
      t = (t + 1) % next.players.length;
      if (playerActive(next, t)) { next.turn = t; break; }
    }
  }
  return next;
}

export function passMehenTurn(state: MehenState, reason: string): MehenState {
  const next: MehenState = {
    ...state,
    log: [...state.log, `${state.players[state.turn].name}: ${reason}.`],
  };
  next.rolled = false;
  next.dice = -1;
  next.faces = [];
  next.turnCount += 1;
  let t = next.turn;
  for (let i = 0; i < next.players.length; i++) {
    t = (t + 1) % next.players.length;
    if (playerActive(next, t)) { next.turn = t; break; }
  }
  return next;
}

// Simple AI: prioritise captures > arriving at head > returning home > furthest progress.
export function chooseAIMehenMove(state: MehenState, roll: number): MehenMove | null {
  const moves = legalMehenMoves(state, roll);
  if (moves.length === 0) return null;
  let best = moves[0]; let bestScore = -Infinity;
  for (const m of moves) {
    let s = 0;
    if (m.captureId) s += 100;
    if (m.kind === 'returnHome') s += 40;
    if (m.kind === 'arriveHead') s += 30;
    const piece = state.pieces.find((p) => p.id === m.pieceId)!;
    if (m.kind === 'inward') s += m.toPos * 0.5;
    if (m.kind === 'outward') s += m.toOutDist * 0.7;
    if (m.kind === 'enter') s += 5;
    if (piece.kind === 'lion') s += 8;
    s += Math.random() * 2;
    if (s > bestScore) { bestScore = s; best = m; }
  }
  return best;
}

// Layout: Archimedean spiral from outer tail (i=0) to head (i=N-1) at centre.
export function mehenSpiralLayout(N: number, cx: number, cy: number, rOuter: number, rInner: number, turns = 3.2) {
  return Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const angle = -Math.PI / 2 + t * turns * Math.PI * 2;
    const r = rOuter - (rOuter - rInner) * Math.pow(t, 0.92);
    return { i, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, angle, r };
  });
}

// Ludus Latrunculorum — Roman "game of mercenaries"
// 8×8 grid; each side has 11 soldiers + 1 dux (commander) starting on back two rows.
// Soldiers move/capture like Petteia (orthogonal rook moves, custodial sandwich).
// The Dux additionally may LEAP over a friendly piece (one square) to an empty square,
// per the most widely-cited reconstruction (Bell, Schädler).
// Win: capture/immobilise opponent OR trap their Dux so it has no move.

export type LatPlayer = 'white' | 'black';
export interface LatPos { row: number; col: number }
export interface LatPiece { id: number; owner: LatPlayer; pos: LatPos; dux: boolean }

export interface LatState {
  pieces: LatPiece[];
  turn: LatPlayer;
  selected: number | null;
  winner: LatPlayer | null;
  log: string[];
}

export const BOARD_SIZE = 8;

export function initialLatState(): LatState {
  const pieces: LatPiece[] = [];
  let id = 0;
  // White on rows 6,7. Black on rows 0,1. Dux at row 7 col 4 / row 0 col 3.
  for (let c = 0; c < BOARD_SIZE; c++) pieces.push({ id: id++, owner: 'white', pos: { row: 6, col: c }, dux: false });
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (c === 4) pieces.push({ id: id++, owner: 'white', pos: { row: 7, col: c }, dux: true });
    else if (c < 4 || c > 4) pieces.push({ id: id++, owner: 'white', pos: { row: 7, col: c }, dux: false });
  }
  for (let c = 0; c < BOARD_SIZE; c++) pieces.push({ id: id++, owner: 'black', pos: { row: 1, col: c }, dux: false });
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (c === 3) pieces.push({ id: id++, owner: 'black', pos: { row: 0, col: c }, dux: true });
    else pieces.push({ id: id++, owner: 'black', pos: { row: 0, col: c }, dux: false });
  }
  return { pieces, turn: 'white', selected: null, winner: null, log: ['White legion advances.'] };
}

function pieceAt(state: LatState, row: number, col: number): LatPiece | null {
  return state.pieces.find((p) => p.pos.row === row && p.pos.col === col) ?? null;
}

export function legalMovesFor(state: LatState, pieceId: number): LatPos[] {
  const p = state.pieces.find((x) => x.id === pieceId);
  if (!p) return [];
  const out: LatPos[] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    let r = p.pos.row + dr, c = p.pos.col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      const occ = pieceAt(state, r, c);
      if (occ) {
        // Dux leap: jump exactly one friendly piece into the empty square beyond.
        if (p.dux && occ.owner === p.owner) {
          const lr = r + dr, lc = c + dc;
          if (lr >= 0 && lr < BOARD_SIZE && lc >= 0 && lc < BOARD_SIZE && !pieceAt(state, lr, lc)) {
            out.push({ row: lr, col: lc });
          }
        }
        break;
      }
      out.push({ row: r, col: c });
      r += dr; c += dc;
    }
  }
  return out;
}

export function allLegalMoves(state: LatState, who: LatPlayer): { piece: LatPiece; to: LatPos }[] {
  const moves: { piece: LatPiece; to: LatPos }[] = [];
  state.pieces.filter((p) => p.owner === who).forEach((piece) => {
    legalMovesFor(state, piece.id).forEach((to) => moves.push({ piece, to }));
  });
  return moves;
}

export function applyLatMove(state: LatState, pieceId: number, to: LatPos): LatState {
  const piece = state.pieces.find((x) => x.id === pieceId);
  if (!piece || state.winner || piece.owner !== state.turn || !legalMovesFor(state, pieceId).some(p => p.row === to.row && p.col === to.col)) return state;
  const moved: LatPiece = { ...piece, pos: { ...to } };
  let pieces = state.pieces.map((p) => (p.id === pieceId ? moved : p));

  // Custodial capture
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const captured: LatPiece[] = [];
  for (const [dr, dc] of dirs) {
    const adj = pieces.find((p) => p.pos.row === to.row + dr && p.pos.col === to.col + dc);
    if (!adj || adj.owner === moved.owner) continue;
    const beyondR = to.row + 2 * dr, beyondC = to.col + 2 * dc;
    if (beyondR < 0 || beyondR >= BOARD_SIZE || beyondC < 0 || beyondC >= BOARD_SIZE) continue;
    const beyond = pieces.find((p) => p.pos.row === beyondR && p.pos.col === beyondC);
    // Dux requires TWO attackers to capture
    if (beyond && beyond.owner === moved.owner) {
      if (adj.dux) {
        // need attacker also on perpendicular side
        const perpDirs = dr === 0 ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
        const flanker = perpDirs.some(([pdr, pdc]) => {
          const f = pieces.find((p) => p.pos.row === adj.pos.row + pdr && p.pos.col === adj.pos.col + pdc);
          return f && f.owner === moved.owner;
        });
        if (flanker) captured.push(adj);
      } else captured.push(adj);
    }
  }
  if (captured.length) pieces = pieces.filter((p) => !captured.some((c) => c.id === p.id));

  const log = [...state.log, `${cap(moved.owner)}${moved.dux ? ' (Dux)' : ''} → ${alg(to)}${captured.length ? ` ✦ ${captured.length} captured` : ''}`];

  const nextTurn: LatPlayer = moved.owner === 'white' ? 'black' : 'white';
  let winner: LatPlayer | null = null;
  const oppPieces = pieces.filter((p) => p.owner === nextTurn);
  const oppDux = oppPieces.find((p) => p.dux);
  if (!oppDux) winner = moved.owner;
  else if (oppPieces.length <= 1) winner = moved.owner;
  else {
    const opp = allLegalMoves({ ...state, pieces, turn: nextTurn, selected: null, winner: null, log }, nextTurn);
    if (opp.length === 0) winner = moved.owner;
  }
  if (winner) log.push(`${cap(winner)} wins — ${!oppDux ? 'enemy Dux fallen!' : oppPieces.length <= 1 ? 'legion routed' : 'opponent immobilised'}.`);

  return { pieces, turn: nextTurn, selected: null, winner, log };
}

function cap(p: LatPlayer) { return p === 'white' ? 'Rome' : 'Foe'; }
function alg(p: LatPos) { return `${String.fromCharCode(97 + p.col)}${BOARD_SIZE - p.row}`; }

export function chooseAILatMove(state: LatState): { piece: LatPiece; to: LatPos } | null {
  const moves = allLegalMoves(state, state.turn);
  if (!moves.length) return null;
  let best = moves[0]; let bestScore = -Infinity;
  for (const m of moves) {
    const after = applyLatMove(state, m.piece.id, m.to);
    const myCount = after.pieces.filter((p) => p.owner === state.turn).length;
    const oppCount = after.pieces.filter((p) => p.owner !== state.turn).length;
    const myDux = after.pieces.find((p) => p.owner === state.turn && p.dux);
    const oppDux = after.pieces.find((p) => p.owner !== state.turn && p.dux);
    let score = (myCount - oppCount) * 10;
    if (!oppDux) score += 5000;
    if (!myDux) score -= 5000;
    if (m.piece.dux) score -= 2; // protect dux: discourage leading with it
    if (after.winner === state.turn) score += 1000;
    if (after.winner && after.winner !== state.turn) score -= 1000;
    score += allLegalMoves(after, state.turn).length * 0.3;
    score -= allLegalMoves(after, after.turn).length * 0.3;
    if (Math.random() < 0.05) score += Math.random() * 2;
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

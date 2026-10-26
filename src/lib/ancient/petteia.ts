// Petteia (Πεττεία) — ancient Greek "pebbles"
// 8×8 board, two equal armies of 8 pieces lined up on the back rows.
// Custodial capture (sandwich along row or column).
// Win by capturing all opposing pieces OR immobilising opponent (no legal moves).
// Sources: Plato (Republic 487b), Polybius, Pollux's Onomasticon. Exact rules are partly
// reconstructed — this implementation follows Kurke (1999) and Schädler's modern consensus.

export type PettPlayer = 'white' | 'black';
export interface PettPos { row: number; col: number }
export interface PettPiece { id: number; owner: PettPlayer; pos: PettPos }

export interface PettState {
  pieces: PettPiece[];
  turn: PettPlayer;
  selected: number | null;
  winner: PettPlayer | null;
  log: string[];
}

export const BOARD_SIZE = 8;

export function initialPettState(): PettState {
  const pieces: PettPiece[] = [];
  let id = 0;
  for (let c = 0; c < BOARD_SIZE; c++) pieces.push({ id: id++, owner: 'white', pos: { row: 7, col: c } });
  for (let c = 0; c < BOARD_SIZE; c++) pieces.push({ id: id++, owner: 'black', pos: { row: 0, col: c } });
  return { pieces, turn: 'white', selected: null, winner: null, log: ['White begins.'] };
}

function pieceAt(state: PettState, row: number, col: number): PettPiece | null {
  return state.pieces.find((p) => p.pos.row === row && p.pos.col === col) ?? null;
}

export function legalMovesFor(state: PettState, pieceId: number): PettPos[] {
  const p = state.pieces.find((x) => x.id === pieceId);
  if (!p) return [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const out: PettPos[] = [];
  for (const [dr, dc] of dirs) {
    let r = p.pos.row + dr, c = p.pos.col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (pieceAt(state, r, c)) break;
      out.push({ row: r, col: c });
      r += dr; c += dc;
    }
  }
  return out;
}

export function allLegalMoves(state: PettState, who: PettPlayer): { piece: PettPiece; to: PettPos }[] {
  const moves: { piece: PettPiece; to: PettPos }[] = [];
  state.pieces.filter((p) => p.owner === who).forEach((piece) => {
    legalMovesFor(state, piece.id).forEach((to) => moves.push({ piece, to }));
  });
  return moves;
}

export function applyPettMove(state: PettState, pieceId: number, to: PettPos): PettState {
  const piece = state.pieces.find((x) => x.id === pieceId);
  if (!piece || state.winner || piece.owner !== state.turn || !legalMovesFor(state, pieceId).some(p => p.row === to.row && p.col === to.col)) return state;
  const moved: PettPiece = { ...piece, pos: { ...to } };
  let pieces = state.pieces.map((p) => (p.id === pieceId ? moved : p));

  // Custodial capture: for each orthogonal direction, if adjacent enemy is sandwiched by friend, capture it.
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const captured: PettPiece[] = [];
  for (const [dr, dc] of dirs) {
    const adj = pieces.find((p) => p.pos.row === to.row + dr && p.pos.col === to.col + dc);
    if (!adj || adj.owner === moved.owner) continue;
    const beyondR = to.row + 2 * dr, beyondC = to.col + 2 * dc;
    if (beyondR < 0 || beyondR >= BOARD_SIZE || beyondC < 0 || beyondC >= BOARD_SIZE) continue;
    const beyond = pieces.find((p) => p.pos.row === beyondR && p.pos.col === beyondC);
    if (beyond && beyond.owner === moved.owner) captured.push(adj);
  }
  if (captured.length) pieces = pieces.filter((p) => !captured.some((c) => c.id === p.id));

  const log = [...state.log, `${cap(moved.owner)} ${alg(piece.pos)}→${alg(to)}${captured.length ? ` ✦ captured ${captured.length}` : ''}`];

  const nextTurn: PettPlayer = moved.owner === 'white' ? 'black' : 'white';
  let winner: PettPlayer | null = null;
  // Win conditions
  const oppHasPieces = pieces.some((p) => p.owner === nextTurn);
  if (!oppHasPieces) winner = moved.owner;
  else {
    const opp = allLegalMoves({ ...state, pieces, turn: nextTurn, selected: null, winner: null, log }, nextTurn);
    if (opp.length === 0) winner = moved.owner;
  }
  if (winner) log.push(`${cap(winner)} wins — opponent ${oppHasPieces ? 'immobilised' : 'eliminated'}.`);

  return { pieces, turn: nextTurn, selected: null, winner, log };
}

function cap(p: PettPlayer) { return p === 'white' ? 'White' : 'Black'; }
function alg(p: PettPos) { return `${String.fromCharCode(97 + p.col)}${BOARD_SIZE - p.row}`; }

// AI: greedy with 1-ply lookahead.
// Score = (my pieces - opp pieces) * 10 + my mobility - opp mobility.
export function chooseAIPettMove(state: PettState): { piece: PettPiece; to: PettPos } | null {
  const moves = allLegalMoves(state, state.turn);
  if (!moves.length) return null;
  let best = moves[0]; let bestScore = -Infinity;
  for (const m of moves) {
    const after = applyPettMove(state, m.piece.id, m.to);
    const myCount = after.pieces.filter((p) => p.owner === state.turn).length;
    const oppCount = after.pieces.filter((p) => p.owner !== state.turn).length;
    let score = (myCount - oppCount) * 10;
    if (after.winner === state.turn) score += 1000;
    if (after.winner && after.winner !== state.turn) score -= 1000;
    score += allLegalMoves(after, state.turn).length * 0.3;
    score -= allLegalMoves(after, after.turn).length * 0.3;
    if (Math.random() < 0.05) score += Math.random() * 2;
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

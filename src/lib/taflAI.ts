import type { Piece, Position, Player, BoardSize, AIDifficulty, VariantRules } from '@/types/game';
import { createTaflLogic, ownerOf } from './taflEngine';

interface AIMove { piece: Piece; to: Position; score: number }
const SETTINGS = {
  beginner: { depth: 1, noise: 70, root: 8, beam: 6, ms: 60 },
  easy: { depth: 1, noise: 30, root: 12, beam: 6, ms: 80 },
  medium: { depth: 2, noise: 4, root: 18, beam: 12, ms: 150 },
  valhalla: { depth: 3, noise: 0, root: 24, beam: 14, ms: 240 },
};

/** A bounded search: even the 19×19 board cannot lock the UI in an unbounded depth-four search. */
export function createTaflAI(boardSize: BoardSize, difficulty: AIDifficulty = 'medium', rules?: VariantRules, variantId?: string) {
  const logic = createTaflLogic(boardSize, rules, variantId);
  const settings = SETTINGS[difficulty];
  const opponent = (side: Player): Player => side === 'attacker' ? 'defender' : 'attacker';
  const simulate = (pieces: Piece[], piece: Piece, to: Position) => {
    const captured = logic.getCapturedPieces(piece, to, pieces);
    return pieces.map(p => p.id === piece.id ? { ...p, position: to } : p).filter(p => !captured.some(c => c.id === p.id));
  };
  const terminal = (pieces: Piece[], side: Player): number | null => {
    const king = pieces.find(p => p.type === 'king');
    if (!king) return side === 'attacker' ? 100000 : -100000;
    if (logic.isEscape(king.position)) return side === 'defender' ? 100000 : -100000;
    return null;
  };
  const evaluate = (pieces: Piece[], side: Player): number => {
    const ended = terminal(pieces, side);
    if (ended !== null) return ended;
    const king = pieces.find(p => p.type === 'king')!;
    const attackerLosses = logic.config.initialAttackers.length - pieces.filter(p => p.type === 'attacker').length;
    const defenderLosses = logic.config.initialDefenders.length - pieces.filter(p => p.type === 'defender').length;
    let defenderScore = attackerLosses * 30 - defenderLosses * 45;
    const escapeDistance = logic.rules.edgeEscape
      ? Math.min(king.position.row, king.position.col, boardSize - 1 - king.position.row, boardSize - 1 - king.position.col)
      : Math.min(...logic.config.corners.map(c => Math.abs(king.position.row - c.row) + Math.abs(king.position.col - c.col)));
    defenderScore += (boardSize - escapeDistance) * 12;
    const kingMoves = logic.getValidMoves(king, pieces);
    defenderScore += kingMoves.length * 2;
    if (kingMoves.some(logic.isEscape)) defenderScore += 650;
    for (const p of pieces) {
      if (p.type !== 'attacker') continue;
      const distance = Math.abs(p.position.row - king.position.row) + Math.abs(p.position.col - king.position.col);
      if (distance === 1) defenderScore -= 45;
      else if (distance === 2) defenderScore -= 7;
    }
    return side === 'defender' ? defenderScore : -defenderScore;
  };

  const getBestMove = (pieces: Piece[], aiSide: Player): AIMove | null => {
    if (terminal(pieces, aiSide) !== null) return null;
    const deadline = Date.now() + settings.ms;
    const candidates = (position: Piece[], side: Player) => {
      const moves: Array<AIMove & { after: Piece[] }> = [];
      for (const piece of position) {
        if (ownerOf(piece) !== side) continue;
        for (const to of logic.getValidMoves(piece, position)) {
          const after = simulate(position, piece, to);
          moves.push({ piece, to, after, score: evaluate(after, aiSide) });
        }
      }
      return moves;
    };
    const search = (position: Piece[], side: Player, depth: number, alpha: number, beta: number): number => {
      const ended = terminal(position, aiSide);
      if (ended !== null) return ended;
      if (!depth || Date.now() >= deadline) return evaluate(position, aiSide);
      const maximizing = side === aiSide;
      const moves = candidates(position, side).sort((a, b) => maximizing ? b.score - a.score : a.score - b.score);
      if (!moves.length) return maximizing ? -100000 : 100000;
      let value = maximizing ? -Infinity : Infinity;
      for (const move of moves.slice(0, settings.beam)) {
        const score = search(move.after, opponent(side), depth - 1, alpha, beta);
        value = maximizing ? Math.max(value, score) : Math.min(value, score);
        if (maximizing) alpha = Math.max(alpha, value); else beta = Math.min(beta, value);
        if (beta <= alpha || Date.now() >= deadline) break;
      }
      return value;
    };
    const moves = candidates(pieces, aiSide).sort((a, b) => b.score - a.score);
    if (!moves.length) return null;
    // Every difficulty takes a visible immediate win before applying personality/noise.
    const winningMove = moves.find(m => terminal(m.after, aiSide) === 100000);
    if (winningMove) return { piece: winningMove.piece, to: winningMove.to, score: winningMove.score };
    let best = moves[0];
    let bestScore = -Infinity;
    for (const move of moves.slice(0, settings.root)) {
      if (bestScore !== -Infinity && Date.now() >= deadline) break;
      const score = search(move.after, opponent(aiSide), settings.depth - 1, -Infinity, Infinity) + (Math.random() - 0.5) * settings.noise;
      if (score > bestScore) { bestScore = score; best = move; }
    }
    return { piece: best.piece, to: best.to, score: bestScore };
  };
  return { getBestMove };
}

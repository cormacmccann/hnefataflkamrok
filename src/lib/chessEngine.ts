import { Chess, type Move } from 'chess.js';
import type { ChessColor, ChessDifficulty, ChessMoveInput, ChessPromotion, ChessSnapshot, ChessSquare, PromotionPiece } from '@/types/chess';

export const CHESS_PROMOTIONS: readonly PromotionPiece[] = ['q', 'r', 'b', 'n'];
const otherColor = (color: ChessColor): ChessColor => color === 'w' ? 'b' : 'w';
const validSquare = (value: string): value is ChessSquare => /^[a-h][1-8]$/.test(value);
const moveInput = (move: Move): ChessMoveInput => ({ from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion as PromotionPiece } : {}) });

/** Keeps the complete chess.js history, so changing a renderer cannot lose castling,
 * en-passant eligibility, repetition counts, half-move clocks or pending promotion. */
export class ChessSession {
  private game: Chess;
  private selected: ChessSquare | null = null;
  private pendingPromotion: ChessPromotion | null = null;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
    this.game.setHeader('Event', 'TAFL Chess');
  }

  snapshot(): ChessSnapshot {
    const mate = this.game.isCheckmate();
    const stalemate = !mate && this.game.isStalemate();
    const drawReason = this.game.isThreefoldRepetition() ? 'threefold-repetition' : this.game.isDrawByFiftyMoves() ? 'fifty-move' : this.game.isInsufficientMaterial() ? 'insufficient-material' : null;
    const status = mate ? 'checkmate' : stalemate ? 'stalemate' : drawReason ? 'draw' : 'playing';
    const verboseHistory = this.game.history({ verbose: true });
    const last = verboseHistory[verboseHistory.length - 1];
    return {
      board: this.game.board().flat().filter(piece => piece !== null).map(piece => ({ square: piece.square, type: piece.type, color: piece.color })),
      fen: this.game.fen(), turn: this.game.turn(), selectedSquare: this.selected,
      legalMoves: this.selected && status === 'playing' ? [...new Set(this.game.moves({ square: this.selected, verbose: true }).map(move => move.to))] : [],
      history: this.game.history(), lastMove: last ? { from: last.from, to: last.to, san: last.san } : null,
      check: this.game.isCheck(), status, winner: mate ? otherColor(this.game.turn()) : null,
      drawReason: status === 'draw' ? drawReason : null,
      promotion: this.pendingPromotion ? { ...this.pendingPromotion } : null,
      moveNumber: this.game.moveNumber(),
    };
  }

  selectSquare(square: ChessSquare): void {
    if (!validSquare(square) || this.game.isGameOver() || this.pendingPromotion) return;
    if (this.selected && this.selected !== square) {
      const attempt = this.move(this.selected, square);
      if (attempt !== 'invalid') return;
    }
    const piece = this.game.get(square);
    this.selected = piece?.color === this.game.turn() && this.selected !== square ? square : null;
  }

  move(from: ChessSquare, to: ChessSquare, promotion?: PromotionPiece): 'moved' | 'promotion' | 'invalid' {
    if (!validSquare(from) || !validSquare(to) || this.game.isGameOver()) return 'invalid';
    const possibilities = this.game.moves({ square: from, verbose: true }).filter(move => move.to === to);
    if (!possibilities.length) return 'invalid';
    if (possibilities.some(move => !!move.promotion) && !promotion) {
      this.pendingPromotion = { from, to, color: this.game.turn() };
      this.selected = from;
      return 'promotion';
    }
    const legal = possibilities.find(move => move.promotion === promotion);
    if (!legal) return 'invalid';
    this.game.move(moveInput(legal));
    this.selected = null;
    this.pendingPromotion = null;
    return 'moved';
  }

  choosePromotion(piece: PromotionPiece): boolean {
    if (!this.pendingPromotion || !CHESS_PROMOTIONS.includes(piece)) return false;
    const { from, to } = this.pendingPromotion;
    return this.move(from, to, piece) === 'moved';
  }

  cancelPromotion(): void { this.pendingPromotion = null; this.selected = null; }
  undo(plies = 1): void {
    this.cancelPromotion();
    for (let i = 0; i < plies; i++) if (!this.game.undo()) break;
  }
  newGame(): void { this.game = new Chess(); this.game.setHeader('Event', 'TAFL Chess'); this.cancelPromotion(); }
  computerMove(difficulty: ChessDifficulty): boolean {
    if (this.pendingPromotion || this.game.isGameOver()) return false;
    const move = chooseChessAIMove(this.game, difficulty);
    return !!move && this.move(move.from, move.to, move.promotion) === 'moved';
  }
  exportPGN(): string {
    const state = this.snapshot();
    const result = state.status === 'playing' ? '*' : state.winner === 'w' ? '1-0' : state.winner === 'b' ? '0-1' : '1/2-1/2';
    this.game.setHeader('Result', result);
    return this.game.pgn({ maxWidth: 80 });
  }
}

const VALUES = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const LEVELS = { easy: { depth: 1, ms: 60, root: 16, beam: 12, noise: 65 }, medium: { depth: 2, ms: 150, root: 20, beam: 14, noise: 5 }, hard: { depth: 3, ms: 260, root: 24, beam: 18, noise: 0 } };

function evaluateChess(game: Chess, perspective: ChessColor): number {
  let value = 0;
  for (const piece of game.board().flat()) {
    if (!piece) continue;
    const file = piece.square.charCodeAt(0) - 97;
    const rank = Number(piece.square[1]) - 1;
    const advance = piece.color === 'w' ? rank : 7 - rank;
    const centrality = 3.5 - Math.abs(3.5 - file) + 3.5 - Math.abs(3.5 - rank);
    let positional = 0;
    if (piece.type === 'p') positional = advance * 7 + centrality * 2;
    if (piece.type === 'n') positional = centrality * 9;
    if (piece.type === 'b') positional = centrality * 5;
    if (piece.type === 'r') positional = advance * 2;
    if (piece.type === 'q') positional = centrality * 2;
    if (piece.type === 'k' && (piece.square === 'g1' || piece.square === 'c1' || piece.square === 'g8' || piece.square === 'c8')) positional = 25;
    value += (piece.color === perspective ? 1 : -1) * (VALUES[piece.type] + positional);
  }
  return value;
}
const tacticalOrder = (move: Move): number => (move.captured ? VALUES[move.captured] * 10 - VALUES[move.piece] : 0) + (move.promotion ? VALUES[move.promotion] * 9 : 0) + (move.san.includes('+') ? 45 : 0) + (move.san.includes('O-O') ? 30 : 0);

/** Legal local opponent, with bounded iterative search; no network or engine download. */
export function chooseChessAIMove(position: Chess | string, difficulty: ChessDifficulty = 'medium'): ChessMoveInput | null {
  const game = typeof position === 'string' ? new Chess(position) : new Chess();
  if (typeof position !== 'string') game.loadPgn(position.pgn()); // Preserve history for draw evaluation.
  if (game.isGameOver()) return null;
  const settings = LEVELS[difficulty];
  const side = game.turn();
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  const immediateMate = moves.find(move => move.san.endsWith('#'));
  if (immediateMate) return moveInput(immediateMate);
  const deadline = Date.now() + settings.ms;
  let aborted = false;
  const scorePosition = () => evaluateChess(game, side);
  const search = (depth: number, alpha: number, beta: number, ply: number): number => {
    if (Date.now() >= deadline) { aborted = true; return scorePosition(); }
    const choices = game.moves({ verbose: true });
    if (!choices.length) return game.isCheck() ? game.turn() === side ? -100000 + ply : 100000 - ply : 0;
    if (game.isInsufficientMaterial() || game.isThreefoldRepetition() || game.isDrawByFiftyMoves()) return 0;
    if (depth === 0) return scorePosition();
    const maximizing = game.turn() === side;
    let best = maximizing ? -Infinity : Infinity;
    choices.sort((a, b) => tacticalOrder(b) - tacticalOrder(a));
    for (const move of choices.slice(0, settings.beam)) {
      game.move(moveInput(move));
      const value = search(depth - 1, alpha, beta, ply + 1);
      game.undo();
      best = maximizing ? Math.max(best, value) : Math.min(best, value);
      if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);
      if (beta <= alpha || aborted) break;
    }
    return best;
  };

  const ordered = moves.map(move => {
    game.move(moveInput(move));
    const score = scorePosition() + (Math.random() - 0.5) * settings.noise;
    game.undo();
    return { move, score };
  }).sort((a, b) => b.score - a.score);
  let best = ordered[0].move;
  // Adopt only completed iterations, so a deadline never compares unlike search depths.
  for (let depth = 2; depth <= settings.depth; depth++) {
    let iterationBest = best;
    let iterationScore = -Infinity;
    aborted = false;
    for (const candidate of ordered.slice(0, settings.root)) {
      game.move(moveInput(candidate.move));
      const score = search(depth - 1, -Infinity, Infinity, 1);
      game.undo();
      if (aborted) break;
      if (score > iterationScore) { iterationScore = score; iterationBest = candidate.move; }
    }
    if (aborted) break;
    best = iterationBest;
    ordered.sort((a, b) => a.move === best ? -1 : b.move === best ? 1 : 0);
  }
  return moveInput(best);
}

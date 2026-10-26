import type { Color, PieceSymbol, Square } from 'chess.js';

export type ChessColor = Color;
export type ChessPieceType = PieceSymbol;
export type ChessSquare = Square;
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';
export type ChessDifficulty = 'easy' | 'medium' | 'hard';
export type ChessOpponent = 'computer' | 'local';
export interface ChessOptions { opponent: ChessOpponent; humanColor: ChessColor; difficulty: ChessDifficulty }
export interface ChessBoardPiece { square: ChessSquare; type: ChessPieceType; color: ChessColor }
export interface ChessMoveInput { from: ChessSquare; to: ChessSquare; promotion?: PromotionPiece }
export interface ChessPromotion { from: ChessSquare; to: ChessSquare; color: ChessColor }
export type ChessStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw';
export type ChessDrawReason = 'threefold-repetition' | 'fifty-move' | 'insufficient-material' | 'draw';
export interface ChessSnapshot {
  board: ChessBoardPiece[];
  fen: string;
  turn: ChessColor;
  selectedSquare: ChessSquare | null;
  legalMoves: ChessSquare[];
  history: string[];
  lastMove: { from: ChessSquare; to: ChessSquare; san: string } | null;
  check: boolean;
  status: ChessStatus;
  winner: ChessColor | null;
  drawReason: ChessDrawReason | null;
  promotion: ChessPromotion | null;
  moveNumber: number;
}

export type PieceType = 'attacker' | 'defender' | 'king';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  position: Position;
}

export interface Move {
  piece: Piece;
  from: Position;
  to: Position;
  captured: Piece[];
  notation: string;
}

export type Player = 'attacker' | 'defender';

export type GameResult = 'attacker-wins' | 'defender-wins' | null;

export type BoardSize = 7 | 9 | 11;

export interface GameVariant {
  id: string;
  name: string;
  boardSize: BoardSize;
  description: string;
  origin: string;
}

export type AIDifficulty = 'beginner' | 'easy' | 'medium' | 'valhalla';

export type GameMode = 'play' | 'demo';

export interface GameState {
  pieces: Piece[];
  currentPlayer: Player;
  moveHistory: Move[];
  selectedPiece: Piece | null;
  validMoves: Position[];
  gameResult: GameResult;
  boardSize: BoardSize;
  isPlayerTurn: boolean;
  playerSide: Player;
}

export type SquareType = 'normal' | 'corner' | 'throne';

export interface BoardConfig {
  size: BoardSize;
  corners: Position[];
  throne: Position;
  initialAttackers: Position[];
  initialDefenders: Position[];
  kingPosition: Position;
}

export type PieceType = 'attacker' | 'defender' | 'king';

export type BoardType = 'square' | 'circular';

export interface Position {
  row: number;
  col: number;
}

// Circular board position (ring 0 = center, spoke 0-15 = direction)
export interface FidchellPosition {
  ring: number;  // 0 = center (Navel), 1-4 = outer rings
  spoke: number; // 0-15 (16 radial lines, like compass directions)
}

export interface Piece {
  id: string;
  type: PieceType;
  position: Position;
  circularPosition?: FidchellPosition; // For Fidchell
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

export type BoardSize = 7 | 9 | 11 | 19;

export type VictoryType = 'escape' | 'capture-king' | 'connection';

export interface VariantRules {
  kingArmed: boolean; // Can king participate in captures
  edgeEscape: boolean; // King escapes to any edge (vs corners only)
  shieldwallCapture: boolean; // Capture against board edge
  victoryType?: VictoryType; // Different victory conditions
}

export interface BoardTheme {
  boardBase: string;
  boardFrame: string;
  squareLight: string;
  squareDark: string;
  corner: string;
  throne: string;
  circularFrame: string;
  accentRing: string;
  runeColor: string;
}

export interface GameVariant {
  id: string;
  name: string;
  boardSize: BoardSize;
  boardType: BoardType;
  description: string;
  origin: string;
  theme: BoardTheme;
  history: string;
  era: string;
  defaultRules: VariantRules;
  coordinates: { lat: number; lng: number };
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
  boardType?: BoardType;
  connectionPath?: FidchellPosition[]; // For Fidchell connection victory visualization
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

// Fidchell-specific circular board configuration
export interface CircularBoardConfig {
  rings: number;        // Number of concentric rings (typically 5: center + 4 outer)
  spokes: number;       // Number of radial lines (typically 16)
  totalNodes: number;   // Total intersection points
  piecesPerSide: number; // Equal pieces for both sides
  navelPosition: FidchellPosition; // Center (Navel Stone)
  initialWhite: FidchellPosition[]; // Defenders (connection-makers)
  initialBlack: FidchellPosition[]; // Attackers (blockers)
}

import { Position, Piece, PieceType, Player, Move, BoardSize, GameResult } from '@/types/game';
import { BOARD_CONFIGS } from '@/constants/game';

export function useGameLogic(boardSize: BoardSize) {
  const config = BOARD_CONFIGS[boardSize];

  const isCorner = (pos: Position): boolean => {
    return config.corners.some(c => c.row === pos.row && c.col === pos.col);
  };

  const isThrone = (pos: Position): boolean => {
    return pos.row === config.throne.row && pos.col === config.throne.col;
  };

  const isRestrictedSquare = (pos: Position): boolean => {
    return isCorner(pos) || isThrone(pos);
  };

  const getPieceAt = (pieces: Piece[], pos: Position): Piece | undefined => {
    return pieces.find(p => p.position.row === pos.row && p.position.col === pos.col);
  };

  const isValidPosition = (pos: Position): boolean => {
    return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize;
  };

  const getValidMoves = (piece: Piece, pieces: Piece[]): Position[] => {
    const moves: Position[] = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    for (const dir of directions) {
      let pos = { row: piece.position.row + dir.row, col: piece.position.col + dir.col };
      
      while (isValidPosition(pos) && !getPieceAt(pieces, pos)) {
        // Only king can move to corners
        if (isCorner(pos) && piece.type !== 'king') {
          break;
        }
        // Only king can move to throne (once left)
        if (isThrone(pos) && piece.type !== 'king') {
          pos = { row: pos.row + dir.row, col: pos.col + dir.col };
          continue;
        }
        moves.push({ ...pos });
        pos = { row: pos.row + dir.row, col: pos.col + dir.col };
      }
    }

    return moves;
  };

  const isHostile = (pos: Position, pieces: Piece[], againstType: PieceType): boolean => {
    const piece = getPieceAt(pieces, pos);
    if (piece) {
      if (againstType === 'attacker') {
        return piece.type === 'defender' || piece.type === 'king';
      }
      return piece.type === 'attacker';
    }
    // Corners and empty throne are hostile to all
    if (isCorner(pos)) return true;
    if (isThrone(pos) && !getPieceAt(pieces, pos)) return true;
    return false;
  };

  const getCapturedPieces = (movedPiece: Piece, newPos: Position, pieces: Piece[]): Piece[] => {
    const captured: Piece[] = [];
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];

    const updatedPieces = pieces.map(p => 
      p.id === movedPiece.id ? { ...p, position: newPos } : p
    );

    for (const dir of directions) {
      const adjacentPos = { row: newPos.row + dir.row, col: newPos.col + dir.col };
      const beyondPos = { row: newPos.row + dir.row * 2, col: newPos.col + dir.col * 2 };
      
      if (!isValidPosition(adjacentPos)) continue;
      
      const adjacentPiece = getPieceAt(updatedPieces, adjacentPos);
      if (!adjacentPiece) continue;
      
      // Can't capture your own pieces
      if (movedPiece.type === 'attacker' && adjacentPiece.type === 'attacker') continue;
      if (movedPiece.type !== 'attacker' && adjacentPiece.type !== 'attacker') continue;

      // Regular capture: sandwich between two hostile squares
      if (adjacentPiece.type !== 'king') {
        if (isValidPosition(beyondPos) && isHostile(beyondPos, updatedPieces, adjacentPiece.type)) {
          captured.push(adjacentPiece);
        }
      } else {
        // King capture: must be surrounded on all 4 sides
        const kingCaptured = directions.every(d => {
          const checkPos = { row: adjacentPos.row + d.row, col: adjacentPos.col + d.col };
          return !isValidPosition(checkPos) || isHostile(checkPos, updatedPieces, 'king');
        });
        if (kingCaptured) {
          captured.push(adjacentPiece);
        }
      }
    }

    return captured;
  };

  const checkGameResult = (pieces: Piece[], lastMove: Move | null): GameResult => {
    const king = pieces.find(p => p.type === 'king');
    
    // King captured
    if (!king) {
      return 'attacker-wins';
    }

    // King escaped to corner
    if (isCorner(king.position)) {
      return 'defender-wins';
    }

    return null;
  };

  const posToNotation = (pos: Position): string => {
    const col = String.fromCharCode(97 + pos.col);
    const row = boardSize - pos.row;
    return `${col}${row}`;
  };

  const createMoveNotation = (piece: Piece, from: Position, to: Position, captured: Piece[]): string => {
    const pieceSymbol = piece.type === 'king' ? 'K' : piece.type === 'attacker' ? 'A' : 'D';
    const captureStr = captured.length > 0 ? `x${captured.length}` : '';
    return `${pieceSymbol}${posToNotation(from)}-${posToNotation(to)}${captureStr}`;
  };

  return {
    isCorner,
    isThrone,
    isRestrictedSquare,
    getPieceAt,
    getValidMoves,
    getCapturedPieces,
    checkGameResult,
    createMoveNotation,
    config,
  };
}

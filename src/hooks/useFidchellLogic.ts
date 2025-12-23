import { useCallback } from 'react';
import { Piece, FidchellPosition, Player } from '@/types/game';
import { FIDCHELL_CONFIG } from '@/constants/game';

interface FidchellLogicReturn {
  getValidMoves: (piece: Piece, pieces: Piece[]) => FidchellPosition[];
  checkConnection: (pieces: Piece[]) => { connected: boolean; path: FidchellPosition[] };
  simulateMove: (pieces: Piece[], piece: Piece, to: FidchellPosition) => { newPieces: Piece[]; captured: Piece[] };
  checkGameOver: (pieces: Piece[]) => { gameOver: boolean; winner: Player | null };
}

export function useFidchellLogic(): FidchellLogicReturn {
  
  // Check if two circular positions are adjacent
  const areAdjacent = useCallback((a: FidchellPosition, b: FidchellPosition): boolean => {
    // Center is adjacent to all ring 1 positions
    if (a.ring === 0 && b.ring === 1) return true;
    if (b.ring === 0 && a.ring === 1) return true;
    
    // Same ring - adjacent spokes
    if (a.ring === b.ring && a.ring > 0) {
      const spokeDiff = Math.abs(a.spoke - b.spoke);
      return spokeDiff === 1 || spokeDiff === FIDCHELL_CONFIG.spokes - 1;
    }
    
    // Adjacent rings - same spoke
    if (Math.abs(a.ring - b.ring) === 1 && a.spoke === b.spoke) {
      return true;
    }
    
    return false;
  }, []);

  // Get piece at circular position
  const getPieceAt = useCallback((pieces: Piece[], pos: FidchellPosition): Piece | undefined => {
    return pieces.find(p => 
      p.circularPosition?.ring === pos.ring && 
      p.circularPosition?.spoke === pos.spoke
    );
  }, []);

  // Get valid moves for a piece on circular board
  const getValidMoves = useCallback((piece: Piece, pieces: Piece[]): FidchellPosition[] => {
    if (!piece.circularPosition) return [];
    
    const pos = piece.circularPosition;
    const moves: FidchellPosition[] = [];
    
    // Movement: along spokes (radially) or along rings (circularly)
    
    // Radial movement (along spoke)
    if (pos.ring === 0) {
      // From center, can move to any ring 1 position
      for (let spoke = 0; spoke < FIDCHELL_CONFIG.spokes; spoke++) {
        const target: FidchellPosition = { ring: 1, spoke };
        if (!getPieceAt(pieces, target)) {
          moves.push(target);
        }
      }
    } else {
      // Move inward along spoke
      for (let ring = pos.ring - 1; ring >= 0; ring--) {
        const target: FidchellPosition = ring === 0 
          ? { ring: 0, spoke: 0 } 
          : { ring, spoke: pos.spoke };
        if (getPieceAt(pieces, target)) break;
        moves.push(target);
      }
      
      // Move outward along spoke
      for (let ring = pos.ring + 1; ring < FIDCHELL_CONFIG.rings; ring++) {
        const target: FidchellPosition = { ring, spoke: pos.spoke };
        if (getPieceAt(pieces, target)) break;
        moves.push(target);
      }
      
      // Circular movement (along ring)
      // Move clockwise
      for (let i = 1; i < FIDCHELL_CONFIG.spokes; i++) {
        const spoke = (pos.spoke + i) % FIDCHELL_CONFIG.spokes;
        const target: FidchellPosition = { ring: pos.ring, spoke };
        if (getPieceAt(pieces, target)) break;
        moves.push(target);
      }
      
      // Move counter-clockwise
      for (let i = 1; i < FIDCHELL_CONFIG.spokes; i++) {
        const spoke = (pos.spoke - i + FIDCHELL_CONFIG.spokes) % FIDCHELL_CONFIG.spokes;
        const target: FidchellPosition = { ring: pos.ring, spoke };
        if (getPieceAt(pieces, target)) break;
        moves.push(target);
      }
    }
    
    return moves;
  }, [getPieceAt]);

  // BFS to check if white has a connection from center (ring 1) to edge
  // The Navel Stone (center) counts as a connection point for any white piece on ring 1
  const checkConnection = useCallback((pieces: Piece[]): { connected: boolean; path: FidchellPosition[] } => {
    const whitePieces = pieces.filter(p => p.type === 'defender');
    const whitePositions = new Set(
      whitePieces
        .filter(p => p.circularPosition)
        .map(p => `${p.circularPosition!.ring}-${p.circularPosition!.spoke}`)
    );
    
    // Check if there's a white piece touching the center (ring 1)
    const hasRing1 = whitePieces.some(p => p.circularPosition?.ring === 1);
    if (!hasRing1) {
      return { connected: false, path: [] };
    }
    
    // BFS from all ring 1 white pieces (they connect to the Navel Stone)
    const visited = new Set<string>();
    const queue: { pos: FidchellPosition; path: FidchellPosition[] }[] = [];
    
    // Start from all white pieces on ring 1 (connected to center)
    for (const piece of whitePieces) {
      if (piece.circularPosition?.ring === 1) {
        const key = `${piece.circularPosition.ring}-${piece.circularPosition.spoke}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ 
            pos: piece.circularPosition, 
            path: [{ ring: 0, spoke: 0 }, piece.circularPosition] // Include center in path
          });
        }
      }
    }
    
    while (queue.length > 0) {
      const { pos, path } = queue.shift()!;
      
      // Check if we reached the outer edge
      if (pos.ring === FIDCHELL_CONFIG.rings - 1) {
        return { connected: true, path };
      }
      
      // Get adjacent positions
      const neighbors: FidchellPosition[] = [];
      
      // Radial neighbors
      if (pos.ring > 1) {
        neighbors.push({ ring: pos.ring - 1, spoke: pos.spoke });
      }
      if (pos.ring < FIDCHELL_CONFIG.rings - 1) {
        neighbors.push({ ring: pos.ring + 1, spoke: pos.spoke });
      }
      // Circular neighbors
      neighbors.push({ 
        ring: pos.ring, 
        spoke: (pos.spoke + 1) % FIDCHELL_CONFIG.spokes 
      });
      neighbors.push({ 
        ring: pos.ring, 
        spoke: (pos.spoke - 1 + FIDCHELL_CONFIG.spokes) % FIDCHELL_CONFIG.spokes 
      });
      
      for (const neighbor of neighbors) {
        const key = `${neighbor.ring}-${neighbor.spoke}`;
        if (!visited.has(key) && whitePositions.has(key)) {
          visited.add(key);
          queue.push({ pos: neighbor, path: [...path, neighbor] });
        }
      }
    }
    
    return { connected: false, path: [] };
  }, []);

  // Simulate a move and check for captures
  const simulateMove = useCallback((
    pieces: Piece[], 
    piece: Piece, 
    to: FidchellPosition
  ): { newPieces: Piece[]; captured: Piece[] } => {
    const newPieces = pieces.map(p => 
      p.id === piece.id 
        ? { 
            ...p, 
            circularPosition: to,
            position: { row: to.ring, col: to.spoke } // Keep position in sync
          }
        : p
    );
    
    const captured: Piece[] = [];
    const movingPieceType = piece.type;
    const isWhite = movingPieceType === 'defender' || movingPieceType === 'king';
    
    // Check for custodial captures (simplified for circular board)
    // A piece is captured if sandwiched between two enemies on the same line
    
    // Get neighbors of the destination
    const neighbors: FidchellPosition[] = [];
    if (to.ring === 0) {
      // Center - check all ring 1
      for (let spoke = 0; spoke < FIDCHELL_CONFIG.spokes; spoke++) {
        neighbors.push({ ring: 1, spoke });
      }
    } else {
      // Radial neighbors
      if (to.ring > 0) {
        neighbors.push(to.ring === 1 
          ? { ring: 0, spoke: 0 } 
          : { ring: to.ring - 1, spoke: to.spoke }
        );
      }
      if (to.ring < FIDCHELL_CONFIG.rings - 1) {
        neighbors.push({ ring: to.ring + 1, spoke: to.spoke });
      }
      // Circular neighbors
      neighbors.push({ ring: to.ring, spoke: (to.spoke + 1) % FIDCHELL_CONFIG.spokes });
      neighbors.push({ ring: to.ring, spoke: (to.spoke - 1 + FIDCHELL_CONFIG.spokes) % FIDCHELL_CONFIG.spokes });
    }
    
    // Check each neighbor for capture
    for (const neighbor of neighbors) {
      const neighborPiece = getPieceAt(newPieces, neighbor);
      if (!neighborPiece) continue;
      
      const neighborIsWhite = neighborPiece.type === 'defender' || neighborPiece.type === 'king';
      if (neighborIsWhite === isWhite) continue; // Same team
      
      // Check if sandwiched - find the opposite side
      let opposite: FidchellPosition | null = null;
      
      if (neighbor.ring === to.ring) {
        // Circular - opposite is on the other side
        const spokeDiff = neighbor.spoke - to.spoke;
        if (Math.abs(spokeDiff) === 1 || Math.abs(spokeDiff) === FIDCHELL_CONFIG.spokes - 1) {
          const oppositeSpoke = spokeDiff > 0 || spokeDiff === -(FIDCHELL_CONFIG.spokes - 1)
            ? (neighbor.spoke + 1) % FIDCHELL_CONFIG.spokes
            : (neighbor.spoke - 1 + FIDCHELL_CONFIG.spokes) % FIDCHELL_CONFIG.spokes;
          opposite = { ring: neighbor.ring, spoke: oppositeSpoke };
        }
      } else {
        // Radial - opposite is on the other ring
        const ringDiff = neighbor.ring - to.ring;
        if (Math.abs(ringDiff) === 1) {
          const oppositeRing = neighbor.ring + ringDiff;
          if (oppositeRing >= 0 && oppositeRing < FIDCHELL_CONFIG.rings) {
            opposite = oppositeRing === 0 
              ? { ring: 0, spoke: 0 }
              : { ring: oppositeRing, spoke: neighbor.spoke };
          }
        }
      }
      
      if (opposite) {
        const oppositePiece = getPieceAt(newPieces, opposite);
        if (oppositePiece) {
          const oppositeIsWhite = oppositePiece.type === 'defender' || oppositePiece.type === 'king';
          if (oppositeIsWhite === isWhite) {
            // Captured!
            captured.push(neighborPiece);
          }
        }
      }
    }
    
    // Remove captured pieces
    const finalPieces = newPieces.filter(p => !captured.some(c => c.id === p.id));
    
    return { newPieces: finalPieces, captured };
  }, [getPieceAt]);

  // Check if game is over
  const checkGameOver = useCallback((pieces: Piece[]): { gameOver: boolean; winner: Player | null } => {
    // White wins if they have a connection from center to edge
    const { connected } = checkConnection(pieces);
    if (connected) {
      return { gameOver: true, winner: 'defender' };
    }
    
    // Black wins if white has too few pieces to possibly connect
    const whitePieces = pieces.filter(p => p.type === 'defender');
    const minPiecesForConnection = FIDCHELL_CONFIG.rings - 1; // Need at least 4 pieces for rings 1-4
    
    if (whitePieces.length < minPiecesForConnection) {
      return { gameOver: true, winner: 'attacker' };
    }
    
    return { gameOver: false, winner: null };
  }, [checkConnection]);

  return {
    getValidMoves,
    checkConnection,
    simulateMove,
    checkGameOver,
  };
}
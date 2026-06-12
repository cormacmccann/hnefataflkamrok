import { useState, useCallback, useRef, useEffect } from 'react';
import { Piece, Position, Player, BoardSize, AIDifficulty } from '@/types/game';
import { useAI } from './useAI';

interface DemoState {
  currentMove: {
    piece: Piece | null;
    to: Position | null;
    player: Player;
    explanation: string;
  };
  isPlaying: boolean;
  showPopup: boolean;
}

function generateMoveExplanation(
  piece: Piece,
  to: Position,
  player: Player,
  capturesCount: number,
  isKingMove: boolean,
  movesTowardsCorner: boolean
): string {
  const explanations: string[] = [];

  if (isKingMove) {
    if (movesTowardsCorner) {
      explanations.push("The King advances toward a corner escape square.");
    } else {
      explanations.push("The King repositions to create escape opportunities.");
    }
  } else if (player === 'attacker') {
    if (capturesCount > 0) {
      explanations.push(`Attackers capture ${capturesCount} piece${capturesCount > 1 ? 's' : ''} by sandwiching!`);
    } else {
      explanations.push("Attackers tighten the siege around the King's forces.");
    }
  } else {
    if (capturesCount > 0) {
      explanations.push(`Defenders capture ${capturesCount} attacker${capturesCount > 1 ? 's' : ''} to clear an escape path.`);
    } else {
      explanations.push("Defenders maneuver to protect the King's escape route.");
    }
  }

  return explanations[0] || "Strategic positioning on the battlefield.";
}

export function useDemoMode(boardSize: BoardSize, difficulty: AIDifficulty = 'medium') {
  const ai = useAI(boardSize, difficulty);
  const [demoState, setDemoState] = useState<DemoState>({
    currentMove: { piece: null, to: null, player: 'attacker', explanation: '' },
    isPlaying: false,
    showPopup: false,
  });
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNextDemoMove = useCallback((pieces: Piece[], currentPlayer: Player, isCorner: (pos: Position) => boolean) => {
    const bestMove = ai.getBestMove(pieces, currentPlayer);
    
    if (!bestMove) return null;

    const { piece, to } = bestMove;
    const isKingMove = piece.type === 'king';
    
    // Check if king is moving towards corner
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: boardSize - 1 },
      { row: boardSize - 1, col: 0 },
      { row: boardSize - 1, col: boardSize - 1 },
    ];
    
    const currentMinDist = Math.min(...corners.map(c => 
      Math.abs(piece.position.row - c.row) + Math.abs(piece.position.col - c.col)
    ));
    const newMinDist = Math.min(...corners.map(c => 
      Math.abs(to.row - c.row) + Math.abs(to.col - c.col)
    ));
    const movesTowardsCorner = isKingMove && newMinDist < currentMinDist;

    // Estimate captures (simplified)
    const capturesCount = 0; // Would need full game logic to know

    const explanation = generateMoveExplanation(
      piece,
      to,
      currentPlayer,
      capturesCount,
      isKingMove,
      movesTowardsCorner
    );

    return { piece, to, explanation };
  }, [ai, boardSize]);

  const setDemoMove = useCallback((piece: Piece, to: Position, player: Player, explanation: string) => {
    setDemoState(prev => ({
      ...prev,
      currentMove: { piece, to, player, explanation },
      showPopup: true,
    }));
  }, []);

  const hidePopup = useCallback(() => {
    setDemoState(prev => ({ ...prev, showPopup: false }));
  }, []);

  const startDemo = useCallback(() => {
    setDemoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const stopDemo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDemoState({
      currentMove: { piece: null, to: null, player: 'attacker', explanation: '' },
      isPlaying: false,
      showPopup: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    demoState,
    getNextDemoMove,
    setDemoMove,
    hidePopup,
    startDemo,
    stopDemo,
  };
}

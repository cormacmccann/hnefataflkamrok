import { useCallback } from 'react';
import { Piece, Position, Player, BoardSize } from '@/types/game';
import { useGameLogic } from './useGameLogic';

interface AIMove {
  piece: Piece;
  to: Position;
  score: number;
}

export function useAI(boardSize: BoardSize) {
  const logic = useGameLogic(boardSize);

  const evaluatePosition = useCallback((pieces: Piece[], aiSide: Player): number => {
    const king = pieces.find(p => p.type === 'king');
    if (!king) return aiSide === 'attacker' ? 10000 : -10000;

    if (logic.isCorner(king.position)) {
      return aiSide === 'defender' ? 10000 : -10000;
    }

    let score = 0;
    const attackers = pieces.filter(p => p.type === 'attacker').length;
    const defenders = pieces.filter(p => p.type === 'defender').length;

    // Material advantage
    if (aiSide === 'attacker') {
      score += (16 - defenders) * 30;
      score -= (24 - attackers) * 20;
    } else {
      score += (24 - attackers) * 20;
      score -= (16 - defenders) * 30;
    }

    // King position evaluation
    const kingDistToCorner = Math.min(
      ...logic.config.corners.map(c => 
        Math.abs(king.position.row - c.row) + Math.abs(king.position.col - c.col)
      )
    );

    if (aiSide === 'defender') {
      score += (boardSize - kingDistToCorner) * 15;
    } else {
      score -= (boardSize - kingDistToCorner) * 15;
    }

    // Control of center for attackers
    if (aiSide === 'attacker') {
      const center = Math.floor(boardSize / 2);
      pieces.filter(p => p.type === 'attacker').forEach(p => {
        const distToCenter = Math.abs(p.position.row - center) + Math.abs(p.position.col - center);
        score += Math.max(0, boardSize - distToCenter);
      });
    }

    // King mobility
    const kingMoves = logic.getValidMoves(king, pieces);
    if (aiSide === 'defender') {
      score += kingMoves.length * 5;
      if (kingMoves.some(m => logic.isCorner(m))) {
        score += 500;
      }
    } else {
      score -= kingMoves.length * 5;
      if (kingMoves.some(m => logic.isCorner(m))) {
        score -= 500;
      }
    }

    return score;
  }, [logic, boardSize]);

  const getBestMove = useCallback((pieces: Piece[], aiSide: Player): AIMove | null => {
    const aiPieces = pieces.filter(p => 
      aiSide === 'attacker' ? p.type === 'attacker' : (p.type === 'defender' || p.type === 'king')
    );

    let bestMove: AIMove | null = null;
    let bestScore = -Infinity;

    for (const piece of aiPieces) {
      const validMoves = logic.getValidMoves(piece, pieces);

      for (const to of validMoves) {
        const captured = logic.getCapturedPieces(piece, to, pieces);
        
        // Simulate the move
        const newPieces = pieces
          .map(p => p.id === piece.id ? { ...p, position: to } : p)
          .filter(p => !captured.some(c => c.id === p.id));

        let moveScore = evaluatePosition(newPieces, aiSide);
        
        // Bonus for captures
        moveScore += captured.length * 50;
        
        // Extra bonus for capturing king
        if (captured.some(c => c.type === 'king')) {
          moveScore += 10000;
        }

        // Add small random factor to avoid predictability
        moveScore += Math.random() * 10;

        if (moveScore > bestScore) {
          bestScore = moveScore;
          bestMove = { piece, to, score: moveScore };
        }
      }
    }

    return bestMove;
  }, [logic, evaluatePosition]);

  return { getBestMove };
}

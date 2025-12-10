import { useCallback } from 'react';
import { Piece, Position, Player, BoardSize, AIDifficulty } from '@/types/game';
import { useGameLogic } from './useGameLogic';

interface AIMove {
  piece: Piece;
  to: Position;
  score: number;
}

const DIFFICULTY_CONFIG = {
  beginner: { depth: 1, randomness: 80, blunderChance: 0.5 },
  easy: { depth: 1, randomness: 50, blunderChance: 0.3 },
  medium: { depth: 2, randomness: 15, blunderChance: 0.1 },
  valhalla: { depth: 4, randomness: 0, blunderChance: 0 },
};

export function useAI(boardSize: BoardSize, difficulty: AIDifficulty = 'medium') {
  const logic = useGameLogic(boardSize);
  const config = DIFFICULTY_CONFIG[difficulty];

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

  const simulateMove = useCallback((pieces: Piece[], piece: Piece, to: Position): Piece[] => {
    const captured = logic.getCapturedPieces(piece, to, pieces);
    return pieces
      .map(p => p.id === piece.id ? { ...p, position: to } : p)
      .filter(p => !captured.some(c => c.id === p.id));
  }, [logic]);

  const minimax = useCallback((
    pieces: Piece[],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiSide: Player
  ): number => {
    // Check terminal states
    const king = pieces.find(p => p.type === 'king');
    if (!king) return isMaximizing ? -10000 : 10000;
    if (logic.isCorner(king.position)) {
      return aiSide === 'defender' 
        ? (isMaximizing ? 10000 : -10000)
        : (isMaximizing ? -10000 : 10000);
    }

    if (depth === 0) {
      return evaluatePosition(pieces, aiSide);
    }

    const currentSide = isMaximizing ? aiSide : (aiSide === 'attacker' ? 'defender' : 'attacker');
    const sidePieces = pieces.filter(p => 
      currentSide === 'attacker' ? p.type === 'attacker' : (p.type === 'defender' || p.type === 'king')
    );

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const piece of sidePieces) {
        const moves = logic.getValidMoves(piece, pieces);
        for (const move of moves) {
          const newPieces = simulateMove(pieces, piece, move);
          const evalScore = minimax(newPieces, depth - 1, alpha, beta, false, aiSide);
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const piece of sidePieces) {
        const moves = logic.getValidMoves(piece, pieces);
        for (const move of moves) {
          const newPieces = simulateMove(pieces, piece, move);
          const evalScore = minimax(newPieces, depth - 1, alpha, beta, true, aiSide);
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [logic, evaluatePosition, simulateMove]);

  const getBestMove = useCallback((pieces: Piece[], aiSide: Player): AIMove | null => {
    const aiPieces = pieces.filter(p => 
      aiSide === 'attacker' ? p.type === 'attacker' : (p.type === 'defender' || p.type === 'king')
    );

    const allMoves: AIMove[] = [];

    for (const piece of aiPieces) {
      const validMoves = logic.getValidMoves(piece, pieces);

      for (const to of validMoves) {
        const newPieces = simulateMove(pieces, piece, to);
        const captured = logic.getCapturedPieces(piece, to, pieces);
        
        let moveScore: number;
        
        if (config.depth <= 1) {
          // Simple evaluation for easy mode
          moveScore = evaluatePosition(newPieces, aiSide);
        } else {
          // Minimax with alpha-beta pruning for higher difficulties
          moveScore = minimax(newPieces, config.depth - 1, -Infinity, Infinity, false, aiSide);
        }
        
        // Bonus for captures
        moveScore += captured.length * 50;
        
        // Extra bonus for capturing king
        if (captured.some(c => c.type === 'king')) {
          moveScore += 10000;
        }

        // Add randomness based on difficulty
        moveScore += (Math.random() - 0.5) * config.randomness;

        allMoves.push({ piece, to, score: moveScore });
      }
    }

    if (allMoves.length === 0) return null;

    // Sort moves by score
    allMoves.sort((a, b) => b.score - a.score);

    // Blunder chance for easier difficulties - pick a random move instead
    if (Math.random() < config.blunderChance && allMoves.length > 1) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, allMoves.length));
      return allMoves[randomIndex];
    }

    return allMoves[0];
  }, [logic, evaluatePosition, simulateMove, minimax, config]);

  return { getBestMove };
}

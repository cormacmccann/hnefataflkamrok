import { useCallback } from 'react';
import { Piece, Player, FidchellPosition, AIDifficulty } from '@/types/game';
import { useFidchellLogic } from './useFidchellLogic';
import { FIDCHELL_CONFIG } from '@/constants/game';

interface FidchellAIMove {
  piece: Piece;
  to: FidchellPosition;
  score: number;
}

interface FidchellAIReturn {
  getBestMove: (pieces: Piece[], player: Player) => FidchellAIMove | null;
}

const DIFFICULTY_CONFIG = {
  beginner: { depth: 1, randomness: 0.4, blunderChance: 0.3 },
  easy: { depth: 2, randomness: 0.25, blunderChance: 0.15 },
  medium: { depth: 3, randomness: 0.1, blunderChance: 0.05 },
  valhalla: { depth: 4, randomness: 0, blunderChance: 0 },
};

export function useFidchellAI(difficulty: AIDifficulty): FidchellAIReturn {
  const logic = useFidchellLogic();
  const config = DIFFICULTY_CONFIG[difficulty];

  // Evaluate position for connection game
  const evaluatePosition = useCallback((pieces: Piece[], forPlayer: Player): number => {
    const isWhite = forPlayer === 'defender';
    
    // Check for immediate wins
    const { connected, path } = logic.checkConnection(pieces);
    if (connected) {
      return isWhite ? 10000 : -10000;
    }

    // Count pieces
    const whitePieces = pieces.filter(p => p.type === 'defender' || p.type === 'king');
    const blackPieces = pieces.filter(p => p.type === 'attacker');
    
    // Too few white pieces = black wins
    if (whitePieces.length < FIDCHELL_CONFIG.rings) {
      return isWhite ? -10000 : 10000;
    }

    let score = 0;

    // Material advantage
    score += (whitePieces.length - blackPieces.length) * 100;

    // Connection progress - how many rings have white pieces
    const ringsWithWhite = new Set(
      whitePieces
        .filter(p => p.circularPosition)
        .map(p => p.circularPosition!.ring)
    );
    score += ringsWithWhite.size * 150;

    // Longest partial path from center
    const longestPath = path.length;
    score += longestPath * 200;

    // Control of key spokes (cardinal directions: 0, 4, 8, 12)
    const keySpokes = [0, 4, 8, 12];
    for (const spoke of keySpokes) {
      for (let ring = 1; ring < FIDCHELL_CONFIG.rings; ring++) {
        const pos: FidchellPosition = { ring, spoke };
        const piece = pieces.find(p => 
          p.circularPosition?.ring === pos.ring && 
          p.circularPosition?.spoke === pos.spoke
        );
        if (piece) {
          const isWhitePiece = piece.type === 'defender' || piece.type === 'king';
          score += isWhitePiece ? 30 : -30;
        }
      }
    }

    // Outer ring control (important for both sides)
    const outerRing = FIDCHELL_CONFIG.rings - 1;
    let whiteOnOuter = 0;
    let blackOnOuter = 0;
    for (let spoke = 0; spoke < FIDCHELL_CONFIG.spokes; spoke++) {
      const piece = pieces.find(p => 
        p.circularPosition?.ring === outerRing && 
        p.circularPosition?.spoke === spoke
      );
      if (piece) {
        if (piece.type === 'defender' || piece.type === 'king') {
          whiteOnOuter++;
        } else {
          blackOnOuter++;
        }
      }
    }
    score += (whiteOnOuter - blackOnOuter) * 50;

    return isWhite ? score : -score;
  }, [logic]);

  // Simple minimax with alpha-beta pruning
  const minimax = useCallback((
    pieces: Piece[],
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
    forPlayer: Player
  ): number => {
    if (depth === 0) {
      return evaluatePosition(pieces, forPlayer);
    }

    const { gameOver, winner } = logic.checkGameOver(pieces);
    if (gameOver) {
      if (winner === forPlayer) return 10000;
      if (winner !== null) return -10000;
      return 0;
    }

    const currentPlayer: Player = maximizing ? forPlayer : (forPlayer === 'defender' ? 'attacker' : 'defender');
    const playerPieces = pieces.filter(p => {
      const isWhite = p.type === 'defender' || p.type === 'king';
      return currentPlayer === 'defender' ? isWhite : !isWhite;
    });

    if (maximizing) {
      let maxEval = -Infinity;
      for (const piece of playerPieces) {
        const moves = logic.getValidMoves(piece, pieces);
        for (const move of moves) {
          const { newPieces } = logic.simulateMove(pieces, piece, move);
          const evalScore = minimax(newPieces, depth - 1, alpha, beta, false, forPlayer);
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const piece of playerPieces) {
        const moves = logic.getValidMoves(piece, pieces);
        for (const move of moves) {
          const { newPieces } = logic.simulateMove(pieces, piece, move);
          const evalScore = minimax(newPieces, depth - 1, alpha, beta, true, forPlayer);
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [evaluatePosition, logic]);

  const getBestMove = useCallback((pieces: Piece[], player: Player): FidchellAIMove | null => {
    const playerPieces = pieces.filter(p => {
      const isWhite = p.type === 'defender' || p.type === 'king';
      return player === 'defender' ? isWhite : !isWhite;
    });

    const allMoves: FidchellAIMove[] = [];

    for (const piece of playerPieces) {
      const moves = logic.getValidMoves(piece, pieces);
      for (const move of moves) {
        const { newPieces, captured } = logic.simulateMove(pieces, piece, move);
        
        // Use minimax for scoring
        let score = minimax(newPieces, config.depth - 1, -Infinity, Infinity, false, player);
        
        // Bonus for captures
        score += captured.length * 200;
        
        // Add randomness based on difficulty
        score += (Math.random() - 0.5) * config.randomness * 1000;

        allMoves.push({ piece, to: move, score });
      }
    }

    if (allMoves.length === 0) return null;

    // Sort by score
    allMoves.sort((a, b) => b.score - a.score);

    // Blunder chance - sometimes pick a worse move
    if (Math.random() < config.blunderChance && allMoves.length > 1) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, allMoves.length));
      return allMoves[randomIndex];
    }

    return allMoves[0];
  }, [logic, minimax, config]);

  return { getBestMove };
}
import { useCallback } from 'react';
import { Piece, Player, FidchellPosition, AIDifficulty } from '@/types/game';
import { useFidchellLogic } from './useFidchellLogic';
import { FIDCHELL_CONFIG } from '@/constants/game';

type Color = 'white' | 'black';
const playerToColor = (p: Player): Color => (p === 'defender' ? 'white' : 'black');

export interface FidchellAIAction {
  kind: 'place' | 'move';
  to: FidchellPosition;
  piece?: Piece; // for 'move'
  score: number;
}

interface FidchellAIReturn {
  /** Decide a placement during phase 1. */
  getBestPlacement: (pieces: Piece[], player: Player) => FidchellAIAction | null;
  /** Decide a move during phase 2. */
  getBestMove: (pieces: Piece[], player: Player) => FidchellAIAction | null;
}

const DIFFICULTY: Record<AIDifficulty, { noise: number; lookahead: boolean }> = {
  beginner: { noise: 800, lookahead: false },
  easy: { noise: 400, lookahead: false },
  medium: { noise: 120, lookahead: true },
  valhalla: { noise: 0, lookahead: true },
};

export function useFidchellAI(difficulty: AIDifficulty): FidchellAIReturn {
  const logic = useFidchellLogic();
  const cfg = DIFFICULTY[difficulty];

  // Heuristic: own connection progress – opponent connection progress
  // + captured material + light positional bonus for inner→outer spread.
  const evaluate = useCallback((pieces: Piece[], color: Color): number => {
    const own = pieces.filter(p =>
      color === 'white' ? p.type === 'defender' || p.type === 'king' : p.type === 'attacker'
    );
    const opp = pieces.filter(p =>
      color === 'white' ? p.type === 'attacker' : p.type === 'defender' || p.type === 'king'
    );

    const ownConn = logic.checkConnection(pieces, color);
    if (ownConn.connected) return 100000;
    const oppColor: Color = color === 'white' ? 'black' : 'white';
    const oppConn = logic.checkConnection(pieces, oppColor);
    if (oppConn.connected) return -100000;

    const ownRings = new Set(own.map(p => p.circularPosition!.ring));
    const oppRings = new Set(opp.map(p => p.circularPosition!.ring));

    let score = 0;
    score += (own.length - opp.length) * 30;
    score += ownRings.size * 80;
    score -= oppRings.size * 60;
    score += ownConn.path.length * 25;
    score -= oppConn.path.length * 20;

    // Touching outer rim is valuable for whoever's there.
    const R = FIDCHELL_CONFIG.rings - 1;
    for (const p of own) if (p.circularPosition!.ring === R) score += 40;
    for (const p of opp) if (p.circularPosition!.ring === R) score -= 35;

    return score;
  }, [logic]);

  const getBestPlacement = useCallback((pieces: Piece[], player: Player): FidchellAIAction | null => {
    const color = playerToColor(player);
    const empties = logic.getAllEmptyNodes(pieces);
    if (empties.length === 0) return null;

    let best: FidchellAIAction | null = null;
    for (const pos of empties) {
      const { newPieces, captured } = logic.applyPlacement(pieces, color, pos, 999999);
      let score = evaluate(newPieces, color);
      score += captured.length * 250;
      score += (Math.random() - 0.5) * cfg.noise;
      if (!best || score > best.score) {
        best = { kind: 'place', to: pos, score };
      }
    }
    return best;
  }, [logic, evaluate, cfg]);

  const getBestMove = useCallback((pieces: Piece[], player: Player): FidchellAIAction | null => {
    const color = playerToColor(player);
    const own = pieces.filter(p =>
      color === 'white' ? p.type === 'defender' || p.type === 'king' : p.type === 'attacker'
    );
    let best: FidchellAIAction | null = null;
    for (const piece of own) {
      for (const to of logic.getValidMoves(piece, pieces)) {
        const { newPieces, captured } = logic.applyMove(pieces, piece, to);
        let score = evaluate(newPieces, color);
        score += captured.length * 250;
        score += (Math.random() - 0.5) * cfg.noise;
        if (!best || score > best.score) {
          best = { kind: 'move', to, piece, score };
        }
      }
    }
    return best;
  }, [logic, evaluate, cfg]);

  return { getBestPlacement, getBestMove };
}

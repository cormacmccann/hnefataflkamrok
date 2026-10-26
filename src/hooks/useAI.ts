import { useMemo } from 'react';
import type { BoardSize, AIDifficulty, VariantRules } from '@/types/game';
import { createTaflAI } from '@/lib/taflAI';

export function useAI(boardSize: BoardSize, difficulty: AIDifficulty = 'medium', rules?: VariantRules, variantId?: string) {
  return useMemo(() => createTaflAI(boardSize, difficulty, rules, variantId), [boardSize, difficulty, rules, variantId]);
}

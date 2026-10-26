import { useMemo } from 'react';
import type { BoardSize, VariantRules } from '@/types/game';
import { createTaflLogic } from '@/lib/taflEngine';

export function useGameLogic(boardSize: BoardSize, rules?: VariantRules, variantId?: string) {
  return useMemo(() => createTaflLogic(boardSize, rules, variantId), [boardSize, rules, variantId]);
}

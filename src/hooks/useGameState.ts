import { useState, useCallback, useRef } from 'react';
import type { GameState, Piece, Position, Move, BoardSize, Player, VariantRules } from '@/types/game';
import { BOARD_CONFIGS } from '@/constants/game';
import { createTaflLogic, getRepetitionResult, ownerOf, positionKey } from '@/lib/taflEngine';
import { useGameLogic } from './useGameLogic';
import { useSoundEffects } from './useSoundEffects';

interface CapturePosition { position: Position; pieceType: 'attacker' | 'defender' | 'king' }

export function createInitialPieces(boardSize: BoardSize): Piece[] {
  const config = BOARD_CONFIGS[boardSize];
  return [
    ...config.initialAttackers.map((position, i) => ({ id: `a${i}`, type: 'attacker' as const, position: { ...position } })),
    ...config.initialDefenders.map((position, i) => ({ id: `d${i}`, type: 'defender' as const, position: { ...position } })),
    { id: 'king', type: 'king', position: { ...config.kingPosition } },
  ];
}

function initialState(boardSize: BoardSize, playerSide: Player, rules?: VariantRules, variantId?: string): GameState {
  const active = createTaflLogic(boardSize, rules, variantId);
  return { pieces: createInitialPieces(boardSize), currentPlayer: 'attacker', moveHistory: [], selectedPiece: null, validMoves: [], gameResult: null, boardSize, isPlayerTurn: playerSide === 'attacker', playerSide, rules: active.rules, variantId: active.variantId };
}

export function useGameState(boardSize: BoardSize, playerSide: Player, sfxVolume = 0.5, rules?: VariantRules, variantId?: string) {
  const [gameState, setGameState] = useState<GameState>(() => initialState(boardSize, playerSide, rules, variantId));
  // A synchronous current state makes AI moves atomic and the boolean return reliable under React batching.
  const stateRef = useRef(gameState);
  const repetitions = useRef(new Map([[positionKey(gameState.pieces, gameState.currentPlayer), 1]]));
  const [capturePositions, setCapturePositions] = useState<CapturePosition[]>([]);
  const logic = useGameLogic(gameState.boardSize, gameState.rules, gameState.variantId);
  const sounds = useSoundEffects(sfxVolume);
  const publish = useCallback((next: GameState) => { stateRef.current = next; setGameState(next); }, []);
  const clearCapturePositions = useCallback(() => setCapturePositions([]), []);

  const resetGame = useCallback((newSize?: BoardSize, newSide?: Player, newRules?: VariantRules, newVariantId?: string) => {
    const prev = stateRef.current;
    const next = initialState(newSize ?? prev.boardSize, newSide ?? prev.playerSide, newRules ?? rules, newVariantId ?? variantId);
    repetitions.current = new Map([[positionKey(next.pieces, next.currentPlayer), 1]]);
    setCapturePositions([]);
    publish(next);
  }, [publish, rules, variantId]);

  const selectPiece = useCallback((candidate: Piece | null) => {
    const prev = stateRef.current;
    if (!candidate) { publish({ ...prev, selectedPiece: null, validMoves: [] }); return; }
    const piece = prev.pieces.find(p => p.id === candidate.id);
    if (!piece || ownerOf(piece) !== prev.currentPlayer || prev.gameResult) return;
    const active = createTaflLogic(prev.boardSize, prev.rules, prev.variantId);
    sounds.playSelect();
    publish({ ...prev, selectedPiece: piece, validMoves: active.getValidMoves(piece, prev.pieces) });
  }, [publish, sounds]);

  const makeMove = useCallback((to: Position, pieceId?: string): boolean => {
    const prev = stateRef.current;
    const piece = prev.pieces.find(p => p.id === (pieceId ?? prev.selectedPiece?.id));
    if (!piece || prev.gameResult || ownerOf(piece) !== prev.currentPlayer) return false;
    const active = createTaflLogic(prev.boardSize, prev.rules, prev.variantId);
    if (!active.getValidMoves(piece, prev.pieces).some(m => m.row === to.row && m.col === to.col)) return false;
    const captured = active.getCapturedPieces(piece, to, prev.pieces);
    const from = { ...piece.position };
    const move: Move = { piece: { ...piece, position: from }, from, to: { ...to }, captured, notation: active.createMoveNotation(piece, from, to, captured) };
    const pieces = prev.pieces.map(p => p.id === piece.id ? { ...p, position: { ...to } } : p).filter(p => !captured.some(c => c.id === p.id));
    const nextPlayer: Player = prev.currentPlayer === 'attacker' ? 'defender' : 'attacker';
    const key = positionKey(pieces, nextPlayer);
    const occurrences = (repetitions.current.get(key) ?? 0) + 1;
    repetitions.current.set(key, occurrences);
    const gameResult = active.checkGameResult(pieces, move, nextPlayer) ?? getRepetitionResult(prev.variantId, prev.currentPlayer, occurrences);
    if (captured.length) {
      sounds.playCapture();
      setCapturePositions(captured.map(p => ({ position: p.position, pieceType: p.type })));
    } else sounds.playMove();
    if (gameResult) sounds.playGameOver();
    publish({ ...prev, pieces, currentPlayer: nextPlayer, moveHistory: [...prev.moveHistory, move], selectedPiece: null, validMoves: [], gameResult, isPlayerTurn: nextPlayer === prev.playerSide });
    return true;
  }, [publish, sounds]);

  const undoMove = useCallback((plies = 2) => {
    const prev = stateRef.current;
    if (prev.moveHistory.length < plies || plies < 1) return;
    const moveHistory = prev.moveHistory.slice(0, -plies);
    let pieces = createInitialPieces(prev.boardSize);
    const seen = new Map([[positionKey(pieces, 'attacker'), 1]]);
    let currentPlayer: Player = 'attacker';
    for (const move of moveHistory) {
      pieces = pieces.map(p => p.id === move.piece.id ? { ...p, position: move.to } : p).filter(p => !move.captured.some(c => c.id === p.id));
      currentPlayer = currentPlayer === 'attacker' ? 'defender' : 'attacker';
      const key = positionKey(pieces, currentPlayer);
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    repetitions.current = seen;
    setCapturePositions([]);
    sounds.playSelect();
    publish({ ...prev, pieces, currentPlayer, moveHistory, selectedPiece: null, validMoves: [], gameResult: null, isPlayerTurn: currentPlayer === prev.playerSide });
  }, [publish, sounds]);

  return { gameState, selectPiece, makeMove, undoMove, resetGame, logic, capturePositions, clearCapturePositions };
}

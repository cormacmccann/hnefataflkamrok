import { useState, useCallback, useEffect } from 'react';
import { GameState, Piece, Position, Move, BoardSize, Player } from '@/types/game';
import { BOARD_CONFIGS } from '@/constants/game';
import { useGameLogic } from './useGameLogic';
import { useSoundEffects } from './useSoundEffects';

function createInitialPieces(boardSize: BoardSize): Piece[] {
  const config = BOARD_CONFIGS[boardSize];
  const pieces: Piece[] = [];
  let id = 0;

  config.initialAttackers.forEach(pos => {
    pieces.push({ id: `a${id++}`, type: 'attacker', position: { ...pos } });
  });

  config.initialDefenders.forEach(pos => {
    pieces.push({ id: `d${id++}`, type: 'defender', position: { ...pos } });
  });

  pieces.push({ id: 'king', type: 'king', position: { ...config.kingPosition } });

  return pieces;
}

export function useGameState(boardSize: BoardSize, playerSide: Player) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    pieces: createInitialPieces(boardSize),
    currentPlayer: 'attacker',
    moveHistory: [],
    selectedPiece: null,
    validMoves: [],
    gameResult: null,
    boardSize,
    isPlayerTurn: playerSide === 'attacker',
    playerSide,
  }));

  const logic = useGameLogic(boardSize);
  const sounds = useSoundEffects();

  const resetGame = useCallback((newSize?: BoardSize, newSide?: Player) => {
    const size = newSize ?? boardSize;
    const side = newSide ?? playerSide;
    setGameState({
      pieces: createInitialPieces(size),
      currentPlayer: 'attacker',
      moveHistory: [],
      selectedPiece: null,
      validMoves: [],
      gameResult: null,
      boardSize: size,
      isPlayerTurn: side === 'attacker',
      playerSide: side,
    });
  }, [boardSize, playerSide]);

  const selectPiece = useCallback((piece: Piece | null) => {
    if (!piece) {
      setGameState(prev => ({ ...prev, selectedPiece: null, validMoves: [] }));
      return;
    }

    setGameState(prev => {
      // Can only select pieces of current player
      const isAttackerTurn = prev.currentPlayer === 'attacker';
      const isValidSelection = isAttackerTurn 
        ? piece.type === 'attacker'
        : piece.type === 'defender' || piece.type === 'king';

      if (!isValidSelection || prev.gameResult) {
        return prev;
      }

      sounds.playSelect();
      const validMoves = logic.getValidMoves(piece, prev.pieces);
      return { ...prev, selectedPiece: piece, validMoves };
    });
  }, [logic, sounds]);

  const makeMove = useCallback((to: Position): boolean => {
    let moveSuccessful = false;

    setGameState(prev => {
      if (!prev.selectedPiece || prev.gameResult) return prev;

      const isValidMove = prev.validMoves.some(m => m.row === to.row && m.col === to.col);
      if (!isValidMove) return prev;

      const captured = logic.getCapturedPieces(prev.selectedPiece, to, prev.pieces);
      const from = prev.selectedPiece.position;
      
      const move: Move = {
        piece: prev.selectedPiece,
        from,
        to,
        captured,
        notation: logic.createMoveNotation(prev.selectedPiece, from, to, captured),
      };

      const updatedPieces = prev.pieces
        .map(p => p.id === prev.selectedPiece!.id ? { ...p, position: to } : p)
        .filter(p => !captured.some(c => c.id === p.id));

      const gameResult = logic.checkGameResult(updatedPieces, move);
      const nextPlayer: Player = prev.currentPlayer === 'attacker' ? 'defender' : 'attacker';

      if (captured.length > 0) {
        sounds.playCapture();
      } else {
        sounds.playMove();
      }

      if (gameResult) {
        sounds.playGameOver();
      }

      moveSuccessful = true;

      return {
        ...prev,
        pieces: updatedPieces,
        currentPlayer: nextPlayer,
        moveHistory: [...prev.moveHistory, move],
        selectedPiece: null,
        validMoves: [],
        gameResult,
        isPlayerTurn: nextPlayer === prev.playerSide,
      };
    });

    return moveSuccessful;
  }, [logic, sounds]);

  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (prev.moveHistory.length < 2) return prev; // Undo both player and AI move

      const newHistory = prev.moveHistory.slice(0, -2);
      const piecesToRestore = createInitialPieces(prev.boardSize);

      // Replay all moves except last two
      let currentPieces = piecesToRestore;
      for (const move of newHistory) {
        currentPieces = currentPieces
          .map(p => p.id === move.piece.id ? { ...p, position: move.to } : p)
          .filter(p => !move.captured.some(c => c.id === p.id));
      }

      sounds.playSelect();

      return {
        ...prev,
        pieces: currentPieces,
        currentPlayer: prev.playerSide,
        moveHistory: newHistory,
        selectedPiece: null,
        validMoves: [],
        gameResult: null,
        isPlayerTurn: true,
      };
    });
  }, [sounds]);

  return {
    gameState,
    selectPiece,
    makeMove,
    undoMove,
    resetGame,
    logic,
  };
}

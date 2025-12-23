import { useState, useCallback, useMemo } from 'react';
import { Piece, Player, GameResult, FidchellPosition, Move, GameState } from '@/types/game';
import { FIDCHELL_CONFIG } from '@/constants/game';
import { useFidchellLogic } from './useFidchellLogic';
import { useSoundEffects } from './useSoundEffects';

interface FidchellStateReturn {
  gameState: GameState;
  selectPiece: (piece: Piece | null) => void;
  makeMove: (to: FidchellPosition) => boolean;
  resetGame: (playerSide: Player) => void;
  connectionPath: FidchellPosition[];
}

export function useFidchellState(playerSide: Player, sfxVolume: number): FidchellStateReturn {
  const logic = useFidchellLogic();
  const { playSelect, playMove, playCapture } = useSoundEffects(sfxVolume);

  // Create initial pieces - Fidchell has no king, it's a connection game
  const createInitialPieces = useCallback((): Piece[] => {
    const pieces: Piece[] = [];
    
    // White pieces (defenders/connection makers) - starts on inner rings
    FIDCHELL_CONFIG.initialWhite.forEach((pos, idx) => {
      pieces.push({
        id: `white-${idx}`,
        type: 'defender',
        position: { row: pos.ring, col: pos.spoke },
        circularPosition: pos,
      });
    });
    
    // Black pieces (attackers/blockers) - starts on outer rings
    FIDCHELL_CONFIG.initialBlack.forEach((pos, idx) => {
      pieces.push({
        id: `black-${idx}`,
        type: 'attacker',
        position: { row: pos.ring, col: pos.spoke },
        circularPosition: pos,
      });
    });
    
    return pieces;
  }, []);

  const [pieces, setPieces] = useState<Piece[]>(createInitialPieces);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('attacker'); // Black moves first
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<FidchellPosition[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [connectionPath, setConnectionPath] = useState<FidchellPosition[]>([]);

  const isPlayerTurn = currentPlayer === playerSide;

  // Convert FidchellPosition[] to Position[] for compatibility
  const validMovesAsPositions = useMemo(() => {
    return validMoves.map(fp => ({ row: fp.ring, col: fp.spoke }));
  }, [validMoves]);

  const selectPiece = useCallback((piece: Piece | null) => {
    if (!piece) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    // Check if piece belongs to current player
    const isWhitePiece = piece.type === 'defender' || piece.type === 'king';
    const isCurrentPlayerWhite = currentPlayer === 'defender';
    
    if (isWhitePiece !== isCurrentPlayerWhite) {
      return;
    }

    playSelect();
    setSelectedPiece(piece);
    const moves = logic.getValidMoves(piece, pieces);
    setValidMoves(moves);
  }, [currentPlayer, pieces, logic, playSelect]);

  const makeMove = useCallback((to: FidchellPosition): boolean => {
    if (!selectedPiece || !selectedPiece.circularPosition) return false;

    // Check if move is valid
    const isValid = validMoves.some(m => m.ring === to.ring && m.spoke === to.spoke);
    if (!isValid) return false;

    // Execute move
    const { newPieces, captured } = logic.simulateMove(pieces, selectedPiece, to);
    
    // Play sounds
    playMove();
    if (captured.length > 0) {
      playCapture();
    }

    // Create move record
    const move: Move = {
      piece: selectedPiece,
      from: { row: selectedPiece.circularPosition.ring, col: selectedPiece.circularPosition.spoke },
      to: { row: to.ring, col: to.spoke },
      captured,
      notation: `${selectedPiece.type[0].toUpperCase()}(${selectedPiece.circularPosition.ring},${selectedPiece.circularPosition.spoke})→(${to.ring},${to.spoke})`,
    };

    setPieces(newPieces);
    setMoveHistory(prev => [...prev, move]);
    setSelectedPiece(null);
    setValidMoves([]);

    // Check for game over
    const { gameOver, winner } = logic.checkGameOver(newPieces);
    if (gameOver && winner) {
      setGameResult(winner === 'defender' ? 'defender-wins' : 'attacker-wins');
      
      // Update connection path for victory visualization
      if (winner === 'defender') {
        const { path } = logic.checkConnection(newPieces);
        setConnectionPath(path);
      }
    } else {
      // Update connection path visualization
      const { path } = logic.checkConnection(newPieces);
      setConnectionPath(path);
      
      // Switch turns
      setCurrentPlayer(prev => prev === 'attacker' ? 'defender' : 'attacker');
    }

    return true;
  }, [selectedPiece, validMoves, pieces, logic, playMove, playCapture]);

  const resetGame = useCallback((side: Player) => {
    setPieces(createInitialPieces());
    setCurrentPlayer('attacker');
    setSelectedPiece(null);
    setValidMoves([]);
    setMoveHistory([]);
    setGameResult(null);
    setConnectionPath([]);
  }, [createInitialPieces]);

  const gameState: GameState = {
    pieces,
    currentPlayer,
    moveHistory,
    selectedPiece,
    validMoves: validMovesAsPositions,
    gameResult,
    boardSize: 7, // Not used for circular board
    isPlayerTurn,
    playerSide,
    boardType: 'circular',
    connectionPath,
  };

  return {
    gameState,
    selectPiece,
    makeMove,
    resetGame,
    connectionPath,
  };
}
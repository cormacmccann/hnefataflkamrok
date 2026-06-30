import { useState, useCallback, useMemo, useRef } from 'react';
import { Piece, Player, GameResult, FidchellPosition, Move, GameState } from '@/types/game';
import { FIDCHELL_CONFIG } from '@/constants/game';
import { useFidchellLogic } from './useFidchellLogic';
import { useSoundEffects } from './useSoundEffects';

export type FidchellPhase = 'placement' | 'movement';

type Color = 'white' | 'black';
const playerToColor = (p: Player): Color => (p === 'defender' ? 'white' : 'black');
const colorToPlayer = (c: Color): Player => (c === 'white' ? 'defender' : 'attacker');

interface FidchellStateReturn {
  gameState: GameState;
  selectPiece: (piece: Piece | null) => void;
  makeMove: (to: FidchellPosition) => boolean;
  resetGame: (playerSide: Player) => void;
  handleNodeClick: (pos: FidchellPosition) => void;
  handlePieceClick: (pieceId: string) => void;
  connectionPath: FidchellPosition[];
  phase: FidchellPhase;
  pawnsInHand: { defender: number; attacker: number };
}

export function useFidchellState(playerSide: Player, sfxVolume: number): FidchellStateReturn {
  const logic = useFidchellLogic();
  const { playSelect, playMove, playCapture } = useSoundEffects(sfxVolume);

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('attacker');
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<FidchellPosition[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [connectionPath, setConnectionPath] = useState<FidchellPosition[]>([]);
  const [pawnsInHand, setPawnsInHand] = useState<{ defender: number; attacker: number }>({
    defender: FIDCHELL_CONFIG.piecesPerSide,
    attacker: FIDCHELL_CONFIG.piecesPerSide,
  });
  const nextIdRef = useRef(0);

  // A player is in placement phase as long as they still have pawns in hand.
  const phase: FidchellPhase = pawnsInHand[currentPlayer] > 0 ? 'placement' : 'movement';

  const isPlayerTurn = currentPlayer === playerSide;

  const validMovesAsPositions = useMemo(
    () => validMoves.map(fp => ({ row: fp.ring, col: fp.spoke })),
    [validMoves]
  );

  const afterAction = useCallback((newPieces: Piece[], gainExtraTurn: boolean) => {
    // Connection win check for both colors (mover first).
    const moverColor = playerToColor(currentPlayer);
    const moverConn = logic.checkConnection(newPieces, moverColor);
    if (moverConn.connected) {
      setConnectionPath(moverConn.path);
      setGameResult(currentPlayer === 'defender' ? 'defender-wins' : 'attacker-wins');
      return;
    }
    const otherColor: Color = moverColor === 'white' ? 'black' : 'white';
    const otherConn = logic.checkConnection(newPieces, otherColor);
    if (otherConn.connected) {
      setConnectionPath(otherConn.path);
      const winner = colorToPlayer(otherColor);
      setGameResult(winner === 'defender' ? 'defender-wins' : 'attacker-wins');
      return;
    }
    setConnectionPath([]);

    if (!gainExtraTurn) {
      setCurrentPlayer(prev => (prev === 'attacker' ? 'defender' : 'attacker'));
    }
  }, [currentPlayer, logic]);

  const placePawn = useCallback((at: FidchellPosition) => {
    if (gameResult) return false;
    if (pawnsInHand[currentPlayer] <= 0) return false;
    if (at.ring === 0) return false; // never place on Navel Stone
    if (pieces.some(p => p.circularPosition?.ring === at.ring && p.circularPosition?.spoke === at.spoke)) {
      return false;
    }

    const color = playerToColor(currentPlayer);
    const id = nextIdRef.current++;
    const { newPieces, captured, placed } = logic.applyPlacement(pieces, color, at, id);

    playMove();
    if (captured.length > 0) playCapture();

    const move: Move = {
      piece: placed,
      from: { row: -1, col: -1 }, // sentinel: from hand
      to: { row: at.ring, col: at.spoke },
      captured,
      notation: `place ${color[0].toUpperCase()}@(${at.ring},${at.spoke})${captured.length ? `×${captured.length}` : ''}`,
    };

    setPieces(newPieces);
    setMoveHistory(prev => [...prev, move]);
    setPawnsInHand(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] - 1 }));
    setSelectedPiece(null);
    setValidMoves([]);

    afterAction(newPieces, captured.length > 0);
    return true;
  }, [gameResult, pawnsInHand, currentPlayer, pieces, logic, playMove, playCapture, afterAction]);

  const selectPiece = useCallback((piece: Piece | null) => {
    if (!piece) {
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }
    if (gameResult) return;
    // Only selectable during the mover's movement phase.
    if (pawnsInHand[currentPlayer] > 0) return;

    const color = playerToColor(currentPlayer);
    const pieceColor: Color = piece.type === 'attacker' ? 'black' : 'white';
    if (pieceColor !== color) return;

    playSelect();
    setSelectedPiece(piece);
    setValidMoves(logic.getValidMoves(piece, pieces));
  }, [gameResult, pawnsInHand, currentPlayer, logic, pieces, playSelect]);

  const makeMove = useCallback((to: FidchellPosition): boolean => {
    if (!selectedPiece || !selectedPiece.circularPosition) return false;
    if (gameResult) return false;
    if (!validMoves.some(m => m.ring === to.ring && m.spoke === to.spoke)) return false;

    const { newPieces, captured } = logic.applyMove(pieces, selectedPiece, to);
    playMove();
    if (captured.length > 0) playCapture();

    const move: Move = {
      piece: selectedPiece,
      from: { row: selectedPiece.circularPosition.ring, col: selectedPiece.circularPosition.spoke },
      to: { row: to.ring, col: to.spoke },
      captured,
      notation: `(${selectedPiece.circularPosition.ring},${selectedPiece.circularPosition.spoke})→(${to.ring},${to.spoke})${captured.length ? `×${captured.length}` : ''}`,
    };

    setPieces(newPieces);
    setMoveHistory(prev => [...prev, move]);
    setSelectedPiece(null);
    setValidMoves([]);

    afterAction(newPieces, captured.length > 0);
    return true;
  }, [selectedPiece, gameResult, validMoves, pieces, logic, playMove, playCapture, afterAction]);

  const handleNodeClick = useCallback((pos: FidchellPosition) => {
    if (gameResult) return;
    if (pawnsInHand[currentPlayer] > 0) {
      placePawn(pos);
      return;
    }
    if (selectedPiece) makeMove(pos);
  }, [gameResult, pawnsInHand, currentPlayer, selectedPiece, placePawn, makeMove]);

  const handlePieceClick = useCallback((pieceId: string) => {
    if (gameResult) return;
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    if (selectedPiece?.id === pieceId) {
      selectPiece(null);
    } else {
      selectPiece(piece);
    }
  }, [gameResult, pieces, selectedPiece, selectPiece]);

  const resetGame = useCallback((_side: Player) => {
    nextIdRef.current = 0;
    setPieces([]);
    setCurrentPlayer('attacker');
    setSelectedPiece(null);
    setValidMoves([]);
    setMoveHistory([]);
    setGameResult(null);
    setConnectionPath([]);
    setPawnsInHand({
      defender: FIDCHELL_CONFIG.piecesPerSide,
      attacker: FIDCHELL_CONFIG.piecesPerSide,
    });
  }, []);

  const gameState: GameState = {
    pieces,
    currentPlayer,
    moveHistory,
    selectedPiece,
    validMoves: validMovesAsPositions,
    gameResult,
    boardSize: 7,
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
    handleNodeClick,
    handlePieceClick,
    connectionPath,
    phase,
    pawnsInHand,
  };
}

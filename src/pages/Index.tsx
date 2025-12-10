import { useState, useEffect, useCallback } from 'react';
import { BoardSize, Player, Position } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { useAI } from '@/hooks/useAI';
import { Board } from '@/components/game/Board';
import { TurnIndicator } from '@/components/game/TurnIndicator';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { VictoryModal } from '@/components/game/VictoryModal';
import { RulesModal } from '@/components/game/RulesModal';
import { GameSetup } from '@/components/game/GameSetup';

export default function Index() {
  const [gameStarted, setGameStarted] = useState(false);
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [showRules, setShowRules] = useState(false);
  const [showVictory, setShowVictory] = useState(true);

  const { gameState, selectPiece, makeMove, undoMove, resetGame } = useGameState(boardSize, playerSide);
  const ai = useAI(boardSize);

  const handleStartGame = (size: BoardSize, side: Player) => {
    setBoardSize(size);
    setPlayerSide(side);
    setGameStarted(true);
    resetGame(size, side);
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setShowVictory(true);
  };

  const handleSquareClick = useCallback((position: Position) => {
    if (!gameState.isPlayerTurn || gameState.gameResult) return;

    if (gameState.selectedPiece) {
      const moveSuccess = makeMove(position);
      if (!moveSuccess) {
        const pieceAtPos = gameState.pieces.find(
          p => p.position.row === position.row && p.position.col === position.col
        );
        if (pieceAtPos) {
          selectPiece(pieceAtPos);
        } else {
          selectPiece(null);
        }
      }
    }
  }, [gameState.isPlayerTurn, gameState.gameResult, gameState.selectedPiece, gameState.pieces, makeMove, selectPiece]);

  const handlePieceClick = useCallback((pieceId: string) => {
    if (!gameState.isPlayerTurn || gameState.gameResult) return;

    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (gameState.selectedPiece?.id === pieceId) {
      selectPiece(null);
    } else {
      selectPiece(piece);
    }
  }, [gameState.isPlayerTurn, gameState.gameResult, gameState.pieces, gameState.selectedPiece, selectPiece]);

  useEffect(() => {
    if (!gameStarted || gameState.gameResult || gameState.isPlayerTurn) return;

    const aiSide: Player = playerSide === 'attacker' ? 'defender' : 'attacker';
    
    const timeoutId = setTimeout(() => {
      const bestMove = ai.getBestMove(gameState.pieces, aiSide);
      if (bestMove) {
        selectPiece(bestMove.piece);
        setTimeout(() => {
          makeMove(bestMove.to);
        }, 300);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [gameStarted, gameState.isPlayerTurn, gameState.gameResult, gameState.pieces, playerSide, ai, selectPiece, makeMove]);

  useEffect(() => {
    if (gameState.gameResult) {
      setShowVictory(true);
    }
  }, [gameState.gameResult]);

  if (!gameStarted) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-['Cinzel'] text-primary tracking-wide">Hnefatafl</h1>
          <p className="text-muted-foreground text-sm mt-1">The Viking Game</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          <div className="w-full lg:w-48 space-y-4 order-2 lg:order-1">
            <TurnIndicator currentPlayer={gameState.currentPlayer} isPlayerTurn={gameState.isPlayerTurn} playerSide={playerSide} />
            <GameControls onUndo={undoMove} onNewGame={handleNewGame} onShowRules={() => setShowRules(true)} canUndo={gameState.moveHistory.length >= 2 && gameState.isPlayerTurn} isGameOver={!!gameState.gameResult} />
          </div>

          <div className="order-1 lg:order-2">
            <Board gameState={gameState} onSquareClick={handleSquareClick} onPieceClick={handlePieceClick} />
          </div>

          <div className="w-full lg:w-48 h-64 lg:h-96 order-3">
            <MoveHistory moves={gameState.moveHistory} />
          </div>
        </div>

        <div className="flex justify-center gap-8 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--piece-attacker))]" />
            <span>Attackers: {gameState.pieces.filter(p => p.type === 'attacker').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--piece-defender))]" />
            <span>Defenders: {gameState.pieces.filter(p => p.type === 'defender' || p.type === 'king').length}</span>
          </div>
        </div>
      </div>

      <VictoryModal result={showVictory ? gameState.gameResult : null} playerSide={playerSide} onPlayAgain={handleNewGame} onClose={() => setShowVictory(false)} />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

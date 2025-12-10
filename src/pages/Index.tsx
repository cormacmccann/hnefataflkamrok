import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardSize, Player, Position } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { useAI } from '@/hooks/useAI';
import { Scene3D } from '@/components/game/Scene3D';
import { TurnIndicator } from '@/components/game/TurnIndicator';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { VictoryModal } from '@/components/game/VictoryModal';
import { RulesModal } from '@/components/game/RulesModal';
import { GameSetup } from '@/components/game/GameSetup';
import { MusicPlayer } from '@/components/game/MusicPlayer';
import hnefataflLogo from '@/assets/hnefatafl-logo.png';

export default function Index() {
  const [gameStarted, setGameStarted] = useState(false);
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [showRules, setShowRules] = useState(false);
  const [showVictory, setShowVictory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

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
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fullscreen 3D Scene */}
      <Scene3D 
        gameState={gameState} 
        onSquareClick={handleSquareClick} 
        onPieceClick={handlePieceClick} 
      />

      {/* Header Overlay with Logo and Music */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
      >
        <div className="flex-1" />
        <img 
          src={hnefataflLogo} 
          alt="Hnefatafl" 
          className="h-12 sm:h-16 drop-shadow-lg"
        />
        <div className="flex-1 flex justify-end">
          <MusicPlayer />
        </div>
      </motion.header>

      {/* Left Panel - Turn Indicator & Controls */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-20 left-4 z-20 space-y-3 w-48"
      >
        <TurnIndicator 
          currentPlayer={gameState.currentPlayer} 
          isPlayerTurn={gameState.isPlayerTurn} 
          playerSide={playerSide} 
        />
        <GameControls 
          onUndo={undoMove} 
          onNewGame={handleNewGame} 
          onShowRules={() => setShowRules(true)} 
          canUndo={gameState.moveHistory.length >= 2 && gameState.isPlayerTurn} 
          isGameOver={!!gameState.gameResult} 
        />
      </motion.div>

      {/* Right Panel - Move History (toggleable on mobile) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-20 right-4 z-20 hidden lg:block w-48 h-80"
      >
        <MoveHistory moves={gameState.moveHistory} />
      </motion.div>

      {/* Mobile History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="fixed top-20 right-4 z-20 lg:hidden bg-card/90 backdrop-blur p-2 rounded-lg border border-border"
      >
        <span className="text-sm font-['Cinzel']">📜 History</span>
      </button>

      {/* Mobile History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-32 right-4 z-30 w-48 h-64 lg:hidden"
          >
            <MoveHistory moves={gameState.moveHistory} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-4 text-sm"
      >
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur px-4 py-2 rounded-full border border-border shadow-lg">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--piece-attacker))]" />
          <span className="text-foreground/90">Attackers: {gameState.pieces.filter(p => p.type === 'attacker').length}</span>
        </div>
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur px-4 py-2 rounded-full border border-border shadow-lg">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--piece-defender))]" />
          <span className="text-foreground/90">Defenders: {gameState.pieces.filter(p => p.type === 'defender' || p.type === 'king').length}</span>
        </div>
      </motion.div>

      {/* Modals */}
      <VictoryModal 
        result={showVictory ? gameState.gameResult : null} 
        playerSide={playerSide} 
        onPlayAgain={handleNewGame} 
        onClose={() => setShowVictory(false)} 
      />
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

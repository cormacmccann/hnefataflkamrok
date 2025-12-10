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
import vikingBackground from '@/assets/viking-background.jpg';

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
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed p-4"
      style={{ backgroundImage: `url(${vikingBackground})` }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        <header className="text-center mb-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-['Cinzel'] text-primary tracking-wide drop-shadow-lg"
          >
            Hnefatafl
          </motion.h1>
          <p className="text-muted-foreground text-sm mt-1">The Viking Game</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-56 space-y-4 order-2 lg:order-1"
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

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <Scene3D 
              gameState={gameState} 
              onSquareClick={handleSquareClick} 
              onPieceClick={handlePieceClick} 
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-56 h-64 lg:h-96 order-3"
          >
            <MoveHistory moves={gameState.moveHistory} />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-8 mt-6 text-sm"
        >
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--piece-attacker))]" />
            <span>Attackers: {gameState.pieces.filter(p => p.type === 'attacker').length}</span>
          </div>
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-4 h-4 rounded-full bg-[hsl(var(--piece-defender))]" />
            <span>Defenders: {gameState.pieces.filter(p => p.type === 'defender' || p.type === 'king').length}</span>
          </div>
        </motion.div>
      </motion.div>

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

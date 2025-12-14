import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardSize, Player, Position, AIDifficulty, GameMode, BoardTheme } from '@/types/game';
import { GAME_VARIANTS } from '@/constants/game';
import { useGameState } from '@/hooks/useGameState';
import { useAI } from '@/hooks/useAI';
import { useVolumeControl } from '@/hooks/useVolumeControl';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Scene3D } from '@/components/game/Scene3D';
import { TurnIndicator } from '@/components/game/TurnIndicator';
import { MoveHistory } from '@/components/game/MoveHistory';
import { GameControls } from '@/components/game/GameControls';
import { VictoryModal } from '@/components/game/VictoryModal';
import { RulesModal } from '@/components/game/RulesModal';
import { GameSetup } from '@/components/game/GameSetup';
import { VolumeControl } from '@/components/game/VolumeControl';
import { LogoIntro } from '@/components/game/LogoIntro';
import { DemoMovePopup } from '@/components/game/DemoMovePopup';
import hnefataflLogo from '@/assets/hnefatafl-logo.png';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(GAME_VARIANTS[1].theme);
  const [showRules, setShowRules] = useState(false);
  const [showVictory, setShowVictory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const { musicVolume, sfxVolume, updateMusicVolume, updateSfxVolume } = useVolumeControl();
  const { isPlaying, startMusic } = useMusicPlayer(musicVolume);

  const handleIntroComplete = () => {
    setShowIntro(false);
    startMusic();
  };

  const { gameState, selectPiece, makeMove, undoMove, resetGame, logic, capturePositions, clearCapturePositions } = useGameState(boardSize, playerSide, sfxVolume);
  const ai = useAI(boardSize, difficulty);
  const { demoState, setDemoMove, hidePopup, startDemo, stopDemo } = useDemoMode(boardSize, difficulty);

  const handleStartGame = (size: BoardSize, side: Player, diff: AIDifficulty, mode: GameMode, variantId: string) => {
    const variant = GAME_VARIANTS.find(v => v.id === variantId) || GAME_VARIANTS[1];
    setBoardSize(size);
    setPlayerSide(side);
    setDifficulty(diff);
    setGameMode(mode);
    setBoardTheme(variant.theme);
    setGameStarted(true);
    resetGame(size, side);
    startMusic();
    
    if (mode === 'demo') {
      startDemo();
    }
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setShowVictory(true);
    setGameMode('play');
    stopDemo();
  };

  const handleSquareClick = useCallback((position: Position) => {
    if (gameMode === 'demo') return; // No interaction in demo mode
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
  }, [gameMode, gameState.isPlayerTurn, gameState.gameResult, gameState.selectedPiece, gameState.pieces, makeMove, selectPiece]);

  const handlePieceClick = useCallback((pieceId: string) => {
    if (gameMode === 'demo') return; // No interaction in demo mode
    if (!gameState.isPlayerTurn || gameState.gameResult) return;

    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (gameState.selectedPiece?.id === pieceId) {
      selectPiece(null);
    } else {
      selectPiece(piece);
    }
  }, [gameMode, gameState.isPlayerTurn, gameState.gameResult, gameState.pieces, gameState.selectedPiece, selectPiece]);

  // Demo mode: AI plays both sides
  useEffect(() => {
    if (!gameStarted || gameState.gameResult) return;
    
    if (gameMode === 'demo') {
      // In demo mode, AI plays for both sides
      const currentPlayer = gameState.currentPlayer;
      
      const timeoutId = setTimeout(() => {
        const bestMove = ai.getBestMove(gameState.pieces, currentPlayer);
        if (bestMove) {
          // Generate explanation
          const isKingMove = bestMove.piece.type === 'king';
          const corners = [
            { row: 0, col: 0 },
            { row: 0, col: boardSize - 1 },
            { row: boardSize - 1, col: 0 },
            { row: boardSize - 1, col: boardSize - 1 },
          ];
          const currentMinDist = Math.min(...corners.map(c => 
            Math.abs(bestMove.piece.position.row - c.row) + Math.abs(bestMove.piece.position.col - c.col)
          ));
          const newMinDist = Math.min(...corners.map(c => 
            Math.abs(bestMove.to.row - c.row) + Math.abs(bestMove.to.col - c.col)
          ));
          const movesTowardsCorner = isKingMove && newMinDist < currentMinDist;
          
          let explanation = '';
          if (isKingMove) {
            explanation = movesTowardsCorner 
              ? "The King advances toward a corner escape square."
              : "The King repositions to create escape opportunities.";
          } else if (currentPlayer === 'attacker') {
            explanation = "Attackers tighten the siege around the King's forces.";
          } else {
            explanation = "Defenders maneuver to protect the King's escape route.";
          }
          
          setDemoMove(bestMove.piece, bestMove.to, currentPlayer, explanation);
          selectPiece(bestMove.piece);
          
          setTimeout(() => {
            makeMove(bestMove.to);
            setTimeout(() => hidePopup(), 1500);
          }, 1200);
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    } else {
      // Normal play mode: AI plays opponent only
      if (gameState.isPlayerTurn) return;
      
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
    }
  }, [gameStarted, gameMode, gameState.currentPlayer, gameState.isPlayerTurn, gameState.gameResult, gameState.pieces, playerSide, boardSize, ai, selectPiece, makeMove, setDemoMove, hidePopup]);

  useEffect(() => {
    if (gameState.gameResult) {
      setShowVictory(true);
    }
  }, [gameState.gameResult]);

  if (showIntro) {
    return <LogoIntro onComplete={handleIntroComplete} />;
  }

  if (!gameStarted) {
    return (
      <GameSetup 
        onStartGame={handleStartGame}
        musicVolume={musicVolume}
        sfxVolume={sfxVolume}
        onMusicVolumeChange={updateMusicVolume}
        onSfxVolumeChange={updateSfxVolume}
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fullscreen 3D Scene */}
      <Scene3D 
        gameState={gameState} 
        onSquareClick={handleSquareClick} 
        onPieceClick={handlePieceClick}
        capturePositions={capturePositions}
        onCaptureComplete={clearCapturePositions}
        theme={boardTheme}
      />

      {/* Header Overlay with Logo and Volume */}
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
          <VolumeControl
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            onMusicVolumeChange={updateMusicVolume}
            onSfxVolumeChange={updateSfxVolume}
          />
        </div>
      </motion.header>

      {/* Left Panel - Turn Indicator & Controls */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-20 left-4 z-20 space-y-3 w-48"
      >
        {!gameMode || gameMode === 'play' ? (
          <>
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
          </>
        ) : (
          <div className="bg-card/90 backdrop-blur p-3 rounded-lg border border-border shadow-lg">
            <div className="text-center font-['Cinzel'] text-primary text-sm mb-2">Demo Mode</div>
            <p className="text-xs text-muted-foreground text-center mb-3">Watch the AI play both sides</p>
            <button 
              onClick={handleNewGame}
              className="w-full text-sm bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors"
            >
              Exit Demo
            </button>
          </div>
        )}
      </motion.div>

      {/* Right Panel - Move History - positioned below header/volume */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed top-24 right-4 z-10 hidden lg:block w-48 h-72"
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

      {/* Demo Mode Move Popup */}
      {gameMode === 'demo' && (
        <DemoMovePopup
          piece={demoState.currentMove.piece}
          to={demoState.currentMove.to}
          player={demoState.currentMove.player}
          explanation={demoState.currentMove.explanation}
          visible={demoState.showPopup}
        />
      )}

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

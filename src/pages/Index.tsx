import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardSize, Player, Position, AIDifficulty, GameMode, BoardTheme, FidchellPosition, BoardType } from '@/types/game';
import { GAME_VARIANTS } from '@/constants/game';
import { useGameState } from '@/hooks/useGameState';
import { useAI } from '@/hooks/useAI';
import { useVolumeControl } from '@/hooks/useVolumeControl';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useFidchellState } from '@/hooks/useFidchellState';
import { useFidchellAI } from '@/hooks/useFidchellAI';
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
import { useLanguage } from '@/i18n/LanguageContext';
import hnefataflLogo from '@/assets/hnefatafl-logo.png';
import builtwithImg from '@/assets/builtwith.png';
import kamrokLogo from '@/assets/kamrok-logo.png';

export default function Index() {
  const { t } = useLanguage();
  const [showIntro, setShowIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(GAME_VARIANTS[1].theme);
  const [boardType, setBoardType] = useState<BoardType>('square');
  const [variantId, setVariantId] = useState<string>('tablut');
  const [showRules, setShowRules] = useState(false);
  const [showVictory, setShowVictory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const { musicVolume, sfxVolume, updateMusicVolume, updateSfxVolume } = useVolumeControl();
  const { isPlaying, startMusic } = useMusicPlayer(musicVolume);

  const handleIntroComplete = () => {
    setShowIntro(false);
    startMusic();
  };

  // Standard Tafl game state (for square boards)
  const taflState = useGameState(boardSize, playerSide, sfxVolume);
  const taflAI = useAI(boardSize, difficulty);
  
  // Fidchell game state (for circular board)
  const fidchellState = useFidchellState(playerSide, sfxVolume);
  const fidchellAI = useFidchellAI(difficulty);
  
  // Select the appropriate game state based on board type
  const isFidchell = boardType === 'circular';
  const gameState = isFidchell ? fidchellState.gameState : taflState.gameState;
  const selectPiece = isFidchell ? fidchellState.selectPiece : taflState.selectPiece;
  
  const { demoState, setDemoMove, hidePopup, startDemo, stopDemo } = useDemoMode(boardSize, difficulty);

  const handleStartGame = (size: BoardSize, side: Player, diff: AIDifficulty, mode: GameMode, selectedVariantId: string) => {
    const variant = GAME_VARIANTS.find(v => v.id === selectedVariantId) || GAME_VARIANTS[1];
    setBoardSize(size);
    setPlayerSide(side);
    setDifficulty(diff);
    setGameMode(mode);
    setBoardTheme(variant.theme);
    setBoardType(variant.boardType);
    setVariantId(selectedVariantId);
    setGameStarted(true);
    
    if (variant.boardType === 'circular') {
      fidchellState.resetGame(side);
    } else {
      taflState.resetGame(size, side);
    }
    
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

  // Handle move for both board types
  const makeMove = useCallback((position: Position) => {
    if (isFidchell) {
      const fidchellPos: FidchellPosition = { ring: position.row, col: position.col } as any;
      return fidchellState.makeMove({ ring: position.row, spoke: position.col });
    }
    return taflState.makeMove(position);
  }, [isFidchell, fidchellState, taflState]);

  const handleSquareClick = useCallback((position: Position) => {
    if (gameMode === 'demo') return;
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
    if (gameMode === 'demo') return;
    if (!gameState.isPlayerTurn || gameState.gameResult) return;

    const piece = gameState.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (gameState.selectedPiece?.id === pieceId) {
      selectPiece(null);
    } else {
      selectPiece(piece);
    }
  }, [gameMode, gameState.isPlayerTurn, gameState.gameResult, gameState.pieces, gameState.selectedPiece, selectPiece]);

  // Demo mode & AI: plays both sides
  useEffect(() => {
    if (!gameStarted || gameState.gameResult) return;
    
    // Fidchell uses different AI
    if (isFidchell) {
      if (gameMode === 'demo') {
        const currentPlayer = gameState.currentPlayer;
        const timeoutId = setTimeout(() => {
          const bestMove = fidchellAI.getBestMove(gameState.pieces, currentPlayer);
          if (bestMove && bestMove.piece.circularPosition) {
            const explanation = currentPlayer === 'defender' 
              ? t.defendersManeuver
              : t.attackersSiege;
            setDemoMove(bestMove.piece, { row: bestMove.to.ring, col: bestMove.to.spoke }, currentPlayer, explanation);
            selectPiece(bestMove.piece);
            
            setTimeout(() => {
              fidchellState.makeMove(bestMove.to);
              setTimeout(() => hidePopup(), 1500);
            }, 1200);
          }
        }, 2000);
        return () => clearTimeout(timeoutId);
      } else {
        if (gameState.isPlayerTurn) return;
        const aiSide: Player = playerSide === 'attacker' ? 'defender' : 'attacker';
        const timeoutId = setTimeout(() => {
          const bestMove = fidchellAI.getBestMove(gameState.pieces, aiSide);
          if (bestMove) {
            selectPiece(bestMove.piece);
            setTimeout(() => {
              fidchellState.makeMove(bestMove.to);
            }, 300);
          }
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
    
    // Standard Tafl AI
    if (gameMode === 'demo') {
      const currentPlayer = gameState.currentPlayer;
      
      const timeoutId = setTimeout(() => {
        const bestMove = taflAI.getBestMove(gameState.pieces, currentPlayer);
        if (bestMove) {
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
            explanation = movesTowardsCorner ? t.kingAdvances : t.kingRepositions;
          } else if (currentPlayer === 'attacker') {
            explanation = t.attackersSiege;
          } else {
            explanation = t.defendersManeuver;
          }
          
          setDemoMove(bestMove.piece, bestMove.to, currentPlayer, explanation);
          selectPiece(bestMove.piece);
          
          setTimeout(() => {
            taflState.makeMove(bestMove.to);
            setTimeout(() => hidePopup(), 1500);
          }, 1200);
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    } else {
      if (gameState.isPlayerTurn) return;
      
      const aiSide: Player = playerSide === 'attacker' ? 'defender' : 'attacker';
      
      const timeoutId = setTimeout(() => {
        const bestMove = taflAI.getBestMove(gameState.pieces, aiSide);
        if (bestMove) {
          selectPiece(bestMove.piece);
          setTimeout(() => {
            taflState.makeMove(bestMove.to);
          }, 300);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [gameStarted, gameMode, gameState.currentPlayer, gameState.isPlayerTurn, gameState.gameResult, gameState.pieces, playerSide, boardSize, isFidchell, taflAI, fidchellAI, selectPiece, taflState, fidchellState, setDemoMove, hidePopup, t]);

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
        capturePositions={taflState.capturePositions}
        onCaptureComplete={taflState.clearCapturePositions}
        theme={boardTheme}
        boardType={boardType}
        connectionPath={isFidchell ? fidchellState.connectionPath : undefined}
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
          alt={t.appName}
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
        className="fixed top-20 left-2 sm:left-4 z-20 space-y-2 sm:space-y-3 w-32 sm:w-48"
      >
        {!gameMode || gameMode === 'play' ? (
          <>
            <TurnIndicator 
              currentPlayer={gameState.currentPlayer} 
              isPlayerTurn={gameState.isPlayerTurn} 
              playerSide={playerSide} 
            />
            <GameControls 
              onUndo={isFidchell ? () => {} : taflState.undoMove} 
              onNewGame={handleNewGame} 
              onShowRules={() => setShowRules(true)} 
              canUndo={!isFidchell && gameState.moveHistory.length >= 2 && gameState.isPlayerTurn} 
              isGameOver={!!gameState.gameResult} 
            />
          </>
        ) : (
          <div className="bg-card/90 backdrop-blur p-3 rounded-lg border border-border shadow-lg">
            <div className="text-center font-['Cinzel'] text-primary text-sm mb-2">{t.demoMode}</div>
            <p className="text-xs text-muted-foreground text-center mb-3">{t.watchAI}</p>
            <button 
              onClick={handleNewGame}
              className="w-full text-sm bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-lg transition-colors"
            >
              {t.exitDemo}
            </button>
          </div>
        )}
      </motion.div>

      {/* Right Panel - Move History */}
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
        <span className="text-sm font-['Cinzel']">📜 {t.moveHistory}</span>
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
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-4 text-xs sm:text-sm"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 bg-card/90 backdrop-blur px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border shadow-lg">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(var(--piece-attacker))]" />
          <span className="text-foreground/90">{t.attackers}: {gameState.pieces.filter(p => p.type === 'attacker').length}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-card/90 backdrop-blur px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border shadow-lg">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[hsl(var(--piece-defender))]" />
          <span className="text-foreground/90">{t.defenders}: {gameState.pieces.filter(p => p.type === 'defender' || p.type === 'king').length}</span>
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

      {/* Kamrok logo */}
      <a
        href="https://kamrok.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 left-3 z-30"
      >
        <img src={kamrokLogo} alt="Kamrok" className="h-5 sm:h-6 w-auto drop-shadow-lg opacity-70 hover:opacity-100 transition-opacity" />
      </a>

      {/* Built with Lovable badge */}
      <a
        href="https://lovable.dev/invite/8MUK1UP"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 z-30"
      >
        <img src={builtwithImg} alt="Built with Lovable" className="h-5 sm:h-6 w-auto drop-shadow-lg opacity-70 hover:opacity-100 transition-opacity" />
      </a>
    </div>
  );
}
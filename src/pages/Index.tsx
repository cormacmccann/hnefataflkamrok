import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Maximize2, Minimize2, RotateCcw, Shield, Swords, Users } from 'lucide-react';
import type { BoardSize, Player, Position, AIDifficulty, GameMode } from '@/types/game';
import { GAME_VARIANTS } from '@/constants/game';
import { useGameState } from '@/hooks/useGameState';
import { useAI } from '@/hooks/useAI';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useVolumeControl } from '@/hooks/useVolumeControl';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useFidchellState } from '@/hooks/useFidchellState';
import { useFidchellAI } from '@/hooks/useFidchellAI';
import { GameSetup } from '@/components/game/GameSetup';
import { LogoIntro } from '@/components/game/LogoIntro';
import { BrandMark } from '@/components/game/BrandMark';
import { TaflBoard2D } from '@/components/game/TaflBoard2D';
import { BoardViewToggle, type BoardView } from '@/components/game/BoardViewToggle';
import { MoveHistory } from '@/components/game/MoveHistory';
import { LanguageSelector } from '@/components/game/LanguageSelector';
import { VolumeControl } from '@/components/game/VolumeControl';
import { VictoryModal } from '@/components/game/VictoryModal';
import { RulesModal } from '@/components/game/RulesModal';
import { ERA_IMAGES } from '@/components/ancient/EraBackdrop';
import '@/components/ancient/ancient-games.css';

const Scene3D = lazy(() => import('@/components/game/Scene3D').then(m => ({ default: m.Scene3D })));

export default function Index() {
  const { tr } = useUiTranslation();
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('tafl-intro-seen'));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('play');
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [variantId, setVariantId] = useState('tablut');
  const [view, setView] = useState<BoardView>(() => localStorage.getItem('tafl-board-view') === '2d' ? '2d' : '3d');
  const [showRules, setShowRules] = useState(false);
  const [showVictory, setShowVictory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isPassAndPlay, setIsPassAndPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const roomRef = useRef<HTMLDivElement>(null);
  const variant = GAME_VARIANTS.find(v => v.id === variantId) || GAME_VARIANTS[2];
  const isFidchell = variant.boardType === 'circular';
  const { musicVolume, sfxVolume, updateMusicVolume, updateSfxVolume, toggleMute } = useVolumeControl();
  const { startMusic } = useMusicPlayer(musicVolume);
  const tafl = useGameState(boardSize, playerSide, sfxVolume, variant.defaultRules, variantId);
  const taflAI = useAI(boardSize, difficulty, variant.defaultRules, variantId);
  const fidchell = useFidchellState(playerSide, sfxVolume);
  const fidchellAI = useFidchellAI(difficulty);
  const gameState = isFidchell ? fidchell.gameState : tafl.gameState;
  const aiRef = useRef({ tafl, taflAI, fidchell, fidchellAI });
  aiRef.current = { tafl, taflAI, fidchell, fidchellAI };

  const finishIntro = useCallback(() => { sessionStorage.setItem('tafl-intro-seen', '1'); setShowIntro(false); }, []);
  const setBoardView = (next: BoardView) => { setView(next); localStorage.setItem('tafl-board-view', next); };
  const handleStartGame = (size: BoardSize, side: Player, diff: AIDifficulty, mode: GameMode, id: string, local = false) => {
    const selected = GAME_VARIANTS.find(v => v.id === id) || GAME_VARIANTS[2];
    setBoardSize(size); setPlayerSide(side); setDifficulty(diff); setGameMode(mode); setVariantId(selected.id); setIsPassAndPlay(local); setGameStarted(true); setShowVictory(true); setShowHistory(false);
    if (selected.boardType === 'circular') fidchell.resetGame(side);
    else tafl.resetGame(size, side, selected.defaultRules, selected.id);
    startMusic();
  };
  const handleStartPassAndPlay = (id: string) => { const selected = GAME_VARIANTS.find(v => v.id === id) || GAME_VARIANTS[2]; handleStartGame(selected.boardSize, 'attacker', difficulty, 'play', id, true); };
  const backToCollection = () => { setGameStarted(false); setShowRules(false); };
  const canInteract = gameMode !== 'demo' && !gameState.gameResult && (isPassAndPlay || gameState.isPlayerTurn);
  const handleSquareClick = (pos: Position) => {
    if (!canInteract) return;
    if (isFidchell) { fidchell.handleNodeClick({ ring: pos.row, spoke: pos.col }); return; }
    if (gameState.selectedPiece && !tafl.makeMove(pos)) tafl.selectPiece(null);
  };
  const handlePieceClick = (id: string) => {
    if (!canInteract) return;
    if (isFidchell) { fidchell.handlePieceClick(id); return; }
    const piece = gameState.pieces.find(p => p.id === id);
    if (piece) tafl.selectPiece(gameState.selectedPiece?.id === id ? null : piece);
  };

  // One cancellable action per turn; execute against current state atomically.
  useEffect(() => {
    if (!gameStarted || gameState.gameResult || isPassAndPlay || (gameMode !== 'demo' && gameState.isPlayerTurn)) return;
    const timer = window.setTimeout(() => {
      const live = aiRef.current;
      if (isFidchell) {
        const action = live.fidchell.phase === 'placement' ? live.fidchellAI.getBestPlacement(gameState.pieces, gameState.currentPlayer) : live.fidchellAI.getBestMove(gameState.pieces, gameState.currentPlayer);
        if (action?.kind === 'place') live.fidchell.handleNodeClick(action.to);
        else if (action?.piece) live.fidchell.makeMove(action.to, action.piece.id);
      } else {
        const action = live.taflAI.getBestMove(gameState.pieces, gameState.currentPlayer);
        if (action) live.tafl.makeMove(action.to, action.piece.id);
      }
    }, gameMode === 'demo' ? 1300 : 550);
    return () => window.clearTimeout(timer);
  }, [gameStarted, gameState.gameResult, gameState.pieces, gameState.currentPlayer, gameState.isPlayerTurn, isPassAndPlay, gameMode, isFidchell]);

  useEffect(() => { if (gameState.gameResult) setShowVictory(true); }, [gameState.gameResult]);
  useEffect(() => { const update = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', update); return () => document.removeEventListener('fullscreenchange', update); }, []);
  const toggleFullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { /* The viewport layout remains usable when fullscreen is unavailable. */ } };

  if (showIntro) return <LogoIntro onComplete={finishIntro} />;
  if (!gameStarted) return <GameSetup onStartGame={handleStartGame} onStartPassAndPlay={handleStartPassAndPlay} musicVolume={musicVolume} sfxVolume={sfxVolume} onMusicVolumeChange={updateMusicVolume} onSfxVolumeChange={updateSfxVolume} onToggleMute={toggleMute} />;
  const sideName = (side: Player) => tr(isFidchell ? side === 'attacker' ? 'Ebony' : 'Ivory' : side === 'attacker' ? 'Attackers' : 'Defenders');
  const status = gameState.gameResult ? 'The game is complete' : gameMode === 'demo' ? 'A game in motion' : isPassAndPlay ? tr('{side} to move', {side:sideName(gameState.currentPlayer)}) : gameState.isPlayerTurn ? 'Your move' : 'Your opponent is thinking…';
  const objective = isFidchell ? 'Connect the centre to the outer ring with an unbroken chain of your pawns.' : variant.defaultRules.edgeEscape ? 'The king wins by reaching any edge. The attackers must capture the king.' : 'Guide the king to a corner. The attackers must close the escape and capture the king.';
  const undoAvailable = !isFidchell && gameMode !== 'demo' && gameState.moveHistory.length >= (isPassAndPlay ? 1 : 2) && (isPassAndPlay || gameState.isPlayerTurn);
  return <div className="game-room" ref={roomRef}>
    <header className="game-room-header">
      <button className="back-to-collection" aria-label="The collection" onClick={backToCollection}><ArrowLeft size={17} /><span>The collection</span></button>
      <div className="game-room-identity"><BrandMark compact /><div><span className="eyebrow">{variant.origin}</span><h1>{variant.name}</h1></div></div>
      <div className="game-room-tools"><BoardViewToggle view={view} onChange={setBoardView} /><button className="room-icon-button fullscreen-button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button><VolumeControl musicVolume={musicVolume} sfxVolume={sfxVolume} onMusicVolumeChange={updateMusicVolume} onSfxVolumeChange={updateSfxVolume} onToggleMute={toggleMute} /></div>
    </header>
    <div className="game-room-status" role="status" aria-live="polite"><span>{status}</span>{isFidchell && <small>{fidchell.phase === 'placement' ? 'Place your pawns' : 'Move your pawns'} · Ivory {fidchell.pawnsInHand.defender} · Ebony {fidchell.pawnsInHand.attacker}</small>}</div>
    <main className="game-room-layout">
      <aside className="game-room-sidebar">
        <div className="room-turn-card" aria-live="polite"><span className="eyebrow">{gameMode === 'demo' ? 'Watching the table' : isPassAndPlay ? 'Shared table' : 'At the table'}</span><div className="room-current-player"><span className={`player-stone ${gameState.currentPlayer}`} /><h2>{sideName(gameState.currentPlayer)}</h2></div><p>{status}</p></div>
        <div className="room-objective"><span className="eyebrow">The object of play</span><p>{objective}</p>{!isFidchell && <span className="room-rule-detail">{variant.defaultRules.kingArmed ? 'The king may take part in captures.' : 'The king cannot take part in captures.'}</span>}</div>
        {isFidchell && <div className="room-placement"><span className="eyebrow">{fidchell.phase === 'placement' ? 'Place your pawns' : 'Move your pawns'}</span><p>In hand <strong>Ivory {fidchell.pawnsInHand.defender} · Ebony {fidchell.pawnsInHand.attacker}</strong></p></div>}
        <div className="room-actions"><button onClick={() => tafl.undoMove(isPassAndPlay ? 1 : 2)} disabled={!undoAvailable}><RotateCcw size={15} /> Undo {isPassAndPlay ? 'move' : 'turn'}</button><button onClick={() => setShowRules(true)}><BookOpen size={15} /> Rules of this table</button></div>
        <div className="room-provenance"><img src={ERA_IMAGES[variantId]} alt={`Artist's impression of ${variant.origin}`} /><span>{variant.era} · {variant.origin}</span><small>{isFidchell ? 'Modern connection interpretation' : variant.id === 'hnefatafl' ? 'Copenhagen core rules' : 'A modern playable reconstruction'}</small></div>
      </aside>
      <section className="game-board-stage" aria-label={`${variant.name} game board`}>
        {view === '2d' ? <TaflBoard2D gameState={gameState} onSquareClick={handleSquareClick} onPieceClick={handlePieceClick} placementMode={isFidchell && fidchell.phase === 'placement' && canInteract} /> : <BoardSceneBoundary onUse2D={() => setBoardView('2d')}><Suspense fallback={<div className="board-loading"><img src="/brand/tafl-emblem.png" alt="" width="70" height="70" /><p>Preparing the carved pieces…</p><button onClick={() => setBoardView('2d')}>Play in 2D now</button></div>}><Scene3D gameState={gameState} onSquareClick={handleSquareClick} onPieceClick={handlePieceClick} capturePositions={tafl.capturePositions} onCaptureComplete={tafl.clearCapturePositions} theme={variant.theme} boardType={variant.boardType} connectionPath={isFidchell ? fidchell.connectionPath : undefined} variantId={variantId} placementMode={isFidchell && fidchell.phase === 'placement' && canInteract} /></Suspense></BoardSceneBoundary>}
        <div className="board-stage-instruction">{gameState.selectedPiece ? 'Choose a marked destination' : isFidchell && fidchell.phase === 'placement' ? 'Choose an empty intersection' : view === '3d' ? 'Drag to look around · Scroll to zoom · Select a piece to move' : 'Select a piece · Choose a marked destination'}</div>
      </section>
      <aside className={`room-history ${showHistory ? 'room-history--open' : ''}`}><MoveHistory moves={gameState.moveHistory} /></aside>
    </main>
    <div className="game-room-toolbar"><button onClick={() => tafl.undoMove(isPassAndPlay ? 1 : 2)} disabled={!undoAvailable}><RotateCcw size={16} /><span>Undo move</span></button><button onClick={() => setShowRules(true)}><BookOpen size={16} /><span>Rules</span></button><button onClick={() => setShowHistory(!showHistory)} aria-expanded={showHistory}><ChevronDown size={16} /><span>Moves</span><small>{gameState.moveHistory.length}</small></button></div>
    <footer className="game-room-footer"><div className="room-piece-counts"><span><i className="player-stone attacker" />{sideName('attacker')} <strong>{gameState.pieces.filter(p => p.type === 'attacker').length}</strong></span><span><i className="player-stone defender" />{sideName('defender')} <strong>{gameState.pieces.filter(p => p.type !== 'attacker').length}</strong></span></div><span className="room-mode">{gameMode === 'demo' ? 'Computer vs computer' : isPassAndPlay ? 'Two players · one table' : `${tr('You play as')} ${sideName(playerSide)}`}</span><button className="mobile-history-toggle" onClick={() => setShowHistory(!showHistory)} aria-expanded={showHistory}>Moves {gameState.moveHistory.length}<ChevronDown size={14} /></button><span className="room-move-count">Move {gameState.moveHistory.length + 1}</span></footer>
    <div className="game-language-control"><LanguageSelector compact align="up" /></div>
    <VictoryModal circular={isFidchell} sharedTable={isPassAndPlay || gameMode === 'demo'} result={showVictory ? gameState.gameResult : null} playerSide={playerSide} onPlayAgain={backToCollection} onClose={() => setShowVictory(false)} />
    <RulesModal open={showRules} onClose={() => setShowRules(false)} variant={variant} />
  </div>;
}
class BoardSceneBoundary extends Component<{ children: ReactNode; onUse2D: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="board-loading"><p>The 3D board could not load on this device.</p><button onClick={this.props.onUse2D}>Continue in 2D</button></div> : this.props.children; }
}

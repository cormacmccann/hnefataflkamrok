import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, ChevronRight, Compass, Eye, Globe2, Shield, Swords, Users } from 'lucide-react';
import { BoardSize, Player, AIDifficulty, GameMode, GameVariant } from '@/types/game';
import { GAME_VARIANTS, BOARD_CONFIGS } from '@/constants/game';
import { LORE_GAMES, LoreGame } from '@/constants/loreGames';
const ChessGameModal = lazy(() => import('@/components/chess/ChessGameModal').then(m => ({ default: m.ChessGameModal })));
const AncientGameModal = lazy(() => import('@/components/ancient/AncientGameModal').then(m => ({ default: m.AncientGameModal })));
import { ERA_IMAGES } from '@/components/ancient/EraBackdrop';
import { ProfileChip } from '@/components/auth/ProfileChip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LanguageSelector } from './LanguageSelector';
import { BrandMark } from './BrandMark';
import { VolumeControl } from './VolumeControl';
const TaflHistoryMap = lazy(() => import('./TaflHistoryMap').then(m => ({ default: m.TaflHistoryMap })));
import { RulesModal } from './RulesModal';
import { SourcesPanel } from './SourcesPanel';
import kamrokLogo from '@/assets/kamrok-logo.png';

interface GameSetupProps {
  onStartGame: (size: BoardSize, side: Player, difficulty: AIDifficulty, mode: GameMode, variantId: string) => void;
  onStartPassAndPlay?: (variantId: string) => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}
const FAMILY_LABELS = { custodial: 'Strategy & capture', race: 'Race & chance', sowing: 'Sowing & strategy', territory: 'Connection & territory' };
const CLASSIC_GAMES = [{id:'chess',name:'Chess',region:'A world tradition',era:'Modern standard rules'}];
const SHORT_NAMES: Record<string, string> = { petteia: 'Petteia', latrunculorum: 'Latrunculorum', liubo: 'Liubo', mehen: 'Mehen' };

export function GameSetup(props: GameSetupProps) {
  const [selectedId, setSelectedId] = useState('hnefatafl');
  const gameListRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<'tafl' | 'world' | 'classics'>('tafl');
  const [playerSide, setPlayerSide] = useState<Player>('defender');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy');
  const [opponent, setOpponent] = useState<'ai' | 'local'>('ai');
  const [showMap, setShowMap] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showChess, setShowChess] = useState(false);
  const [loreGame, setLoreGame] = useState<LoreGame | null>(null);
  useEffect(() => {
    const list=gameListRef.current; const selected=list?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if(window.innerWidth<=900&&list&&selected) list.scrollTo({left:selected.offsetLeft-list.offsetLeft-(list.clientWidth-selected.clientWidth)/2,behavior:'auto'});
  },[selectedId,category]);
  const variant = GAME_VARIANTS.find(v => v.id === selectedId);
  const ancient = LORE_GAMES.find(v => v.id === selectedId);
  const isChess = selectedId === 'chess';
  const categoryGames = category === 'tafl' ? GAME_VARIANTS : category === 'world' ? LORE_GAMES : CLASSIC_GAMES;
  const name = isChess ? 'Chess' : variant?.name || SHORT_NAMES[selectedId] || ancient?.name || 'TAFL';
  const origin = isChess ? 'A world tradition' : variant?.origin || ancient?.region;
  const era = isChess ? 'Modern standard rules' : variant?.era || ancient?.era;
  const description = isChess ? 'A game of kings, brought to the same wooden table. Play against the computer or a friend, switch between carved 3D pieces and a clear 2D board, and review every move.' : variant?.history || ancient?.description;
  const circular = variant?.boardType === 'circular';
  const config = variant ? BOARD_CONFIGS[variant.boardSize] : null;
  const selectCategory = (next: 'tafl' | 'world' | 'classics') => { setCategory(next); setSelectedId(next === 'tafl' ? 'hnefatafl' : next === 'world' ? 'royal-ur' : 'chess'); };
  const start = (mode: GameMode = 'play') => {
    if (isChess) setShowChess(true);
    else if (ancient) setLoreGame(ancient);
    else if (variant && opponent === 'local' && mode === 'play') props.onStartPassAndPlay?.(variant.id);
    else if (variant) props.onStartGame(variant.boardSize, playerSide, difficulty, mode, variant.id);
  };
  return <div className="collection-shell collection-shell--immersive">
    <div className={`collection-world ${isChess ? 'collection-world--chess' : ''}`} style={isChess ? undefined : {backgroundImage:`url(${ERA_IMAGES[selectedId]})`}} aria-hidden="true" />
    <div className="collection-world-shade" aria-hidden="true" />
    <header className="collection-header">
      <BrandMark />
      <nav className="collection-nav" aria-label="Collection navigation">
        <span className="nav-current"><span /> The collection</span>
        <button onClick={() => setShowMap(true)}><Compass size={16} /> Historical atlas</button>
        <button onClick={() => setShowStory(true)}><BookOpen size={16} /> History & sources</button>
      </nav>
      <div className="header-utilities"><LanguageSelector compact /><VolumeControl musicVolume={props.musicVolume} sfxVolume={props.sfxVolume} onMusicVolumeChange={props.onMusicVolumeChange} onSfxVolumeChange={props.onSfxVolumeChange} onToggleMute={props.onToggleMute} /><ProfileChip /></div>
    </header>
    <main className="collection-layout">
      <aside className="collection-library" data-category={category} aria-label="Choose a game">
        <div className="library-heading"><span className="eyebrow">Discover & play</span><span className="library-total">15 games</span></div>
        <h1>A seat at<br /><em>the old table.</em></h1>
        <p className="library-intro">Ancient worlds, brought together<br className="hidden xl:block" /> through the games they played.</p>
        <div className="library-tabs" role="group" aria-label="Game families"><button aria-pressed={category === 'tafl'} onClick={() => selectCategory('tafl')}>Tafl family <span>06</span></button><button aria-pressed={category === 'world'} onClick={() => selectCategory('world')}>World <span>08</span></button><button aria-pressed={category === 'classics'} onClick={() => selectCategory('classics')}>Classics <span>01</span></button></div>
        <div ref={gameListRef} className="game-list">{categoryGames.map((game, i) => {
          const homeland = 'origin' in game ? game.origin : game.region;
          return <button key={game.id} className={`library-game ${selectedId === game.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(game.id)} aria-pressed={selectedId === game.id}><span className="game-number">{String(i + 1).padStart(2, '0')}</span><span className="library-game-art">{game.id === 'chess' ? <span className="library-chess-icon" aria-hidden>♞</span> : <img src={ERA_IMAGES[game.id]} alt="" width="48" height="48" />}</span><span className="library-game-copy"><strong>{SHORT_NAMES[game.id] || game.name}</strong><small>{homeland}</small></span><ChevronRight size={14} aria-hidden /></button>;
        })}</div>
        <button className="library-atlas" onClick={() => setShowMap(true)}><Globe2 size={17} /><span>Follow the games across the world</span><ArrowRight size={14} /></button>
      </aside>
      <section className={`collection-exhibit ${variant ? 'exhibit-tafl' : ''}`} aria-label={`${name} overview`}>
        {isChess ? <div className="exhibit-chess-background" /> : <img key={selectedId} className="exhibit-landscape" src={ERA_IMAGES[selectedId]} alt={`Artist's impression of ${origin}`} />}<div className="exhibit-shade" />
        <div className="exhibit-topline"><span className="eyebrow">{isChess ? 'The classical table' : variant ? 'The tafl tradition' : FAMILY_LABELS[ancient?.family || 'race']}</span><span className="exhibit-edition">Nº {String(categoryGames.findIndex(g => g.id === selectedId) + 1).padStart(2, '0')}</span></div>
        <div className="exhibit-title" key={`${selectedId}-title`}><p>{origin} <span>·</span> {era}</p><h2>{name}</h2><span className="exhibit-rule" /></div>
        {isChess ? <div className="exhibit-board-space"><ChessPreview /></div> : variant ? <div className="exhibit-board-space"><BoardPreview variant={variant} /></div> : <div className="exhibit-ancient-symbol" aria-hidden>{ancient?.family === 'sowing' ? '◉ ◉ ◉' : ancient?.family === 'custodial' ? '♟' : '✺'}</div>}
        <div className="exhibit-story"><span className="eyebrow">{circular ? 'A modern connection interpretation' : 'A living tradition of play'}</span><p>{description}</p><button onClick={() => setShowStory(true)}>Read the story <ArrowRight size={14} /></button></div><span className="exhibit-caption">{isChess ? 'The classical table' : 'Landscape · artist’s impression'}</span>
      </section>
      <aside className="collection-settings" aria-label="Game setup">
        <div className="settings-title"><span className="eyebrow">Your table awaits</span><h2>Make your move.</h2><p>{isChess || variant ? 'A quiet contest. A worthy opponent.' : 'Discover a different tradition of play.'}</p></div>
        <div className="game-facts"><div><span>THE BOARD</span><strong>{isChess ? '8 × 8' : variant ? circular ? '7 rings · 16 spokes' : `${variant.boardSize} × ${variant.boardSize}` : ancient?.family === 'sowing' ? '4 rows · 32 pits' : ancient?.family === 'custodial' ? '8 × 8' : 'Traditional track'}</strong></div><div><span>THE CONTEST</span><strong>{isChess ? 'Checkmate the opposing king' : variant ? circular ? 'Connect centre to edge' : variant.defaultRules.edgeEscape ? 'Escape to any edge' : 'Escape to a corner' : ancient?.family === 'custodial' ? 'Capture the opposing army' : ancient?.family === 'sowing' ? 'Sow, relay & capture' : 'Race your pieces home'}</strong></div>{variant && !circular && <div><span>THE ARMIES</span><strong>{config?.initialAttackers.length} attackers · {(config?.initialDefenders.length || 0) + 1} defenders</strong></div>}</div>
        {variant ? <>
          <fieldset className="setup-field"><legend>01 <span>Your opponent</span></legend><div className="segmented-choice"><button aria-pressed={opponent === 'ai'} onClick={() => setOpponent('ai')}><Swords size={15} /> The computer</button><button aria-pressed={opponent === 'local'} onClick={() => setOpponent('local')}><Users size={15} /> A friend</button></div></fieldset>
          {opponent === 'ai' ? <><fieldset className="setup-field"><legend>02 <span>Choose your side</span></legend><div className="side-choices">{(['defender', 'attacker'] as const).map(side => <button key={side} aria-pressed={playerSide === side} onClick={() => setPlayerSide(side)}>{side === 'defender' ? <Shield size={20} /> : <Swords size={20} />}<span><strong>{circular ? side === 'defender' ? 'Ivory' : 'Ebony' : side === 'defender' ? 'Defenders' : 'Attackers'}</strong><small>{circular ? 'Connect centre to rim' : side === 'defender' ? 'Guide the king to safety' : 'Surround the king'}</small></span><span className="choice-radio" /></button>)}</div></fieldset>
          <fieldset className="setup-field"><legend>03 <span>The challenge</span></legend><div className="difficulty-choices">{([{ id: 'easy', name: 'Apprentice', level: 'Easy' }, { id: 'medium', name: 'Strategist', level: 'Medium' }, { id: 'valhalla', name: 'Master', level: 'Hard' }] as const).map(d => <button key={d.id} aria-pressed={difficulty === d.id} onClick={() => setDifficulty(d.id)}><span>{d.name}</span><small>{d.level}</small></button>)}</div></fieldset></> : <div className="setup-local-note"><Users size={24} /><p>Share this screen.<br />{circular ? 'Ebony' : 'The attackers'} move first. Pass the table between turns.</p></div>}
        </> : <div className="reconstruction-note"><BookOpen size={20} /><p><strong>{isChess ? 'A game of kings.' : ancient?.id === 'royal-ur' ? 'A recovered game' : 'A playable interpretation'}</strong>{isChess ? 'Castling, en passant, all four promotions, checkmate and draws. Choose a computer opponent or share the screen with a friend.' : ancient?.id === 'royal-ur' ? 'Play the popular modern race rules inspired by the surviving Babylonian evidence.' : 'Where original rules are incomplete or lost, the table uses a modern reconstruction. Read the rules inside the game.'}</p><span>{isChess ? 'Computer or a friend · three difficulty levels' : ancient?.id === 'bao' ? 'Local two-player · shared screen' : ancient?.id === 'mehen' ? '2–6 players · human or computer' : 'Play against the computer'}</span></div>}
        <div className="settings-launch"><button className="primary-action" onClick={() => start()}>{isChess ? 'Open chess' : variant ? 'Take your seat' : 'Open the game'}<ArrowRight size={19} /></button><div className="launch-links"><button onClick={() => variant ? setShowRules(true) : setShowStory(true)}><BookOpen size={14} /> {variant ? 'How to play' : 'About this game'}</button>{variant && <button onClick={() => start('demo')}><Eye size={14} /> Watch a game</button>}</div><p className="launch-note">Playable in 2D & 3D <span>·</span> No account needed</p></div>
      </aside>
    </main>
    <footer className="collection-footer"><a href="https://kamrok.com" target="_blank" rel="noopener noreferrer"><img src={kamrokLogo} alt="Kamrok" width="75" height="20" /></a><span>Made for the love of the game.</span><span>Old worlds. Timeless play.</span></footer>
    {showMap && <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-background">Opening the atlas…</div>}><TaflHistoryMap variants={GAME_VARIANTS} selectedVariant={variant || GAME_VARIANTS[4]} onSelectVariant={v => { setCategory('tafl'); setSelectedId(v.id); }} onClose={() => setShowMap(false)} /></Suspense>}
    <RulesModal open={showRules} onClose={() => setShowRules(false)} variant={variant} />
    <Dialog open={showStory} onOpenChange={setShowStory}><DialogContent className="story-dialog"><DialogHeader><DialogDescription className="eyebrow">{origin} · {era}</DialogDescription><DialogTitle>{name}</DialogTitle></DialogHeader>{!isChess && <img src={ERA_IMAGES[selectedId]} alt={`Artist's impression of ${origin}`} />}<p>{description}</p><p className="story-caveat">{isChess ? 'This table follows modern chess movement rules. Repetition and fifty-move draws are automatically adjudicated; tournament clocks and claim arbitration are not used.' : circular ? 'This circular connection game is a contemporary interpretation. The original medieval Irish rules of Fidchell are not known.' : 'Ancient games survive through objects, texts and later traditions. The playable rules are identified interpretations; the landscape is an artist’s impression.'}</p><SourcesPanel sources={variant?.sources} alternates={variant?.alternateRules} historianMode /></DialogContent></Dialog>
    {showChess && <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-background">Preparing your table…</div>}><ChessGameModal open onClose={() => setShowChess(false)} /></Suspense>}
    {loreGame && <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-background">Preparing your table…</div>}><AncientGameModal game={loreGame} onClose={() => setLoreGame(null)} /></Suspense>}
  </div>;
}
function BoardPreview({ variant }: { variant: GameVariant }) {
  const config = BOARD_CONFIGS[variant.boardSize];
  if (variant.boardType === 'circular') return <div className="preview-circular" aria-label="Circular connection board preview">{[1, 2, 3, 4, 5, 6, 7].map(r => <i key={r} style={{ width: `${r * 12}%`, height: `${r * 12}%` }} />)}{Array.from({ length: 16 }, (_, i) => <b key={i} style={{ transform: `rotate(${i * 22.5}deg)` }} />)}<span>✺</span></div>;
  return <div className="preview-board" aria-label={`${variant.boardSize} by ${variant.boardSize} starting position`} style={{ gridTemplateColumns: `repeat(${variant.boardSize}, 1fr)` }}>{Array.from({ length: variant.boardSize * variant.boardSize }, (_, i) => {
    const row = Math.floor(i / variant.boardSize), col = i % variant.boardSize;
    const type = config.kingPosition.row === row && config.kingPosition.col === col ? 'king' : config.initialAttackers.some(p => p.row === row && p.col === col) ? 'attacker' : config.initialDefenders.some(p => p.row === row && p.col === col) ? 'defender' : null;
    return <span key={i} className={(row + col) % 2 ? 'preview-dark' : ''}>{type && <i className={`preview-piece preview-piece--${type}`}>{type === 'king' ? '♔' : ''}</i>}</span>;
  })}</div>;
}

function ChessPreview() {
  const ranks=['♜♞♝♛♚♝♞♜','♟♟♟♟♟♟♟♟','','','','','♙♙♙♙♙♙♙♙','♖♘♗♕♔♗♘♖'];
  return <div className="preview-board preview-chess-board" aria-label="Chess starting position" style={{gridTemplateColumns:'repeat(8,1fr)'}}>{Array.from({length:64},(_,i)=>{const row=Math.floor(i/8),col=i%8;return <span key={i} className={(row+col)%2?'preview-dark':''}><b className={row<2?'preview-chess-dark':'preview-chess-light'}>{ranks[row][col]||''}</b></span>})}</div>;
}

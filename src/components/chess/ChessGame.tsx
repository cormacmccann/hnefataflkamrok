import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, BookOpen, Download, FlipVertical2, RotateCcw, Settings2, Undo2, X } from 'lucide-react';
import { LanguageSelector } from '@/components/game/LanguageSelector';
import { BrandMark } from '@/components/game/BrandMark';
import { BoardView, BoardViewToggle } from '@/components/game/BoardViewToggle';
import { useChessGame } from '@/hooks/useChessGame';
import { ChessOptions, PromotionPiece } from '@/types/chess';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { ChessBoard2D } from './ChessBoard2D';
import { ChessScene3D } from './ChessScene3D';
import '@/components/ancient/ancient-games.css';
import './chess-game.css';

type Translate = (key: string, values?: Record<string, string | number>) => string;
const INITIAL_OPTIONS: ChessOptions = { opponent: 'computer', humanColor: 'w', difficulty: 'easy' };

export function ChessGame({ onClose }: { onClose: () => void }) {
  const [options, setOptions] = useState<ChessOptions>(INITIAL_OPTIONS);
  const [sessionId, setSessionId] = useState(0);
  const start = (next: ChessOptions) => { setOptions(next); setSessionId(id => id + 1); };
  return <ChessSession key={sessionId} options={options} onStart={start} onClose={onClose} />;
}

function ChessSession({ options, onStart, onClose }: { options: ChessOptions; onStart: (options: ChessOptions) => void; onClose: () => void }) {
  const { tr } = useUiTranslation();
  const game = useChessGame(options);
  const [view, setView] = useState<BoardView>('3d');
  const [orientation, setOrientation] = useState(options.opponent === 'computer' ? options.humanColor : 'w');
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (game.status !== 'playing') setShowResult(true); }, [game.status]);
  useEffect(() => { if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight; }, [game.history.length]);
  const sideName = (side: string) => tr(side === 'w' ? 'White' : 'Black');
  const drawReason = game.drawReason === 'threefold-repetition' ? tr('The same position occurred three times.') : game.drawReason === 'fifty-move' ? tr('Fifty moves without a pawn move or capture.') : game.drawReason === 'insufficient-material' ? tr('Neither side has enough material to checkmate.') : tr('The position is drawn.');
  const resultTitle = game.status === 'checkmate' ? tr('Checkmate · {side} wins', { side: sideName(game.winner || 'w') }) : game.status === 'stalemate' ? tr('Draw by stalemate') : tr('Draw');
  const resultDescription = game.status === 'checkmate' ? tr('The king is in check with no legal escape.') : game.status === 'stalemate' ? tr('The side to move has no legal move and is not in check.') : drawReason;
  const status = game.status !== 'playing' ? resultTitle : game.promotion ? tr('Choose a promotion piece') : game.thinking ? tr('{side} is thinking…', { side: sideName(game.turn) }) : game.check ? tr('{side} is in check', { side: sideName(game.turn) }) : tr('{side} to move', { side: sideName(game.turn) });
  const restart = () => { setShowResult(false); game.newGame(); };
  const exportPGN = () => {
    const blob = new Blob([game.exportPGN()], { type: 'application/x-chess-pgn;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'tafl-chess.pgn'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const boardProps = { board: game.board, selectedSquare: game.selectedSquare, legalMoves: game.legalMoves, lastMove: game.lastMove, check: game.check, turn: game.turn, orientation, onSquareClick: game.selectSquare, disabled: game.thinking || !!game.promotion || game.status !== 'playing' };
  const material = game.board.reduce((sum, piece) => sum + ({ p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[piece.type]) * (piece.color === 'w' ? 1 : -1), 0);
  const history = <MoveList history={game.history} tr={tr} />;
  return <div className="chess-room">
    <div className="game-language-control"><LanguageSelector compact align="up" /></div>
    <header className="chess-room-header">
      <button className="chess-back" onClick={onClose} aria-label={tr('Back to collection')}><ArrowLeft size={17} /><span>{tr('Collection')}</span></button>
      <div className="chess-identity"><BrandMark compact /><div><span className="chess-eyebrow">{tr('The classical table')}</span><h1>{tr('Chess')}</h1></div></div>
      <div className="chess-top-tools"><BoardViewToggle view={view} onChange={setView} /><button className="chess-icon-button chess-mobile-settings" onClick={() => setShowSettings(true)} aria-label={tr('Game settings')}><Settings2 size={17} /></button><button className="chess-icon-button" onClick={() => setShowRules(true)} aria-label={tr('Chess rules')}><BookOpen size={17} /></button><button className="chess-icon-button chess-new-game" onClick={restart} aria-label={tr('New game')}><RotateCcw size={17} /></button></div>
    </header>
    <main className="chess-room-layout">
      <aside className="chess-settings" aria-label={tr('Game settings')}>
        <div className="chess-panel-title"><span className="chess-eyebrow">{tr('Your table')}</span><h2>{tr('A game of kings.')}</h2><p>{tr('Patience. Foresight. One considered move.')}</p></div>
        <ChessSettings options={options} onStart={onStart} tr={tr} />
        <div className="chess-table-note"><BookOpen size={17} /><p>{tr('Modern chess rules, including castling, en passant and your choice of promotion.')}</p></div>
      </aside>
      <section className="chess-play-area" aria-label={tr('Chess table')}>
        <div className="chess-player-band"><span className={`chess-side-stone ${orientation === 'w' ? 'black' : 'white'}`} /><span>{sideName(orientation === 'w' ? 'b' : 'w')}</span><small>{options.opponent === 'local' ? tr('Shared table') : orientation === options.humanColor ? tr('Computer') : tr('You')}</small></div>
        <div className="chess-board-stage" aria-label={tr('{view} chess board', { view: view.toUpperCase() })}>
          {view === '3d' ? <ChessScene3D {...boardProps} onUse2D={() => setView('2d')} /> : <ChessBoard2D {...boardProps} />}
        </div>
        <div className="chess-player-band"><span className={`chess-side-stone ${orientation === 'w' ? 'white' : 'black'}`} /><span>{sideName(orientation)}</span><small>{options.opponent === 'local' ? tr('Shared table') : orientation === options.humanColor ? tr('You') : tr('Computer')}</small><span className="chess-material">{material === 0 ? tr('Material level') : tr('{side} +{value}', { side: sideName(material > 0 ? 'w' : 'b'), value: Math.abs(material) })}</span></div>
      </section>
      <aside className="chess-match-panel" aria-label={tr('Match information')}>
        <div className={`chess-turn-card ${game.check ? 'is-check' : ''}`}><span className="chess-eyebrow">{tr('The position')}</span><h2 role="status" aria-live="polite">{status}</h2><p>{game.status !== 'playing' ? resultDescription : game.selectedSquare ? tr('Choose a highlighted destination.') : game.thinking ? tr('The computer is considering its reply.') : tr('Select a piece to see its legal moves.')}</p></div>
        <div className="chess-history-header"><h2>{tr('Moves')}</h2><span>{tr('Standard notation')}</span></div>
        <div className="chess-history" ref={historyRef}>{history}</div>
        <div className="chess-match-actions"><button onClick={game.undo} disabled={!game.canUndo || !!game.promotion}><Undo2 size={15} />{tr('Undo move')}</button><button onClick={() => setOrientation(side => side === 'w' ? 'b' : 'w')}><FlipVertical2 size={15} />{tr('Turn the board')}</button><button onClick={exportPGN} disabled={game.history.length === 0}><Download size={15} />{tr('Save PGN')}</button><button onClick={restart}><RotateCcw size={15} />{tr('New game')}</button></div>
      </aside>
    </main>
    <footer className="chess-room-footer"><span>{tr('Move {number}', { number: game.moveNumber })}<i>·</i>{status}</span><div><button className="chess-mobile-action" onClick={game.undo} disabled={!game.canUndo || !!game.promotion} aria-label={tr('Undo move')}><Undo2 size={15} /></button><button className="chess-mobile-action" onClick={() => setOrientation(side => side === 'w' ? 'b' : 'w')} aria-label={tr('Turn the board')}><FlipVertical2 size={15} /></button><button className="chess-mobile-action" onClick={() => setShowMoves(true)}><span>{tr('Moves')}</span><small>{game.history.length}</small></button><span className="chess-footer-caption">{tr('Old worlds. Timeless play.')}</span></div></footer>
    <ChessDialog open={showSettings} onOpenChange={setShowSettings} title={tr('Your chess table')} description={tr('Choose your opponent, side and challenge.')} closeLabel={tr('Close')}><ChessSettings options={options} onStart={next => { setShowSettings(false); onStart(next); }} tr={tr} /><button className="chess-dialog-secondary" onClick={() => { setShowSettings(false); restart(); }}>{tr('Restart the current game')}</button></ChessDialog>
    <ChessDialog open={showMoves} onOpenChange={setShowMoves} title={tr('Moves')} description={tr('Standard algebraic notation records every move.')} closeLabel={tr('Close')}><div className="chess-dialog-moves">{history}</div><button className="chess-dialog-secondary" onClick={exportPGN} disabled={!game.history.length}>{tr('Save PGN')}</button></ChessDialog>
    <ChessDialog open={showRules} onOpenChange={setShowRules} title={tr('How to play chess')} description={tr('Modern rules of the game')} closeLabel={tr('Close')}><div className="chess-rules-copy"><p>{tr('White moves first. Select a piece, then a highlighted square. You must protect your own king; a move that leaves it in check is illegal.')}</p><p>{tr('Checkmate wins: the opposing king is attacked and has no legal escape. Stalemate and insufficient material draw the game. This table automatically declares repetition and fifty-move draws, which players claim in tournament chess.')}</p><p>{tr('Castling moves the king two squares toward its rook when neither has moved and the king crosses no attacked square. En passant is available immediately after an adjacent pawn advances two squares. Pawns promote to a queen, rook, bishop or knight.')}</p><a href="https://handbook.fide.com/chapter/E012023" target="_blank" rel="noopener noreferrer">{tr('Read the FIDE Laws of Chess')} ↗</a></div></ChessDialog>
    <ChessDialog open={!!game.promotion} onOpenChange={open => { if (!open) game.cancelPromotion(); }} title={tr('Promote your pawn')} description={tr('Choose the piece that will replace your pawn.')} closeLabel={tr('Cancel promotion')}><div className="chess-promotion-options">{([{ id: 'q', name: 'Queen', glyph: '♕' }, { id: 'r', name: 'Rook', glyph: '♖' }, { id: 'b', name: 'Bishop', glyph: '♗' }, { id: 'n', name: 'Knight', glyph: '♘' }] as const).map(piece => <button key={piece.id} onClick={() => game.choosePromotion(piece.id as PromotionPiece)} aria-label={tr('Promote to {piece}', { piece: tr(piece.name) })}><span aria-hidden>{piece.glyph}</span><strong>{tr(piece.name)}</strong></button>)}</div></ChessDialog>
    <ChessDialog open={showResult && game.status !== 'playing'} onOpenChange={setShowResult} title={resultTitle} description={resultDescription} closeLabel={tr('Review the board')}><div className="chess-result-mark" aria-hidden>♔</div><button className="chess-primary-button" onClick={restart}>{tr('Play again')}</button><button className="chess-dialog-secondary" onClick={() => setShowResult(false)}>{tr('Review the board')}</button></ChessDialog>
  </div>;
}

function ChessSettings({ options, onStart, tr }: { options: ChessOptions; onStart: (options: ChessOptions) => void; tr: Translate }) {
  const [draft, setDraft] = useState(options);
  return <form className="chess-settings-form" onSubmit={event => { event.preventDefault(); onStart(draft); }}>
    <fieldset><legend>{tr('Your opponent')}</legend><div className="chess-option-row"><button type="button" aria-pressed={draft.opponent === 'computer'} onClick={() => setDraft({ ...draft, opponent: 'computer' })}>{tr('Computer')}</button><button type="button" aria-pressed={draft.opponent === 'local'} onClick={() => setDraft({ ...draft, opponent: 'local' })}>{tr('A friend')}</button></div></fieldset>
    {draft.opponent === 'computer' ? <><fieldset><legend>{tr('Your pieces')}</legend><div className="chess-option-row"><button type="button" aria-pressed={draft.humanColor === 'w'} onClick={() => setDraft({ ...draft, humanColor: 'w' })}><span className="chess-side-stone white" />{tr('White')}</button><button type="button" aria-pressed={draft.humanColor === 'b'} onClick={() => setDraft({ ...draft, humanColor: 'b' })}><span className="chess-side-stone black" />{tr('Black')}</button></div></fieldset><fieldset><legend>{tr('The challenge')}</legend><div className="chess-difficulty-options">{([{ id: 'easy', title: 'Apprentice', caption: 'Easy' }, { id: 'medium', title: 'Strategist', caption: 'Medium' }, { id: 'hard', title: 'Master', caption: 'Hard' }] as const).map(level => <button type="button" key={level.id} aria-pressed={draft.difficulty === level.id} onClick={() => setDraft({ ...draft, difficulty: level.id })}><span>{tr(level.title)}</span><small>{tr(level.caption)}</small></button>)}</div></fieldset></> : <p className="chess-local-note">{tr('Share this screen and take turns. White moves first. Turn the board whenever you wish.')}</p>}
    <button type="submit" className="chess-primary-button">{tr('Start a new game')}<RotateCcw size={15} /></button>
  </form>;
}

function MoveList({ history, tr }: { history: string[]; tr: Translate }) {
  if (!history.length) return <p className="chess-empty-history">{tr('The opening move is yours to make.')}</p>;
  return <table className="chess-moves-table"><caption className="sr-only">{tr('Move history')}</caption><thead><tr><th scope="col">#</th><th scope="col">{tr('White')}</th><th scope="col">{tr('Black')}</th></tr></thead><tbody>{Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => <tr key={i}><th scope="row">{i + 1}.</th><td>{history[i * 2]}</td><td>{history[i * 2 + 1] || '—'}</td></tr>)}</tbody></table>;
}

function ChessDialog({ open, onOpenChange, title, description, closeLabel, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; closeLabel: string; children: React.ReactNode }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="chess-dialog-overlay" /><Dialog.Content className="chess-dialog"><button className="chess-dialog-close" onClick={() => onOpenChange(false)} aria-label={closeLabel}><X size={18} /></button><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}

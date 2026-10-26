import { useUiTranslation } from '@/i18n/useUiTranslation';
import { FIDCHELL_CONFIG } from '@/constants/game';
import { createTaflLogic } from '@/lib/taflEngine';
import type { GameState, Position } from '@/types/game';

interface Props {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceClick: (pieceId: string) => void;
  placementMode?: boolean;
}
export function TaflBoard2D({ gameState, onSquareClick, onPieceClick, placementMode = false }: Props) {
  const { tr } = useUiTranslation();
  if (gameState.boardType === 'circular') return <CircularBoard2D gameState={gameState} onSquareClick={onSquareClick} onPieceClick={onPieceClick} placementMode={placementMode} />;
  const { boardSize, pieces, selectedPiece, validMoves, moveHistory } = gameState;
  const logic = createTaflLogic(boardSize, gameState.rules, gameState.variantId);
  const lastMove = moveHistory.at(-1);
  return <div className="tafl-flat-stage"><div className="tafl-flat-board" role="group" aria-label={`${boardSize} by ${boardSize} Tafl board`} style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
    {Array.from({ length: boardSize * boardSize }, (_, i) => {
      const row = Math.floor(i / boardSize), col = i % boardSize;
      const pos = { row, col };
      const piece = pieces.find(p => p.position.row === row && p.position.col === col);
      const valid = validMoves.some(p => p.row === row && p.col === col);
      const selected = selectedPiece?.id === piece?.id && !!piece;
      const special = logic.isThrone(pos) ? 'throne' : logic.isEscape(pos) ? 'escape' : '';
      const last = lastMove && [lastMove.from, lastMove.to].some(p => p.row === row && p.col === col);
      const coordinate = `${String.fromCharCode(97 + col)}${boardSize - row}`;
      return <button key={i} type="button" className={`tafl-flat-square ${(row + col) % 2 ? 'dark' : ''} ${special} ${valid ? 'valid' : ''} ${selected ? 'selected' : ''} ${last ? 'last-move' : ''}`} aria-label={tr('{square}, {piece}', {square:coordinate, piece:tr(piece ? piece.type : special || 'Empty')}) + (valid ? tr(', legal move') : '')} aria-pressed={selected} onClick={() => piece ? onPieceClick(piece.id) : onSquareClick(pos)}>
        {(row === boardSize - 1 || col === 0) && <span className="tafl-coordinate">{col === 0 ? boardSize - row : String.fromCharCode(97 + col)}</span>}
        {piece ? <span className={`tafl-flat-piece ${piece.type}`}>{piece.type === 'king' ? '♔' : ''}</span> : valid ? <span className="tafl-valid-dot" /> : special === 'throne' ? <span className="tafl-throne-mark">✣</span> : special === 'escape' ? <span className="tafl-escape-mark">◇</span> : null}
      </button>;
    })}
  </div></div>;
}
function CircularBoard2D({ gameState, onSquareClick, onPieceClick, placementMode }: Props) {
  const { tr } = useUiTranslation();
  const rings = FIDCHELL_CONFIG.rings - 1, spokes = FIDCHELL_CONFIG.spokes;
  const point = (ring: number, spoke: number) => { const angle = (spoke / spokes) * Math.PI * 2 - Math.PI / 2; const radius = ring * 36; return { x: 300 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius }; };
  return <div className="tafl-flat-stage circular-flat-stage"><svg viewBox="0 0 600 600" className="circular-flat-board" role="group" aria-label="Fidchell circular connection board">
    <defs><radialGradient id="fidchell-wood"><stop offset="0" stopColor="#bc965d" /><stop offset="1" stopColor="#79542c" /></radialGradient></defs>
    <circle cx="300" cy="300" r="285" fill="url(#fidchell-wood)" stroke="#3e2d1c" strokeWidth="18" /><circle cx="300" cy="300" r="274" fill="none" stroke="#c7a363" strokeWidth="2" />
    {Array.from({ length: rings }, (_, i) => <circle key={i} cx="300" cy="300" r={(i + 1) * 36} fill="none" stroke="#4a321d" strokeWidth="1.2" />)}
    {Array.from({ length: spokes }, (_, i) => { const p = point(rings, i); return <line key={i} x1="300" y1="300" x2={p.x} y2={p.y} stroke="#4a321d" strokeWidth="1.2" />; })}
    <circle cx="300" cy="300" r="13" fill="#30291a" /><text x="300" y="306" textAnchor="middle" fill="#d4b878" fontSize="20">✺</text>
    {Array.from({ length: rings * spokes }, (_, i) => {
      const ring = Math.floor(i / spokes) + 1, spoke = i % spokes;
      const p = point(ring, spoke);
      const piece = gameState.pieces.find(p => p.circularPosition?.ring === ring && p.circularPosition?.spoke === spoke);
      const valid = gameState.validMoves.some(p => p.row === ring && p.col === spoke);
      const selected = !!piece && gameState.selectedPiece?.id === piece.id;
      const connected = gameState.connectionPath?.some(p => p.ring === ring && p.spoke === spoke);
      const activate = () => piece ? onPieceClick(piece.id) : onSquareClick({ row: ring, col: spoke });
      return <g key={i} role="button" tabIndex={0} aria-label={tr('Ring {v0}, spoke {v1}{v2}', {v0:ring,v1:spoke+1,v2:piece ? ', '+tr(piece.type === 'attacker' ? 'Ebony' : 'Ivory') : valid ? tr(', legal move') : placementMode ? tr(', place pawn') : tr(', empty')})} aria-pressed={selected} onClick={activate} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }} className="circular-flat-node">
        <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
        {piece && <circle cx={p.x} cy={p.y} r="10" fill={piece.type === 'attacker' ? '#24281e' : '#ebdbb5'} stroke={selected || connected ? '#ffdf85' : '#4d3a21'} strokeWidth={selected || connected ? '4' : '2'} />}
        {!piece && (valid || placementMode) && <circle cx={p.x} cy={p.y} r={valid ? '5' : '2.5'} fill={valid ? '#e4e8b0' : '#d7c39390'} />}
      </g>;
    })}
  </svg></div>;
}

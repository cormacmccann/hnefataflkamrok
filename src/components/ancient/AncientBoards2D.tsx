import { useUiTranslation } from '@/i18n/useUiTranslation';
import { CSSProperties } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UrState, UrMove, SQUARE_COORDS, WHITE_PATH, BLACK_PATH, ROSETTE_SQUARES, SquareId } from '@/lib/ancient/royalUr';
import { RaceState, RaceMove } from '@/lib/ancient/raceEngine';

type TacticalPiece = { id: number; owner: 'white' | 'black'; pos: { row: number; col: number }; dux?: boolean };
export function TacticalBoard2D({ size, pieces, selected, targets, onSquareClick }: {
  size: number; pieces: TacticalPiece[]; selected: number | null; targets: { row: number; col: number }[];
  onSquareClick: (row: number, col: number) => void;
}) {
  const { tr } = useUiTranslation();
  return (
    <div className="ancient-flat-board ancient-grid-board" style={{ gridTemplateColumns: `repeat(${size},1fr)` }} role="group" aria-label="Tactical board">
      {Array.from({ length: size * size }, (_, i) => {
        const row = Math.floor(i / size), col = i % size;
        const piece = pieces.find(p => p.pos.row === row && p.pos.col === col);
        const valid = targets.some(p => p.row === row && p.col === col);
        const coordinate = `${String.fromCharCode(97 + col)}${size - row}`;
        return <button key={i} className={`ancient-flat-tile ${(row + col) % 2 ? 'dark' : ''} ${valid ? 'valid' : ''} ${piece?.id === selected ? 'selected' : ''}`} onClick={() => onSquareClick(row, col)} aria-label={tr('{square}, {piece}',{square:coordinate,piece:piece ? tr('{side} {piece}',{side:tr(piece.owner === 'white' ? 'White' : 'Black'),piece:tr(piece.dux ? 'Dux' : 'soldier')}) : tr('Empty')}) + (valid ? tr(', legal move') : '')} aria-pressed={!!piece && piece.id === selected}>
          <span className="ancient-tile-number" aria-hidden="true">{coordinate}</span>
          {piece ? <span className={`ancient-token ${piece.owner}`} aria-hidden="true">{piece.dux ? '♜' : ''}</span> : valid ? <span className="ancient-target-dot" /> : null}
        </button>;
      })}
    </div>
  );
}

export function UrBoard2D({ state, moves, onMove }: { state: UrState; moves: UrMove[]; onMove: (move: UrMove) => void }) {
  const { tr } = useUiTranslation();
  const portrait = useIsMobile();
  return <div className="ancient-flat-board ancient-path-board" style={{ '--board-ratio': portrait ? 3 / 8 : 8 / 3 } as CSSProperties} role="group" aria-label={tr('Royal Game of Ur board')}>
    {(Object.entries(SQUARE_COORDS) as [SquareId, { row: number; col: number }][]).map(([id, pos]) => {
      const move = moves.find(m => m.toPathIdx < 14 && WHITE_PATH[m.toPathIdx] === id);
      const white = state.white.some(p => p >= 0 && p < 14 && WHITE_PATH[p] === id);
      const black = state.black.some(p => p >= 0 && p < 14 && BLACK_PATH[p] === id);
      const rosette = ROSETTE_SQUARES.has(id);
      const pieceName = white || black ? tr('{side} {piece}', { side: tr(white ? 'White' : 'Black'), piece: tr('Pawn') }) : tr('Empty');
      return <button key={id} className={`ancient-flat-tile ${rosette ? 'special' : ''} ${move ? 'valid' : ''}`} style={{ left: `${portrait ? pos.row * 100 / 3 : pos.col * 12.5}%`, top: `${portrait ? pos.col * 12.5 : pos.row * 100 / 3}%`, width: `${portrait ? 100 / 3 : 12.5}%`, height: `${portrait ? 12.5 : 100 / 3}%` }} onClick={() => move && onMove(move)} aria-label={tr('{square}, {piece}', { square: id, piece: pieceName }) + (rosette ? tr(', rosette') : '') + (move ? tr(', legal destination') : '')} disabled={!move}>
        {rosette && <span className="ancient-rosette" aria-hidden="true">✦</span>}{(white || black) && <span className={`ancient-token ${white ? 'white' : 'black'}`} aria-hidden="true" />}{move && !white && !black && <span className="ancient-target-dot" />}
      </button>;
    })}
  </div>;
}

export function RaceBoard2D({ state, moves, onMove }: { state: RaceState; moves: RaceMove[]; onMove: (move: RaceMove) => void }) {
  const { tr } = useUiTranslation();
  const isMobile = useIsMobile();
  const xs = state.cfg.layout.map(s => s.x), zs = state.cfg.layout.map(s => s.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const spanX = maxX - minX + 1, spanZ = maxZ - minZ + 1;
  const portrait = isMobile && spanX / spanZ > 2;
  return <div className="ancient-flat-board ancient-path-board" style={{ '--board-ratio': portrait ? spanZ / spanX : spanX / spanZ } as CSSProperties} role="group" aria-label={tr('{v0} path board', { v0: tr(state.cfg.name) })}>
    {state.cfg.layout.map(sq => {
      const move = moves.find(m => m.to === sq.index);
      const def = state.cfg.squares[sq.index];
      const white = state.white.includes(sq.index), black = state.black.includes(sq.index);
      const pieceName = white || black ? tr('{side} {piece}', { side: tr(white ? 'White' : 'Black'), piece: tr('Pawn') }) : tr('Empty');
      return <button key={sq.index} className={`ancient-flat-tile ${state.cfg.specialIndices?.includes(sq.index) ? 'special' : ''} ${move ? 'valid' : ''}`} style={{ left: `${portrait ? (sq.z - minZ) / spanZ * 100 : (sq.x - minX) / spanX * 100}%`, top: `${portrait ? (sq.x - minX) / spanX * 100 : (sq.z - minZ) / spanZ * 100}%`, width: `${100 / (portrait ? spanZ : spanX)}%`, height: `${100 / (portrait ? spanX : spanZ)}%` }} onClick={() => move && onMove(move)} aria-label={tr('{square}, {piece}', { square: tr('to square {v0}', { v0: sq.index + 1 }), piece: pieceName }) + (def?.label ? `, ${tr(def.label)}` : '') + (move ? tr(', legal destination') : '')} disabled={!move}>
        <span className="ancient-tile-number" aria-hidden="true">{sq.index + 1}</span>
        {(def?.extraRoll || def?.safe) && <span className="ancient-rosette" aria-hidden="true">{def.extraRoll ? '✦' : '◆'}</span>}
        {(white || black) && <span className={`ancient-token ${white ? 'white' : 'black'}`} aria-hidden="true" />}{move && !white && !black && <span className="ancient-target-dot" />}
      </button>;
    })}
  </div>;
}

import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { Color, PieceSymbol, Square } from 'chess.js';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { ChessPieceIcon } from './ChessPieceIcon';
import './chess-boards.css';

export interface ChessBoardProps {
  board: Array<{ square: Square; type: PieceSymbol; color: Color }>;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square; san?: string } | null;
  check: boolean;
  turn: Color;
  orientation: Color;
  onSquareClick: (square: Square) => void;
  disabled?: boolean;
}
const PIECE_NAMES: Record<PieceSymbol, string> = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };

export function ChessBoard2D({ board, selectedSquare, legalMoves, lastMove, check, turn, orientation, onSquareClick, disabled = false }: ChessBoardProps) {
  const { tr } = useUiTranslation();
  const files = orientation === 'w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = orientation === 'w' ? '87654321' : '12345678';
  const [focusedSquare, setFocusedSquare] = useState<Square>(orientation === 'w' ? 'e2' : 'e7');
  const refs = useRef(new Map<Square, HTMLButtonElement>());
  useEffect(() => { setFocusedSquare(orientation === 'w' ? 'e2' : 'e7'); }, [orientation]);
  const moveFocus = (event: KeyboardEvent, row: number, col: number) => {
    const keys: Record<string, [number, number]> = { ArrowUp: [row - 1, col], ArrowDown: [row + 1, col], ArrowLeft: [row, col - 1], ArrowRight: [row, col + 1], Home: [row, 0], End: [row, 7] };
    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    const [r, c] = next;
    if (r < 0 || r > 7 || c < 0 || c > 7) return;
    const square = `${files[c]}${ranks[r]}` as Square;
    setFocusedSquare(square); refs.current.get(square)?.focus();
  };
  return <div className="chess-flat-wrap">
    <div className="chess-flat-board" role="grid" aria-label={tr('Chess board, {side} perspective', { side: tr(orientation === 'w' ? 'White' : 'Black') })} aria-readonly={disabled}>
      {Array.from({ length: 8 }, (_, row) => <div className="chess-flat-row" role="row" key={row}>
        {Array.from({ length: 8 }, (_, col) => {
          const square = `${files[col]}${ranks[row]}` as Square;
          const piece = board.find(p => p.square === square);
          const selected = selectedSquare === square;
          const legal = legalMoves.includes(square);
          const previous = lastMove?.from === square || lastMove?.to === square;
          const checked = check && piece?.type === 'k' && piece.color === turn;
          const dark = (square.charCodeAt(0) - 97 + Number(square[1]) - 1) % 2 === 0;
          const pieceName = piece ? tr('{side} {piece}', { side: tr(piece.color === 'w' ? 'White' : 'Black'), piece: tr(PIECE_NAMES[piece.type]) }) : tr('Empty');
          const label = [tr('{square}, {piece}', { square, piece: pieceName }), selected && tr('Selected'), legal && tr('Legal destination'), checked && tr('Check'), previous && tr('Last move')].filter(Boolean).join('. ');
          return <button key={square} ref={element => { if (element) refs.current.set(square, element); else refs.current.delete(square); }} type="button" role="gridcell"
            className={`chess-flat-square ${dark ? 'chess-square-dark' : 'chess-square-light'} ${selected ? 'chess-square-selected' : ''} ${previous ? 'chess-square-previous' : ''} ${checked ? 'chess-square-check' : ''} ${legal && piece ? 'chess-square-capture' : ''}`}
            aria-label={label} aria-selected={selected} aria-disabled={disabled} tabIndex={focusedSquare === square ? 0 : -1}
            onFocus={() => setFocusedSquare(square)} onKeyDown={event => moveFocus(event, row, col)} onClick={() => { if (!disabled) onSquareClick(square); }}>
            {piece && <ChessPieceIcon type={piece.type} color={piece.color} />}
            {legal && !piece && <span className="chess-legal-dot" aria-hidden />}
            {col === 0 && <span className="chess-rank-label" aria-hidden>{ranks[row]}</span>}
            {row === 7 && <span className="chess-file-label" aria-hidden>{files[col]}</span>}
          </button>;
        })}
      </div>)}
    </div>
    <p className="sr-only">{tr('Use arrow keys to explore the board. Press Enter to select a piece or make a legal move.')}</p>
  </div>;
}

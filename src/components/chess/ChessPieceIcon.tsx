import type { Color, PieceSymbol } from 'chess.js';

/** Familiar, font-independent chess silhouettes shared by both armies. */
export function ChessPieceIcon({ type, color }: { type: PieceSymbol; color: Color }) {
  const fill = color === 'w' ? '#f4e6ca' : '#292820';
  const stroke = color === 'w' ? '#5a462d' : '#c8b58c';
  return <svg viewBox="0 0 60 64" aria-hidden="true" focusable="false" className="chess-piece-icon" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
    {type === 'p' && <><circle cx="30" cy="16" r="9" /><path d="M23 26h14l-3 8c0 7 4 12 9 16H17c5-4 9-9 9-16z" /></>}
    {type === 'r' && <><path d="M15 9h8v7h6V9h7v7h6V9h5v17l-7 5-3 16H23l-3-16-5-5z" /><path d="M18 26h26M23 34h15" fill="none" /></>}
    {type === 'n' && <><path d="M18 49c2-10-2-12 2-23l-7 5-3-8 10-12 8-3 2-6 6 9c10 4 13 13 12 23l-4 15z" /><path d="M23 19l-7 7m15 4c-3 6-3 11-1 15m10-25c4 8 4 15 1 21" fill="none" /><circle cx="28" cy="16" r="1.5" fill={stroke} stroke="none" /></>}
    {type === 'b' && <><path d="M30 5C24 11 17 17 18 24c0 6 5 8 8 10l-5 14h18l-5-14c3-2 8-4 8-10C43 17 36 11 30 5z" /><path d="m34 15-8 11M20 45h20" fill="none" /><circle cx="30" cy="5" r="2.5" /></>}
    {type === 'q' && <><path d="m14 18 6 21h20l6-21-10 8-6-13-6 13zM22 40h16l4 10H18z" /><circle cx="13" cy="15" r="3.5" /><circle cx="30" cy="9" r="3.5" /><circle cx="47" cy="15" r="3.5" /><path d="M21 35h18" fill="none" /></>}
    {type === 'k' && <><path d="M27 3h6v6h6v6h-6v7h-6v-7h-6V9h6z" /><path d="M30 25c-12-12-23 0-12 12l5 5-4 8h22l-4-8 5-5c11-12 0-24-12-12z" /><path d="M23 41h14M30 25v16" fill="none" /></>}
    <path d="M17 50h26l3 6H14zM13 57h34v4H13z" />
  </svg>;
}

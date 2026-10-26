import { useMemo } from 'react';
import { MehenState, MehenMove, mehenSpiralLayout, MEHEN_PATH_LEN } from '@/lib/ancient/mehenEngine';

interface Props {
  state: MehenState;
  myMoves: MehenMove[];
  onSelectMove: (m: MehenMove) => void;
  selectedPieceId: string | null;
  onSelectPiece: (id: string | null) => void;
}

const BOARD = 760;
const CX = BOARD / 2;
const CY = BOARD / 2;
const R_OUTER = 330;
const R_INNER = 36;

export function MehenBoard({ state, myMoves, onSelectMove, selectedPieceId, onSelectPiece }: Props) {
  const layout = useMemo(() => mehenSpiralLayout(state.N, CX, CY, R_OUTER, R_INNER, 3.2), [state.N]);

  // Build snake path (SVG path along spiral)
  const snakePath = useMemo(() => {
    const pts = layout;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    return d;
  }, [layout]);

  const headSpace = layout[state.N - 1];
  const tailSpace = layout[0];

  // group pieces by board position
  const piecesAt = new Map<number, typeof state.pieces>();
  state.pieces.forEach((p) => {
    if (p.status === 'in' || p.status === 'out') {
      const arr = piecesAt.get(p.pos) ?? [];
      arr.push(p);
      piecesAt.set(p.pos, arr);
    }
  });

  // targets keyed by board pos (for showing highlight rings)
  const targetByPos = new Map<number, MehenMove>();
  myMoves.forEach((m) => {
    const key = m.kind === 'returnHome' ? -2 : m.toPos;
    if (key >= 0) targetByPos.set(key, m);
  });

  // pieces that have at least one legal move
  const movablePieceIds = new Set(myMoves.map((m) => m.pieceId));

  // selected piece's specific moves
  const selectedMoves = myMoves.filter((m) => m.pieceId === selectedPieceId);
  const selectedTargets = new Map<number, MehenMove>();
  selectedMoves.forEach((m) => { if (m.kind !== 'returnHome') selectedTargets.set(m.toPos, m); });
  const selectedReturnMove = selectedMoves.find((m) => m.kind === 'returnHome');

  return (
    <svg
      viewBox={`0 0 ${BOARD} ${BOARD}`}
      role="group"
      aria-label="Mehen spiral board. Select a movable pawn then its highlighted destination."
      className="w-full h-full max-h-[min(82vh,82vw)] mx-auto block touch-none select-none"
      onClick={() => onSelectPiece(null)}
    >
      <defs>
        <radialGradient id="mehen-bg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#3a2410" />
          <stop offset="55%" stopColor="#28190b" />
          <stop offset="100%" stopColor="#10090a" />
        </radialGradient>
        <radialGradient id="mehen-stone" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#e6c890" />
          <stop offset="60%" stopColor="#c79a55" />
          <stop offset="100%" stopColor="#7d5223" />
        </radialGradient>
        <linearGradient id="snake-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8a5a28" />
          <stop offset="50%" stopColor="#c89146" />
          <stop offset="100%" stopColor="#6e3f18" />
        </linearGradient>
        <radialGradient id="head-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd66a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffd66a" stopOpacity="0" />
        </radialGradient>
        <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x={0} y={0} width={BOARD} height={BOARD} fill="url(#mehen-bg)" />
      <circle cx={CX} cy={CY} r={R_OUTER + 50} fill="url(#mehen-stone)" opacity={0.92} />
      <circle cx={CX} cy={CY} r={R_OUTER + 50} fill="none" stroke="#3a2410" strokeWidth={6} opacity={0.6} />

      {/* hieroglyph border ring */}
      <g opacity={0.5} fontFamily="serif" fontSize={18} fill="#3a2410">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r = R_OUTER + 30;
          const glyphs = ['𓂀', '𓆣', '𓆗', '𓋹', '𓊽', '𓏛', '𓆄', '𓁹'];
          return (
            <text
              key={i}
              x={CX + Math.cos(a) * r}
              y={CY + Math.sin(a) * r}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${(a * 180) / Math.PI + 90} ${CX + Math.cos(a) * r} ${CY + Math.sin(a) * r})`}
            >
              {glyphs[i % glyphs.length]}
            </text>
          );
        })}
      </g>

      {/* Snake body — drawn as a thick stroke along spiral, tail tapered via overlay strokes */}
      <path d={snakePath} stroke="#2a1808" strokeWidth={44} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={snakePath} stroke="url(#snake-skin)" strokeWidth={38} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* scale highlights */}
      <path d={snakePath} stroke="#f1cd80" strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray="2 6" opacity={0.55} />

      {/* Tail tip indicator */}
      <circle cx={tailSpace.x} cy={tailSpace.y} r={26} fill="#5a3a18" stroke="#2a1808" strokeWidth={2} />
      <text x={tailSpace.x} y={tailSpace.y + 5} textAnchor="middle" fontSize={14} fontFamily="serif" fill="#f1cd80" fontWeight="bold">TAIL</text>

      {/* Spaces along the snake */}
      {layout.map((sq, i) => {
        const isHead = i === state.N - 1;
        const isTail = i === 0;
        const target = selectedTargets.get(i);
        return (
          <g key={i}>
            {!isHead && !isTail && (
              <circle
                cx={sq.x}
                cy={sq.y}
                r={9}
                fill="#2a1808"
                opacity={0.35}
              />
            )}
            {target && (
              <circle
                cx={sq.x}
                cy={sq.y}
                r={18}
                fill="none"
                stroke="#9bff7c"
                strokeWidth={3}
                opacity={0.9}
                style={{ cursor: 'pointer' }}
                role="button" tabIndex={0} aria-label={`Move to spiral space ${i + 1}`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMove(target); } }}
                onClick={(e) => { e.stopPropagation(); onSelectMove(target); }}
              >
                <animate attributeName="r" values="16;22;16" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Snake head */}
      <circle cx={headSpace.x} cy={headSpace.y} r={48} fill="url(#head-glow)" />
      <circle cx={headSpace.x} cy={headSpace.y} r={28} fill="#c89146" stroke="#2a1808" strokeWidth={3} />
      <circle cx={headSpace.x - 9} cy={headSpace.y - 5} r={4} fill="#1a0a04" />
      <circle cx={headSpace.x + 9} cy={headSpace.y - 5} r={4} fill="#1a0a04" />
      <path d={`M ${headSpace.x - 8} ${headSpace.y + 6} Q ${headSpace.x} ${headSpace.y + 14} ${headSpace.x + 8} ${headSpace.y + 6}`}
        stroke="#1a0a04" strokeWidth={2} fill="none" />
      <text x={headSpace.x} y={headSpace.y + 46} textAnchor="middle" fontSize={12} fill="#f1cd80" fontFamily="serif" fontWeight="bold">RA</text>

      {/* Pieces */}
      {Array.from(piecesAt.entries()).map(([pos, arr]) => {
        const sq = layout[pos];
        return arr.map((p, idx) => {
          const angle = (idx / Math.max(arr.length, 1)) * Math.PI * 2;
          const off = arr.length > 1 ? 11 : 0;
          const px = sq.x + Math.cos(angle) * off;
          const py = sq.y + Math.sin(angle) * off;
          const color = state.players[p.player].color;
          const isMovable = movablePieceIds.has(p.id);
          const isSelected = p.id === selectedPieceId;
          const isLast = p.id === state.lastMovedId;
          return (
            <g
              key={p.id}
              role="button" tabIndex={isMovable ? 0 : -1}
              aria-label={`${state.players[p.player].name} ${p.kind}, space ${pos + 1}${isMovable ? ', movable' : ''}`}
              aria-pressed={isSelected}
              onKeyDown={e => { if (isMovable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelectPiece(isSelected ? null : p.id); } }}
              style={{ cursor: isMovable ? 'pointer' : 'default' }}
              onClick={(e) => {
                e.stopPropagation();
                if (isMovable) onSelectPiece(isSelected ? null : p.id);
              }}
            >
              {(isMovable || isSelected || isLast) && (
                <circle cx={px} cy={py} r={p.kind === 'lion' ? 16 : 13}
                  fill="none"
                  stroke={isSelected ? '#9bff7c' : isLast ? '#ffd66a' : '#ffffff'}
                  strokeWidth={2}
                  opacity={isSelected ? 0.95 : 0.55}>
                  {isSelected && <animate attributeName="r" values={`${p.kind === 'lion' ? 14 : 11};${p.kind === 'lion' ? 19 : 16};${p.kind === 'lion' ? 14 : 11}`} dur="1s" repeatCount="indefinite" />}
                </circle>
              )}
              {p.kind === 'lion' ? (
                <g>
                  <rect x={px - 10} y={py - 10} width={20} height={20} rx={3}
                    fill={color} stroke="#1a0a04" strokeWidth={1.5} />
                  <text x={px} y={py + 5} textAnchor="middle" fontSize={13} fontWeight="bold"
                    fill={isLightColor(color) ? '#1a0a04' : '#f1cd80'}>L</text>
                </g>
              ) : (
                <g>
                  <ellipse cx={px} cy={py} rx={9} ry={7}
                    fill={color} stroke="#1a0a04" strokeWidth={1.5} />
                  <ellipse cx={px} cy={py - 1} rx={4} ry={3} fill={isLightColor(color) ? '#7a5a30' : '#f1cd80'} opacity={0.55} />
                </g>
              )}
            </g>
          );
        });
      })}

      {/* "Return home" button — appears at tail when selected piece can bear off */}
      {selectedReturnMove && (
        <g role="button" tabIndex={0} aria-label="Return selected piece home" style={{ cursor: 'pointer' }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectMove(selectedReturnMove); } }} onClick={(e) => { e.stopPropagation(); onSelectMove(selectedReturnMove); }}>
          <circle cx={tailSpace.x} cy={tailSpace.y} r={32} fill="#9bff7c" opacity={0.25}>
            <animate attributeName="r" values="28;36;28" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={tailSpace.x} cy={tailSpace.y} r={26} fill="none" stroke="#9bff7c" strokeWidth={3} />
        </g>
      )}
    </svg>
  );
}

function isLightColor(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}

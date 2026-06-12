// SVG diagrams used in the layered "How to play" modal.
// Pure SVG — no canvas/engine deps. Scales to any size via viewBox.

import { motion } from 'framer-motion';

const COLOR = {
  light: '#e7d3a8',
  dark: '#b08855',
  frame: '#4a3728',
  corner: '#8b6914',
  throne: '#6b4423',
  attacker: '#1a1a1a',
  defender: '#f5f0e0',
  king: '#d4a017',
  highlight: '#fbbf24',
  capture: '#dc2626',
};

interface BoardProps {
  cells?: number;
}

function BoardGrid({ cells = 7 }: BoardProps) {
  const squares = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isCorner =
        (r === 0 || r === cells - 1) && (c === 0 || c === cells - 1);
      const isThrone = r === Math.floor(cells / 2) && c === Math.floor(cells / 2);
      const isLight = (r + c) % 2 === 0;
      let fill = isLight ? COLOR.light : COLOR.dark;
      if (isCorner) fill = COLOR.corner;
      if (isThrone) fill = COLOR.throne;
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={c * 10}
          y={r * 10}
          width={10}
          height={10}
          fill={fill}
          stroke={COLOR.frame}
          strokeWidth={0.3}
        />
      );
    }
  }
  return <>{squares}</>;
}

function Piece({
  r,
  c,
  type,
  highlight,
}: {
  r: number;
  c: number;
  type: 'attacker' | 'defender' | 'king';
  highlight?: 'move' | 'capture';
}) {
  const cx = c * 10 + 5;
  const cy = r * 10 + 5;
  const fill =
    type === 'attacker' ? COLOR.attacker : type === 'defender' ? COLOR.defender : COLOR.king;
  const stroke = type === 'king' ? COLOR.frame : type === 'attacker' ? '#444' : '#888';
  return (
    <g>
      {highlight === 'capture' && (
        <circle cx={cx} cy={cy} r={4.6} fill="none" stroke={COLOR.capture} strokeWidth={0.8} />
      )}
      {highlight === 'move' && (
        <circle cx={cx} cy={cy} r={4.6} fill="none" stroke={COLOR.highlight} strokeWidth={0.6} strokeDasharray="1 1" />
      )}
      <circle cx={cx} cy={cy} r={3.6} fill={fill} stroke={stroke} strokeWidth={0.4} />
      {type === 'king' && (
        <text x={cx} y={cy + 1.5} textAnchor="middle" fontSize="4" fill={COLOR.frame} fontWeight="700">
          ♔
        </text>
      )}
    </g>
  );
}

/* -------------------- Diagrams -------------------- */

export function GoalDiagram() {
  return (
    <svg viewBox="0 0 70 70" className="w-full max-w-[220px] mx-auto">
      <BoardGrid />
      <Piece r={3} c={3} type="king" />
      {/* Arrows from king to each corner */}
      {[
        { x: 5, y: 5 },
        { x: 65, y: 5 },
        { x: 5, y: 65 },
        { x: 65, y: 65 },
      ].map((p, i) => (
        <line
          key={i}
          x1={35}
          y1={35}
          x2={p.x}
          y2={p.y}
          stroke={COLOR.highlight}
          strokeWidth={0.6}
          strokeDasharray="1.5 1"
          opacity={0.7}
        />
      ))}
    </svg>
  );
}

export function MovementDiagram() {
  return (
    <svg viewBox="0 0 70 70" className="w-full max-w-[220px] mx-auto">
      <BoardGrid />
      <Piece r={3} c={3} type="defender" />
      {/* Rook-like rays */}
      {[
        { x1: 35, y1: 35, x2: 5, y2: 35 },
        { x1: 35, y1: 35, x2: 65, y2: 35 },
        { x1: 35, y1: 35, x2: 35, y2: 5 },
        { x1: 35, y1: 35, x2: 35, y2: 65 },
      ].map((l, i) => (
        <line
          key={i}
          {...l}
          stroke={COLOR.highlight}
          strokeWidth={0.8}
          strokeDasharray="2 1"
        />
      ))}
      {/* Valid destination dots */}
      {[
        [0, 3],
        [1, 3],
        [2, 3],
        [4, 3],
        [5, 3],
        [6, 3],
        [3, 0],
        [3, 1],
        [3, 2],
        [3, 4],
        [3, 5],
        [3, 6],
      ].map(([r, c], i) => (
        <circle key={i} cx={c * 10 + 5} cy={r * 10 + 5} r={1.2} fill={COLOR.highlight} />
      ))}
    </svg>
  );
}

export function CaptureDiagram() {
  return (
    <svg viewBox="0 0 70 70" className="w-full max-w-[220px] mx-auto">
      <BoardGrid />
      <Piece r={3} c={2} type="attacker" />
      <Piece r={3} c={3} type="defender" highlight="capture" />
      <Piece r={3} c={4} type="attacker" />
      <text x={35} y={62} textAnchor="middle" fontSize="3.4" fill={COLOR.frame} fontFamily="Cinzel, serif">
        Sandwich = capture
      </text>
    </svg>
  );
}

export function PiecesLegend() {
  return (
    <svg viewBox="0 0 70 20" className="w-full max-w-[260px] mx-auto">
      <g>
        <Piece r={0} c={1} type="king" />
        <text x={15} y={9} fontSize="3.2" fill={COLOR.frame} fontFamily="Cinzel, serif">King</text>
        <text x={15} y={13} fontSize="2.4" fill="#666">Must escape</text>
      </g>
      <g>
        <Piece r={0} c={3} type="defender" />
        <text x={35} y={9} fontSize="3.2" fill={COLOR.frame} fontFamily="Cinzel, serif">Defender</text>
        <text x={35} y={13} fontSize="2.4" fill="#666">Protects king</text>
      </g>
      <g>
        <Piece r={0} c={5} type="attacker" />
        <text x={55} y={9} fontSize="3.2" fill={COLOR.frame} fontFamily="Cinzel, serif">Attacker</text>
        <text x={55} y={13} fontSize="2.4" fill="#666">Hunts king</text>
      </g>
    </svg>
  );
}

/* -------------------- Animated demo -------------------- */
// A short, captioned auto-playing sequence.

interface DemoStep {
  caption: string;
  pieces: Array<{ r: number; c: number; type: 'attacker' | 'defender' | 'king'; highlight?: 'move' | 'capture' }>;
}

const DEMO_STEPS: DemoStep[] = [
  {
    caption: 'Start: the king sits at the throne, defenders around, attackers at the edges.',
    pieces: [
      { r: 3, c: 3, type: 'king' },
      { r: 2, c: 3, type: 'defender' }, { r: 4, c: 3, type: 'defender' },
      { r: 3, c: 2, type: 'defender' }, { r: 3, c: 4, type: 'defender' },
      { r: 0, c: 3, type: 'attacker' }, { r: 6, c: 3, type: 'attacker' },
      { r: 3, c: 0, type: 'attacker' }, { r: 3, c: 6, type: 'attacker' },
      { r: 1, c: 3, type: 'attacker' }, { r: 5, c: 3, type: 'attacker' },
    ],
  },
  {
    caption: 'An attacker slides up the column toward a defender…',
    pieces: [
      { r: 3, c: 3, type: 'king' },
      { r: 2, c: 3, type: 'defender' },
      { r: 4, c: 3, type: 'defender', highlight: 'move' },
      { r: 3, c: 2, type: 'defender' }, { r: 3, c: 4, type: 'defender' },
      { r: 0, c: 3, type: 'attacker' }, { r: 6, c: 3, type: 'attacker' },
      { r: 3, c: 0, type: 'attacker' }, { r: 3, c: 6, type: 'attacker' },
      { r: 5, c: 3, type: 'attacker' },
    ],
  },
  {
    caption: '…sandwiches it between two attackers — captured!',
    pieces: [
      { r: 3, c: 3, type: 'king' },
      { r: 2, c: 3, type: 'defender' },
      { r: 4, c: 3, type: 'defender', highlight: 'capture' },
      { r: 3, c: 2, type: 'defender' }, { r: 3, c: 4, type: 'defender' },
      { r: 0, c: 3, type: 'attacker' }, { r: 6, c: 3, type: 'attacker' },
      { r: 3, c: 0, type: 'attacker' }, { r: 3, c: 6, type: 'attacker' },
      { r: 5, c: 3, type: 'attacker' }, { r: 3, c: 3, type: 'attacker' }, // visual stand-in
    ],
  },
  {
    caption: 'A defender opens a path; the king will sprint to a corner to win.',
    pieces: [
      { r: 0, c: 0, type: 'king', highlight: 'move' },
      { r: 2, c: 3, type: 'defender' },
      { r: 3, c: 2, type: 'defender' }, { r: 3, c: 4, type: 'defender' },
      { r: 0, c: 3, type: 'attacker' }, { r: 6, c: 3, type: 'attacker' },
      { r: 3, c: 6, type: 'attacker' },
      { r: 5, c: 3, type: 'attacker' },
    ],
  },
];

export function AnimatedDemo({ step }: { step: number }) {
  const s = DEMO_STEPS[step % DEMO_STEPS.length];
  return (
    <div className="space-y-3">
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg viewBox="0 0 70 70" className="w-full max-w-[280px] mx-auto rounded-md shadow-lg">
          <BoardGrid />
          {s.pieces.map((p, i) => (
            <Piece key={i} {...p} />
          ))}
        </svg>
      </motion.div>
      <p className="text-sm text-center text-foreground/90 italic min-h-[2.5rem]">
        {s.caption}
      </p>
      <div className="flex justify-center gap-1.5">
        {DEMO_STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step % DEMO_STEPS.length ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export const DEMO_TOTAL_STEPS = DEMO_STEPS.length;

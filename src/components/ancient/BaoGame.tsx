import { useCallback, useMemo, useState } from 'react';
import { RotateCcw, BookOpen, Cpu, Hand, Info } from 'lucide-react';
import {
  initialBaoState, legalMoves, legalPits, applyMove, BaoState, Move,
  ringPit, NYUMBA_RING, KICHWA_RING, isInnerRing,
} from '@/lib/ancient/baoEngine';

const COLS = 8;
const ROWS = 4;
const PIT_W = 64;
const PIT_H = 64;
const GAP = 6;
const PAD = 24;
const STORE_W = 80;
const BOARD_W = PAD * 2 + STORE_W * 2 + GAP * 4 + PIT_W * COLS + GAP * (COLS - 1);
const BOARD_H = PAD * 2 + PIT_H * ROWS + GAP * (ROWS - 1);

export function BaoGame() {
  const [state, setState] = useState<BaoState>(initialBaoState);
  const [selectedPit, setSelectedPit] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  const allMoves = useMemo(() => legalMoves(state), [state]);
  const pitViews = useMemo(() => legalPits(state), [state]);
  const captureMandatory = pitViews.some((p) => p.isCapture);

  const selectedPitView = pitViews.find((v) => v.ringIndex === selectedPit) ?? null;
  const moveOptions = selectedPitView ? selectedPitView.moves : [];

  const onPitClick = useCallback((ri: number) => {
    const view = pitViews.find((v) => v.ringIndex === ri);
    if (!view) return;
    setSelectedPit(ri);
    // If only one move possible from this pit, apply immediately
    if (view.moves.length === 1) {
      setState(applyMove(state, view.moves[0]).state);
      setSelectedPit(null);
    }
  }, [pitViews, state]);

  const onChooseMove = (m: Move) => {
    setState(applyMove(state, m).state);
    setSelectedPit(null);
  };

  const reset = () => { setState(initialBaoState()); setSelectedPit(null); };

  const turnPlayer = state.turn;
  const nyumbaStatusLabel = state.nyumba[turnPlayer];
  const phaseLabel = state.phase === 'kunamua' ? 'Phase 1 · Kunamua' : 'Phase 2 · Mtaji';

  return (
    <div className="absolute inset-0 overflow-auto flex flex-col items-center bao-bg">
      <style>{`
        .bao-bg { background: radial-gradient(ellipse at top, #4a2d18 0%, #1c0f08 70%), #1c0f08; }
        .bao-card { background: linear-gradient(180deg, #f1d9a3, #d6b275); color: #2a1808; border: 1.5px solid #6e3f18; box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4); }
        .bao-btn { background: linear-gradient(180deg, #d8a850, #8a5a22); color: #2a1808; border: 1.5px solid #2a1808; font-family: 'Cinzel', serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 3px 10px rgba(0,0,0,0.4); }
        .bao-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pit-fill { fill: #c79a55; }
        .pit-stroke { stroke: #2a1808; stroke-width: 1.5; }
        @keyframes lore-fade { 0%{opacity:0;transform:translateY(-6px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        @keyframes seed-pop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>

      {/* Top bar */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 px-3 py-2">
        <div className="bao-card rounded-md px-3 py-1.5 text-xs sm:text-sm font-['Cinzel'] flex items-center gap-2">
          <span className="font-bold">Bao la Kiswahili</span>
          <span className="opacity-60">·</span>
          <span>{phaseLabel}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRules(true)} className="bao-btn px-3 py-1.5 rounded-md text-xs inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Rules
          </button>
          <button onClick={reset} className="bao-btn px-3 py-1.5 rounded-md text-xs inline-flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className="w-full max-w-5xl px-3 mb-2">
        <div className="bao-card rounded-md px-3 py-2 text-xs sm:text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-['Cinzel'] font-bold">{state.winner === null ? `Player ${turnPlayer + 1}'s turn` : `Player ${state.winner + 1} wins`}</span>
          {state.winner === null && (
            <>
              <span className="opacity-70">·</span>
              <span>
                {captureMandatory ? (
                  <b className="text-red-800">A capture is available — you must capture.</b>
                ) : (
                  <>Choose a glowing pit to sow.</>
                )}
              </span>
              <span className="opacity-70">·</span>
              <span>Storage: <b>P1 {state.storage[0]}</b> / <b>P2 {state.storage[1]}</b></span>
              <span className="opacity-70">·</span>
              <span>Nyumba: P1 <b>{state.nyumba[0]}</b> · P2 <b>{state.nyumba[1]}</b></span>
            </>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="w-full px-2 flex justify-center">
        <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className="w-full max-w-4xl h-auto block select-none">
          <defs>
            <linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a5a28" />
              <stop offset="100%" stopColor="#5e3a18" />
            </linearGradient>
            <radialGradient id="pitGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#6a4520" />
              <stop offset="100%" stopColor="#2c1808" />
            </radialGradient>
            <radialGradient id="pitLegal" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#9ec48a" />
              <stop offset="100%" stopColor="#3a5d2c" />
            </radialGradient>
            <radialGradient id="pitCapture" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#f0a06a" />
              <stop offset="100%" stopColor="#7a3414" />
            </radialGradient>
          </defs>

          {/* Carved board background */}
          <rect x={0} y={0} width={BOARD_W} height={BOARD_H} rx={20} fill="url(#woodGrad)" />
          <rect x={6} y={6} width={BOARD_W - 12} height={BOARD_H - 12} rx={16} fill="none" stroke="#3a2410" strokeWidth={2} opacity={0.6} />

          {/* Storage areas (left = P1 storage, right = P2 storage) */}
          {[0, 1].map((p) => {
            const x = p === 0 ? PAD : BOARD_W - PAD - STORE_W;
            return (
              <g key={`store-${p}`}>
                <rect x={x} y={PAD} width={STORE_W} height={BOARD_H - PAD * 2} rx={12} fill="url(#pitGrad)" className="pit-stroke" />
                <text x={x + STORE_W / 2} y={PAD + 24} textAnchor="middle" fontSize={11} fontFamily="serif" fill="#f1cd80">P{p + 1} STORE</text>
                <text x={x + STORE_W / 2} y={BOARD_H / 2 + 8} textAnchor="middle" fontSize={32} fontWeight="bold" fontFamily="serif" fill="#f1d9a3">{state.storage[p]}</text>
                <text x={x + STORE_W / 2} y={BOARD_H / 2 + 32} textAnchor="middle" fontSize={10} fill="#f1cd80" opacity={0.7}>seeds</text>
              </g>
            );
          })}

          {/* Row labels */}
          {[
            { row: 0, label: 'P2 OUTER', side: 'top' },
            { row: 1, label: 'P2 INNER', side: 'top' },
            { row: 2, label: 'P1 INNER', side: 'bottom' },
            { row: 3, label: 'P1 OUTER', side: 'bottom' },
          ].map(({ row, label }) => {
            const y = PAD + row * (PIT_H + GAP) + PIT_H / 2 + 4;
            return (
              <text key={row} x={PAD + STORE_W + GAP + 2} y={y - PIT_H / 2 - 4} fontSize={8} fill="#f1cd80" opacity={0.6} fontFamily="serif">{label}</text>
            );
          })}

          {/* Pits */}
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: COLS }).map((_, col) => {
              const x = PAD + STORE_W + GAP * 2 + col * (PIT_W + GAP);
              const y = PAD + row * (PIT_H + GAP);
              const seeds = state.pits[row][col];

              // who owns this row?
              const owner: 0 | 1 = (row === 2 || row === 3) ? 0 : 1;
              const isOwnersInner = (owner === 0 && row === 2) || (owner === 1 && row === 1);
              const isOwnersTurn = owner === turnPlayer && state.winner === null;

              // ring index from owner POV
              const innerRow = owner === 0 ? 2 : 1;
              const outerRow = owner === 0 ? 3 : 0;
              let ri: number;
              if (row === innerRow) ri = owner === 0 ? col : 7 - col;
              else ri = owner === 0 ? 15 - col : 8 + col;

              const isNyumba = isOwnersInner && ri === NYUMBA_RING;
              const isKichwa = isOwnersInner && (KICHWA_RING as readonly number[]).includes(ri);

              const pv = isOwnersTurn ? pitViews.find((v) => v.ringIndex === ri) : undefined;
              const isLegal = !!pv;
              const isCapPit = !!pv?.isCapture;
              const isSelected = isOwnersTurn && selectedPit === ri;

              return (
                <g key={`${row}-${col}`}
                  style={{ cursor: isLegal ? 'pointer' : 'default' }}
                  onClick={() => { if (isLegal) onPitClick(ri); }}>
                  {/* Pit background */}
                  {isNyumba ? (
                    <rect x={x + 2} y={y + 2} width={PIT_W - 4} height={PIT_H - 4} rx={6}
                      fill={isCapPit ? 'url(#pitCapture)' : isLegal ? 'url(#pitLegal)' : 'url(#pitGrad)'}
                      className="pit-stroke" strokeWidth={isSelected ? 3 : 1.5}
                      stroke={isSelected ? '#9bff7c' : '#2a1808'} />
                  ) : (
                    <ellipse cx={x + PIT_W / 2} cy={y + PIT_H / 2} rx={PIT_W / 2 - 4} ry={PIT_H / 2 - 6}
                      fill={isCapPit ? 'url(#pitCapture)' : isLegal ? 'url(#pitLegal)' : 'url(#pitGrad)'}
                      className="pit-stroke" strokeWidth={isSelected ? 3 : 1.5}
                      stroke={isSelected ? '#9bff7c' : '#2a1808'} />
                  )}

                  {/* Kichwa marker */}
                  {isKichwa && (
                    <text x={x + 6} y={y + 14} fontSize={8} fontFamily="serif" fill="#f1cd80" opacity={0.85}>K</text>
                  )}
                  {/* Nyumba marker */}
                  {isNyumba && (
                    <text x={x + PIT_W - 14} y={y + 14} fontSize={8} fontFamily="serif"
                      fill={state.nyumba[owner] === 'destroyed' ? '#a82020' : state.nyumba[owner] === 'inactive' ? '#aaaa70' : '#f1cd80'}>
                      N
                    </text>
                  )}

                  {/* Seed count */}
                  <text x={x + PIT_W / 2} y={y + PIT_H / 2 + 6} textAnchor="middle"
                    fontSize={20} fontWeight="bold" fontFamily="serif"
                    fill={seeds === 0 ? '#5a3a18' : '#f1d9a3'}>
                    {seeds}
                  </text>

                  {/* Highlight ring */}
                  {isLegal && !isSelected && (
                    <ellipse cx={x + PIT_W / 2} cy={y + PIT_H / 2} rx={PIT_W / 2 - 2} ry={PIT_H / 2 - 4}
                      fill="none" stroke={isCapPit ? '#ff8c4a' : '#9bff7c'} strokeWidth={2} opacity={0.7}>
                      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.4s" repeatCount="indefinite" />
                    </ellipse>
                  )}
                </g>
              );
            })
          )}

          {/* Last-capture marker */}
          {state.lastCapture && (() => {
            const x = PAD + STORE_W + GAP * 2 + state.lastCapture.col * (PIT_W + GAP);
            const y = PAD + state.lastCapture.row * (PIT_H + GAP);
            return (
              <circle cx={x + PIT_W / 2} cy={y + PIT_H / 2} r={PIT_W / 2}
                fill="none" stroke="#ff5050" strokeWidth={2} opacity={0.6}>
                <animate attributeName="r" values={`${PIT_W / 2 - 4};${PIT_W / 2 + 4};${PIT_W / 2 - 4}`} dur="1.5s" repeatCount="indefinite" />
              </circle>
            );
          })()}
        </svg>
      </div>

      {/* Move option chooser */}
      {selectedPitView && moveOptions.length > 1 && (
        <div className="w-full max-w-4xl px-3 mt-2">
          <div className="bao-card rounded-md p-3 text-xs space-y-2">
            <div className="font-['Cinzel'] font-bold flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5" /> Choose how to play this pit:
            </div>
            <div className="flex flex-wrap gap-2">
              {moveOptions.map((m, idx) => {
                const dirLabel = m.direction === 'fwd' ? 'forward →' : '← backward';
                const kLabel = m.kichwaChoice !== undefined ? ` · enter from Kichwa ${m.kichwaChoice === 0 ? 'left' : 'right'}` : '';
                const taxLabel = m.taxation ? ' · taxation (2 seeds only)' : '';
                return (
                  <button key={idx} onClick={() => onChooseMove(m)} className="bao-btn px-3 py-1.5 rounded-md text-xs">
                    Sow {dirLabel}{kLabel}{taxLabel}
                  </button>
                );
              })}
              <button onClick={() => setSelectedPit(null)} className="bao-card rounded-md px-3 py-1.5 text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Log */}
      <div className="w-full max-w-4xl px-3 mt-2 pb-3">
        <div className="bao-card rounded-md p-2 max-h-28 overflow-y-auto text-[11px] font-mono space-y-0.5">
          {state.log.slice(-8).map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      {/* Latest lore message */}
      {state.log.length > 0 && (
        <div key={state.log.length}
          className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 bao-card rounded-md px-3 py-1.5 text-xs font-['Cinzel'] italic max-w-md text-center"
          style={{ animation: 'lore-fade 3.5s ease-in-out' }}>
          {state.log[state.log.length - 1]}
        </div>
      )}

      {state.winner !== null && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4" onClick={reset}>
          <div className="bao-card rounded-xl p-6 max-w-md text-center">
            <div className="text-xs font-['Cinzel'] uppercase opacity-70 tracking-widest">The game is decided</div>
            <div className="text-2xl font-['Cinzel'] font-bold my-2">Player {state.winner + 1} wins!</div>
            <div className="text-sm mb-3">{state.winReason}</div>
            <button className="bao-btn px-4 py-2 rounded-md text-sm">Play again</button>
          </div>
        </div>
      )}

      {showRules && <BaoRulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

function BaoRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bao-card rounded-xl p-5 max-w-xl w-full max-h-[85vh] overflow-y-auto text-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-['Cinzel'] font-bold mb-3 text-center">How to Play Bao la Kiswahili</h3>
        <div className="space-y-2.5 leading-relaxed">
          <p><b>Board.</b> 4 rows × 8 pits. Each player owns one inner (front) row and one outer (back) row. The <b>Nyumba</b> is the square pit on your inner row, and the two end pits of your inner row are the <b>Kichwa</b>.</p>
          <p><b>Phase 1 — Kunamua.</b> Take one seed from your storage and drop it into any non-empty pit on your side, then sow (lift all seeds, drop one at a time in the chosen direction).</p>
          <p><b>Phase 2 — Mtaji.</b> Once storages are empty, pick a pit on your side with at least 2 seeds and sow. Outer-row pits may only be chosen when no inner pit has more than one seed.</p>
          <p><b>Sowing & relay.</b> If your last seed lands in a non-empty pit on your side, lift those seeds and continue sowing. Highlighted pits show your legal moves.</p>
          <p><b>Capture.</b> If your last seed lands in a non-empty pit on your <i>inner</i> row, and the directly opposite opponent inner pit has seeds, you capture them. Re-sow the captured seeds from one of your Kichwa pits, sowing <i>toward</i> the Nyumba.</p>
          <p><b>Mandatory capture.</b> If any capture move is available, you must play one of them.</p>
          <p><b>Nyumba.</b> Your Nyumba is <i>functional</i> when it holds 6+ seeds. The final seed of a non-capture move that lands in your functional Nyumba ends the move (resting in the house). If the opponent captures all seeds from your Nyumba, it is <i>destroyed</i>. In Phase 1 the Nyumba may only be played when it captures, or when it's the last non-empty inner pit (taxation — 2 seeds only).</p>
          <p><b>Win.</b> You win when the opponent's inner row is empty in Phase 2, or when they have no legal move.</p>
          <p className="italic opacity-75 border-t border-amber-800/20 pt-2">
            Not yet implemented: blocking rule, long-sowing (&gt;16 seeds) capture restriction, and the "destroy Nyumba to continue (Safari)" choice — for now landing the final seed in a functional Nyumba always stops the move.
          </p>
        </div>
        <button onClick={onClose} className="bao-btn w-full py-2 rounded-md text-sm mt-4">Close</button>
      </div>
    </div>
  );
}

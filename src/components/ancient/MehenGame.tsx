import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dices, RotateCcw, BookOpen, Users, Cpu, User } from 'lucide-react';
import {
  MehenState, MehenMove, initialMehenState, legalMehenMoves,
  applyMehenMove, passMehenTurn, chooseAIMehenMove, castSticks,
  MEHEN_PLAYER_COLORS, MEHEN_PLAYER_NAMES,
} from '@/lib/ancient/mehenEngine';
import { MehenBoard } from './MehenBoard';

type SetupSlot = { isAI: boolean };

export function MehenGame() {
  const [setup, setSetup] = useState<SetupSlot[] | null>(null);
  const [state, setState] = useState<MehenState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const start = useCallback((slots: SetupSlot[]) => {
    setSetup(slots);
    setState(initialMehenState(slots));
    setSelectedPieceId(null);
  }, []);

  const myMoves = useMemo(() => {
    if (!state || !state.rolled || state.winner !== null) return [];
    return legalMehenMoves(state, state.dice);
  }, [state]);

  const currentPlayer = state ? state.players[state.turn] : null;
  const isAITurn = !!currentPlayer?.isAI && state?.winner === null;

  const handleRoll = useCallback(() => {
    if (!state || state.rolled || state.winner !== null) return;
    setRolling(true);
    setTimeout(() => {
      const { value, faces } = castSticks();
      const rolled: MehenState = { ...state, dice: value, faces, rolled: true,
        log: [...state.log, `${state.players[state.turn].name} casts: ${value}`] };
      const moves = legalMehenMoves(rolled, value);
      setRolling(false);
      if (moves.length === 0) {
        setState(passMehenTurn(rolled, `casts ${value} — no legal move`));
      } else {
        setState(rolled);
      }
    }, 600);
  }, [state]);

  // AI auto-roll and move
  useEffect(() => {
    if (!state || state.winner !== null || !isAITurn) return;
    if (!state.rolled && !rolling) {
      const id = setTimeout(() => {
        const { value, faces } = castSticks();
        const rolled: MehenState = { ...state, dice: value, faces, rolled: true,
          log: [...state.log, `${state.players[state.turn].name} casts: ${value}`] };
        const move = chooseAIMehenMove(rolled, value);
        setAiThinking(true);
        setTimeout(() => {
          setAiThinking(false);
          if (!move) setState(passMehenTurn(rolled, `casts ${value} — no legal move`));
          else setState(applyMehenMove(rolled, move));
        }, 700);
      }, 500);
      return () => clearTimeout(id);
    }
  }, [state, isAITurn, rolling]);

  const playMove = (m: MehenMove) => {
    if (!state) return;
    setSelectedPieceId(null);
    setState(applyMehenMove(state, m));
  };

  // Auto-select & auto-play when only one move available
  useEffect(() => {
    if (!state || isAITurn) return;
    if (myMoves.length === 1) {
      setSelectedPieceId(myMoves[0].pieceId);
    } else if (myMoves.length > 1 && selectedPieceId) {
      const stillHas = myMoves.some((m) => m.pieceId === selectedPieceId);
      if (!stillHas) setSelectedPieceId(null);
    }
  }, [myMoves, isAITurn]); // eslint-disable-line

  if (!setup || !state) return <MehenSetup onStart={start} />;

  return (
    <div className="absolute inset-0 overflow-hidden mehen-bg flex flex-col">
      <style>{`
        .mehen-bg {
          background:
            radial-gradient(ellipse at top, #2a1809 0%, #14090a 70%),
            #14090a;
        }
        .mehen-card {
          background: linear-gradient(180deg, #f1d9a3, #d6b275);
          color: #2a1808;
          border: 1.5px solid #6e3f18;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .mehen-btn {
          background: linear-gradient(180deg, #d8a850, #8a5a22);
          color: #2a1808;
          border: 1.5px solid #2a1808;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.05em;
          font-weight: 700;
          text-transform: uppercase;
          box-shadow: 0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,230,160,0.4);
        }
        .mehen-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @keyframes lore-fade {
          0% { opacity: 0; transform: translateY(-6px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-3 py-2">
        <div className="mehen-card rounded-md px-3 py-1.5 text-xs sm:text-sm font-['Cinzel'] flex items-center gap-2">
          <span className="font-bold">Mehen</span>
          <span className="opacity-60">·</span>
          <span>Game of the Coiled One</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRules(true)} className="mehen-btn px-3 py-1.5 rounded-md text-xs inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Rules
          </button>
          <button onClick={() => { setSetup(null); setState(null); }} className="mehen-btn px-3 py-1.5 rounded-md text-xs inline-flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> New game
          </button>
        </div>
      </div>

      {/* Main board area */}
      <div className="relative flex-1 flex items-center justify-center px-2 pb-2 min-h-0">
        <MehenBoard
          state={state}
          myMoves={isAITurn ? [] : myMoves}
          onSelectMove={playMove}
          selectedPieceId={selectedPieceId}
          onSelectPiece={setSelectedPieceId}
        />

        {/* Player roster (right) */}
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 max-w-[180px]">
          {state.players.map((p, i) => {
            const remaining = state.pieces.filter((x) => x.player === i && x.kind === 'pawn' && (x.status === 'off' || x.status === 'in' || x.status === 'out')).length;
            const returned = state.pieces.filter((x) => x.player === i && x.kind === 'pawn' && x.status === 'returned').length;
            const isCurrent = i === state.turn && state.winner === null;
            return (
              <div key={i}
                className={`mehen-card rounded-md px-2 py-1.5 text-[11px] ${isCurrent ? 'ring-2 ring-amber-300 scale-[1.02]' : ''}`}>
                <div className="flex items-center gap-1.5 font-['Cinzel'] font-bold">
                  <span className="inline-block w-3 h-3 rounded-full border border-amber-950" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                  {p.isAI && <Cpu className="w-3 h-3 opacity-60" />}
                </div>
                <div className="flex justify-between gap-2 mt-0.5">
                  <span title="Pawns devoured">🦁 {p.captures}</span>
                  <span title="Pawns left">◉ {remaining}</span>
                  <span title="Returned safely">✦ {returned}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lore message (latest log) */}
        {state.log.length > 0 && (
          <div key={state.log.length}
            className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 mehen-card rounded-md px-3 py-1.5 text-xs font-['Cinzel'] italic"
            style={{ animation: 'lore-fade 4s ease-in-out' }}>
            {state.log[state.log.length - 1]}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="relative z-20 px-3 pb-3 pt-2 flex flex-col items-center gap-2">
        <CastingSticks faces={state.faces} rolled={state.rolled} rolling={rolling} value={state.dice} />
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={handleRoll}
            disabled={state.rolled || state.winner !== null || isAITurn || rolling}
            className="mehen-btn px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2"
          >
            <Dices className={`w-4 h-4 ${rolling ? 'animate-spin' : ''}`} />
            {rolling ? 'Casting…' : isAITurn ? (aiThinking ? `${currentPlayer?.name} thinks…` : `${currentPlayer?.name} casts…`)
              : state.rolled ? `Rolled ${state.dice} — choose a piece` : `${currentPlayer?.name}: cast sticks`}
          </button>
          {state.rolled && !isAITurn && myMoves.length > 1 && selectedPieceId === null && (
            <span className="mehen-card rounded-md px-3 py-1.5 text-xs italic">Tap a glowing piece</span>
          )}
        </div>
      </div>

      {state.winner !== null && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4" onClick={() => { setSetup(null); setState(null); }}>
          <div className="mehen-card rounded-xl p-6 max-w-md text-center">
            <div className="text-xs font-['Cinzel'] uppercase opacity-70 tracking-widest">Mehen has spoken</div>
            <div className="text-2xl font-['Cinzel'] font-bold mt-2 mb-1" style={{ color: state.players[state.winner].color === '#E8DCC2' ? '#6e3f18' : state.players[state.winner].color }}>
              {state.players[state.winner].name} triumphs!
            </div>
            <div className="text-sm mb-3">
              Devoured pawns: {state.players[state.winner].captures}
              {state.endTie && <div className="text-xs italic opacity-70 mt-1">Tie broken by earliest return.</div>}
            </div>
            <button className="mehen-btn px-4 py-2 rounded-md text-sm">Play again</button>
          </div>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

function CastingSticks({ faces, rolled, rolling, value }: { faces: number[]; rolled: boolean; rolling: boolean; value: number }) {
  const display = rolling ? [0, 1, 0, 1] : (faces.length === 4 ? faces : [0, 0, 0, 0]);
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2">
        {display.map((f, i) => (
          <div key={i}
            className={`relative w-10 h-3 rounded-sm border border-amber-950 transition-transform ${rolling ? 'animate-spin' : ''}`}
            style={{
              background: f
                ? 'linear-gradient(180deg, #f3deb1, #c9a86a)'
                : 'linear-gradient(180deg, #2a1808, #120903)',
              transformOrigin: 'center',
              animationDuration: '0.4s',
              animationDelay: `${i * 0.05}s`,
            }}>
            <div className="absolute inset-x-1 top-[1px] h-[1.5px] rounded-full"
              style={{ background: f ? 'rgba(255,235,180,0.7)' : 'rgba(180,120,60,0.25)' }} />
          </div>
        ))}
      </div>
      {rolled && !rolling && (
        <div className="mehen-card rounded-md px-2 py-1 text-xs font-['Cinzel'] font-bold">
          {faces.reduce((a, b) => a + b, 0)} light → move {value}
        </div>
      )}
    </div>
  );
}

function MehenSetup({ onStart }: { onStart: (slots: SetupSlot[]) => void }) {
  const [count, setCount] = useState(2);
  const [slots, setSlots] = useState<SetupSlot[]>([{ isAI: false }, { isAI: true }]);

  const setCountSafe = (n: number) => {
    setCount(n);
    setSlots((cur) => {
      const next = [...cur];
      while (next.length < n) next.push({ isAI: true });
      next.length = n;
      return next;
    });
  };

  return (
    <div className="absolute inset-0 mehen-bg flex items-center justify-center p-4 overflow-auto">
      <style>{`
        .mehen-bg { background: radial-gradient(ellipse at top, #2a1809 0%, #14090a 70%), #14090a; }
        .mehen-card { background: linear-gradient(180deg, #f1d9a3, #d6b275); color: #2a1808; border: 1.5px solid #6e3f18; box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4); }
        .mehen-btn { background: linear-gradient(180deg, #d8a850, #8a5a22); color: #2a1808; border: 1.5px solid #2a1808; font-family: 'Cinzel', serif; letter-spacing: 0.05em; font-weight: 700; text-transform: uppercase; box-shadow: 0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,230,160,0.4); }
      `}</style>
      <div className="mehen-card rounded-xl p-5 sm:p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="text-[10px] font-['Cinzel'] tracking-[0.3em] uppercase opacity-70">Predynastic Egypt · c. 3000 BCE</div>
          <h2 className="text-3xl font-['Cinzel'] font-bold mt-1">Mehen</h2>
          <p className="text-xs mt-1 italic opacity-75">The Game of the Coiled Serpent</p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs font-['Cinzel'] font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Players
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 3, 4, 5, 6].map((n) => (
                <button key={n}
                  onClick={() => setCountSafe(n)}
                  className={`py-2 rounded-md text-sm font-['Cinzel'] font-bold border-2 ${count === n ? 'border-amber-950 bg-amber-900/20' : 'border-transparent bg-amber-50/40'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {slots.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-amber-50/40 rounded-md px-2 py-1.5">
                <span className="inline-block w-4 h-4 rounded-full border border-amber-950 shrink-0" style={{ backgroundColor: MEHEN_PLAYER_COLORS[i] }} />
                <span className="text-sm font-['Cinzel'] font-bold flex-1">{MEHEN_PLAYER_NAMES[i]}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSlots((cur) => cur.map((x, j) => j === i ? { isAI: false } : x))}
                    className={`px-2 py-1 rounded text-[10px] font-['Cinzel'] inline-flex items-center gap-1 ${!s.isAI ? 'bg-amber-900 text-amber-50' : 'bg-amber-50/60'}`}>
                    <User className="w-3 h-3" /> Human
                  </button>
                  <button
                    onClick={() => setSlots((cur) => cur.map((x, j) => j === i ? { isAI: true } : x))}
                    className={`px-2 py-1 rounded text-[10px] font-['Cinzel'] inline-flex items-center gap-1 ${s.isAI ? 'bg-amber-900 text-amber-50' : 'bg-amber-50/60'}`}>
                    <Cpu className="w-3 h-3" /> AI
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => onStart(slots)} className="mehen-btn w-full py-3 rounded-lg text-base mt-2">
            Enter the Coils
          </button>

          <p className="text-[10px] italic opacity-70 text-center mt-1">
            The true rules of Mehen are lost to time. This is a modern interpretation honouring the spiral serpent, the soul's journey, and the lion's hunt.
          </p>
        </div>
      </div>
    </div>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="mehen-card rounded-xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto text-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-['Cinzel'] font-bold mb-3 text-center">How to Play Mehen</h3>
        <div className="space-y-2.5 leading-relaxed">
          <p><b>The board</b> is the coiled serpent Mehen. Souls enter at the outer <i>tail</i> and travel inward to the <i>head</i> where Ra awaits.</p>
          <p><b>Casting sticks.</b> Four sticks each have a light and dark side. The number of light sides = your move; <i>no</i> light sides = move 5.</p>
          <p><b>Phase 1 — Journey inward.</b> Bring pawns onto the snake on any roll. Land on an opponent's pawn to <i>swap positions</i>. You must reach the head by exact roll. When all 6 of your pawns reach the head, your <i>lion awakens</i>.</p>
          <p><b>Phase 2 — Return outward.</b> Move your pawns back toward the tail. Your lion moves at <b>double speed</b>. When a lion lands on an opponent's pawn it is <i>devoured</i> and removed. Lions swap with other lions. Pawns still swap with pawns. Any roll that reaches or passes the tail returns the piece safely.</p>
          <p><b>Victory.</b> The player whose lion devours the most enemy pawns wins. If tied, the first to return all their pawns home wins.</p>
        </div>
        <button onClick={onClose} className="mehen-btn w-full py-2 rounded-md text-sm mt-4">Close</button>
      </div>
    </div>
  );
}

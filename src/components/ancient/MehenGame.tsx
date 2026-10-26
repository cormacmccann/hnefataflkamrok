import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dices, BookOpen, Users, Cpu, User } from 'lucide-react';
import {
  MehenState, MehenMove, initialMehenState, legalMehenMoves,
  applyMehenMove, passMehenTurn, chooseAIMehenMove, castSticks,
  MEHEN_PLAYER_COLORS, MEHEN_PLAYER_NAMES,
} from '@/lib/ancient/mehenEngine';
import { MehenBoard } from './MehenBoard';
import { MehenBoard3D } from './MehenBoard3D';
import { Ancient3DScene } from './Ancient3DScene';
import { AncientGameShell } from './AncientGameShell';
import { BoardView } from '@/components/game/BoardViewToggle';

type SetupSlot = { isAI: boolean };

export function MehenGame() {
  const { tr } = useUiTranslation();
  const [setup, setSetup] = useState<SetupSlot[] | null>(null);
  const [state, setState] = useState<MehenState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [view, setView] = useState<BoardView>('3d');
  const rollTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(rollTimer.current), []);
  const start = useCallback((slots: SetupSlot[]) => {
    clearTimeout(rollTimer.current); setRolling(false); setSetup(slots);
    setState(initialMehenState(slots)); setSelectedPieceId(null);
  }, []);
  const myMoves = useMemo(() => !state || !state.rolled || state.winner !== null ? [] : legalMehenMoves(state, state.dice), [state]);
  const currentPlayer = state ? state.players[state.turn] : null;
  const isAITurn = !!currentPlayer?.isAI && state?.winner === null;
  const handleRoll = useCallback(() => {
    if (!state || state.rolled || state.winner !== null || isAITurn || rolling) return;
    setRolling(true);
    rollTimer.current = setTimeout(() => {
      const { value, faces } = castSticks();
      const rolled: MehenState = { ...state, dice: value, faces, rolled: true, log: [...state.log, `${state.players[state.turn].name} casts: ${value}`] };
      setRolling(false);
      const moves = legalMehenMoves(rolled, value);
      setState(moves.length ? rolled : passMehenTurn(rolled, `casts ${value} — no legal move`));
    }, 500);
  }, [state, isAITurn, rolling]);
  useEffect(() => {
    if (!state || state.winner !== null || !isAITurn) return;
    const id = setTimeout(() => {
      const { value, faces } = castSticks();
      const rolled: MehenState = { ...state, dice: value, faces, rolled: true, log: [...state.log, `${state.players[state.turn].name} casts: ${value}`] };
      const move = chooseAIMehenMove(rolled, value);
      setState(move ? applyMehenMove(rolled, move) : passMehenTurn(rolled, `casts ${value} — no legal move`));
    }, 1100);
    return () => clearTimeout(id);
  }, [state, isAITurn]);
  const playMove = (move: MehenMove) => {
    if (!state || isAITurn || !state.rolled || !myMoves.some(m => m.pieceId === move.pieceId && m.toPos === move.toPos && m.kind === move.kind)) return;
    setSelectedPieceId(null); setState(applyMehenMove(state, move));
  };
  const reset = () => { clearTimeout(rollTimer.current); setRolling(false); setSetup(null); setState(null); setSelectedPieceId(null); };
  if (!setup || !state) return <MehenSetup onStart={start} />;
  const status = state.winner !== null ? tr('{side} wins', { side: state.players[state.winner].name }) : `${currentPlayer?.name} · ${isAITurn ? tr('opponent thinking…') : state.rolled ? tr('cast {v0} · choose a move', { v0: state.dice }) : tr('cast sticks to begin')}`;
  const humanMoves = isAITurn ? [] : myMoves;
  const displayedMoves = humanMoves.filter((move, i, moves) => move.kind !== 'enter' || moves.findIndex(other => other.kind === 'enter') === i);
  return <>
    <AncientGameShell title="Mehen" status={status} view={view} onViewChange={setView} onRestart={reset} log={state.log}
      rules={tr("The original rules are lost. This modern interpretation sends six pawns inward, then home; awakened lions capture on the return journey. Most captures wins, with return order breaking ties.")}
      controls={<>
        <div className="ancient-roster">{state.players.map((p,i) => <span key={i} className={state.turn === i ? 'current' : ''}><i style={{ color:p.color }}>●</i> {p.name}{p.isAI ? ` · ${tr('AI')}` : ''} · {p.captures} {tr('captures ·')} {state.pieces.filter(x=>x.player===i&&x.kind==='pawn'&&x.status==='returned').length}{tr('/6 home')}</span>)}</div>
        <button className="ancient-move-button" onClick={handleRoll} disabled={state.rolled || state.winner !== null || isAITurn || rolling}><Dices size={15} />{rolling ? tr('Casting…') : isAITurn ? tr('Opponent’s turn') : state.rolled ? tr('cast {v0} · choose a move', { v0: state.dice }) : tr('Cast sticks')}</button>
        <button className="ancient-move-button secondary" onClick={() => setShowRules(true)}><BookOpen size={15} />{tr('Rules of this table')}</button>
        {displayedMoves.map((move,i) => {
          const piece=state.pieces.find(p=>p.id===move.pieceId);
          const label=piece?.kind==='lion'?tr('lion'):`${tr('Pawn')} ${Number(move.pieceId.split('pawn')[1])+1}`;
          return <button key={i} className="ancient-move-button secondary" onClick={() => playMove(move)}>{move.kind==='enter'?`${tr('Enter')} `:''}{label} {move.kind==='returnHome'?`→ ${tr('home')}`:`→ ${move.toPos+1}`}</button>;
        })}
      </>}>
      {view === '3d' ? <Ancient3DScene cameraPosition={[0,11,7]} eraId="mehen"><MehenBoard3D state={state} myMoves={humanMoves} onSelectMove={playMove} selectedPieceId={selectedPieceId} onSelectPiece={setSelectedPieceId} /></Ancient3DScene> : <div className="ancient-mehen-board"><MehenBoard state={state} myMoves={humanMoves} onSelectMove={playMove} selectedPieceId={selectedPieceId} onSelectPiece={setSelectedPieceId} /></div>}
    </AncientGameShell>
    {showRules && <RulesModal onClose={() => setShowRules(false)} />}
  </>;
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  initialUrState, rollDice, legalMoves, applyMove, passTurn, chooseAIMove,
  UrState, UrMove,
} from '@/lib/ancient/royalUr';
import { Dices, RotateCcw } from 'lucide-react';
import { Ancient3DScene } from './Ancient3DScene';
import { RoyalUrBoard3D } from './RoyalUrBoard3D';
import { EraBackdrop } from './EraBackdrop';


export function RoyalUrGame() {
  const [state, setState] = useState<UrState>(initialUrState);
  const [aiThinking, setAiThinking] = useState(false);
  const [rolling, setRolling] = useState(false);

  const myMoves = useMemo(
    () => (state.rolled && state.turn === 'white' ? legalMoves(state, state.dice) : []),
    [state]
  );

  const onRoll = useCallback(() => {
    if (state.rolled || state.winner || state.turn !== 'white') return;
    setRolling(true);
    setTimeout(() => {
      const r = rollDice();
      const next = { ...state, dice: r, rolled: true, log: [...state.log, `White rolled ${r}`] };
      const moves = legalMoves(next, r);
      setRolling(false);
      if (moves.length === 0) setState(passTurn(next, r === 0 ? 'Rolled 0.' : 'No legal move.'));
      else setState(next);
    }, 600);
  }, [state]);

  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const r = rollDice();
      const next = { ...state, dice: r, rolled: true, log: [...state.log, `Black rolled ${r}`] };
      const move = chooseAIMove(next, r);
      if (!move) setState(passTurn(next, r === 0 ? 'Rolled 0.' : 'No legal move.'));
      else setState(applyMove(next, move));
      setAiThinking(false);
    }, 900);
    return () => { clearTimeout(id); setAiThinking(false); };
  }, [state]);

  const trySelectMove = (m: UrMove) => {
    if (state.turn !== 'white' || !state.rolled || state.winner) return;
    setState(applyMove(state, m));
  };
  const reset = () => setState(initialUrState());

  return (
    <div className="absolute inset-0">
      <Ancient3DScene cameraPosition={[0, 9, 8]} minDistance={7} maxDistance={20} eraId="royal-ur">
        <RoyalUrBoard3D state={state} myMoves={myMoves} onMove={trySelectMove} />
      </Ancient3DScene>

      {/* HUD: header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 parchment rounded-lg px-4 py-2 flex items-center gap-3 text-amber-950 text-sm font-['Cinzel']">
        <span className="font-bold">Royal Game of Ur</span>
        <span className="opacity-70">·</span>
        <span>
          {state.winner ? `${state.winner === 'white' ? 'You' : 'AI'} won` : state.turn === 'white' ? 'Your turn' : 'AI turn'}
        </span>
      </div>

      <button
        onClick={reset}
        className="absolute top-4 right-4 z-20 carved-button px-3 py-2 rounded-md text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <RotateCcw className="w-4 h-4" /> Restart
      </button>

      <EraBackdrop gameId="royal-ur" />

      {/* HUD: roll button */}

      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={onRoll}
          disabled={state.rolled || state.winner !== null || state.turn !== 'white' || rolling}
          className="px-5 py-3 rounded-lg font-['Cinzel'] font-bold uppercase tracking-wider
            bg-gradient-to-b from-primary to-[hsl(35_55%_38%)] text-primary-foreground
            shadow-[0_0_20px_hsl(38_60%_50%/0.4)] disabled:opacity-50 disabled:cursor-not-allowed
            inline-flex items-center gap-2"
        >
          <Dices className={`w-5 h-5 ${rolling ? 'animate-spin' : ''}`} />
          {rolling ? 'Rolling…' : state.turn === 'white' && !state.rolled ? 'Roll sticks' : aiThinking ? 'Black thinking…' : `Rolled: ${state.dice >= 0 ? state.dice : '—'}`}
        </button>
      </div>

      {/* HUD: log + rules */}
      <div className="absolute bottom-4 left-4 right-4 z-20 grid sm:grid-cols-2 gap-2 max-w-3xl mx-auto">
        <div className="parchment rounded-lg p-2 max-h-24 overflow-y-auto text-[11px] font-mono space-y-0.5 text-amber-950">
          {state.log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="parchment rounded-lg p-2 text-[11px] text-amber-950 leading-snug">
          <span className="font-bold font-['Cinzel']">How to play:</span> Roll 4 sticks (0–4). Click a glowing square to move. Land on a ✦ rosette for a safe square + extra turn. Bear off all 7 tokens to win. Finkel's reconstruction (BM 33333+).
        </div>
      </div>
    </div>
  );
}

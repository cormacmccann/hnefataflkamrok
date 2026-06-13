import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  initialBaoState, legalBaoMoves, applyBaoMove, chooseAIBaoMove, BaoState,
} from '@/lib/ancient/bao';
import { RotateCcw } from 'lucide-react';
import { Ancient3DScene } from './Ancient3DScene';
import { BaoBoard3D } from './BaoBoard3D';
import { EraBackdrop } from './EraBackdrop';

export function BaoGame() {
  const [state, setState] = useState<BaoState>(initialBaoState);
  const [aiThinking, setAiThinking] = useState(false);

  const myLegal = useMemo(() => state.turn === 'white' && !state.winner ? legalBaoMoves(state, 'white') : [], [state]);

  const click = useCallback((i: number) => {
    if (state.turn !== 'white' || state.winner) return;
    if (!myLegal.includes(i)) return;
    setState(applyBaoMove(state, i));
  }, [state, myLegal]);

  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const m = chooseAIBaoMove(state);
      if (m === null) setState({ ...state, winner: 'white', log: [...state.log, 'Black has no moves — White wins.'] });
      else setState(applyBaoMove(state, m));
      setAiThinking(false);
    }, 700);
    return () => { clearTimeout(id); setAiThinking(false); };
  }, [state]);

  const reset = () => setState(initialBaoState());

  return (
    <div className="absolute inset-0">
      <Ancient3DScene cameraPosition={[0, 7, 5]} minDistance={4} maxDistance={15} eraId="bao">
        <BaoBoard3D state={state} legalMoves={myLegal} onPit={click} />
      </Ancient3DScene>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 parchment rounded-lg px-4 py-2 flex items-center gap-3 text-amber-950 text-sm font-['Cinzel']">
        <span className="font-bold">Bao la Kiswahili</span>
        <span className="opacity-70">·</span>
        <span>{state.winner ? `${state.winner === 'white' ? 'You' : 'AI'} won` : state.turn === 'white' ? 'Your turn' : aiThinking ? 'AI thinking…' : 'AI turn'}</span>
        <span className="opacity-70">·</span>
        <span>Stores W {state.storeW} / B {state.storeB}</span>
      </div>

      <button onClick={reset} className="absolute top-4 right-4 z-20 carved-button px-3 py-2 rounded-md text-foreground inline-flex items-center gap-1.5 text-sm">
        <RotateCcw className="w-4 h-4" /> Restart
      </button>

      <EraBackdrop gameId="bao" />

      <div className="absolute bottom-4 left-4 right-4 z-20 grid sm:grid-cols-2 gap-2 max-w-3xl mx-auto">
        <div className="parchment rounded-lg p-2 max-h-24 overflow-y-auto text-[11px] font-mono space-y-0.5 text-amber-950">
          {state.log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="parchment rounded-lg p-2 text-[11px] text-amber-950 leading-snug">
          <span className="font-bold font-['Cinzel']">How to play:</span> Tap a glowing pit on your row (front, with ≥2 seeds). Seeds sow counter-clockwise. If the last seed lands in an empty pit on your row and the opposite pit has seeds, you capture them into your store. First to empty the opponent or hold the largest store wins.
          <div className="italic opacity-75 mt-1 border-t border-amber-800/20 pt-1">A simplified introduction to Bao — the full Swahili-coast game is far more complex.</div>
        </div>
      </div>
    </div>
  );
}

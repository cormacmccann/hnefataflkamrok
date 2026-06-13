import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  initialLatState, legalMovesFor, applyLatMove, chooseAILatMove,
  LatState, LatPos,
} from '@/lib/ancient/latrunculorum';
import { RotateCcw } from 'lucide-react';
import { Ancient3DScene } from './Ancient3DScene';
import { LatrunculorumBoard3D } from './LatrunculorumBoard3D';
import { EraBackdrop } from './EraBackdrop';

export function LatrunculorumGame() {
  const [state, setState] = useState<LatState>(initialLatState);
  const [aiThinking, setAiThinking] = useState(false);

  const validTargets = useMemo<LatPos[]>(() => {
    if (state.selected === null || state.turn !== 'white' || state.winner) return [];
    return legalMovesFor(state, state.selected);
  }, [state]);

  const clickSquare = useCallback((row: number, col: number) => {
    if (state.turn !== 'white' || state.winner) return;
    const piece = state.pieces.find((p) => p.pos.row === row && p.pos.col === col);
    if (state.selected !== null) {
      const target = validTargets.find((p) => p.row === row && p.col === col);
      if (target) { setState(applyLatMove(state, state.selected, target)); return; }
    }
    if (piece && piece.owner === 'white') setState({ ...state, selected: piece.id });
    else setState({ ...state, selected: null });
  }, [state, validTargets]);

  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const m = chooseAILatMove(state);
      if (!m) setState({ ...state, winner: 'white', log: [...state.log, 'Black has no moves — White wins.'] });
      else setState(applyLatMove(state, m.piece.id, m.to));
      setAiThinking(false);
    }, 600);
    return () => { clearTimeout(id); setAiThinking(false); };
  }, [state]);

  const reset = () => setState(initialLatState());

  return (
    <div className="absolute inset-0">
      <Ancient3DScene cameraPosition={[0, 11, 9]} eraId="latrunculorum">
        <LatrunculorumBoard3D state={state} validTargets={validTargets} onSquareClick={clickSquare} />
      </Ancient3DScene>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 parchment rounded-lg px-4 py-2 flex items-center gap-3 text-amber-950 text-sm font-['Cinzel']">
        <span className="font-bold">Ludus Latrunculorum</span>
        <span className="opacity-70">·</span>
        <span>{state.winner ? `${state.winner === 'white' ? 'Rome' : 'Foe'} wins` : state.turn === 'white' ? 'Your turn (Rome)' : aiThinking ? 'Enemy thinking…' : 'Enemy turn'}</span>
      </div>

      <button onClick={reset} className="absolute top-4 right-4 z-20 carved-button px-3 py-2 rounded-md text-foreground inline-flex items-center gap-1.5 text-sm">
        <RotateCcw className="w-4 h-4" /> Restart
      </button>

      <EraBackdrop gameId="latrunculorum" />

      <div className="absolute bottom-4 left-4 right-4 z-20 grid sm:grid-cols-2 gap-2 max-w-3xl mx-auto">
        <div className="parchment rounded-lg p-2 max-h-24 overflow-y-auto text-[11px] font-mono space-y-0.5 text-amber-950">
          {state.log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="parchment rounded-lg p-2 text-[11px] text-amber-950 leading-snug">
          <span className="font-bold font-['Cinzel']">How to play:</span> Move like a rook. Sandwich an enemy soldier between two of yours to capture. Your gold-crested <b>Dux</b> may leap over a friendly piece. Capture the enemy Dux or immobilise the legion to win.
        </div>
      </div>
    </div>
  );
}

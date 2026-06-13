import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dices, RotateCcw } from 'lucide-react';
import {
  initialRaceState, legalRaceMoves, applyRaceMove, passRaceTurn, chooseAIRaceMove,
  RaceState, RaceMove, RaceConfig,
} from '@/lib/ancient/raceEngine';
import { Ancient3DScene } from './Ancient3DScene';
import { RaceBoard3D } from './RaceBoard3D';
import { EraBackdrop } from './EraBackdrop';

interface Props {
  config: RaceConfig;
  eraId: string;
  cameraPosition?: [number, number, number];
  /** Optional theme tweaks for the board. */
  tileColor?: string;
  specialColor?: string;
  baseColor?: string;
  surfaceColor?: string;
  tileSize?: number;
  disclaimer?: string;
  diceLabel?: string;
}

export function RaceGame({
  config, eraId, cameraPosition, tileColor, specialColor, baseColor, surfaceColor, tileSize,
  disclaimer, diceLabel = 'Roll',
}: Props) {
  const [state, setState] = useState<RaceState>(() => initialRaceState(config));
  const [aiThinking, setAiThinking] = useState(false);
  const [rolling, setRolling] = useState(false);

  const myMoves = useMemo(
    () => (state.rolled && state.turn === 'white' ? legalRaceMoves(state, state.dice) : []),
    [state]
  );

  const onRoll = useCallback(() => {
    if (state.rolled || state.winner || state.turn !== 'white') return;
    setRolling(true);
    setTimeout(() => {
      const { value, faces } = config.diceRoll();
      const next = { ...state, dice: value, diceFaces: faces, rolled: true, log: [...state.log, `White rolled ${value}`] };
      const moves = legalRaceMoves(next, value);
      setRolling(false);
      if (moves.length === 0) setState(passRaceTurn(next, `Rolled ${value} — no legal move`));
      else setState(next);
    }, 500);
  }, [state, config]);

  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const { value, faces } = config.diceRoll();
      const next = { ...state, dice: value, diceFaces: faces, rolled: true, log: [...state.log, `Black rolled ${value}`] };
      const move = chooseAIRaceMove(next, value);
      if (!move) setState(passRaceTurn(next, `Rolled ${value} — no legal move`));
      else setState(applyRaceMove(next, move));
      setAiThinking(false);
    }, 900);
    return () => { clearTimeout(id); setAiThinking(false); };
  }, [state, config]);

  const playMove = (m: RaceMove) => {
    if (state.turn !== 'white' || !state.rolled || state.winner) return;
    setState(applyRaceMove(state, m));
  };
  const reset = () => setState(initialRaceState(config));

  return (
    <div className="absolute inset-0">
      <Ancient3DScene cameraPosition={cameraPosition ?? [0, 12, 9]} minDistance={6} maxDistance={26}>
        <RaceBoard3D
          state={state} myMoves={myMoves} onMove={playMove}
          tileColor={tileColor} specialColor={specialColor}
          baseColor={baseColor} surfaceColor={surfaceColor} tileSize={tileSize}
        />
      </Ancient3DScene>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 parchment rounded-lg px-4 py-2 flex items-center gap-3 text-amber-950 text-sm font-['Cinzel']">
        <span className="font-bold">{config.name}</span>
        <span className="opacity-70">·</span>
        <span>{state.winner ? `${state.winner === 'white' ? 'You' : 'AI'} won` : state.turn === 'white' ? 'Your turn' : 'AI turn'}</span>
      </div>

      <button onClick={reset} className="absolute top-4 right-4 z-20 carved-button px-3 py-2 rounded-md text-foreground inline-flex items-center gap-1.5 text-sm">
        <RotateCcw className="w-4 h-4" /> Restart
      </button>

      <EraBackdrop gameId={eraId} />

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
          {rolling ? 'Rolling…' : state.turn === 'white' && !state.rolled
            ? diceLabel
            : aiThinking ? 'AI thinking…' : `Rolled: ${state.dice >= 0 ? state.dice : '—'}`}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-20 grid sm:grid-cols-2 gap-2 max-w-3xl mx-auto">
        <div className="parchment rounded-lg p-2 max-h-24 overflow-y-auto text-[11px] font-mono space-y-0.5 text-amber-950">
          {state.log.slice(-6).map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div className="parchment rounded-lg p-2 text-[11px] text-amber-950 leading-snug space-y-1">
          <div><span className="font-bold font-['Cinzel']">How to play:</span> Roll, then click a glowing tile to advance. ✦ tiles grant safety or an extra roll. First to bear off all tokens wins.</div>
          {(disclaimer || config.rulesNote) && (
            <div className="italic opacity-80 border-t border-amber-800/20 pt-1">{disclaimer ?? config.rulesNote}</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  initialUrState, rollDice, legalMoves, applyMove, passTurn, chooseAIMove,
  ROSETTE_SQUARES, SQUARE_COORDS, WHITE_PATH, BLACK_PATH, UrState, UrMove, SquareId,
} from '@/lib/ancient/royalUr';
import { Dices, RotateCcw, Sparkles } from 'lucide-react';

const ALL_SQUARES: SquareId[] = Object.keys(SQUARE_COORDS) as SquareId[];

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
      if (moves.length === 0) {
        setState(passTurn(next, r === 0 ? 'Rolled 0.' : 'No legal move.'));
      } else {
        setState(next);
      }
    }, 600);
  }, [state]);

  // AI loop: rolls + moves until it's white's turn again or game over
  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const r = rollDice();
      const next = { ...state, dice: r, rolled: true, log: [...state.log, `Black rolled ${r}`] };
      const move = chooseAIMove(next, r);
      if (!move) {
        setState(passTurn(next, r === 0 ? 'Rolled 0.' : 'No legal move.'));
      } else {
        setState(applyMove(next, move));
      }
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
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="font-['Cinzel'] text-lg text-primary">Royal Game of Ur</h3>
        <p className="text-[11px] text-muted-foreground">Sumer · c. 2600 BCE · Finkel's reconstruction (BM 33333+)</p>
      </div>

      <UrBoard state={state} myMoves={myMoves} onMove={trySelectMove} />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onRoll}
            disabled={state.rolled || state.winner !== null || state.turn !== 'white' || rolling}
            className="tap-target px-3 rounded-md bg-primary text-primary-foreground disabled:opacity-50 inline-flex items-center gap-1.5 text-sm"
          >
            <Dices className={`w-4 h-4 ${rolling ? 'animate-spin' : ''}`} />
            {rolling ? 'Rolling…' : state.turn === 'white' && !state.rolled ? 'Roll sticks' : aiThinking ? 'Black thinking…' : `Roll: ${state.dice >= 0 ? state.dice : '—'}`}
          </button>
          <span className={`text-xs px-2 py-1 rounded ${state.turn === 'white' ? 'bg-primary/20 text-primary' : 'bg-secondary/50'}`}>
            {state.winner ? `${state.winner === 'white' ? 'You' : 'AI'} won` : state.turn === 'white' ? 'Your turn' : 'AI turn'}
          </span>
        </div>
        <button
          onClick={reset}
          className="tap-target px-3 rounded-md bg-secondary hover:bg-secondary/80 inline-flex items-center gap-1.5 text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Restart
        </button>
      </div>

      <Pools state={state} />

      <div className="rounded-lg border border-border bg-background/40 p-2 max-h-24 overflow-y-auto text-[11px] font-mono space-y-0.5">
        {state.log.slice(-8).map((l, i) => (
          <div key={i} className="text-foreground/70">{l}</div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground italic text-center">
        4 tetrahedral sticks (each 50/50) → roll 0–4. Land on a ✦ rosette to take an extra turn (and stay safe on the central one). Bear off all 7 tokens to win.
      </p>
    </div>
  );
}

function UrBoard({ state, myMoves, onMove }: { state: UrState; myMoves: UrMove[]; onMove: (m: UrMove) => void }) {
  const cellSize = 44;
  const targets = new Map<string, UrMove>();
  myMoves.forEach((m) => {
    if (m.toPathIdx === 14) return;
    targets.set(WHITE_PATH[m.toPathIdx], m);
  });
  const myTokenOnSquare = (sq: SquareId): { who: 'white' | 'black'; idx: number } | null => {
    for (let i = 0; i < state.white.length; i++) {
      const p = state.white[i]; if (p >= 0 && p < 14 && WHITE_PATH[p] === sq) return { who: 'white', idx: i };
    }
    for (let i = 0; i < state.black.length; i++) {
      const p = state.black[i]; if (p >= 0 && p < 14 && BLACK_PATH[p] === sq) return { who: 'black', idx: i };
    }
    return null;
  };

  return (
    <div className="flex justify-center">
      <div
        className="relative"
        style={{ width: cellSize * 8, height: cellSize * 3 }}
      >
        {ALL_SQUARES.map((sq) => {
          const { row, col } = SQUARE_COORDS[sq];
          const isRosette = ROSETTE_SQUARES.has(sq);
          const tok = myTokenOnSquare(sq);
          const target = targets.get(sq);
          const fromSquare = myMoves.find((m) => m.fromPathIdx >= 0 && WHITE_PATH[m.fromPathIdx] === sq);
          return (
            <div
              key={sq}
              style={{
                position: 'absolute',
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
              }}
              className={`border border-amber-900/60 flex items-center justify-center
                ${isRosette ? 'bg-amber-700/40' : 'bg-amber-100/10'}
                ${target ? 'ring-2 ring-primary cursor-pointer' : ''}
                ${fromSquare && !target ? 'ring-1 ring-primary/40' : ''}
              `}
              onClick={() => target && onMove(target)}
            >
              {isRosette && <Sparkles className="absolute w-3 h-3 text-amber-300/70 top-0.5 left-0.5" />}
              {tok && (
                <motion.div
                  layoutId={`ur-${tok.who}-${tok.idx}`}
                  className={`w-7 h-7 rounded-full border-2 ${
                    tok.who === 'white'
                      ? 'bg-amber-50 border-amber-700'
                      : 'bg-stone-900 border-stone-600'
                  } shadow-md`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pools({ state }: { state: UrState }) {
  const wStart = state.white.filter((p) => p === -1).length;
  const wOff = state.white.filter((p) => p === 14).length;
  const bStart = state.black.filter((p) => p === -1).length;
  const bOff = state.black.filter((p) => p === 14).length;
  return (
    <div className="flex justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className="text-amber-200">White</span>
        <Pool count={wStart} cls="bg-amber-50 border-amber-700" /> <span>start</span>
        <Pool count={wOff} cls="bg-amber-50 border-amber-700" /> <span>off</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-stone-300">Black</span>
        <Pool count={bStart} cls="bg-stone-900 border-stone-600" /> <span>start</span>
        <Pool count={bOff} cls="bg-stone-900 border-stone-600" /> <span>off</span>
      </div>
    </div>
  );
}

function Pool({ count, cls }: { count: number; cls: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`w-3 h-3 rounded-full border ${cls}`} />
      ))}
      {count === 0 && <span className="text-muted-foreground">·</span>}
    </span>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  initialPettState, legalMovesFor, applyPettMove, chooseAIPettMove,
  PettState, PettPos, BOARD_SIZE,
} from '@/lib/ancient/petteia';
import { RotateCcw } from 'lucide-react';

export function PetteiaGame() {
  const [state, setState] = useState<PettState>(initialPettState);
  const [aiThinking, setAiThinking] = useState(false);

  const validTargets = useMemo<PettPos[]>(() => {
    if (state.selected === null || state.turn !== 'white' || state.winner) return [];
    return legalMovesFor(state, state.selected);
  }, [state]);

  const clickSquare = useCallback((row: number, col: number) => {
    if (state.turn !== 'white' || state.winner) return;
    const piece = state.pieces.find((p) => p.pos.row === row && p.pos.col === col);
    if (state.selected !== null) {
      const target = validTargets.find((p) => p.row === row && p.col === col);
      if (target) {
        setState(applyPettMove(state, state.selected, target));
        return;
      }
    }
    if (piece && piece.owner === 'white') {
      setState({ ...state, selected: piece.id });
    } else {
      setState({ ...state, selected: null });
    }
  }, [state, validTargets]);

  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const m = chooseAIPettMove(state);
      if (!m) {
        setState({ ...state, winner: 'white', log: [...state.log, 'Black has no moves — White wins.'] });
      } else {
        setState(applyPettMove(state, m.piece.id, m.to));
      }
      setAiThinking(false);
    }, 600);
    return () => { clearTimeout(id); setAiThinking(false); };
  }, [state]);

  const reset = () => setState(initialPettState());

  const whiteCount = state.pieces.filter((p) => p.owner === 'white').length;
  const blackCount = state.pieces.filter((p) => p.owner === 'black').length;

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="font-['Cinzel'] text-lg text-primary">Petteia (Πεττεία)</h3>
        <p className="text-[11px] text-muted-foreground">Greece · c. 600 BCE · the "pebbles" of Plato & Polybius</p>
      </div>

      <PettBoard state={state} validTargets={validTargets} onClick={clickSquare} />

      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded ${state.turn === 'white' ? 'bg-primary/20 text-primary' : 'bg-secondary/50'}`}>
          {state.winner ? `${state.winner === 'white' ? 'You' : 'AI'} wins` : state.turn === 'white' ? 'Your turn' : aiThinking ? 'AI thinking…' : 'AI turn'}
        </span>
        <span className="text-muted-foreground">White {whiteCount} · Black {blackCount}</span>
        <button
          onClick={reset}
          className="tap-target px-3 rounded-md bg-secondary hover:bg-secondary/80 inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Restart
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background/40 p-2 max-h-20 overflow-y-auto text-[11px] font-mono space-y-0.5">
        {state.log.slice(-6).map((l, i) => (
          <div key={i} className="text-foreground/70">{l}</div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground italic text-center">
        Move like a chess rook. Sandwich an enemy between two of your pieces (row or column) to capture. Win by capturing all opposing pieces or immobilising them. Rules reconstructed from Plato, Polybius, Pollux.
      </p>
    </div>
  );
}

function PettBoard({
  state, validTargets, onClick,
}: {
  state: PettState;
  validTargets: PettPos[];
  onClick: (row: number, col: number) => void;
}) {
  const cell = 38;
  const isTarget = (r: number, c: number) => validTargets.some((p) => p.row === r && p.col === c);
  return (
    <div className="flex justify-center">
      <div
        className="grid border-2 border-stone-700 rounded shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cell}px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, ${cell}px)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
          const row = Math.floor(i / BOARD_SIZE);
          const col = i % BOARD_SIZE;
          const light = (row + col) % 2 === 0;
          const piece = state.pieces.find((p) => p.pos.row === row && p.pos.col === col);
          const target = isTarget(row, col);
          const selected = piece && state.selected === piece.id;
          return (
            <div
              key={i}
              onClick={() => onClick(row, col)}
              className={`flex items-center justify-center cursor-pointer relative transition-colors
                ${light ? 'bg-stone-200' : 'bg-stone-400'}
                ${selected ? 'ring-2 ring-primary ring-inset' : ''}
                ${target ? 'after:content-[""] after:absolute after:w-3 after:h-3 after:rounded-full after:bg-primary/60' : ''}
              `}
            >
              {piece && (
                <motion.div
                  layoutId={`pett-${piece.id}`}
                  className={`w-7 h-7 rounded-full border-2 shadow ${
                    piece.owner === 'white'
                      ? 'bg-amber-50 border-amber-800'
                      : 'bg-stone-900 border-stone-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

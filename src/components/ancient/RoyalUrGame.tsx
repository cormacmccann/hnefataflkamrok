import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  initialUrState, rollDice, legalMoves, applyMove, passTurn, chooseAIMove,
  UrState, UrMove,
} from '@/lib/ancient/royalUr';
import { Dices } from 'lucide-react';
import { Ancient3DScene } from './Ancient3DScene';
import { RoyalUrBoard3D } from './RoyalUrBoard3D';
import { AncientGameShell } from './AncientGameShell';
import { UrBoard2D } from './AncientBoards2D';
import { BoardView } from '@/components/game/BoardViewToggle';


export function RoyalUrGame() {
  const { tr } = useUiTranslation();
  const [state, setState] = useState<UrState>(initialUrState);
  const [aiThinking, setAiThinking] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [view, setView] = useState<BoardView>('3d');
  const rollTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(rollTimer.current), []);

  const myMoves = useMemo(
    () => (state.rolled && state.turn === 'white' ? legalMoves(state, state.dice) : []),
    [state]
  );

  const onRoll = useCallback(() => {
    if (state.rolled || state.winner || state.turn !== 'white' || rolling) return;
    setRolling(true);
    rollTimer.current = setTimeout(() => {
      const r = rollDice();
      const next = { ...state, dice: r, rolled: true, log: [...state.log, `White rolled ${r}`] };
      const moves = legalMoves(next, r);
      setRolling(false);
      if (moves.length === 0) setState(passTurn(next, r === 0 ? 'Rolled 0.' : 'No legal move.'));
      else setState(next);
    }, 600);
  }, [state, rolling]);

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
  const reset = () => { clearTimeout(rollTimer.current); setRolling(false); setState(initialUrState()); };

  const displayedMoves = myMoves.filter((move, i, moves) => move.fromPathIdx !== -1 || moves.findIndex(other => other.fromPathIdx === -1) === i);
  const status = state.winner ? tr(state.winner === 'white' ? 'You win' : 'Opponent wins') : state.turn === 'white' ? tr('Your turn · ivory tokens') : tr('Opponent’s turn');
  return (
    <AncientGameShell title="Royal Game of Ur" status={status} view={view} onViewChange={setView} onRestart={reset} log={state.log}
      rules={tr("Cast four binary dice, then choose a highlighted destination. Rosettes grant another turn; the central rosette is safe. Bear off all seven tokens with an exact roll. A playable modern reconstruction.")}
      controls={<>
        <button onClick={onRoll} disabled={state.rolled || !!state.winner || state.turn !== 'white' || rolling} className="ancient-move-button"><Dices size={16} />{rolling ? tr('Casting…') : aiThinking ? tr('Opponent thinking…') : state.rolled ? tr('cast {v0} · choose a move', { v0: state.dice }) : tr('Cast dice')}</button>
        <span className="ancient-board-score">{tr('Home: you')} {state.white.filter(p => p === 14).length}/7 {tr('· opponent')} {state.black.filter(p => p === 14).length}/7</span>
        {displayedMoves.map((move, i) => <button className="ancient-move-button secondary" key={i} onClick={() => trySelectMove(move)} aria-label={tr('Move token {v0} {v1}', { v0: move.tokenIndex + 1, v1: move.toPathIdx === 14 ? tr('home') : tr('to square {v0}', { v0: move.toPathIdx + 1 }) })}>{move.toPathIdx === 14 ? tr('Bear off') : move.fromPathIdx === -1 ? tr('Enter') : tr('Token {v0}', { v0: move.tokenIndex + 1 })} {move.toPathIdx < 14 ? `→ ${move.toPathIdx + 1}` : tr('Token {v0}', { v0: move.tokenIndex + 1 })}</button>)}
      </>}>
      {view === '3d' ? <Ancient3DScene cameraPosition={[0, 9, 8]} minDistance={7} maxDistance={20} eraId="royal-ur"><RoyalUrBoard3D state={state} myMoves={myMoves} onMove={trySelectMove} /></Ancient3DScene> : <UrBoard2D state={state} moves={myMoves} onMove={trySelectMove} />}
    </AncientGameShell>
  );
}

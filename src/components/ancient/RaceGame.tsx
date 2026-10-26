import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dices } from 'lucide-react';
import {
  initialRaceState, legalRaceMoves, applyRaceMove, passRaceTurn, chooseAIRaceMove,
  RaceState, RaceMove, RaceConfig,
} from '@/lib/ancient/raceEngine';
import { Ancient3DScene } from './Ancient3DScene';
import { RaceBoard3D } from './RaceBoard3D';
import { AncientGameShell } from './AncientGameShell';
import { RaceBoard2D } from './AncientBoards2D';
import { BoardView } from '@/components/game/BoardViewToggle';

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
  disclaimer, diceLabel = 'Cast dice',
}: Props) {
  const { tr } = useUiTranslation();
  const [state, setState] = useState<RaceState>(() => initialRaceState(config));
  const [aiThinking, setAiThinking] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [view, setView] = useState<BoardView>('3d');
  const rollTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(rollTimer.current), []);

  const myMoves = useMemo(
    () => (state.rolled && state.turn === 'white' ? legalRaceMoves(state, state.dice) : []),
    [state]
  );

  const onRoll = useCallback(() => {
    if (state.rolled || state.winner || state.turn !== 'white' || rolling) return;
    setRolling(true);
    rollTimer.current = setTimeout(() => {
      const { value, faces } = config.diceRoll();
      const next = { ...state, dice: value, diceFaces: faces, rolled: true, log: [...state.log, `White rolled ${value}`] };
      const moves = legalRaceMoves(next, value);
      setRolling(false);
      if (moves.length === 0) setState(passRaceTurn(next, `Rolled ${value} — no legal move`));
      else setState(next);
    }, 500);
  }, [state, config, rolling]);

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
  const reset = () => { clearTimeout(rollTimer.current); setRolling(false); setState(initialRaceState(config)); };

  const displayedMoves = myMoves.filter((move, i, moves) => move.from !== -1 || moves.findIndex(other => other.from === -1) === i);
  const status = state.winner ? tr(state.winner === 'white' ? 'You win' : 'Opponent wins') : state.turn === 'white' ? tr('Your turn · ivory tokens') : tr('Opponent’s turn');
  return (
    <AncientGameShell title={config.name} status={status} view={view} onViewChange={setView} onRestart={reset} log={state.log}
      rules={<>{tr('Cast, then choose a highlighted destination or use the move buttons. Bear off every token to win.')} {tr(disclaimer ?? config.rulesNote)}</>}
      controls={<>
        <button onClick={onRoll} disabled={state.rolled || !!state.winner || state.turn !== 'white' || rolling} className="ancient-move-button"><Dices size={16} />{rolling ? tr('Casting…') : aiThinking ? tr('Opponent thinking…') : state.rolled ? tr('cast {v0} · choose a move', { v0: state.dice }) : tr(diceLabel)}</button>
        <span className="ancient-board-score">{tr('Home: you')} {state.white.filter(p => p === config.pathLength).length}/{config.tokensPerPlayer} {tr('· opponent')} {state.black.filter(p => p === config.pathLength).length}/{config.tokensPerPlayer}</span>
        {displayedMoves.map((move, i) => <button className="ancient-move-button secondary" key={i} onClick={() => playMove(move)} aria-label={tr('Move token {v0} {v1}', { v0: move.tokenIndex + 1, v1: move.to === config.pathLength ? tr('home') : tr('to square {v0}', { v0: move.to + 1 }) })}>{move.to === config.pathLength ? tr('Bear off') : move.from === -1 ? tr('Enter') : tr('Token {v0}', { v0: move.tokenIndex + 1 })} {move.to < config.pathLength ? `→ ${move.to + 1}` : tr('Token {v0}', { v0: move.tokenIndex + 1 })}</button>)}
      </>}>
      {view === '3d' ? <Ancient3DScene cameraPosition={cameraPosition ?? [0, 12, 9]} minDistance={6} maxDistance={26} eraId={eraId}><RaceBoard3D state={state} myMoves={myMoves} onMove={playMove} tileColor={tileColor} specialColor={specialColor} baseColor={baseColor} surfaceColor={surfaceColor} tileSize={tileSize} /></Ancient3DScene> : <RaceBoard2D state={state} moves={myMoves} onMove={playMove} />}
    </AncientGameShell>
  );
}

import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  initialLatState, legalMovesFor, applyLatMove, chooseAILatMove,
  LatState, LatPos, BOARD_SIZE,
} from '@/lib/ancient/latrunculorum';
import { Ancient3DScene } from './Ancient3DScene';
import { LatrunculorumBoard3D } from './LatrunculorumBoard3D';
import { AncientGameShell } from './AncientGameShell';
import { TacticalBoard2D } from './AncientBoards2D';
import { BoardView } from '@/components/game/BoardViewToggle';

export function LatrunculorumGame() {
  const { tr } = useUiTranslation();
  const [state, setState] = useState<LatState>(initialLatState);
  const [aiThinking, setAiThinking] = useState(false);
  const [view, setView] = useState<BoardView>('3d');

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

  const status = state.winner ? tr(state.winner === 'white' ? 'You win' : 'Opponent wins') : state.turn === 'white' ? tr('Your turn · select a light soldier') : aiThinking ? tr('Opponent thinking…') : tr('Opponent’s turn');
  return (
    <AncientGameShell title="Ludus Latrunculorum" status={status} view={view} onViewChange={setView} onRestart={reset}
      rules={tr("Move orthogonally; sandwich enemy soldiers to capture. The Dux may leap a friendly soldier. Capture the enemy Dux or immobilise the legion. The Dux is part of this modern reconstruction, not an established ancient rule.")} log={state.log}>
      {view === '3d' ? <Ancient3DScene cameraPosition={[0, 11, 9]} eraId="latrunculorum">
        <LatrunculorumBoard3D state={state} validTargets={validTargets} onSquareClick={clickSquare} />
      </Ancient3DScene> : <TacticalBoard2D size={BOARD_SIZE} pieces={state.pieces} selected={state.selected} targets={validTargets} onSquareClick={clickSquare} />}
    </AncientGameShell>
  );
}

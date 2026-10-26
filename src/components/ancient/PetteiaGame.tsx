import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  initialPettState, legalMovesFor, applyPettMove, chooseAIPettMove,
  PettState, PettPos, BOARD_SIZE,
} from '@/lib/ancient/petteia';
import { Ancient3DScene } from './Ancient3DScene';
import { PetteiaBoard3D } from './PetteiaBoard3D';
import { AncientGameShell } from './AncientGameShell';
import { TacticalBoard2D } from './AncientBoards2D';
import { BoardView } from '@/components/game/BoardViewToggle';


export function PetteiaGame() {
  const { tr } = useUiTranslation();
  const [state, setState] = useState<PettState>(initialPettState);
  const [aiThinking, setAiThinking] = useState(false);
  const [view, setView] = useState<BoardView>('3d');

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
    if (piece && piece.owner === 'white') setState({ ...state, selected: piece.id });
    else setState({ ...state, selected: null });
  }, [state, validTargets]);

  useEffect(() => {
    if (state.winner || state.turn !== 'black') return;
    setAiThinking(true);
    const id = setTimeout(() => {
      const m = chooseAIPettMove(state);
      if (!m) setState({ ...state, winner: 'white', log: [...state.log, 'Black has no moves — White wins.'] });
      else setState(applyPettMove(state, m.piece.id, m.to));
      setAiThinking(false);
    }, 600);
    return () => { clearTimeout(id); setAiThinking(false); };
  }, [state]);

  const reset = () => setState(initialPettState());
  const whiteCount = state.pieces.filter((p) => p.owner === 'white').length;
  const blackCount = state.pieces.filter((p) => p.owner === 'black').length;

  const status = state.winner ? tr(state.winner === 'white' ? 'You win' : 'Opponent wins') : state.turn === 'white' ? tr('Your turn · select a light soldier') : aiThinking ? tr('Opponent thinking…') : tr('Opponent’s turn');
  return (
    <AncientGameShell title="Petteia" status={status} view={view} onViewChange={setView} onRestart={reset}
      rules={tr("Move orthogonally any distance. Sandwich an enemy between two soldiers to capture. Eliminate or immobilise the opponent to win. This is a modern reconstruction; the complete ancient rules are lost.")} log={state.log}>
      {view === '3d' ? <Ancient3DScene cameraPosition={[0, 11, 9]} eraId="petteia">
        <PetteiaBoard3D state={state} validTargets={validTargets} onSquareClick={clickSquare} />
      </Ancient3DScene> : <TacticalBoard2D size={BOARD_SIZE} pieces={state.pieces} selected={state.selected} targets={validTargets} onSquareClick={clickSquare} />}
    </AncientGameShell>
  );
}

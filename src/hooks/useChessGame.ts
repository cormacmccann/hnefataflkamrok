import { useCallback, useEffect, useRef, useState } from 'react';
import { ChessSession } from '@/lib/chessEngine';
import type { ChessOptions, ChessSquare, PromotionPiece } from '@/types/chess';

export function useChessGame({ opponent, humanColor, difficulty }: ChessOptions) {
  const sessionRef = useRef<ChessSession | null>(null);
  if (!sessionRef.current) sessionRef.current = new ChessSession();
  const session = sessionRef.current;
  const [snapshot, setSnapshot] = useState(() => session.snapshot());
  const [epoch, setEpoch] = useState(0);
  const actionVersion = useRef(0);
  const thinking = opponent === 'computer' && snapshot.turn !== humanColor && snapshot.status === 'playing';
  const publish = useCallback(() => setSnapshot(session.snapshot()), [session]);

  useEffect(() => {
    if (!thinking) return;
    let cancelled = false;
    const scheduledVersion = actionVersion.current;
    const timer = window.setTimeout(() => {
      if (cancelled || scheduledVersion !== actionVersion.current) return;
      session.computerMove(difficulty);
      publish();
    }, 450);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [thinking, snapshot.fen, epoch, difficulty, session, publish]);

  const selectSquare = useCallback((square: ChessSquare) => {
    const current = session.snapshot();
    if (current.status !== 'playing' || (opponent === 'computer' && current.turn !== humanColor)) return;
    session.selectSquare(square);
    publish();
  }, [opponent, humanColor, session, publish]);
  const choosePromotion = useCallback((piece: PromotionPiece) => {
    const current = session.snapshot();
    if (current.status !== 'playing' || (opponent === 'computer' && current.turn !== humanColor)) return;
    session.choosePromotion(piece);
    publish();
  }, [opponent, humanColor, session, publish]);
  const cancelPromotion = useCallback(() => { session.cancelPromotion(); publish(); }, [session, publish]);
  const newGame = useCallback(() => { actionVersion.current++; session.newGame(); setEpoch(value => value + 1); publish(); }, [session, publish]);
  const undo = useCallback(() => {
    actionVersion.current++;
    if (session.snapshot().promotion) { session.cancelPromotion(); publish(); return; }
    session.undo();
    const after = session.snapshot();
    if (opponent === 'computer' && after.turn !== humanColor && after.history.length > 0) session.undo();
    setEpoch(value => value + 1);
    publish();
  }, [session, opponent, humanColor, publish]);
  const exportPGN = useCallback(() => session.exportPGN(), [session]);
  const canUndo = !!snapshot.promotion || (opponent === 'local' ? snapshot.history.length > 0 : snapshot.history.length > (humanColor === 'b' ? 1 : 0));
  return { ...snapshot, thinking, canUndo, selectSquare, choosePromotion, cancelPromotion, newGame, undo, exportPGN };
}

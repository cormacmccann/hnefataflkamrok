import { useUiTranslation } from '@/i18n/useUiTranslation';
import { useCallback, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { initialBaoState, legalPits, applyMove, BaoState, Move, pitToRing, NYUMBA_RING } from '@/lib/ancient/baoEngine';
import { AncientGameShell } from './AncientGameShell';
import { Ancient3DScene } from './Ancient3DScene';
import { BaoBoard3D } from './BaoBoard3D';
import { BoardView } from '@/components/game/BoardViewToggle';

export function BaoGame() {
  const { tr } = useUiTranslation();
  const [state, setState] = useState<BaoState>(initialBaoState);
  const [selectedPit, setSelectedPit] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [view, setView] = useState<BoardView>('3d');
  const pitViews = useMemo(() => legalPits(state), [state]);
  const captureMandatory = pitViews.some(p => p.isCapture);
  const selectedPitView = pitViews.find(v => v.ringIndex === selectedPit);
  const moveOptions = selectedPitView?.moves ?? [];
  const onPitClick = useCallback((ring: number) => {
    const pit = pitViews.find(v => v.ringIndex === ring);
    if (!pit) return;
    setSelectedPit(ring);
    if (pit.moves.length === 1) { setState(applyMove(state, pit.moves[0]).state); setSelectedPit(null); }
  }, [pitViews, state]);
  const choose = (move: Move) => { setState(applyMove(state, move).state); setSelectedPit(null); };
  const reset = () => { setState(initialBaoState()); setSelectedPit(null); };
  const status = state.winner !== null ? tr('{side} wins', { side: tr('Player {v0}', { v0: state.winner + 1 }) }) : `${tr('Player {v0}', { v0: state.turn + 1 })} · ${state.phase === 'kunamua' ? 'Kunamua' : 'Mtaji'} · ${tr(captureMandatory ? 'capture is compulsory' : 'Choose a marked destination')}`;
  return <>
    <AncientGameShell title="Bao la Kiswahili" status={status} view={view} onViewChange={setView} onRestart={reset} log={state.log}
      rules={tr("Two players share this device. Sow seeds through your two rows; capture when available. This implementation omits blocking, the long-sowing restriction and the optional Safari choice.")}
      controls={<>
        <button className="ancient-move-button secondary" onClick={() => setShowRules(true)}><BookOpen size={15} />{tr('Rules & limitations')}</button>
        <span className="ancient-board-score">{tr('Storage: P1')} {state.storage[0]} {tr('· P2')} {state.storage[1]}</span>
        {moveOptions.map((move,i) => <button className="ancient-move-button" key={i} onClick={() => choose(move)}>{tr('Sow')} {tr(move.direction === 'fwd' ? 'forward →' : '← backward')}{move.kichwaChoice !== undefined ? ` · ${tr(move.kichwaChoice === 0 ? 'Kichwa (left)' : 'Kichwa (right)')}` : ''}{move.taxation ? ` · ${tr('taxation')}` : ''}</button>)}
        {selectedPit !== null && <button className="ancient-move-button secondary" onClick={() => setSelectedPit(null)}>{tr('Cancel selection')}</button>}
      </>}>
      {view === '3d' ? <Ancient3DScene cameraPosition={[0,9,7]} eraId="bao"><BaoBoard3D state={state} legalPits={pitViews.map(p => p.ringIndex)} selectedPit={selectedPit} onPit={onPitClick} /></Ancient3DScene> : <div className="bao-flat-wrap">
        <div className="bao-flat-label">{tr('Player 2 · outer and inner rows')}</div>
        <div className="bao-flat-board" role="group" aria-label={tr('Bao four-row board')}>
          {state.pits.flatMap((row,r) => row.map((seeds,c) => {
            const owner = r < 2 ? 1 : 0;
            const ring = pitToRing(owner,r,c)!;
            const legal = owner === state.turn && pitViews.some(v => v.ringIndex === ring);
            const selected = owner === state.turn && selectedPit === ring;
            const house = (r === 1 || r === 2) && ring === NYUMBA_RING;
            return <button key={`${r}-${c}`} className={`bao-flat-pit ${legal ? 'legal' : ''} ${selected ? 'selected' : ''} ${house ? 'house' : ''}`} disabled={!legal} onClick={() => onPitClick(ring)} aria-label={tr('Player {v0} {v1} pit {v2}, {v3} seeds{v4}{v5}', { v0: owner + 1, v1: tr(r === 1 || r === 2 ? 'inner' : 'outer'), v2: c + 1, v3: seeds, v4: house ? tr(', Nyumba') : '', v5: legal ? tr(', legal move') : '' })} aria-pressed={selected}><span>{seeds}</span>{house && <small>N</small>}</button>;
          }))}
        </div>
        <div className="bao-flat-label">{tr('Player 1 · inner and outer rows')}</div>
      </div>}
    </AncientGameShell>
    {showRules && <BaoRulesModal onClose={() => setShowRules(false)} />}
  </>;
}

function BaoRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bao-card rounded-xl p-5 max-w-xl w-full max-h-[85vh] overflow-y-auto text-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-['Cinzel'] font-bold mb-3 text-center">How to Play Bao la Kiswahili</h3>
        <div className="space-y-2.5 leading-relaxed">
          <p><b>Board.</b> 4 rows × 8 pits. Each player owns one inner (front) row and one outer (back) row. The <b>Nyumba</b> is the square pit on your inner row, and the two end pits of your inner row are the <b>Kichwa</b>.</p>
          <p><b>Phase 1 — Kunamua.</b> Take one seed from your storage and drop it into any non-empty pit on your side, then sow (lift all seeds, drop one at a time in the chosen direction).</p>
          <p><b>Phase 2 — Mtaji.</b> Once storages are empty, pick a pit on your side with at least 2 seeds and sow. Outer-row pits may only be chosen when no inner pit has more than one seed.</p>
          <p><b>Sowing & relay.</b> If your last seed lands in a non-empty pit on your side, lift those seeds and continue sowing. Highlighted pits show your legal moves.</p>
          <p><b>Capture.</b> If your last seed lands in a non-empty pit on your <i>inner</i> row, and the directly opposite opponent inner pit has seeds, you capture them. Re-sow the captured seeds from one of your Kichwa pits, sowing <i>toward</i> the Nyumba.</p>
          <p><b>Mandatory capture.</b> If any capture move is available, you must play one of them.</p>
          <p><b>Nyumba.</b> Your Nyumba is <i>functional</i> when it holds 6+ seeds. The final seed of a non-capture move that lands in your functional Nyumba ends the move (resting in the house). If the opponent captures all seeds from your Nyumba, it is <i>destroyed</i>. In Phase 1 the Nyumba may only be played when it captures, or when it's the last non-empty inner pit (taxation — 2 seeds only).</p>
          <p><b>Win.</b> You win when the opponent's inner row is empty in Phase 2, or when they have no legal move.</p>
          <p className="italic opacity-75 border-t border-amber-800/20 pt-2">
            Not yet implemented: blocking rule, long-sowing (&gt;16 seeds) capture restriction, and the "destroy Nyumba to continue (Safari)" choice — for now landing the final seed in a functional Nyumba always stops the move.
          </p>
        </div>
        <button onClick={onClose} className="bao-btn w-full py-2 rounded-md text-sm mt-4">Close</button>
      </div>
    </div>
  );
}

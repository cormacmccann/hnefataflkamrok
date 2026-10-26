import { Component, ReactNode, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { BookOpen, RotateCcw, X } from 'lucide-react';
import { useUiTranslation } from '@/i18n/useUiTranslation';
import { BoardView, BoardViewToggle } from '@/components/game/BoardViewToggle';
import { LanguageSelector } from '@/components/game/LanguageSelector';
import { BrandMark } from '@/components/game/BrandMark';
import { localizeAncientLog } from './localizeAncientLog';
import './ancient-games.css';

export function AncientGameShell({ title, status, view, onViewChange, onRestart, children, controls, rules, log }: {
  title: string; status: string; view: BoardView; onViewChange: (view: BoardView) => void;
  onRestart: () => void; children: ReactNode; controls?: ReactNode; rules: ReactNode; log: string[];
}) {
  const [showRules, setShowRules] = useState(false);
  const { tr, trText } = useUiTranslation();
  return (
    <div className="ancient-game-shell">
      <div className="game-language-control"><LanguageSelector compact align="up" /></div>
      <header className="ancient-game-header">
        <BrandMark compact className="ancient-mini-brand" /><div className="ancient-game-heading"><span className="ancient-eyebrow">The ancient collection</span><h1>{title}</h1></div>
        <p className="ancient-game-status" role="status">{trText(status)}</p>
        <div className="ancient-game-tools"><BoardViewToggle view={view} onChange={onViewChange} /><button className="ancient-tool" onClick={() => setShowRules(true)} aria-label={tr('Rules of this table')}><BookOpen size={16} /></button><button className="ancient-tool" onClick={onRestart} aria-label={`Restart ${title}`}><RotateCcw size={16} /><span>Restart</span></button></div>
      </header>
      <main className={`ancient-game-stage ancient-view-${view}`} aria-label={`${title} ${view === '2d' ? '2D' : '3D'} board`}><BoardRenderBoundary key={view} onUse2D={() => onViewChange('2d')}>{children}</BoardRenderBoundary></main>
      <footer className="ancient-game-footer">
        {controls && <div className="ancient-game-actions">{controls}</div>}
        <div className="ancient-game-notes"><p>{rules}</p><p className="ancient-latest-move" aria-live="polite">{localizeAncientLog(log[log.length - 1] || '', tr, trText)}</p></div>
      </footer>
      <Dialog.Root open={showRules} onOpenChange={setShowRules}><Dialog.Portal><Dialog.Overlay className="ancient-rules-overlay" /><Dialog.Content className="ancient-rules-dialog"><button onClick={() => setShowRules(false)} aria-label={tr('Close')}><X size={18} /></button><Dialog.Title>{tr('Rules of this table')}</Dialog.Title><Dialog.Description>{title}</Dialog.Description><div className="ancient-rules-copy">{rules}</div></Dialog.Content></Dialog.Portal></Dialog.Root>
    </div>
  );
}

class BoardRenderBoundary extends Component<{ children: ReactNode; onUse2D: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="ancient-render-fallback"><p>This device could not open the 3D table.</p><button className="ancient-move-button" onClick={this.props.onUse2D}>Continue in 2D</button></div> : this.props.children;
  }
}

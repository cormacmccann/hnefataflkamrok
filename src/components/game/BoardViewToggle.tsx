import { Box, Grid2X2 } from 'lucide-react';

export type BoardView = '2d' | '3d';

export function BoardViewToggle({ view, onChange, className = '' }: {
  view: BoardView;
  onChange: (view: BoardView) => void;
  className?: string;
}) {
  return (
    <div className={`board-view-toggle ${className}`} role="group" aria-label="Board view">
      <button type="button" aria-pressed={view === '3d'} onClick={() => onChange('3d')}><Box size={15} /><span>3D</span></button>
      <button type="button" aria-pressed={view === '2d'} onClick={() => onChange('2d')}><Grid2X2 size={15} /><span>2D</span></button>
    </div>
  );
}

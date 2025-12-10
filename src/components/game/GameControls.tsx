import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw, BookOpen } from 'lucide-react';

interface GameControlsProps {
  onUndo: () => void;
  onNewGame: () => void;
  onShowRules: () => void;
  canUndo: boolean;
  isGameOver: boolean;
}

export function GameControls({ onUndo, onNewGame, onShowRules, canUndo, isGameOver }: GameControlsProps) {
  return (
    <div className="flex flex-col gap-2 bg-card/90 backdrop-blur p-3 rounded-lg border border-border shadow-lg">
      <Button 
        variant="outline" 
        onClick={onUndo} 
        disabled={!canUndo}
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Undo
      </Button>
      <Button 
        variant="outline" 
        onClick={onNewGame}
        className="gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        New Game
      </Button>
      <Button 
        variant="secondary" 
        onClick={onShowRules}
        className="gap-2"
      >
        <BookOpen className="w-4 h-4" />
        Rules
      </Button>
    </div>
  );
}

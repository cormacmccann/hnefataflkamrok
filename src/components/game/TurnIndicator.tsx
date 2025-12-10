import { cn } from '@/lib/utils';
import { Player } from '@/types/game';

interface TurnIndicatorProps {
  currentPlayer: Player;
  isPlayerTurn: boolean;
  playerSide: Player;
}

export function TurnIndicator({ currentPlayer, isPlayerTurn, playerSide }: TurnIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
      <div className="text-sm text-muted-foreground uppercase tracking-wider">Current Turn</div>
      <div className="flex items-center gap-3">
        <div 
          className={cn(
            'w-8 h-8 rounded-full border-2',
            currentPlayer === 'attacker' 
              ? 'bg-[hsl(var(--piece-attacker))] border-[hsl(var(--piece-attacker-accent))]' 
              : 'bg-[hsl(var(--piece-defender))] border-[hsl(var(--piece-defender-accent))]'
          )}
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold capitalize font-['Cinzel']">
            {currentPlayer === 'attacker' ? 'Attackers' : 'Defenders'}
          </span>
          <span className="text-xs text-muted-foreground">
            {isPlayerTurn ? '(Your turn)' : '(AI thinking...)'}
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        You play as: <span className="capitalize font-semibold">{playerSide}</span>
      </div>
    </div>
  );
}

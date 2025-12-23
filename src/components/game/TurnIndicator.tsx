import { cn } from '@/lib/utils';
import { Player } from '@/types/game';
import { useLanguage } from '@/i18n/LanguageContext';

interface TurnIndicatorProps {
  currentPlayer: Player;
  isPlayerTurn: boolean;
  playerSide: Player;
}

export function TurnIndicator({ currentPlayer, isPlayerTurn, playerSide }: TurnIndicatorProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card/90 backdrop-blur border border-border shadow-lg">
      <div className="text-sm text-muted-foreground uppercase tracking-wider">{t.currentTurn}</div>
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
            {currentPlayer === 'attacker' ? t.attackers : t.defenders}
          </span>
          <span className="text-xs text-muted-foreground">
            ({isPlayerTurn ? t.yourTurn : t.aiThinking})
          </span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        {t.youPlayAs}: <span className="capitalize font-semibold">{playerSide === 'attacker' ? t.attacker : t.defender}</span>
      </div>
    </div>
  );
}

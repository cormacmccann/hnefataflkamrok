import { Move } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/i18n/LanguageContext';

interface MoveHistoryProps {
  moves: Move[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col h-full bg-card/90 backdrop-blur border border-border rounded-lg overflow-hidden shadow-lg">
      <div className="p-3 border-b border-border bg-secondary/50">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-center font-['Cinzel']">
          {t.moveHistory}
        </h3>
      </div>
      <ScrollArea className="flex-1 p-2">
        {moves.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            {t.noMovesYet}
          </div>
        ) : (
          <div className="space-y-1">
            {moves.map((move, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-secondary/50 transition-colors"
              >
                <span className="text-muted-foreground w-6">{index + 1}.</span>
                <span className="font-mono">{move.notation}</span>
                {move.captured.length > 0 && (
                  <span className="text-destructive text-xs">⚔</span>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

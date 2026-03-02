import { motion, AnimatePresence } from 'framer-motion';
import { Piece, Position, Player } from '@/types/game';
import { useLanguage } from '@/i18n/LanguageContext';

interface DemoMovePopupProps {
  piece: Piece | null;
  to: Position | null;
  player: Player;
  explanation: string;
  visible: boolean;
}

function getColumnLetter(col: number): string {
  return String.fromCharCode(97 + col);
}

export function DemoMovePopup({ piece, to, player, explanation, visible }: DemoMovePopupProps) {
  const { t } = useLanguage();
  
  if (!piece || !to) return null;

  const notation = `${getColumnLetter(piece.position.col)}${piece.position.row + 1} → ${getColumnLetter(to.col)}${to.row + 1}`;
  const playerName = player === 'attacker' ? t.attackers : t.defenders;

  // Get translated piece type name
  const displayPieceType = piece.type === 'king' 
    ? t.tutorialSteps.king.title
    : piece.type === 'defender' ? t.defender : t.attacker;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-md mx-4 w-[calc(100%-2rem)] sm:w-auto"
        >
          <div className="bg-card/95 backdrop-blur-lg border border-primary/30 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full ${
                player === 'attacker' 
                  ? 'bg-[hsl(var(--piece-attacker))]' 
                  : 'bg-[hsl(var(--piece-defender))]'
              }`} />
              <span className="font-['Cinzel'] text-base sm:text-lg text-primary">{playerName}{t.moveOf}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-muted-foreground">{displayPieceType}:</span>
              <span className="font-mono text-foreground bg-secondary/50 px-2 py-1 rounded">{notation}</span>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

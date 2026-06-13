import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoyalUrGame } from './RoyalUrGame';
import { PetteiaGame } from './PetteiaGame';
import { LoreGame } from '@/constants/loreGames';
import { Hourglass } from 'lucide-react';

interface Props {
  game: LoreGame | null;
  onClose: () => void;
}

export function AncientGameModal({ game, onClose }: Props) {
  if (!game) return null;
  const playable = game.id === 'royal-ur' || game.id === 'petteia';

  return (
    <Dialog open={!!game} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90dvh] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-center font-['Cinzel'] text-xl text-primary">
            {game.name}
          </DialogTitle>
          <p className="text-center text-[11px] text-muted-foreground">{game.region} · {game.era}</p>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] px-3 sm:px-5 pb-4">
          {game.id === 'royal-ur' && <RoyalUrGame />}
          {game.id === 'petteia' && <PetteiaGame />}
          {!playable && <InDevelopmentPanel game={game} />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InDevelopmentPanel({ game }: { game: LoreGame }) {
  const status = STATUS[game.id] ?? { phase: 'Engine design', progress: 10 };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 py-3"
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-700/15 border border-amber-700/40 text-amber-200">
        <Hourglass className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold">In active development</span>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">{game.description}</p>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{status.phase}</span>
          <span>{status.progress}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary to-amber-400"
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground/80">Why it's not playable yet</p>
        <p>{REASONS[game.id] ?? 'Needs a new engine family the project does not yet implement.'}</p>
      </div>
      <p className="text-[10px] text-muted-foreground italic text-center pt-2">
        We're shipping playable variants in waves — Royal Game of Ur and Petteia are live. Senet and Bao are next.
      </p>
    </motion.div>
  );
}

const STATUS: Record<string, { phase: string; progress: number }> = {
  senet: { phase: 'Race engine + Kendall ruleset', progress: 55 },
  liubo: { phase: 'Lost-rules reconstruction research', progress: 15 },
  patolli: { phase: 'Cross-board topology', progress: 35 },
  bao: { phase: 'Sowing engine (4×8 mancala)', progress: 40 },
  mehen: { phase: 'Snake-board spiral & speculative ruleset', progress: 20 },
  latrunculorum: { phase: 'Dux piece + Roman variant rules', progress: 65 },
};

const REASONS: Record<string, string> = {
  senet: 'Race game with throwing-sticks dice and a serpentine track — requires a generic race-engine we are still building. Kendall/Bell reconstruction will be used.',
  liubo: 'The Han-dynasty rules were lost by the Tang. We will only ship a playable version once our reconstruction has solid scholarly grounding.',
  patolli: 'Cross-shaped board topology and bean-dice rolls need the race-engine plus a special branching path renderer.',
  bao: 'Mancala/sowing games need a completely different pit-and-seed engine with multi-lap relay capture — Bao is famously the hardest of them all.',
  mehen: 'The rules of the Snake Game are genuinely unknown. Any "playable Mehen" would be invention, not history. We will ship a clearly-labelled modern reconstruction only.',
  latrunculorum: 'Engine reuses Tafl mechanics, but the "dux" commander piece needs a custom rule plus tuned AI heuristics. Shipping immediately after Petteia.',
};

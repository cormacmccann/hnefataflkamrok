import { motion, AnimatePresence } from 'framer-motion';
import { RoyalUrGame } from './RoyalUrGame';
import { PetteiaGame } from './PetteiaGame';
import { LoreGame } from '@/constants/loreGames';
import { Hourglass, X } from 'lucide-react';

interface Props {
  game: LoreGame | null;
  onClose: () => void;
}

export function AncientGameModal({ game, onClose }: Props) {
  return (
    <AnimatePresence>
      {game && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-30 carved-button p-2 rounded-md text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {game.id === 'royal-ur' && <RoyalUrGame />}
          {game.id === 'petteia' && <PetteiaGame />}
          {game.id !== 'royal-ur' && game.id !== 'petteia' && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <InDevelopmentPanel game={game} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InDevelopmentPanel({ game }: { game: LoreGame }) {
  const status = STATUS[game.id] ?? { phase: 'Engine design', progress: 10 };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="parchment rounded-xl p-6 max-w-md w-full space-y-4 text-amber-950"
    >
      <div>
        <h3 className="font-['Cinzel'] text-xl text-amber-900 font-bold text-center">{game.name}</h3>
        <p className="text-center text-[11px] opacity-70">{game.region} · {game.era}</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-700/15 border border-amber-700/40">
        <Hourglass className="w-4 h-4 shrink-0" />
        <span className="text-sm font-semibold">In active development</span>
      </div>
      <p className="text-sm leading-relaxed">{game.description}</p>
      <div>
        <div className="flex justify-between text-xs mb-1 opacity-80">
          <span>{status.phase}</span>
          <span>{status.progress}%</span>
        </div>
        <div className="h-2 bg-amber-900/20 rounded overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary to-amber-400"
          />
        </div>
      </div>
      <div className="text-xs space-y-1 opacity-90">
        <p className="font-semibold">Why it's not playable yet</p>
        <p>{REASONS[game.id] ?? 'Needs a new engine family the project does not yet implement.'}</p>
      </div>
      <p className="text-[10px] italic text-center pt-1 opacity-70">
        Playable in waves — Royal Game of Ur and Petteia are live in 3D. Senet and Bao are next.
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

import { motion, AnimatePresence } from 'framer-motion';
import { RoyalUrGame } from './RoyalUrGame';
import { PetteiaGame } from './PetteiaGame';
import { LatrunculorumGame } from './LatrunculorumGame';
import { BaoGame } from './BaoGame';
import { RaceGame } from './RaceGame';
import { SENET_CONFIG } from '@/lib/ancient/senet';
import { PATOLLI_CONFIG } from '@/lib/ancient/patolli';
import { LIUBO_CONFIG } from '@/lib/ancient/liubo';
import { MEHEN_CONFIG } from '@/lib/ancient/mehen';
import { LoreGame } from '@/constants/loreGames';
import { X } from 'lucide-react';

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
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-30 carved-button p-2 rounded-md text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {game.id === 'royal-ur' && <RoyalUrGame />}
          {game.id === 'petteia' && <PetteiaGame />}
          {game.id === 'latrunculorum' && <LatrunculorumGame />}
          {game.id === 'bao' && <BaoGame />}
          {game.id === 'senet' && (
            <RaceGame
              config={SENET_CONFIG}
              eraId="senet"
              cameraPosition={[0, 9, 6]}
              tileColor="#E0C088"
              specialColor="#C97A3D"
              baseColor="#3a2410"
              surfaceColor="#5b3a1f"
              diceLabel="Throw sticks"
              disclaimer="Original Senet rules are lost. This uses the Kendall/Bell reconstruction — educated guesswork, not history."
            />
          )}
          {game.id === 'patolli' && (
            <RaceGame
              config={PATOLLI_CONFIG}
              eraId="patolli"
              cameraPosition={[0, 14, 10]}
              tileColor="#1a8a85"
              specialColor="#e94d2e"
              baseColor="#2a1810"
              surfaceColor="#3d1e10"
              tileSize={0.7}
              diceLabel="Throw beans"
              disclaimer="Reconstructed from Diego Durán's chronicle (c. 1581). The Aztec betting mechanic has been omitted."
            />
          )}
          {game.id === 'liubo' && (
            <RaceGame
              config={LIUBO_CONFIG}
              eraId="liubo"
              cameraPosition={[0, 7, 8]}
              tileColor="#9a1a1a"
              specialColor="#FFD700"
              baseColor="#2a1810"
              surfaceColor="#3a1f10"
              diceLabel="Throw sticks"
              disclaimer="Liubo's original rules vanished by ~700 CE. This is a heavily simplified modern reconstruction."
            />
          )}
          {game.id === 'mehen' && (
            <RaceGame
              config={MEHEN_CONFIG}
              eraId="mehen"
              cameraPosition={[0, 12, 8]}
              tileColor="#8a6a3a"
              specialColor="#d4a55a"
              baseColor="#3a2a1a"
              surfaceColor="#5a4520"
              tileSize={0.65}
              diceLabel="Throw sticks"
              disclaimer="Mehen's rules are GENUINELY UNKNOWN. This is a modern speculative reconstruction for educational play — not history."
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

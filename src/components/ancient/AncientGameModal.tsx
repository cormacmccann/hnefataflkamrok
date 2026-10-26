import * as Dialog from '@radix-ui/react-dialog';
import { RoyalUrGame } from './RoyalUrGame';
import { PetteiaGame } from './PetteiaGame';
import { LatrunculorumGame } from './LatrunculorumGame';
import { BaoGame } from './BaoGame';
import { RaceGame } from './RaceGame';
import { MehenGame } from './MehenGame';
import { SENET_CONFIG } from '@/lib/ancient/senet';
import { PATOLLI_CONFIG } from '@/lib/ancient/patolli';
import { LIUBO_CONFIG } from '@/lib/ancient/liubo';
import { LoreGame } from '@/constants/loreGames';
import { X } from 'lucide-react';

interface Props {
  game: LoreGame | null;
  onClose: () => void;
}

export function AncientGameModal({ game, onClose }: Props) {
  return (
    <Dialog.Root open={!!game} onOpenChange={open => { if (!open) onClose(); }}>
      {game && <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[79] bg-black" />
        <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-[80] bg-black outline-none">
          <Dialog.Title className="sr-only">{game.name}</Dialog.Title>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-30 carved-button p-2 rounded-md text-foreground"
            aria-label="Back to collection"
            title="Back to collection"
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
              disclaimer="The complete Senet rules are lost. This is a simplified modern race game inspired by Senet, not a full scholarly reconstruction."
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
              disclaimer="A simplified modern race game inspired by Patolli. The original betting system and some historical mechanics are omitted."
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
          {game.id === 'mehen' && <MehenGame />}
        </Dialog.Content>
      </Dialog.Portal>}
    </Dialog.Root>
  );
}

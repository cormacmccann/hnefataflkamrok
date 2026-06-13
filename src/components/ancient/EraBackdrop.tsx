import { useState } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import petteia from '@/assets/era/petteia.jpg';
import latrunculorum from '@/assets/era/latrunculorum.jpg';
import royalUr from '@/assets/era/royal-ur.jpg';
import senet from '@/assets/era/senet.jpg';
import liubo from '@/assets/era/liubo.jpg';
import patolli from '@/assets/era/patolli.jpg';
import bao from '@/assets/era/bao.jpg';
import mehen from '@/assets/era/mehen.jpg';

export const ERA_IMAGES: Record<string, string> = {
  petteia,
  latrunculorum,
  'royal-ur': royalUr,
  senet,
  liubo,
  patolli,
  bao,
  mehen,
};

const ERA_CAPTIONS: Record<string, string> = {
  petteia: 'Athens & the Acropolis, c. 400 BCE',
  latrunculorum: 'Vindolanda fort, Hadrian\'s Wall, c. 150 CE',
  'royal-ur': 'The city of Ur with its ziggurat, c. 2600 BCE',
  senet: 'A Theban tomb chamber, New Kingdom, c. 1300 BCE',
  liubo: 'Han imperial courtyard, China, c. 100 BCE',
  patolli: 'Aztec Tenochtitlán, c. 1500 CE',
  bao: 'Stone Town, Zanzibar, c. 1700 CE',
  mehen: 'The Nile valley near Saqqara, c. 2700 BCE',
};

/** A small parchment-framed card showing what the game's homeland looked like in its time.
 *  Pinned to the bottom-left of the 3D viewport; collapsible.
 */
export function EraBackdrop({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(true);
  const src = ERA_IMAGES[gameId];
  const caption = ERA_CAPTIONS[gameId];
  if (!src) return null;
  return (
    <div className="absolute top-16 left-4 z-20 max-w-[200px] sm:max-w-[240px]">
      <button
        onClick={() => setOpen(!open)}
        className="parchment rounded-t-lg px-2 py-1 flex items-center justify-between w-full text-[10px] text-amber-950 font-['Cinzel'] font-semibold gap-1"
      >
        <span className="inline-flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Homeland in that era</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="parchment rounded-b-lg p-1.5 border-t border-amber-800/20">
          <img
            src={src}
            alt={caption}
            loading="lazy"
            className="w-full h-auto rounded-sm border border-amber-900/30"
            width={240}
            height={150}
          />
          <p className="text-[9px] sm:text-[10px] text-amber-950/80 italic mt-1 leading-tight">{caption}</p>
        </div>
      )}
    </div>
  );
}

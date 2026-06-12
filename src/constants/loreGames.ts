// Ancient strategy games (non-chess, non-tafl) that existed historically
// and are rarely played today. Shown on the History Map as lore-only entries.
// Phase 2 will make the custodial-capture ones (Petteia, Latrunculorum) fully playable.

export interface LoreGame {
  id: string;
  name: string;
  region: string;
  era: string;
  coordinates: { lat: number; lng: number };
  description: string;
  family: 'custodial' | 'race' | 'sowing' | 'territory';
  status: 'playable-soon' | 'lore';
}

export const LORE_GAMES: LoreGame[] = [
  {
    id: 'petteia',
    name: 'Petteia (Πεττεία)',
    region: 'Ancient Greece',
    era: 'c. 600 BCE – 400 CE',
    coordinates: { lat: 37.984, lng: 23.728 }, // Athens
    description:
      'Greek "pebbles" — an 8×8 strategy game of two equal armies. Plato compared statesmanship to it; Polybius described custodial capture nearly identical to tafl. A direct ancestor of Roman Ludus Latrunculorum.',
    family: 'custodial',
    status: 'playable-soon',
  },
  {
    id: 'latrunculorum',
    name: 'Ludus Latrunculorum',
    region: 'Roman Empire',
    era: 'c. 100 BCE – 400 CE',
    coordinates: { lat: 55.025, lng: -2.272 }, // Vindolanda, Hadrian's Wall
    description:
      '"The game of mercenaries" — the Roman legionary\'s pastime. Glass and stone pieces with a special "dux" (commander) have been found from Vindolanda to North Africa. Custodial capture on grids 8×8 to 12×8.',
    family: 'custodial',
    status: 'playable-soon',
  },
  {
    id: 'senet',
    name: 'Senet',
    region: 'Ancient Egypt',
    era: 'c. 3100 BCE – 400 CE',
    coordinates: { lat: 25.687, lng: 32.659 }, // Luxor / Thebes
    description:
      'A 3×10 race game with throwing-sticks instead of dice — found in the tomb of Tutankhamun. Players raced pieces along a serpentine track between this life and the next.',
    family: 'race',
    status: 'lore',
  },
  {
    id: 'liubo',
    name: 'Liubo (六博)',
    region: 'Han China',
    era: 'c. 400 BCE – 600 CE',
    coordinates: { lat: 34.343, lng: 108.94 }, // Xi'an
    description:
      'A symmetrical Han-dynasty race-and-capture game played with six tossed sticks. Confucius mentioned it; emperors played it. The rules were lost by the Tang dynasty and remain partly mysterious.',
    family: 'race',
    status: 'lore',
  },
  {
    id: 'patolli',
    name: 'Patolli',
    region: 'Mesoamerica (Aztec, Maya, Teotihuacan)',
    era: 'c. 200 BCE – 1521 CE',
    coordinates: { lat: 19.692, lng: -98.844 }, // Teotihuacan
    description:
      'A cross-shaped race game played with marked beans for dice. Beloved by the Aztecs — players wagered cloaks, slaves, even themselves. Banned and burned by Spanish missionaries after the conquest.',
    family: 'race',
    status: 'lore',
  },
  {
    id: 'bao',
    name: 'Bao la Kiswahili',
    region: 'East African coast',
    era: 'c. 700 CE – present (endangered tradition)',
    coordinates: { lat: -6.165, lng: 39.202 }, // Zanzibar
    description:
      'A four-row mancala/sowing game of the Swahili coast — deeply strategic, with a reputation for being among the most complex traditional games on Earth. Master players are dwindling.',
    family: 'sowing',
    status: 'lore',
  },
  {
    id: 'mehen',
    name: 'Mehen (Game of the Snake)',
    region: 'Predynastic Egypt',
    era: 'c. 3000 BCE – 2300 CE',
    coordinates: { lat: 29.978, lng: 31.134 }, // Saqqara
    description:
      'Played on a coiled-snake board with lion-shaped pieces and marbles. Vanished from Egypt by the Old Kingdom\'s end; nobody is sure how it was played. A true lost game.',
    family: 'race',
    status: 'lore',
  },
  {
    id: 'royal-ur',
    name: 'Royal Game of Ur',
    region: 'Sumer (Mesopotamia)',
    era: 'c. 2600 BCE – 200 CE',
    coordinates: { lat: 30.962, lng: 46.103 }, // Ur
    description:
      'A 4,600-year-old race game played from the royal tombs of Ur to Cochin in India. Its rules survived on a Babylonian clay tablet decoded in the British Museum in 1980 — by a curator who taught himself cuneiform.',
    family: 'race',
    status: 'lore',
  },
];

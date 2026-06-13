// Mehen — predynastic Egyptian "Game of the Snake".
// Rules are GENUINELY UNKNOWN. This is a speculative reconstruction shown with
// a clear in-app disclaimer. Spiral board with ~30 segments coiled into the snake's head.
// 6 small marbles per side race inward to the centre (snake's head).
// 6 sticks roll 0..6.

import { RaceConfig, sixStickRoll } from './raceEngine';

const PATH_LEN = 30;

const squares: RaceConfig['squares'] = {
  9: { safe: true, label: 'Coil 1 rest' },
  19: { safe: true, label: 'Coil 2 rest' },
  29: { extraRoll: true, label: "Snake's head" },
};

// Spiral layout: parametric Archimedean spiral inward.
const layout: RaceConfig['layout'] = [];
const turns = 2.5;
const maxR = 4;
for (let i = 0; i < PATH_LEN; i++) {
  const t = i / (PATH_LEN - 1);
  const angle = t * turns * Math.PI * 2;
  const r = maxR * (1 - t * 0.85);
  layout.push({ index: i, x: Math.cos(angle) * r, z: Math.sin(angle) * r });
}

export const MEHEN_CONFIG: RaceConfig = {
  id: 'mehen',
  name: 'Mehen — Game of the Snake',
  pathLength: PATH_LEN,
  tokensPerPlayer: 6,
  squares,
  diceRoll: sixStickRoll,
  exactBearOff: false,
  layout,
  specialIndices: [9, 19, 29],
  rulesNote: 'The original rules of Mehen are LOST. This is a modern speculative reconstruction shown for educational play only — not history.',
};

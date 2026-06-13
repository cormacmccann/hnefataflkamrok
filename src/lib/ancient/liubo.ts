// Liubo (六博) — Han-dynasty race game, original rules lost by the Tang dynasty.
// We provide a SIMPLIFIED reconstruction with clear in-game disclaimer.
// 12-square symmetrical track + central T-zone (we model as a linear race of 12 squares).
// 6 pieces per side. 6 sticks (binary) roll 0→6.

import { RaceConfig, sixStickRoll } from './raceEngine';

const PATH_LEN = 12;

const squares: RaceConfig['squares'] = {
  5: { safe: true, label: 'T-zone (centre)' },
  6: { extraRoll: true, label: 'Imperial square' },
};

const layout: RaceConfig['layout'] = [];
const SQ = 1.1;
const xOff = (PATH_LEN * SQ) / 2 - SQ / 2;
for (let i = 0; i < PATH_LEN; i++) {
  layout.push({ index: i, x: i * SQ - xOff, z: 0 });
}

export const LIUBO_CONFIG: RaceConfig = {
  id: 'liubo',
  name: 'Liubo (六博)',
  pathLength: PATH_LEN,
  tokensPerPlayer: 6,
  squares,
  diceRoll: sixStickRoll,
  exactBearOff: false,
  layout,
  specialIndices: [5, 6],
  rulesNote: 'Original Liubo rules vanished by the Tang dynasty (~700 CE). This is a heavily simplified modern reconstruction — historical accuracy is approximate.',
};

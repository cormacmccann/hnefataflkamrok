// Patolli — Aztec cross-shaped race game (Durán's chronicle reconstruction; betting omitted).
// Cross of 4 arms of 13 squares = 52 squares total path.
// 6 pieces per side. 5 marked beans roll 1..5 (we use 0→5).
// Center / arm-tips marked as safe ("triangle" squares).
// Win by first player to bring all pieces around the cross and bear off.

import { RaceConfig, fiveBeanRoll } from './raceEngine';

const PATH_LEN = 52;
const ARM = 13;

const squares: RaceConfig['squares'] = {};
// Mark arm tips as safe (positions 6, 19, 32, 45 — middle of each arm in 0-index)
[6, 19, 32, 45].forEach((i) => { squares[i] = { safe: true, label: 'Triangle (safe)' }; });
// Arm ends grant extra roll
[12, 25, 38, 51].forEach((i) => { squares[i] = { extraRoll: true, label: 'Arm end' }; });

// Cross layout (arm length 13). Arm runs outward from center along +x, then +z, then -x, then -z.
// Simpler: 4 arms (north/east/south/west), each a strip of 13 squares.
const layout: RaceConfig['layout'] = [];
const SQ = 0.8;
const armDirs: Array<[number, number]> = [
  [0, -1], // north (towards -z)
  [1, 0],  // east
  [0, 1],  // south
  [-1, 0], // west
];
for (let a = 0; a < 4; a++) {
  const [dx, dz] = armDirs[a];
  for (let s = 0; s < ARM; s++) {
    // s=0 nearest to centre, s=12 outermost tip
    const dist = (s + 1) * SQ;
    layout.push({
      index: a * ARM + s,
      x: dx * dist,
      z: dz * dist,
    });
  }
}

export const PATOLLI_CONFIG: RaceConfig = {
  id: 'patolli',
  name: 'Patolli',
  pathLength: PATH_LEN,
  tokensPerPlayer: 6,
  squares,
  diceRoll: fiveBeanRoll,
  exactBearOff: false,
  layout,
  specialIndices: [6, 19, 32, 45, 12, 25, 38, 51],
  rulesNote: 'Aztec cross-board game played with marked beans. Simplified modern interpretation inspired by Durán\'s account; betting omitted.',
};

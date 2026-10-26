// Senet — simplified modern interpretation, not a complete Kendall/Bell ruleset.
// 3 rows × 10 squares = 30 squares, "boustrophedon" snake path.
// 5 pieces per side, alternating start on row 1 (white on odd, black on even).
// 4 throwing-sticks: roll 1,2,3,4,5 — rolls of 1,4,5 grant an extra turn.
// Special squares (1-indexed in literature):
//   26 — House of Beauty (Per-Nefer): safe
//   27 — House of Water: sends piece back to square 15 (House of Rebirth)
//   28 — House of Three Truths: exit only with exact roll of 3
//   29 — House of Re-Atoum: exit only with exact roll of 2
//   30 — House of Horus: safe, bear off with exact 1
//   15 — House of Rebirth (refuge square)
// We use 0-indexed internally.

import { RaceConfig, fourStickRoll } from './raceEngine';

const PATH_LEN = 30;

const squares: RaceConfig['squares'] = {
  14: { safe: true, label: 'House of Rebirth (15)' },
  25: { safe: true, label: 'House of Beauty (26)' },
  26: { sendBackTo: 14, label: 'House of Water (27)' },
  27: { safe: true, label: 'Three Truths (28)' },
  28: { safe: true, label: 'Re-Atoum (29)' },
  29: { safe: true, extraRoll: false, label: 'House of Horus (30)' },
};

// Layout: 3 rows × 10 cols, snake path: row 0 L→R (0..9), row 1 R→L (10..19), row 2 L→R (20..29).
const layout: RaceConfig['layout'] = [];
const SQ = 1.0;
const ROWS = 3, COLS = 10;
const xOff = (COLS * SQ) / 2 - SQ / 2;
const zOff = (ROWS * SQ) / 2 - SQ / 2;
for (let i = 0; i < PATH_LEN; i++) {
  const row = Math.floor(i / COLS);
  const inRow = i % COLS;
  const col = row % 2 === 0 ? inRow : COLS - 1 - inRow;
  layout.push({ index: i, x: col * SQ - xOff, z: row * SQ - zOff });
}

// Initial: alternating on row 1 (path indices 0..9): white on even, black on odd
const initialWhite = [0, 2, 4, 6, 8];
const initialBlack = [1, 3, 5, 7, 9];

export const SENET_CONFIG: RaceConfig = {
  id: 'senet',
  name: 'Senet',
  pathLength: PATH_LEN,
  tokensPerPlayer: 5,
  squares,
  diceRoll: fourStickRoll,
  exactBearOff: true,
  extraTurnRolls: [1, 4, 5],
  initialWhite,
  initialBlack,
  rebirthIndex: 14,
  layout,
  specialIndices: [14, 25, 26, 27, 28, 29],
  rulesNote: "Egyptian-inspired race game. Original rules are incomplete; this simplified interpretation does not implement a complete scholarly ruleset.",
};

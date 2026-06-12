import { BoardConfig, BoardSize, GameVariant, BoardTheme, VariantRules } from '@/types/game';

// Irish Celtic theme - deep greens with gold accents
const BRANDUB_THEME: BoardTheme = {
  boardBase: '#2D4A2D',
  boardFrame: '#1A3A1A',
  squareLight: '#8FBC8F',
  squareDark: '#556B2F',
  corner: '#B8860B',
  throne: '#228B22',
  circularFrame: '#1A3A1A',
  accentRing: '#DAA520',
  runeColor: '#FFD700',
};

// Swedish Nordic theme - light birch wood with ice blue accents
const TABLUT_THEME: BoardTheme = {
  boardBase: '#D2B48C',
  boardFrame: '#A0826D',
  squareLight: '#F5DEB3',
  squareDark: '#C4A574',
  corner: '#4682B4',
  throne: '#5F9EA0',
  circularFrame: '#8B7355',
  accentRing: '#87CEEB',
  runeColor: '#ADD8E6',
};

// Welsh theme - deep red and slate grey
const TAWLBWRDD_THEME: BoardTheme = {
  boardBase: '#4A4A4A',
  boardFrame: '#2F2F2F',
  squareLight: '#A9A9A9',
  squareDark: '#696969',
  corner: '#8B0000',
  throne: '#B22222',
  circularFrame: '#333333',
  accentRing: '#DC143C',
  runeColor: '#FFD700',
};

// Scandinavian Viking theme - dark oak with bronze/gold accents
const HNEFATAFL_THEME: BoardTheme = {
  boardBase: '#4A3728',
  boardFrame: '#5D4037',
  squareLight: '#C4A574',
  squareDark: '#8B7355',
  corner: '#8B6914',
  throne: '#6B4423',
  circularFrame: '#3D2817',
  accentRing: '#CD7F32',
  runeColor: '#FFD700',
};

// Anglo-Saxon ecclesiastical theme - purple and gold
const ALEA_THEME: BoardTheme = {
  boardBase: '#2E1A47',
  boardFrame: '#1A0F2E',
  squareLight: '#9370DB',
  squareDark: '#663399',
  corner: '#FFD700',
  throne: '#4B0082',
  circularFrame: '#1A0F2E',
  accentRing: '#FFD700',
  runeColor: '#E6E6FA',
};

// Celtic Fidchell theme - forest green with silver (circular board)
const FIDCHELL_THEME: BoardTheme = {
  boardBase: '#1B3D2F',
  boardFrame: '#0D1F17',
  squareLight: '#4A7A5A',
  squareDark: '#2D5A3D',
  corner: '#C0C0C0',
  throne: '#2E8B57',
  circularFrame: '#1A3D2A',
  accentRing: '#50C878',
  runeColor: '#98FB98',
};

// Default rules for most variants
const STANDARD_RULES: VariantRules = {
  kingArmed: false,
  edgeEscape: false,
  shieldwallCapture: false,
  victoryType: 'escape',
};

// Fidchell connection-based rules
const FIDCHELL_RULES: VariantRules = {
  kingArmed: true,
  edgeEscape: false,
  shieldwallCapture: false,
  victoryType: 'connection',
};

export const GAME_VARIANTS: GameVariant[] = [
  {
    id: 'fidchell',
    name: 'Fidchell',
    boardSize: 7,
    boardType: 'circular',
    description: 'Celtic "wood-wisdom" — Connection game',
    origin: 'Ballinderry, Ireland',
    theme: FIDCHELL_THEME,
    era: 'c. 600–1100 CE',
    history: 'Fidchell ("wood-wisdom") is a Celtic board game referenced in early Irish sagas like Tochmarc Étaíne. A wooden 7×7 board was excavated at Ballinderry crannog, Co. Offaly in 1932 and dated to the 10th century. The Welsh cognate gwyddbwyll appears in the Mabinogion.',
    defaultRules: FIDCHELL_RULES,
    coordinates: { lat: 53.171, lng: -7.785 },
  },
  {
    id: 'brandub',
    name: 'Brandub',
    boardSize: 7,
    boardType: 'square',
    description: 'Irish 7×7 "black raven"',
    origin: 'Knowth, Ireland',
    theme: BRANDUB_THEME,
    era: 'c. 700–1100 CE',
    history: 'Brandub ("black raven") is the Irish 7×7 tafl variant. A stone board fragment from Knowth, Co. Meath and a complete wooden board from Ballinderry attest its play in early medieval Ireland, with the king representing the High King of Tara.',
    defaultRules: { ...STANDARD_RULES, kingArmed: true },
    coordinates: { lat: 53.701, lng: -6.491 },
  },
  {
    id: 'tablut',
    name: 'Tablut',
    boardSize: 9,
    boardType: 'square',
    description: 'Sámi 9×9, recorded by Linnaeus',
    origin: 'Sápmi (Lapland)',
    theme: TABLUT_THEME,
    era: 'documented 1732, played earlier',
    history: 'Tablut is the Sámi 9×9 tafl, recorded in detail by Carl Linnaeus during his 1732 Iter Lapponicum. His diary preserves the rules — the only complete historical ruleset for any tafl game — and was the basis of all modern reconstructions.',
    defaultRules: STANDARD_RULES,
    coordinates: { lat: 68.435, lng: 18.806 },
  },
  {
    id: 'tawlbwrdd',
    name: 'Tawlbwrdd',
    boardSize: 11,
    boardType: 'square',
    description: 'Welsh "throw-board"',
    origin: 'Wales',
    theme: TAWLBWRDD_THEME,
    era: 'c. 900–1587 CE',
    history: 'Tawlbwrdd ("throw-board") is the Welsh 11×11 tafl. Described in the Cyfraith Hywel law texts and in Robert ap Ifan\'s 1587 manuscript, which provides our clearest medieval Welsh board diagram with 8 defenders, 16 attackers, and an armed king.',
    defaultRules: { ...STANDARD_RULES, kingArmed: true },
    coordinates: { lat: 52.413, lng: -4.082 },
  },
  {
    id: 'hnefatafl',
    name: 'Hnefatafl',
    boardSize: 11,
    boardType: 'square',
    description: 'Norse "king\'s table"',
    origin: 'Gokstad, Norway',
    theme: HNEFATAFL_THEME,
    era: 'c. 400–1100 CE',
    history: 'Hnefatafl ("king\'s table") was the dominant Norse strategy game of the Viking Age. Boards and pieces have been excavated at Gokstad (Norway, c. 900), Birka (Sweden), and across the Norse diaspora from Dublin to L\'Anse aux Meadows. Sagas including Friðþjófs saga describe play.',
    defaultRules: { ...STANDARD_RULES, shieldwallCapture: true },
    coordinates: { lat: 59.083, lng: 10.214 },
  },
  {
    id: 'alea',
    name: 'Alea Evangelii',
    boardSize: 19,
    boardType: 'square',
    description: 'Anglo-Saxon monastic 19×19',
    origin: 'Canterbury, England',
    theme: ALEA_THEME,
    era: 'c. 1000–1150 CE',
    history: 'Alea Evangelii ("Game of the Gospels") survives in a single 12th-century Canterbury manuscript (Corpus Christi College Cambridge MS 122), which presents the 19×19 board as a Christological diagram and credits Bishop Israel the Grammarian (10th c.) for the layout.',
    defaultRules: { ...STANDARD_RULES, edgeEscape: true },
    coordinates: { lat: 51.279, lng: 1.083 },
  },
];

export const BOARD_CONFIGS: Record<BoardSize, BoardConfig> = {
  7: {
    size: 7,
    corners: [
      { row: 0, col: 0 },
      { row: 0, col: 6 },
      { row: 6, col: 0 },
      { row: 6, col: 6 },
    ],
    throne: { row: 3, col: 3 },
    kingPosition: { row: 3, col: 3 },
    initialDefenders: [
      { row: 2, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 4 }, { row: 4, col: 3 },
    ],
    initialAttackers: [
      { row: 0, col: 3 }, { row: 1, col: 3 },
      { row: 3, col: 0 }, { row: 3, col: 1 },
      { row: 3, col: 5 }, { row: 3, col: 6 },
      { row: 5, col: 3 }, { row: 6, col: 3 },
    ],
  },
  9: {
    size: 9,
    corners: [
      { row: 0, col: 0 },
      { row: 0, col: 8 },
      { row: 8, col: 0 },
      { row: 8, col: 8 },
    ],
    throne: { row: 4, col: 4 },
    kingPosition: { row: 4, col: 4 },
    initialDefenders: [
      { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 2 }, { row: 4, col: 3 },
      { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 5, col: 4 }, { row: 6, col: 4 },
    ],
    initialAttackers: [
      { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 },
      { row: 1, col: 4 },
      { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 },
      { row: 4, col: 1 },
      { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
      { row: 4, col: 7 },
      { row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 },
      { row: 7, col: 4 },
    ],
  },
  11: {
    size: 11,
    corners: [
      { row: 0, col: 0 },
      { row: 0, col: 10 },
      { row: 10, col: 0 },
      { row: 10, col: 10 },
    ],
    throne: { row: 5, col: 5 },
    kingPosition: { row: 5, col: 5 },
    initialDefenders: [
      { row: 3, col: 5 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 6 }, { row: 5, col: 7 },
      { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 7, col: 5 },
    ],
    initialAttackers: [
      { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 },
      { row: 1, col: 5 },
      { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 },
      { row: 5, col: 1 },
      { row: 3, col: 10 }, { row: 4, col: 10 }, { row: 5, col: 10 }, { row: 6, col: 10 }, { row: 7, col: 10 },
      { row: 5, col: 9 },
      { row: 10, col: 3 }, { row: 10, col: 4 }, { row: 10, col: 5 }, { row: 10, col: 6 }, { row: 10, col: 7 },
      { row: 9, col: 5 },
    ],
  },
  19: {
    size: 19,
    corners: [
      { row: 0, col: 0 },
      { row: 0, col: 18 },
      { row: 18, col: 0 },
      { row: 18, col: 18 },
    ],
    throne: { row: 9, col: 9 },
    kingPosition: { row: 9, col: 9 },
    initialDefenders: [
      // Cross pattern around king
      { row: 5, col: 9 }, { row: 6, col: 9 }, { row: 7, col: 9 }, { row: 8, col: 9 },
      { row: 10, col: 9 }, { row: 11, col: 9 }, { row: 12, col: 9 }, { row: 13, col: 9 },
      { row: 9, col: 5 }, { row: 9, col: 6 }, { row: 9, col: 7 }, { row: 9, col: 8 },
      { row: 9, col: 10 }, { row: 9, col: 11 }, { row: 9, col: 12 }, { row: 9, col: 13 },
      // Diagonal guards
      { row: 7, col: 7 }, { row: 7, col: 11 }, { row: 11, col: 7 }, { row: 11, col: 11 },
      { row: 6, col: 6 }, { row: 6, col: 12 }, { row: 12, col: 6 }, { row: 12, col: 12 },
    ],
    initialAttackers: [
      // Top edge
      { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 },
      { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 0, col: 13 },
      { row: 1, col: 7 }, { row: 1, col: 9 }, { row: 1, col: 11 },
      { row: 2, col: 9 },
      // Bottom edge
      { row: 18, col: 5 }, { row: 18, col: 6 }, { row: 18, col: 7 }, { row: 18, col: 8 }, { row: 18, col: 9 },
      { row: 18, col: 10 }, { row: 18, col: 11 }, { row: 18, col: 12 }, { row: 18, col: 13 },
      { row: 17, col: 7 }, { row: 17, col: 9 }, { row: 17, col: 11 },
      { row: 16, col: 9 },
      // Left edge
      { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 }, { row: 9, col: 0 },
      { row: 10, col: 0 }, { row: 11, col: 0 }, { row: 12, col: 0 }, { row: 13, col: 0 },
      { row: 7, col: 1 }, { row: 9, col: 1 }, { row: 11, col: 1 },
      { row: 9, col: 2 },
      // Right edge
      { row: 5, col: 18 }, { row: 6, col: 18 }, { row: 7, col: 18 }, { row: 8, col: 18 }, { row: 9, col: 18 },
      { row: 10, col: 18 }, { row: 11, col: 18 }, { row: 12, col: 18 }, { row: 13, col: 18 },
      { row: 7, col: 17 }, { row: 9, col: 17 }, { row: 11, col: 17 },
      { row: 9, col: 16 },
    ],
  },
};

export const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ'];

// Ogham script for Fidchell (Celtic alphabet)
export const OGHAM = ['ᚁ', 'ᚂ', 'ᚃ', 'ᚄ', 'ᚅ', 'ᚆ', 'ᚇ', 'ᚈ', 'ᚉ', 'ᚊ', 'ᚋ', 'ᚌ', 'ᚍ', 'ᚎ', 'ᚏ', 'ᚐ'];

// Fidchell circular board configuration
// 5 rings (center navel + 4 outer), 16 spokes = 49 total positions
export const FIDCHELL_CONFIG: CircularBoardConfig = {
  rings: 5,
  spokes: 16,
  totalNodes: 49, // 1 center + 16*3 (rings 1-3 have all 16) = 49 (ring 4 has 16)
  piecesPerSide: 12,
  navelPosition: { ring: 0, spoke: 0 },
  // White pieces start on inner rings (will make connection from center)
  initialWhite: [
    { ring: 1, spoke: 0 }, { ring: 1, spoke: 4 }, { ring: 1, spoke: 8 }, { ring: 1, spoke: 12 },
    { ring: 2, spoke: 2 }, { ring: 2, spoke: 6 }, { ring: 2, spoke: 10 }, { ring: 2, spoke: 14 },
    { ring: 2, spoke: 0 }, { ring: 2, spoke: 4 }, { ring: 2, spoke: 8 }, { ring: 2, spoke: 12 },
  ],
  // Black pieces start on outer rings (will block connections)
  initialBlack: [
    { ring: 3, spoke: 1 }, { ring: 3, spoke: 3 }, { ring: 3, spoke: 5 }, { ring: 3, spoke: 7 },
    { ring: 3, spoke: 9 }, { ring: 3, spoke: 11 }, { ring: 3, spoke: 13 }, { ring: 3, spoke: 15 },
    { ring: 4, spoke: 0 }, { ring: 4, spoke: 4 }, { ring: 4, spoke: 8 }, { ring: 4, spoke: 12 },
  ],
};

import { CircularBoardConfig } from '@/types/game';

import { BoardConfig, BoardSize, GameVariant, BoardTheme, VariantRules } from '@/types/game';
import { VARIANT_SOURCES, VARIANT_ALTERNATES } from '@/constants/variantSources';

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
  kingArmed: true,
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
    description: 'Modern Celtic-inspired connection game',
    origin: 'Ballinderry, Ireland',
    theme: FIDCHELL_THEME,
    era: 'c. 600–1100 CE',
    history: 'Fidchell appears in medieval Irish storytelling, including The Wooing of Étaín. Its original rules have not survived. This circular connection game is a modern interpretation, distinct from the square, forty-nine-hole gaming board excavated at Ballinderry, Co. Westmeath.',
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
    history: 'Brandub is remembered as an Irish board game. Modern 7×7 tafl reconstructions use a king, four defenders and eight attackers. The carved Ballinderry board is evidence of early medieval gaming in Ireland, but the archaeological find does not preserve a complete ruleset.',
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
    history: 'Tablut is a Sámi game documented by Carl Linnaeus during his 1732 journey through Lapland. His notes are an important surviving account of tafl play. This table follows a modern reading of corrected translations, with an armed king and escape to any edge.',
    defaultRules: { ...STANDARD_RULES, edgeEscape: true },
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
    history: 'The National Library of Wales holds Robert ap Ifan’s manuscript with a diagram of tawlbwrdd and instructions in Welsh. This table is a modern 11×11 reconstruction; the surviving historical account does not settle every detail of play.',
    defaultRules: { ...STANDARD_RULES, kingArmed: true, edgeEscape: true },
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
    history: 'Hnefatafl belongs to the family of king-and-escort games associated with the medieval Norse world. Viking Age gaming boards and pieces survive, but individual finds do not establish one universal ruleset. This table uses the core of the modern Copenhagen reconstruction.',
    defaultRules: { ...STANDARD_RULES, shieldwallCapture: true },
    coordinates: { lat: 59.083, lng: 10.214 },
  },
  {
    id: 'alea',
    name: 'Alea Evangelii',
    boardSize: 19,
    boardType: 'square',
    description: 'Medieval Gospel diagram · 19×19',
    origin: 'Manuscript in Oxford',
    theme: ALEA_THEME,
    era: 'c. 1000–1150 CE',
    history: 'Alea Evangelii survives as a game diagram and explanatory text in Corpus Christi College, Oxford, MS 122: the twelfth-century Corpus Irish Gospels. The manuscript’s place of origin is uncertain. This 19×19 table is a modern playable interpretation, not a complete surviving historical ruleset.',
    defaultRules: { ...STANDARD_RULES, edgeEscape: true },
    coordinates: { lat: 51.752, lng: -1.257 },
  },
].map((v) => ({
  ...v,
  sources: VARIANT_SOURCES[v.id],
  alternateRules: VARIANT_ALTERNATES[v.id],
})) as GameVariant[];

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
// 8 levels: center (Navel) + 7 concentric rings. 16 spokes. 27 pawns per side.
// Both players start with all pawns in hand; board begins empty.
export const FIDCHELL_CONFIG: CircularBoardConfig = {
  rings: 8,
  spokes: 16,
  totalNodes: 1 + 7 * 16, // 113 intersections (center never occupied)
  piecesPerSide: 27,
  navelPosition: { ring: 0, spoke: 0 },
  initialWhite: [],
  initialBlack: [],
};

import { CircularBoardConfig } from '@/types/game';

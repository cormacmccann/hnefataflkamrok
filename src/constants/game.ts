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

// Celtic Fidchell theme - mystical purple and silver (circular board)
const FIDCHELL_THEME: BoardTheme = {
  boardBase: '#1A1428',
  boardFrame: '#0D0A14',
  squareLight: '#7B68B0',
  squareDark: '#4A3D6A',
  corner: '#C0C0C0',
  throne: '#6B4EAB',
  circularFrame: '#2A1F3D',
  accentRing: '#9F7AEA',
  runeColor: '#DDA0DD',
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
    description: 'Celtic "wood-wisdom" - Connection game',
    origin: 'Ireland/Wales',
    theme: FIDCHELL_THEME,
    era: '5th-12th Century',
    history: 'Fidchell ("wood-wisdom") was the most prestigious Celtic board game, played on a sacred circular "web" representing the cosmos. White pieces must create an unbroken connection from the central Navel Stone to the outer edge. Mentioned in the Mabinogion as Gwyddbwyll, it was invented by the god Lugh.',
    defaultRules: FIDCHELL_RULES,
    coordinates: { lat: 53.5, lng: -7.5 },
  },
  {
    id: 'brandub',
    name: 'Brandub',
    boardSize: 7,
    boardType: 'square',
    description: 'Quick Irish variant',
    origin: 'Ireland',
    theme: BRANDUB_THEME,
    era: '7th-12th Century',
    history: 'Brandub, meaning "black raven" in Old Irish, was played by Celtic nobility in medieval Ireland. Ancient texts describe High Kings playing this game in great halls, with the central piece representing the High King of Tara defending against provincial rivals.',
    defaultRules: { ...STANDARD_RULES, kingArmed: true },
    coordinates: { lat: 53.3, lng: -8.0 },
  },
  {
    id: 'tablut',
    name: 'Tablut',
    boardSize: 9,
    boardType: 'square',
    description: 'Classic Swedish game',
    origin: 'Sweden',
    theme: TABLUT_THEME,
    era: '8th-11th Century',
    history: 'Tablut was documented by Carl Linnaeus in 1732 while visiting Lapland, where the Sami people still played this ancient game. It represents a Swedish king defending against Muscovite attackers. This is the best-documented tafl variant.',
    defaultRules: STANDARD_RULES,
    coordinates: { lat: 68.4, lng: 18.5 },
  },
  {
    id: 'tawlbwrdd',
    name: 'Tawlbwrdd',
    boardSize: 11,
    boardType: 'square',
    description: 'Welsh "throw-board"',
    origin: 'Wales',
    theme: TAWLBWRDD_THEME,
    era: '10th-13th Century',
    history: 'Tawlbwrdd, the Welsh "throw-board," was described in medieval Welsh law texts. It was considered one of the 24 feats a gentleman must master. The game held such importance that special boards were treasured heirlooms passed down through noble families.',
    defaultRules: { ...STANDARD_RULES, kingArmed: true },
    coordinates: { lat: 52.1, lng: -3.8 },
  },
  {
    id: 'hnefatafl',
    name: 'Hnefatafl',
    boardSize: 11,
    boardType: 'square',
    description: 'Full Viking battle',
    origin: 'Scandinavia',
    theme: HNEFATAFL_THEME,
    era: '4th-12th Century',
    history: "Hnefatafl, the \"King's Table,\" was the premier strategy game of the Viking Age. Norsemen carried it across their vast trade routes from Byzantium to Newfoundland. Sagas tell of warriors wagering gold and honor on games played by firelight.",
    defaultRules: { ...STANDARD_RULES, shieldwallCapture: true },
    coordinates: { lat: 59.9, lng: 10.7 },
  },
  {
    id: 'alea',
    name: 'Alea Evangelii',
    boardSize: 19,
    boardType: 'square',
    description: 'Monastic grand variant',
    origin: 'England',
    theme: ALEA_THEME,
    era: '10th-11th Century',
    history: 'Alea Evangelii, the "Game of the Gospels," was recorded in a 12th-century manuscript from Canterbury. This massive 19×19 variant was played in monasteries, with piece positions tied to religious symbolism. It represents the grandest known tafl game.',
    defaultRules: { ...STANDARD_RULES, edgeEscape: true },
    coordinates: { lat: 51.3, lng: 1.1 },
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

import { BoardConfig, BoardSize, GameVariant, BoardTheme } from '@/types/game';

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

export const GAME_VARIANTS: GameVariant[] = [
  {
    id: 'brandub',
    name: 'Brandub',
    boardSize: 7,
    description: 'Quick Irish variant',
    origin: 'Ireland',
    theme: BRANDUB_THEME,
  },
  {
    id: 'tablut',
    name: 'Tablut',
    boardSize: 9,
    description: 'Classic Swedish game',
    origin: 'Sweden',
    theme: TABLUT_THEME,
  },
  {
    id: 'hnefatafl',
    name: 'Hnefatafl',
    boardSize: 11,
    description: 'Full Viking battle',
    origin: 'Scandinavia',
    theme: HNEFATAFL_THEME,
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
};

export const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ'];

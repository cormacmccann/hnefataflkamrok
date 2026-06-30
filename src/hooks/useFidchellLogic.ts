import { useCallback } from 'react';
import { Piece, FidchellPosition, Player } from '@/types/game';
import { FIDCHELL_CONFIG } from '@/constants/game';

/**
 * Fidchell — "Connection Tafl" (Gwth Bwch variant)
 *
 * Board: 1 Navel Stone (center, never occupied) + 7 concentric rings × 16 spokes.
 * Two phases:
 *  1. PLACEMENT — each player has 27 pawns in hand; on your turn place one on any
 *     empty intersection. Sandwich captures grant an extra turn.
 *  2. MOVEMENT — once your hand is empty, you slide pieces along a single line
 *     (ring or spoke) through empty intersections until blocked. The Navel Stone
 *     blocks all movement. In movement, the Navel also acts as half of a sandwich
 *     when capturing on ring 1.
 *
 * No captures may pass through the center. Capturing multiple in one move still
 * grants only ONE extra turn. Win: connect the center (via a ring-1 pawn) to the
 * outer rim (ring 7) through a continuous chain of your own adjacent pawns.
 */

type Color = 'white' | 'black';
const CENTER: FidchellPosition = { ring: 0, spoke: 0 };

function colorOf(p: Piece): Color {
  return p.type === 'defender' || p.type === 'king' ? 'white' : 'black';
}

function key(p: FidchellPosition): string {
  return `${p.ring}-${p.spoke}`;
}

function isCenter(p: FidchellPosition): boolean {
  return p.ring === 0;
}

// 4 cardinal step directions on the circular board:
// 'in' (toward center), 'out' (away from center), 'cw', 'ccw'.
type Dir = 'in' | 'out' | 'cw' | 'ccw';
const DIRS: Dir[] = ['in', 'out', 'cw', 'ccw'];

// Returns the next intersection from `pos` in direction `d`, or null if off-board.
// The center is treated as a single position; stepping inward from ring 1 lands
// on the center, but the center is never a placeable / movable square. Stepping
// outward "from" the center is undefined in this engine (we never start there).
function step(pos: FidchellPosition, d: Dir): FidchellPosition | null {
  if (isCenter(pos)) return null;
  const S = FIDCHELL_CONFIG.spokes;
  const R = FIDCHELL_CONFIG.rings;
  switch (d) {
    case 'in':
      return pos.ring === 1 ? CENTER : { ring: pos.ring - 1, spoke: pos.spoke };
    case 'out':
      return pos.ring < R - 1 ? { ring: pos.ring + 1, spoke: pos.spoke } : null;
    case 'cw':
      return { ring: pos.ring, spoke: (pos.spoke + 1) % S };
    case 'ccw':
      return { ring: pos.ring, spoke: (pos.spoke - 1 + S) % S };
  }
}

interface FidchellLogicReturn {
  getValidMoves: (piece: Piece, pieces: Piece[]) => FidchellPosition[];
  getAllEmptyNodes: (pieces: Piece[]) => FidchellPosition[];
  getCapturesFor: (
    pieces: Piece[],
    at: FidchellPosition,
    movingColor: Color,
    phase: 'placement' | 'movement'
  ) => Piece[];
  applyPlacement: (
    pieces: Piece[],
    color: Color,
    at: FidchellPosition,
    nextId: number
  ) => { newPieces: Piece[]; captured: Piece[]; placed: Piece };
  applyMove: (
    pieces: Piece[],
    piece: Piece,
    to: FidchellPosition
  ) => { newPieces: Piece[]; captured: Piece[] };
  checkConnection: (
    pieces: Piece[],
    color: Color
  ) => { connected: boolean; path: FidchellPosition[] };
}

export function useFidchellLogic(): FidchellLogicReturn {
  const pieceAt = useCallback(
    (pieces: Piece[], pos: FidchellPosition) =>
      pieces.find(
        p =>
          p.circularPosition?.ring === pos.ring &&
          p.circularPosition?.spoke === pos.spoke
      ),
    []
  );

  // Movement: slide along a single line (ring or spoke) through empty
  // intersections until blocked. Cannot move through or onto the center.
  const getValidMoves = useCallback(
    (piece: Piece, pieces: Piece[]): FidchellPosition[] => {
      if (!piece.circularPosition) return [];
      const start = piece.circularPosition;
      const moves: FidchellPosition[] = [];
      for (const d of DIRS) {
        let cur: FidchellPosition | null = step(start, d);
        while (cur && !isCenter(cur) && !pieceAt(pieces, cur)) {
          moves.push(cur);
          cur = step(cur, d);
        }
      }
      return moves;
    },
    [pieceAt]
  );

  const getAllEmptyNodes = useCallback((pieces: Piece[]): FidchellPosition[] => {
    const out: FidchellPosition[] = [];
    for (let r = 1; r < FIDCHELL_CONFIG.rings; r++) {
      for (let s = 0; s < FIDCHELL_CONFIG.spokes; s++) {
        const pos = { ring: r, spoke: s };
        if (!pieceAt(pieces, pos)) out.push(pos);
      }
    }
    return out;
  }, [pieceAt]);

  // Custodial sandwich capture, scanned from the just-placed/moved piece.
  // For each cardinal direction, if neighbor1 is enemy and neighbor2 is friendly
  // (or, in movement only, neighbor2 is the Navel Stone and neighbor1 is on
  // ring 1), neighbor1 is captured. Captures never pass through the center.
  const getCapturesFor = useCallback(
    (
      pieces: Piece[],
      at: FidchellPosition,
      movingColor: Color,
      phase: 'placement' | 'movement'
    ): Piece[] => {
      const captured: Piece[] = [];
      for (const d of DIRS) {
        const n1 = step(at, d);
        if (!n1 || isCenter(n1)) continue;
        const p1 = pieceAt(pieces, n1);
        if (!p1 || colorOf(p1) === movingColor) continue;

        const n2 = step(n1, d);
        if (!n2) continue;

        if (isCenter(n2)) {
          // Center as half-sandwich: movement phase only, and only when the
          // captured pawn sits on ring 1.
          if (phase === 'movement' && n1.ring === 1) {
            captured.push(p1);
          }
          continue;
        }

        const p2 = pieceAt(pieces, n2);
        if (p2 && colorOf(p2) === movingColor) {
          captured.push(p1);
        }
      }
      return captured;
    },
    [pieceAt]
  );

  const applyPlacement = useCallback(
    (pieces: Piece[], color: Color, at: FidchellPosition, nextId: number) => {
      const placed: Piece = {
        id: `${color === 'white' ? 'w' : 'b'}-${nextId}`,
        type: color === 'white' ? 'defender' : 'attacker',
        position: { row: at.ring, col: at.spoke },
        circularPosition: at,
      };
      const withPlaced = [...pieces, placed];
      const captured = getCapturesFor(withPlaced, at, color, 'placement');
      const newPieces = withPlaced.filter(p => !captured.some(c => c.id === p.id));
      return { newPieces, captured, placed };
    },
    [getCapturesFor]
  );

  const applyMove = useCallback(
    (pieces: Piece[], piece: Piece, to: FidchellPosition) => {
      const moved = pieces.map(p =>
        p.id === piece.id
          ? { ...p, circularPosition: to, position: { row: to.ring, col: to.spoke } }
          : p
      );
      const captured = getCapturesFor(moved, to, colorOf(piece), 'movement');
      const newPieces = moved.filter(p => !captured.some(c => c.id === p.id));
      return { newPieces, captured };
    },
    [getCapturesFor]
  );

  // Win check: from any of `color`'s pawns on ring 1 (touching the center),
  // BFS through same-color adjacency to reach the outer rim (ring R-1).
  const checkConnection = useCallback(
    (pieces: Piece[], color: Color) => {
      const own = pieces.filter(p => colorOf(p) === color && p.circularPosition);
      const ownSet = new Set(own.map(p => key(p.circularPosition!)));
      const seeds = own.filter(p => p.circularPosition!.ring === 1);
      if (seeds.length === 0) return { connected: false, path: [] };

      const visited = new Set<string>();
      const parent = new Map<string, FidchellPosition | null>();
      const queue: FidchellPosition[] = [];

      for (const s of seeds) {
        const k = key(s.circularPosition!);
        if (!visited.has(k)) {
          visited.add(k);
          parent.set(k, null);
          queue.push(s.circularPosition!);
        }
      }

      const R = FIDCHELL_CONFIG.rings;
      let end: FidchellPosition | null = null;
      while (queue.length) {
        const cur = queue.shift()!;
        if (cur.ring === R - 1) {
          end = cur;
          break;
        }
        for (const d of DIRS) {
          const nb = step(cur, d);
          if (!nb || isCenter(nb)) continue;
          const nk = key(nb);
          if (visited.has(nk) || !ownSet.has(nk)) continue;
          visited.add(nk);
          parent.set(nk, cur);
          queue.push(nb);
        }
      }

      if (!end) return { connected: false, path: [] };
      const path: FidchellPosition[] = [];
      let cur: FidchellPosition | null = end;
      while (cur) {
        path.unshift(cur);
        cur = parent.get(key(cur)) ?? null;
      }
      return { connected: true, path: [CENTER, ...path] };
    },
    []
  );

  return {
    getValidMoves,
    getAllEmptyNodes,
    getCapturesFor,
    applyPlacement,
    applyMove,
    checkConnection,
  };
}

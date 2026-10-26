import type { Position, Piece, PieceType, Player, Move, BoardSize, GameResult, VariantRules } from '@/types/game';
import { BOARD_CONFIGS, GAME_VARIANTS } from '@/constants/game';

const DIRECTIONS = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
export const ownerOf = (piece: Piece): Player => piece.type === 'attacker' ? 'attacker' : 'defender';
export const positionKey = (pieces: Piece[], turn: Player): string => `${turn}:${pieces.map(p => `${p.type}:${p.position.row},${p.position.col}`).sort().join(';')}`;

/** Brandubh's table convention penalises the mover closing the third repetition.
 * Historical/Copenhagen tables retain their published defender-loss convention.
 * Deciding who was forced into a cycle requires arbitration and is not inferred.
 */
export function getRepetitionResult(variantId: string | undefined, mover: Player, occurrences: number): GameResult {
  if (occurrences < 3) return null;
  if (variantId === 'brandub') return mover === 'attacker' ? 'defender-wins' : 'attacker-wins';
  return 'attacker-wins';
}

/** Pure rules shared by human moves, AI search and regression checks. */
export function createTaflLogic(boardSize: BoardSize, overrides?: VariantRules, variantId?: string) {
  const config = BOARD_CONFIGS[boardSize];
  const variant = GAME_VARIANTS.find(v => v.id === variantId) ?? GAME_VARIANTS.find(v => v.boardSize === boardSize && v.boardType === 'square' && v.id !== 'tawlbwrdd')!;
  const rules = { ...variant.defaultRules, ...overrides };
  const id = variantId ?? variant.id;
  const same = (a: Position, b: Position) => a.row === b.row && a.col === b.col;
  const isCorner = (pos: Position) => config.corners.some(c => same(c, pos));
  const isThrone = (pos: Position) => same(pos, config.throne);
  const isEdge = (pos: Position) => pos.row === 0 || pos.col === 0 || pos.row === boardSize - 1 || pos.col === boardSize - 1;
  const isEscape = (pos: Position) => rules.edgeEscape ? isEdge(pos) : isCorner(pos);
  const isRestrictedSquare = (pos: Position) => isThrone(pos) || (!rules.edgeEscape && isCorner(pos));
  const getPieceAt = (pieces: Piece[], pos: Position) => pieces.find(p => same(p.position, pos));
  const isValidPosition = (pos: Position) => Number.isInteger(pos.row) && Number.isInteger(pos.col) && pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize;

  const getValidMoves = (piece: Piece, pieces: Piece[]): Position[] => {
    if (!isValidPosition(piece.position)) return [];
    const occupied = new Set(pieces.map(p => `${p.position.row},${p.position.col}`));
    const moves: Position[] = [];
    for (const dir of DIRECTIONS) {
      let pos = { row: piece.position.row + dir.row, col: piece.position.col + dir.col };
      while (isValidPosition(pos) && !occupied.has(`${pos.row},${pos.col}`)) {
        if (piece.type === 'king' || !isRestrictedSquare(pos)) moves.push({ ...pos });
        // An empty throne can be crossed; its square may only be occupied by the king.
        pos = { row: pos.row + dir.row, col: pos.col + dir.col };
      }
    }
    return moves;
  };

  const isHostile = (pos: Position, pieces: Piece[], against: PieceType): boolean => {
    if (!isValidPosition(pos)) return false; // The board edge never substitutes for a captor.
    const piece = getPieceAt(pieces, pos);
    // Throne is hostile to attackers even when occupied by an unarmed king.
    if (isThrone(pos) && against === 'attacker') return true;
    if (piece) return against === 'attacker'
      ? piece.type === 'defender' || (piece.type === 'king' && rules.kingArmed)
      : piece.type === 'attacker';
    if (!rules.edgeEscape && isCorner(pos)) return true;
    if (isThrone(pos)) {
      // Modern Brandubh: throne protects the king from two-sided captures.
      if (against === 'king' && id === 'brandub') return false;
      return true;
    }
    return false;
  };

  const getCapturedPieces = (movedPiece: Piece, newPos: Position, pieces: Piece[]): Piece[] => {
    if (movedPiece.type === 'king' && !rules.kingArmed) return [];
    const updated = pieces.map(p => p.id === movedPiece.id ? { ...p, position: newPos } : p);
    const captured = new Map<string, Piece>();
    for (const dir of DIRECTIONS) {
      const adjacentPos = { row: newPos.row + dir.row, col: newPos.col + dir.col };
      const adjacent = getPieceAt(updated, adjacentPos);
      if (!adjacent || ownerOf(adjacent) === ownerOf(movedPiece)) continue;
      const beyondPos = { row: newPos.row + dir.row * 2, col: newPos.col + dir.col * 2 };
      if (adjacent.type !== 'king') {
        if (isHostile(beyondPos, updated, adjacent.type)) captured.set(adjacent.id, adjacent);
        continue;
      }
      const nearThrone = Math.abs(adjacentPos.row - config.throne.row) + Math.abs(adjacentPos.col - config.throne.col) === 1;
      const strongKing = id === 'hnefatafl' || isThrone(adjacentPos) || (nearThrone && id !== 'brandub');
      const taken = strongKing
        ? DIRECTIONS.every(d => {
            const p = { row: adjacentPos.row + d.row, col: adjacentPos.col + d.col };
            return isValidPosition(p) && (isThrone(p) || getPieceAt(updated, p)?.type === 'attacker');
          })
        : isHostile(beyondPos, updated, 'king');
      if (taken) captured.set(adjacent.id, adjacent);
    }

    if (rules.shieldwallCapture) {
      const last = boardSize - 1;
      const edges = [
        { at: (i: number) => ({ row: 0, col: i }), inward: (i: number) => ({ row: 1, col: i }) },
        { at: (i: number) => ({ row: last, col: i }), inward: (i: number) => ({ row: last - 1, col: i }) },
        { at: (i: number) => ({ row: i, col: 0 }), inward: (i: number) => ({ row: i, col: 1 }) },
        { at: (i: number) => ({ row: i, col: last }), inward: (i: number) => ({ row: i, col: last - 1 }) },
      ];
      for (const edge of edges) {
        for (let start = 1; start < last; start++) {
          const first = getPieceAt(updated, edge.at(start));
          if (!first || ownerOf(first) === ownerOf(movedPiece)) continue;
          let end = start;
          while (end < last) {
            const p = getPieceAt(updated, edge.at(end));
            if (!p || ownerOf(p) === ownerOf(movedPiece)) break;
            end++;
          }
          if (end - start >= 2) {
            const type = first.type === 'king' ? 'defender' : first.type;
            const brackets = [edge.at(start - 1), edge.at(end)];
            const front = Array.from({ length: end - start }, (_, i) => edge.inward(start + i));
            // Only the move closing a bracket triggers a shieldwall, never an unrelated move.
            if (brackets.some(p => same(p, newPos)) && brackets.every(p => isHostile(p, updated, type)) && front.every(p => {
              const captor = getPieceAt(updated, p);
              return captor && ownerOf(captor) === ownerOf(movedPiece) && (captor.type !== 'king' || rules.kingArmed);
            })) {
              for (let i = start; i < end; i++) {
                const victim = getPieceAt(updated, edge.at(i))!;
                if (victim.type !== 'king') captured.set(victim.id, victim);
              }
            }
          }
          start = end;
        }
      }
    }
    return [...captured.values()];
  };

  const isEncircled = (pieces: Piece[]): boolean => {
    const blocked = new Set(pieces.filter(p => p.type === 'attacker').map(p => `${p.position.row},${p.position.col}`));
    const reached = new Set<string>();
    const queue: Position[] = [];
    const visit = (p: Position) => {
      const key = `${p.row},${p.col}`;
      if (isValidPosition(p) && !blocked.has(key) && !reached.has(key)) { reached.add(key); queue.push(p); }
    };
    for (let i = 0; i < boardSize; i++) {
      visit({ row: 0, col: i }); visit({ row: boardSize - 1, col: i });
      visit({ row: i, col: 0 }); visit({ row: i, col: boardSize - 1 });
    }
    for (let i = 0; i < queue.length; i++) {
      for (const d of DIRECTIONS) visit({ row: queue[i].row + d.row, col: queue[i].col + d.col });
    }
    return pieces.filter(p => p.type !== 'attacker').every(p => !reached.has(`${p.position.row},${p.position.col}`));
  };

  const checkGameResult = (pieces: Piece[], _lastMove: Move | null = null, sideToMove?: Player): GameResult => {
    const king = pieces.find(p => p.type === 'king');
    if (!king) return 'attacker-wins';
    if (isEscape(king.position)) return 'defender-wins';
    if (!pieces.some(p => p.type === 'attacker')) return 'defender-wins';
    if (sideToMove && !pieces.some(p => ownerOf(p) === sideToMove && getValidMoves(p, pieces).length > 0)) return sideToMove === 'attacker' ? 'defender-wins' : 'attacker-wins';
    if (isEncircled(pieces)) return 'attacker-wins';
    return null;
  };
  const posToNotation = (pos: Position) => `${String.fromCharCode(97 + pos.col)}${boardSize - pos.row}`;
  const createMoveNotation = (piece: Piece, from: Position, to: Position, captured: Piece[]) => `${piece.type === 'king' ? 'K' : piece.type === 'attacker' ? 'A' : 'D'}${posToNotation(from)}–${posToNotation(to)}${captured.length ? ` ×${captured.length}` : ''}`;
  return { isCorner, isThrone, isEdge, isEscape, isRestrictedSquare, isValidPosition, getPieceAt, getValidMoves, getCapturedPieces, checkGameResult, createMoveNotation, config, rules, variantId: id };
}

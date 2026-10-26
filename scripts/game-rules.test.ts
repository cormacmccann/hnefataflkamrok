import assert from 'node:assert/strict';
import { createTaflLogic, getRepetitionResult } from '../src/lib/taflEngine';
import { createTaflAI } from '../src/lib/taflAI';
import { BOARD_CONFIGS, GAME_VARIANTS } from '../src/constants/game';
import type { Piece, PieceType } from '../src/types/game';
import { initialUrState, legalMoves as urMoves, applyMove as urApply, WHITE_PATH, BLACK_PATH, SQUARE_COORDS, ROSETTES, ROSETTE_SQUARES } from '../src/lib/ancient/royalUr';
import { initialRaceState, legalRaceMoves, applyRaceMove } from '../src/lib/ancient/raceEngine';
import { SENET_CONFIG } from '../src/lib/ancient/senet';
import { initialBaoState, legalMoves as baoMoves, applyMove as baoApply } from '../src/lib/ancient/baoEngine';
import { initialMehenState, legalMehenMoves, applyMehenMove } from '../src/lib/ancient/mehenEngine';
import { LIUBO_CONFIG } from '../src/lib/ancient/liubo';
import { initialPettState, applyPettMove } from '../src/lib/ancient/petteia';
import { initialLatState, applyLatMove } from '../src/lib/ancient/latrunculorum';
let passed = 0;
function test(name: string, run: () => void) { run(); passed++; console.log(`✓ ${name}`); }
const p = (id: string, type: PieceType, row: number, col: number): Piece => ({ id, type, position: { row, col } });
const a = (id: string, row: number, col: number) => p(id, 'attacker', row, col);
const d = (id: string, row: number, col: number) => p(id, 'defender', row, col);
const k = (row: number, col: number) => p('king', 'king', row, col);
const has = (moves: Array<{row: number; col: number}>, row: number, col: number) => moves.some(m => m.row === row && m.col === col);
const brandub = createTaflLogic(7, undefined, 'brandub');
const tablut = createTaflLogic(9, undefined, 'tablut');
const hnefatafl = createTaflLogic(11, undefined, 'hnefatafl');

test('All five square variants start with unique, in-bounds pieces and no premature result', () => {
  for (const variant of GAME_VARIANTS.filter(v => v.boardType === 'square')) {
    const cfg = BOARD_CONFIGS[variant.boardSize];
    const pieces = [...cfg.initialAttackers.map((pos, i) => a(`a${i}`, pos.row, pos.col)), ...cfg.initialDefenders.map((pos, i) => d(`d${i}`, pos.row, pos.col)), k(cfg.throne.row, cfg.throne.col)];
    assert.equal(new Set(pieces.map(x => `${x.position.row},${x.position.col}`)).size, pieces.length);
    const logic = createTaflLogic(variant.boardSize, variant.defaultRules, variant.id);
    assert(pieces.every(x => logic.isValidPosition(x.position)));
    assert.equal(logic.checkGameResult(pieces, null, 'attacker'), null);
  }
});
test('Rooks cannot move diagonally, jump a blocker, or stop on the throne', () => {
  const soldier = a('a', 3, 1);
  const moves = brandub.getValidMoves(soldier, [soldier, d('d', 1, 1)]);
  assert(!has(moves, 2, 2)); assert(!has(moves, 0, 1)); assert(!has(moves, 3, 3));
  assert(has(moves, 3, 5), 'empty throne may be crossed');
});
test('Brandubh corners are restricted; Tablut corners are ordinary and every edge is an escape', () => {
  const soldier = a('a', 0, 3);
  assert(!has(brandub.getValidMoves(soldier, [soldier]), 0, 0));
  assert(has(tablut.getValidMoves(soldier, [soldier]), 0, 0));
  assert.equal(tablut.checkGameResult([k(0, 4), a('a', 7, 7)]), 'defender-wins');
  assert.equal(brandub.checkGameResult([k(0, 3), a('a', 5, 5)]), null);
});
test('A move captures in multiple directions, with no diagonal capture', () => {
  const mover = a('a', 2, 6);
  const pieces = [mover, d('left', 2, 1), a('left-end', 2, 0), d('up', 1, 2), a('up-end', 0, 2), d('diagonal', 1, 1)];
  assert.deepEqual(brandub.getCapturedPieces(mover, { row: 2, col: 2 }, pieces).map(x => x.id).sort(), ['left', 'up']);
});
test('Moving voluntarily between enemies is safe', () => {
  const mover = d('d', 1, 2);
  const pieces = [mover, a('left', 2, 1), a('right', 2, 3)];
  assert.deepEqual(brandub.getCapturedPieces(mover, { row: 2, col: 2 }, pieces), []);
});
test('Armed king joins captures; an unarmed king neither initiates nor supports a capture', () => {
  const king = k(1, 3);
  const pieces = [king, a('victim', 1, 1), d('friend', 1, 0)];
  assert.equal(brandub.getCapturedPieces(king, { row: 1, col: 2 }, pieces).length, 1);
  const unarmed = createTaflLogic(7, { ...brandub.rules, kingArmed: false }, 'brandub');
  assert.equal(unarmed.getCapturedPieces(king, { row: 1, col: 2 }, pieces).length, 0);
  const mover = d('mover', 2, 0);
  assert.equal(unarmed.getCapturedPieces(mover, { row: 1, col: 0 }, [mover, a('victim', 1, 1), k(1, 2)]).length, 0);
});
test('Tablut king capture requires two sides in the field, three beside throne, four on throne', () => {
  const field = a('mover', 1, 5);
  assert(tablut.getCapturedPieces(field, { row: 1, col: 4 }, [field, k(1, 3), a('end', 1, 2)]).some(x => x.type === 'king'));
  const mover = a('mover', 2, 3);
  const base = [mover, k(3, 4), a('right', 3, 5)];
  assert(!tablut.getCapturedPieces(mover, { row: 3, col: 3 }, base).some(x => x.type === 'king'));
  assert(tablut.getCapturedPieces(mover, { row: 3, col: 3 }, [...base, a('top', 2, 4)]).some(x => x.type === 'king'));
  const throne = [a('mover', 1, 4), k(4, 4), a('left', 4, 3), a('right', 4, 5), a('bottom', 5, 4)];
  assert(tablut.getCapturedPieces(throne[0], { row: 3, col: 4 }, throne).some(x => x.type === 'king'));
});
test('Brandubh king is protected by throne only while standing on it', () => {
  const mover = a('mover', 2, 1);
  assert(brandub.getCapturedPieces(mover, { row: 2, col: 2 }, [mover, k(2, 3), a('end', 2, 4)]).some(x => x.type === 'king'));
  assert(!brandub.getCapturedPieces(mover, { row: 2, col: 2 }, [mover, k(3, 2)]).some(x => x.type === 'king'), 'empty throne does not sandwich Brandubh king');
});
test('Copenhagen king cannot be captured against a board edge or by two field attackers', () => {
  const mover = a('mover', 2, 4);
  assert(!hnefatafl.getCapturedPieces(mover, { row: 1, col: 4 }, [mover, k(0, 4), a('l', 0, 3), a('r', 0, 5)]).some(x => x.type === 'king'));
  assert(!hnefatafl.getCapturedPieces(mover, { row: 2, col: 3 }, [mover, k(2, 2), a('end', 2, 1)]).some(x => x.type === 'king'));
});
test('Shieldwall requires two or more enemy soldiers, both brackets and a complete front', () => {
  const mover = a('mover', 2, 4);
  const wall = [mover, a('left', 0, 1), d('v1', 0, 2), d('v2', 0, 3), a('f1', 1, 2), a('f2', 1, 3)];
  assert.deepEqual(hnefatafl.getCapturedPieces(mover, { row: 0, col: 4 }, wall).map(x => x.id).sort(), ['v1', 'v2']);
  assert.equal(hnefatafl.getCapturedPieces(mover, { row: 0, col: 4 }, wall.filter(x => x.id !== 'f2')).length, 0);
  assert.equal(hnefatafl.getCapturedPieces(mover, { row: 0, col: 4 }, wall.filter(x => x.id !== 'left')).length, 0);
});
test('Shieldwalls remove soldiers but never the king', () => {
  const mover = a('mover', 2, 5);
  const wall = [mover, a('left', 0, 1), d('v1', 0, 2), k(0, 3), d('v2', 0, 4), a('f1', 1, 2), a('f2', 1, 3), a('f3', 1, 4)];
  assert.deepEqual(hnefatafl.getCapturedPieces(mover, { row: 0, col: 5 }, wall).map(x => x.id).sort(), ['v1', 'v2']);
});
test('Encirclement ends the game only when all defenders are cut off from every edge', () => {
  const ring = [a('a1', 2, 3), a('a2', 3, 2), a('a3', 3, 4), a('a4', 4, 3)];
  assert.equal(brandub.checkGameResult([...ring, k(3, 3)]), 'attacker-wins');
  assert.equal(brandub.checkGameResult([...ring, k(3, 3), d('outside', 5, 5)]), null);
});
test('AI recognises immediate winning escapes and king captures on every difficulty', () => {
  for (const difficulty of ['beginner', 'easy', 'medium', 'valhalla'] as const) {
    const pieces = [k(1, 1), a('a', 7, 7)];
    const escape = createTaflAI(9, difficulty, tablut.rules, 'tablut').getBestMove(pieces, 'defender')!;
    assert(tablut.isEscape(escape.to));
    const capturePieces = [k(1, 3), a('end', 1, 2), a('mover', 3, 4)];
    const attack = createTaflAI(9, difficulty, tablut.rules, 'tablut').getBestMove(capturePieces, 'attacker')!;
    assert(tablut.getCapturedPieces(attack.piece, attack.to, capturePieces).some(x => x.type === 'king'));
  }
});
test('Ur route is physically continuous and every rosette marker matches its engine path index', () => {
  for (const path of [WHITE_PATH, BLACK_PATH]) {
    path.forEach((square, i) => {
      assert.equal(ROSETTE_SQUARES.has(square), ROSETTES.has(i));
      if (i) { const before = SQUARE_COORDS[path[i - 1]]; const now = SQUARE_COORDS[square]; assert.equal(Math.abs(before.row - now.row) + Math.abs(before.col - now.col), 1); }
    });
  }
});
test('Ur central rosette is safe and landing on a free rosette grants another turn', () => {
  const state = initialUrState(); state.white[0] = 6; state.black[0] = 7; state.rolled = true; state.dice = 1;
  assert(!urMoves(state, 1).some(m => m.tokenIndex === 0));
  state.black[0] = -1;
  const next = urApply(state, urMoves(state, 1).find(m => m.tokenIndex === 0)!);
  assert.equal(next.white[0], 7); assert.equal(next.turn, 'white'); assert.equal(next.rolled, false);
});
test('Ur exact bearing-off works and forged/unrolled moves are rejected', () => {
  const state = initialUrState(); state.white[0] = 13; state.rolled = true; state.dice = 1;
  const move = urMoves(state, 1).find(m => m.tokenIndex === 0)!;
  assert.equal(move.toPathIdx, 14); assert.equal(urApply(state, move).white[0], 14);
  assert(!urMoves(state, 2).some(m => m.tokenIndex === 0));
  assert.equal(urApply({ ...state, rolled: false }, move).white[0], 13);
  assert.equal(urApply(state, { ...move, toPathIdx: 12 }).white[0], 13);
});
test('Generic race games allow overshoot only when configured and reject stale moves', () => {
  const state = initialRaceState(LIUBO_CONFIG); state.white[0] = LIUBO_CONFIG.pathLength - 1; state.dice = 4; state.rolled = true;
  const move = legalRaceMoves(state, 4).find(m => m.tokenIndex === 0)!;
  assert.equal(move.to, LIUBO_CONFIG.pathLength);
  assert.equal(applyRaceMove(state, move).white[0], LIUBO_CONFIG.pathLength);
  assert(!legalRaceMoves({ ...state, cfg: { ...state.cfg, exactBearOff: true } }, 4).some(m => m.tokenIndex === 0));
  assert.equal(applyRaceMove(state, { ...move, from: 0 }).white[0], LIUBO_CONFIG.pathLength - 1);
});
test('Petteia and Latrunculorum reject out-of-turn and impossible moves', () => {
  const pett = initialPettState(); const black = pett.pieces.find(x => x.owner === 'black')!;
  assert.equal(applyPettMove(pett, black.id, { row: 1, col: 0 }), pett);
  assert.equal(applyPettMove(pett, 0, { row: 6, col: 1 }), pett);
  const lat = initialLatState(); const enemy = lat.pieces.find(x => x.owner === 'black')!;
  assert.equal(applyLatMove(lat, enemy.id, { row: 2, col: 0 }), lat);
});
test('A side with no legal move loses instead of leaving the AI waiting forever', () => {
  const trapped = [a('a', 0, 3), d('left', 0, 2), d('right', 0, 4), d('below', 1, 3), k(3, 3)];
  assert.equal(brandub.checkGameResult(trapped, null, 'attacker'), 'defender-wins');
});
test('Senet rolls 1, 4 and 5 award another turn while roll 2 passes the turn', () => {
  for (const roll of [1, 2, 4, 5]) {
    const state = initialRaceState(SENET_CONFIG); state.white = [10, -1, -1, -1, -1]; state.black = [-1, -1, -1, -1, -1]; state.rolled = true; state.dice = roll;
    const move = legalRaceMoves(state, roll).find(m => m.tokenIndex === 0)!;
    assert.equal(applyRaceMove(state, move).turn, roll === 2 ? 'black' : 'white');
  }
});
test('Bao rejects illegal choices and conserves all 64 seeds through a multi-turn game', () => {
  let state = initialBaoState();
  assert.equal(baoApply(state, { startRing: 99, direction: 'fwd' }).state, state);
  for (let turn = 0; turn < 80 && state.winner === null; turn++) {
    const moves = baoMoves(state);
    if (!moves.length) break;
    const next = baoApply(state, moves[turn % moves.length]).state;
    assert.notEqual(next, state, 'a generated legal move must advance the game');
    assert(next.pits.flat().every(n => Number.isInteger(n) && n >= 0));
    assert.equal(next.pits.flat().reduce((a, b) => a + b, 0) + next.storage[0] + next.storage[1], 64);
    state = next;
  }
});
test('Mehen rejects unrolled and forged capture actions, and accepts a legal reserve entry', () => {
  const state = initialMehenState([{ isAI: false }, { isAI: true }]);
  const move = legalMehenMoves(state, 1)[0];
  assert.equal(applyMehenMove(state, move), state);
  const rolled = { ...state, rolled: true, dice: 1 };
  assert.equal(applyMehenMove(rolled, { ...move, captureId: 'missing' }), rolled);
  const next = applyMehenMove(rolled, move);
  assert.equal(next.pieces.find(p => p.id === move.pieceId)?.status, 'in');
  assert.equal(next.turn, 1);
});
test('Brandubh third repetition penalises either side that closes the repeated position', () => {
  assert.equal(getRepetitionResult('brandub', 'attacker', 3), 'defender-wins');
  assert.equal(getRepetitionResult('brandub', 'defender', 3), 'attacker-wins');
});
test('A first or second occurrence never decides a game by repetition', () => {
  for (const variantId of ['brandub', 'tablut', 'tawlbwrdd', 'hnefatafl', 'alea']) {
    for (const mover of ['attacker', 'defender'] as const) {
      assert.equal(getRepetitionResult(variantId, mover, 1), null);
      assert.equal(getRepetitionResult(variantId, mover, 2), null);
    }
  }
});
test('Historical and Copenhagen tables keep the defender-loss repetition convention', () => {
  for (const variantId of ['tablut', 'tawlbwrdd', 'hnefatafl', 'alea']) {
    assert.equal(getRepetitionResult(variantId, 'attacker', 3), 'attacker-wins');
    assert.equal(getRepetitionResult(variantId, 'defender', 3), 'attacker-wins');
  }
});
console.log(`\n${passed} rule regression checks passed.`);

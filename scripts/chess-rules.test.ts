import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { ChessSession, chooseChessAIMove, CHESS_PROMOTIONS } from '../src/lib/chessEngine';
import type { ChessSquare, PromotionPiece } from '../src/types/chess';
let passed = 0;
function test(name: string, run: () => void) { run(); passed++; console.log(`✓ Chess: ${name}`); }
function play(session: ChessSession, from: ChessSquare, to: ChessSquare, promotion?: PromotionPiece) { assert.equal(session.move(from, to, promotion), 'moved', `${from}→${to}`); }

test('initial legal selection rejects wrong-colour pieces and illegal pawn moves', () => {
  const session = new ChessSession();
  assert.equal(session.snapshot().board.length, 32);
  session.selectSquare('e7'); assert.equal(session.snapshot().selectedSquare, null);
  session.selectSquare('e2'); assert.deepEqual(session.snapshot().legalMoves.sort(), ['e3', 'e4']);
  const before = session.snapshot().fen;
  assert.equal(session.move('e2', 'e5'), 'invalid'); assert.equal(session.snapshot().fen, before);
  play(session, 'e2', 'e4'); assert.equal(session.snapshot().turn, 'b'); assert.deepEqual(session.snapshot().history, ['e4']);
});
test('both castling sides move the king and its rook in one legal move', () => {
  for (const [to, rookSquare] of [['g1', 'f1'], ['c1', 'd1']] as const) {
    const session = new ChessSession('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    play(session, 'e1', to);
    assert.equal(session.snapshot().board.find(p => p.square === to)?.type, 'k');
    assert.equal(session.snapshot().board.find(p => p.square === rookSquare)?.type, 'r');
    assert.equal(session.snapshot().history[0], to === 'g1' ? 'O-O' : 'O-O-O');
  }
});
test('castling through check or out of check is rejected', () => {
  const through = new ChessSession('4kr2/8/8/8/8/8/8/4K2R w K - 0 1');
  assert.equal(through.snapshot().check, false); assert.equal(through.move('e1', 'g1'), 'invalid');
  const out = new ChessSession('k3r3/8/8/8/8/8/8/4K2R w K - 0 1');
  assert.equal(out.snapshot().check, true); assert.equal(out.move('e1', 'g1'), 'invalid');
});
test('a rook returning home never restores castling rights', () => {
  const session = new ChessSession('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  play(session, 'h1', 'h2'); play(session, 'h8', 'h7'); play(session, 'h2', 'h1'); play(session, 'h7', 'h8');
  assert.equal(session.move('e1', 'g1'), 'invalid');
});
test('en passant removes the bypassed pawn, and undo restores both pawns and eligibility', () => {
  const session = new ChessSession();
  play(session, 'e2', 'e4'); play(session, 'a7', 'a6'); play(session, 'e4', 'e5'); play(session, 'd7', 'd5');
  const before = session.snapshot().fen;
  play(session, 'e5', 'd6');
  assert(!session.snapshot().board.some(p => p.square === 'd5'));
  assert.equal(session.snapshot().board.find(p => p.square === 'd6')?.color, 'w');
  session.undo(); assert.equal(session.snapshot().fen, before); play(session, 'e5', 'd6');
});
test('en passant expires after one reply and cannot expose its own king', () => {
  const session = new ChessSession();
  play(session, 'e2', 'e4'); play(session, 'a7', 'a6'); play(session, 'e4', 'e5'); play(session, 'd7', 'd5');
  play(session, 'g1', 'f3'); play(session, 'a6', 'a5'); assert.equal(session.move('e5', 'd6'), 'invalid');
  const exposed = new ChessSession('k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
  assert.equal(exposed.move('e5', 'd6'), 'invalid');
});
test('every promotion is explicit and the pawn remains unmoved until a choice is made', () => {
  for (const promotion of CHESS_PROMOTIONS) {
    const session = new ChessSession('7k/P7/8/8/8/8/8/4K3 w - - 0 1');
    session.selectSquare('a7'); session.selectSquare('a8');
    assert.deepEqual(session.snapshot().promotion, { from: 'a7', to: 'a8', color: 'w' });
    assert.equal(session.snapshot().board.find(p => p.square === 'a7')?.type, 'p');
    assert.equal(session.snapshot().turn, 'w');
    assert.equal(session.choosePromotion(promotion), true);
    assert.equal(session.snapshot().board.find(p => p.square === 'a8')?.type, promotion);
    assert.equal(session.snapshot().turn, 'b'); assert.equal(session.snapshot().promotion, null);
  }
});
test('promotion can be cancelled, rejects a king choice, and permits capture underpromotion', () => {
  const session = new ChessSession('1r5k/P7/8/8/8/8/8/4K3 w - - 0 1');
  const before = session.snapshot().fen;
  assert.equal(session.move('a7', 'b8'), 'promotion');
  assert.equal(session.choosePromotion('k' as PromotionPiece), false);
  session.cancelPromotion(); assert.equal(session.snapshot().fen, before); assert.equal(session.snapshot().promotion, null);
  assert.equal(session.move('a7', 'b8'), 'promotion'); assert.equal(session.choosePromotion('n'), true);
  assert.equal(session.snapshot().board.find(p => p.square === 'b8')?.type, 'n');
  assert(!session.snapshot().board.some(p => p.square === 'b8' && p.color === 'b'));
});
test('pinned pieces cannot move off the pin and leave their king in check', () => {
  const session = new ChessSession('k3r3/8/8/8/8/8/4R3/4K3 w - - 0 1');
  session.selectSquare('e2'); assert(!session.snapshot().legalMoves.includes('f2'));
  assert.equal(session.move('e2', 'f2'), 'invalid');
});
test('checkmate identifies the winner, prevents further moves, and exports the correct result', () => {
  const session = new ChessSession();
  play(session, 'f2', 'f3'); play(session, 'e7', 'e5'); play(session, 'g2', 'g4'); play(session, 'd8', 'h4');
  const state = session.snapshot();
  assert.equal(state.status, 'checkmate'); assert.equal(state.winner, 'b'); assert.equal(state.check, true);
  assert.equal(session.move('e2', 'e4'), 'invalid');
  const pgn = session.exportPGN(); assert(pgn.includes('[Result "0-1"]')); assert(pgn.includes('Qh4#'));
  const restored = new Chess(); restored.loadPgn(pgn); assert.equal(restored.fen(), state.fen);
  session.undo(); assert.equal(session.snapshot().status, 'playing');
});
test('stalemate is a draw without a winner or a checked king', () => {
  const session = new ChessSession('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  const state = session.snapshot(); assert.equal(state.status, 'stalemate'); assert.equal(state.winner, null); assert.equal(state.check, false);
  assert(session.exportPGN().includes('[Result "1/2-1/2"]'));
});
test('insufficient material and the fifty-move rule report distinct draw reasons', () => {
  assert.equal(new ChessSession('7k/8/8/8/8/8/8/K7 w - - 0 1').snapshot().drawReason, 'insufficient-material');
  const fifty = new ChessSession('7k/8/8/8/8/8/8/KR6 w - - 100 51').snapshot();
  assert.equal(fifty.status, 'draw'); assert.equal(fifty.drawReason, 'fifty-move');
});
test('threefold repetition retains full history across snapshots and is undone correctly', () => {
  const session = new ChessSession();
  for (let cycle = 0; cycle < 2; cycle++) {
    play(session, 'g1', 'f3'); play(session, 'g8', 'f6'); play(session, 'f3', 'g1'); play(session, 'f6', 'g8');
    session.snapshot(); session.snapshot(); // Reading either renderer does not recreate the rules engine.
  }
  assert.equal(session.snapshot().status, 'draw'); assert.equal(session.snapshot().drawReason, 'threefold-repetition');
  session.undo(); assert.equal(session.snapshot().status, 'playing');
});
test('reset clears the game and promotion, while undoing two plies restores a whole turn', () => {
  const session = new ChessSession(); const initial = session.snapshot().fen;
  play(session, 'e2', 'e4'); play(session, 'e7', 'e5'); session.undo(2);
  assert.equal(session.snapshot().fen, initial); assert.equal(session.snapshot().history.length, 0);
  play(session, 'd2', 'd4'); session.newGame(); assert.equal(session.snapshot().fen, initial);
  const promotion = new ChessSession('7k/P7/8/8/8/8/8/4K3 w - - 0 1');
  promotion.move('a7', 'a8'); promotion.newGame(); assert.equal(promotion.snapshot().promotion, null);
});
test('every computer level returns legal moves without mutating the live game', () => {
  const game = new Chess(); const before = game.fen(); const beforePgn = game.pgn();
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const move = chooseChessAIMove(game, difficulty)!;
    assert(move); assert(game.moves({ verbose: true }).some(m => m.from === move.from && m.to === move.to && m.promotion === move.promotion));
    assert.equal(game.fen(), before); assert.equal(game.pgn(), beforePgn);
  }
});
test('every computer level finds mate in one and returns no move in a finished game', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    const game = new Chess('7k/8/5KQ1/8/8/8/8/8 w - - 0 1');
    const move = chooseChessAIMove(game, difficulty)!; assert(move); game.move(move); assert(game.isCheckmate());
    assert.equal(chooseChessAIMove(game, difficulty), null);
  }
});
console.log(`\n${passed} chess regression checks passed.`);

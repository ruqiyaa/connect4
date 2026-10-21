const test = require('node:test');
const assert = require('node:assert');
const { createBoard, dropPiece, checkWinner, isDraw } = require('./game');

test('new board is 6 rows by 7 columns, all empty', () => {
  const board = createBoard();
  assert.strictEqual(board.length, 6);
  assert.strictEqual(board[0].length, 7);
  assert.ok(board.every((row) => row.every((cell) => cell === null)));
});

test('rows are separate (changing one does not change another)', () => {
  const board = createBoard();
  board[0][0] = 'R';
  assert.strictEqual(board[1][0], null);
});

test('a piece falls to the bottom row', () => {
  const board = createBoard();
  assert.strictEqual(dropPiece(board, 3, 'R'), 5);
  assert.strictEqual(board[5][3], 'R');
});

test('pieces stack on top of each other', () => {
  const board = createBoard();
  dropPiece(board, 3, 'R');
  assert.strictEqual(dropPiece(board, 3, 'Y'), 4);
});

test('a full column returns -1', () => {
  const board = createBoard();
  for (let i = 0; i < 6; i++) dropPiece(board, 0, 'R');
  assert.strictEqual(dropPiece(board, 0, 'Y'), -1);
});

test('an invalid column returns -1', () => {
  const board = createBoard();
  assert.strictEqual(dropPiece(board, -1, 'R'), -1);
  assert.strictEqual(dropPiece(board, 7, 'R'), -1);
});

test('detects a horizontal win', () => {
  const board = createBoard();
  for (let c = 0; c < 4; c++) dropPiece(board, c, 'R');
  assert.strictEqual(checkWinner(board, 5, 3), true);
});

test('three in a row is not a win', () => {
  const board = createBoard();
  for (let c = 0; c < 3; c++) dropPiece(board, c, 'R');
  assert.strictEqual(checkWinner(board, 5, 2), false);
});

test('detects a vertical win', () => {
  const board = createBoard();
  let row;
  for (let i = 0; i < 4; i++) row = dropPiece(board, 0, 'R');
  assert.strictEqual(checkWinner(board, row, 0), true);
});

test('detects a diagonal win (down-right)', () => {
  const board = createBoard();
  board[2][0] = board[3][1] = board[4][2] = board[5][3] = 'R';
  assert.strictEqual(checkWinner(board, 5, 3), true);
});

test('detects a diagonal win (down-left)', () => {
  const board = createBoard();
  board[2][3] = board[3][2] = board[4][1] = board[5][0] = 'R';
  assert.strictEqual(checkWinner(board, 2, 3), true);
});

test('mixed colors do not win', () => {
  const board = createBoard();
  dropPiece(board, 0, 'R');
  dropPiece(board, 1, 'R');
  dropPiece(board, 2, 'R');
  dropPiece(board, 3, 'Y');
  assert.strictEqual(checkWinner(board, 5, 3), false);
});

test('a win near the board edge does not crash', () => {
  const board = createBoard();
  dropPiece(board, 6, 'R');
  assert.strictEqual(checkWinner(board, 5, 6), false);
});

test('isDraw is false on a new board and true on a full one', () => {
  const board = createBoard();
  assert.strictEqual(isDraw(board), false);
  board.forEach((row) => row.fill('R'));
  assert.strictEqual(isDraw(board), true);
});
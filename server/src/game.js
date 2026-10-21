const ROWS = 6;
const COLS = 7;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

//dropping a piece
function dropPiece(board, col, player) {
    if(!Number.isInteger(col) || col < 0 || col >= COLS) return -1;

    for(let row = ROWS - 1; row>=0; row--){
        if(board[row][col] === null) {
            board[row][col] = player;
            return row;
        }
    }
    return -1;
}

//count in one direction
function countInDirection (board, row, col, dRow, dCol, player) {
    let count = 0;
    let r = row + dRow;
    let c = col + dCol;

    while(r >= 0 && r < ROWS && c>=0 && c < COLS && board[r][c] === player) {
        count++;
        r += dRow;
        c += dCol;
    }
    return count;
}

//checking for win
function checkWinner(board, row, col){
    const player = board[row][col];
    if(!player) return false;

    const directions = [
        [0, 1], //across
        [1, 0], //down
        [1, 1], //diagonal \
        [1, -1], //diagonal /
    ];

    return directions.some(([dRow, dCol]) => {
        const total = 1 +
            countInDirection(board, row, col, dRow, dCol, player) +
            countInDirection(board, row, col, -dRow, -dCol, player);
        
        return total >= 4;
    });
}

//draw
function isDraw (board) {
    return board[0].every((cell) => cell !==null);
}

module.exports = { createBoard, dropPiece,checkWinner, isDraw };
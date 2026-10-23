const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createBoard, dropPiece, checkWinner, isDraw } = require('./game');

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.get('/', (req, res) => res.send('Connect 4 server is running'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN } });

const rooms = new Map();
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; //I AND O looks like 1 and 0 hence not adding them

function makeCode () {
    let code;
    do {
        code = Array.from(
            { length: 4 },
            () => LETTERS[Math.floor(Math.random() * LETTERS.length)]
        ).join('');
    } while (rooms.has(code));
    return code;

}

function publicState(room) {
    return {
        code: room.code,
        board: room.board,
        turn: room.turn,
        status: room.status,
        winner: room.winner,
        rematch: { R: room.rematch.has('R'), Y: room.rematch.has('Y')},

    };
}

function broadcast (room) {
    io.to(room.code).emit('state', publicState(room));
}

function leaveCurrentRoom(socket) {
    const code = socket.data.code;
    if(!code) return;

    const room = rooms.get(code);
    socket.leave(code);
    socket.data.code = null;
    socket.data.color = null;
    if(!room) return;

    if(room.players.R === socket.id) room.players.R = null;
    if(room.players.Y === socket.id) room.players.Y = null;

    if(!room.players.R && !room.players.Y) {
        rooms.delete(code);
        return;
    }
    room.status = 'abandoned';
    broadcast(room);
}

io.on('connection', (socket) => {
    socket.on('create_room', (ack) =>{
        if(typeof ack !== 'function') return;
        leaveCurrentRoom(socket);

        const code = makeCode();
        const room = {
            code,
            board: createBoard(),
            players: { R: socket.id, Y: null },
            turn: 'R',
            starter: 'R',
            status: 'waiting',
            winner: null,
            rematch: new Set(),
        };
        rooms.set(code, room);

        socket.join(code);
        socket.data.code = code;
        socket.data.color = 'R';

        ack({ ok: true, color: 'R', code });
        broadcast(room);
    });

    socket.on('join_room', (rawCode, ack) => {
        if(typeof ack !=='function') return;

        const code = String(rawCode ?? '').trim().toUpperCase();
        const room = rooms.get(code);

        if(!room) return ack({ ok: false, error: 'Room not found '});
        if (socket.data.code === code) return ack({ ok: false, error: 'You are already in this room' });
        if (room.players.Y || room.status !== 'waiting') return ack({ ok: false, error: 'Room is full' });

        leaveCurrentRoom(socket);

        room.players.Y = socket.id;
        room.status = 'playing';
        socket.join(code);
        socket.data.code = code;
        socket.data.color = 'Y';

        ack({ ok: true, color: 'Y', code });
        broadcast(room);
    });

    socket.on('make_move', (col) => {
    const room = rooms.get(socket.data.code);
    if (!room) return;

    if (room.status === 'waiting') return socket.emit('notice', 'Wait for your friend to join');
    if (room.status !== 'playing') return;
    if (room.turn !== socket.data.color) return socket.emit('notice', "It's not your turn");

    const row = dropPiece(room.board, col, socket.data.color);
    if (row === -1) return socket.emit('notice', 'That column is full');

    if (checkWinner(room.board, row, col)) {
      room.status = 'won';
      room.winner = socket.data.color;
    } else if (isDraw(room.board)) {
      room.status = 'draw';
    } else {
      room.turn = room.turn === 'R' ? 'Y' : 'R';
    }
    broadcast(room);
  });

    socket.on('rematch', () => {
    const room = rooms.get(socket.data.code);
    if (!room || (room.status !== 'won' && room.status !== 'draw')) return;

    room.rematch.add(socket.data.color);

    if (room.rematch.size === 2) {
      room.board = createBoard();
      room.starter = room.starter === 'R' ? 'Y' : 'R';
      room.turn = room.starter;
      room.status = 'playing';
      room.winner = null;
      room.rematch = new Set();
    }
    broadcast(room);
  });

  socket.on('leave_room', () => leaveCurrentRoom(socket));
  socket.on('disconnect', () => leaveCurrentRoom(socket));
});

server.listen(PORT, () => console.log(`Connect 4 server on http://localhost:${PORT}`));
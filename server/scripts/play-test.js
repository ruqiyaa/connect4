const { io } = require('socket.io-client');

const URL = 'http://localhost:3001';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((r) => s.once(ev, r));
const ask = (s, ev, ...args) => new Promise((r) => s.emit(ev, ...args, r));

async function main() {
  const a = io(URL);
  const b = io(URL);
  let last = null;
  a.on('state', (s) => (last = s));
  b.on('notice', (m) => console.log('B got notice:', m));

  await Promise.all([once(a, 'connect'), once(b, 'connect')]);
  console.log('both connected');

  const created = await ask(a, 'create_room');
  console.log('create_room ->', created);

  const joined = await ask(b, 'join_room', created.code);
  console.log('join_room ->', joined);

  b.emit('make_move', 3); // Red's turn, so this must be refused
  await wait(100);

  for (let i = 0; i < 4; i++) {
    a.emit('make_move', 0);
    await wait(100);
    if (i < 3) {
      b.emit('make_move', 1);
      await wait(100);
    }
  }
  console.log('after 7 moves ->', last.status, 'winner:', last.winner);

  a.emit('rematch');
  b.emit('rematch');
  await wait(100);
  console.log('after rematch ->', last.status, 'turn:', last.turn);

  a.close();
  b.close();
}

main();
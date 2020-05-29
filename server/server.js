const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const clientPath = `${__dirname}/../client`;

console.log(`serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

const board = Array(20).fill().map(() => Array(20).fill(null));
const cooldown = 100;

const inBounds = (x, y) => {
  return y >= 0 && y < board.length && x >= 0 && x < board[y].length;
};

const numMatches = (x, y, dx, dy) => {
  let i = 1;
  while (inBounds(x + i*dx, y + i*dy) &&
    board[y + i*dy][x + i*dx] === board[y][x]) {
    i++;
  }
  return i - 1;
};

const isWinningTurn = (x, y) => {
  for (let dx = -1; dx < 2; dx++) {
    for (let dy = -1; dy < 2; dy++) {
      if (dx === 0 && dy === 0) {
        continue;
      }

      const count = numMatches(x, y, dx, dy) + numMatches(x, y, -dx, -dy) + 1;

      if (count > 4) {
        return true;
      }
    }
  }
  return false;
};

io.on('connection', (sock) => {
  console.log('someone connected');
  let lastTurnTime = Date.now();

  sock.emit('board', board);
  sock.on('message', (text) => io.emit('message', text));
  sock.on('turn', (rect) => {
    if (Date.now() - lastTurnTime < cooldown) {
      return;
    }

    lastTurnTime = Date.now();
    const { y, x, color } = rect;
    board[y][x] = color;
    io.emit('turn', rect);

    if (isWinningTurn(x, y)) {
      sock.emit('message', 'You Won!!!');
      board.forEach((row) => row.fill(null));
      io.emit('reset');
    }
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('server started on 8080');
});

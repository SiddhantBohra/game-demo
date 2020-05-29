const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const clientPath = `${__dirname}/../client`;

console.log(`serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

const cooldownTime = 100;

const createBoard = (size) => {
  const board = Array(size).fill().map(() => Array(size).fill(null));

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

        const count = numMatches(x, y, dx, dy) +
          numMatches(x, y, -dx, -dy) + 1;

        if (count > 4) {
          return true;
        }
      }
    }
    return false;
  };

  const makeTurn = (x, y, color) => {
    board[y][x] = color;
    return isWinningTurn(x, y);
  };

  const reset = () => {
    board.forEach((row) => row.fill(null));
  };

  const getBoard = () => board;

  return { getBoard, makeTurn, reset };
};

const createCooldown = (cooldownTime) => {
  let lastTurnTime = Date.now();

  return () => {
    if (Date.now() - lastTurnTime > cooldownTime) {
      lastTurnTime = Date.now();
      return true;
    }

    return false;
  };

};

const { getBoard, makeTurn, reset } = createBoard(20);

io.on('connection', (sock) => {
  console.log('someone connected');

  const cooldown = createCooldown(cooldownTime);
  const onTurn = (turn) => {
    if (!cooldown()) {
      return;
    }

    io.emit('turn', turn);

    const { y, x, color } = turn;
    const playerWon = makeTurn(x, y, color);

    if (playerWon) {
      reset();
      sock.emit('message', 'You Won!!!');
      io.emit('reset');
    }
  };

  sock.emit('board', getBoard());
  sock.on('message', (text) => io.emit('message', text));
  sock.on('turn', onTurn);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('server started on 8080');
});

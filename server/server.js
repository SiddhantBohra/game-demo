const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const randomColor = require('randomcolor');
const createBoard = require('./create-board');
const createCooldown = require('./create-cooldown');

const app = express();
const clientPath = `${__dirname}/../client`;

console.log(`serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);
const { getBoard, makeTurn } = createBoard(20);

io.on('connection', (sock) => {
  const color = randomColor();
  const cooldown = createCooldown(2000);

  console.log('someone connected');
  sock.emit('board', getBoard());

  sock.on('message', (text) => io.emit('message', text));
  sock.on('turn', ({ x, y }) => {
    if (cooldown()) {
      const playerWon = makeTurn(x, y, color);
      io.emit('turn', { x, y, color });

      if (playerWon) {
        sock.emit('message', 'YOU WIN');
        io.emit('message', 'new round');
        io.emit('board');
      }
    }
  });

});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('server started on 8080');
});

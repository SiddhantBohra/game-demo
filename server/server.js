const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const clientPath = `${__dirname}/../client`;

console.log(`serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (sock) => {
  console.log('someone connected');
  sock.on('message', (text) => io.emit('message', text));
  sock.on('turn', (turn) => io.emit('turn', turn));
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('server started on 8080');
});

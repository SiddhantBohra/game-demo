const log = (text) => {
  const parent = document.querySelector('#events');
  const el = document.createElement('li');
  el.innerHTML = text;

  parent.appendChild(el);
  parent.scrollTop = parent.scrollHeight;
};

const onChatSubmitted = (sock) => (e) => {
  e.preventDefault();

  const input = document.querySelector('#chat');
  const text = input.value;
  input.value = '';
  sock.emit('message', text);
};

const drawGrid = (ctx, numCells, cellSize) => {

  ctx.strokeWidth = 7;
  ctx.strokeStyle = '#333333';

  ctx.beginPath();

  for (let i = 0; i < numCells + 1; i++) {
    ctx.moveTo(cellSize*i, 0);
    ctx.lineTo(cellSize*i, 400);

    ctx.moveTo(0, cellSize*i);
    ctx.lineTo(400, cellSize*i);
  }
  ctx.stroke();
};

(() => {
  log('welcome');
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  const myColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
  const numCells = 20;
  const cellSize = Math.floor(Math.min(canvas.width, canvas.height)/numCells);

  drawGrid(ctx, numCells, cellSize);
  const handleClick = (x, y) => {
    const cellX = Math.floor(x/cellSize);
    const cellY = Math.floor(y/cellSize);
    sock.emit('click', { x: cellX, y: cellY, color: myColor });
  };

  canvas.addEventListener('click', (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    handleClick(clientX - left, clientY - top);
  });

  const sock = io();
  sock.on('connect', () => log('connected'));
  sock.on('click', ({ x, y, color }) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
  });
  sock.on('message', log);

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));
})();

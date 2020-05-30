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

const createBoard = (canvas, numCells) => {
  const ctx = canvas.getContext('2d');

  const cellSize = Math.floor(Math.min(canvas.width, canvas.height)/numCells);

  const fillRect = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x - 10, y - 10, 20, 20);
  };

  const drawGrid = () => {
    ctx.strokeStyle = '#333';

    ctx.beginPath();

    for (let i = 0; i < numCells + 1; i++) {
      ctx.moveTo(i*cellSize, 0);
      ctx.lineTo(i*cellSize, numCells*cellSize);

      ctx.moveTo(0, i*cellSize);
      ctx.lineTo(numCells*cellSize, i*cellSize);
    }
    ctx.stroke();
  };

  return {
    fillRect,
    drawGrid
  };
};

(() => {
  log('welcome');

  const sock = io();
  const canvas = document.querySelector('canvas');

  const { fillRect, drawGrid } = createBoard(canvas, 20);

  const onCanvasClick = (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const x = clientX - left;
    const y = clientY - top;

    sock.emit('turn', { x, y });
  };

  drawGrid();

  sock.on('connect', () => log('connected'));
  sock.on('message', log);
  sock.on('turn', ({ x, y, color }) => fillRect(x, y, color));

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));

  canvas.addEventListener('click', onCanvasClick);
})();

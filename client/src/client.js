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

  const fillCell = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
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

  const clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawBoard = (board) => {
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        color && fillCell(x, y, color);
      });
    });
  };

  const reset = (board = []) => {
    clear();
    drawGrid();
    drawBoard(board);
  };

  const getCellForCoordinates = (x, y) => ({
    x: Math.floor(x/cellSize),
    y: Math.floor(y/cellSize)
  });

  return {
    fillCell,
    reset,
    getCellForCoordinates
  };
};

(() => {
  log('welcome');

  const sock = io();
  const canvas = document.querySelector('canvas');

  const { fillCell, reset, getCellForCoordinates } = createBoard(canvas, 20);

  const onCanvasClick = (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const { x, y } = getCellForCoordinates(clientX - left, clientY - top);

    sock.emit('turn', { x, y });
  };

  sock.on('connect', () => log('connected'));
  sock.on('message', log);
  sock.on('board', reset);
  sock.on('turn', ({ x, y, color }) => fillCell(x, y, color));

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));

  canvas.addEventListener('click', onCanvasClick);
})();

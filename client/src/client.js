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

  const drawGrid = () => {
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

  const fillCell = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
  };

  const clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const reset = (board) => {
    clear();
    drawGrid();

    if (!board) {
      return;
    }

    board.forEach((row, y) => {
      row.forEach((color, x) => {
        color && fillCell(x, y, color);
      });
    });
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

const randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`;

(() => {
  log('welcome');
  const sock = io();
  const canvas = document.querySelector('canvas');
  const myColor = randomColor();
  const numCells = 20;

  const {
    fillCell,
    reset,
    getCellForCoordinates
  } = createBoard(canvas, numCells);

  const onCanvasClick = (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const { x, y } = getCellForCoordinates(clientX - left, clientY - top);
    sock.emit('turn', { x, y, color: myColor });
  };

  sock.on('connect', () => log('connected'));
  sock.on('message', log);
  sock.on('board', reset);
  sock.on('turn', ({ x, y, color }) => fillCell(x, y, color));
  sock.on('reset', () => {
    log('new round');
    reset();
  });

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));

  canvas.addEventListener('click', onCanvasClick);
})();

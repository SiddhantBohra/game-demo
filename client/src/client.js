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

const randomColor = () => {
  const maxColors = 16777215;
  const value = Math.floor(Math.random()*maxColors).toString(16);
  return `#${value}`;
};

const createBoard = (canvas) => {
  const ctx = canvas.getContext('2d');

  const fillRect = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x - 10, y - 10, 20, 20);
  };

  return {
    fillRect
  };
};

(() => {
  log('welcome');

  const sock = io();
  const canvas = document.querySelector('canvas');
  const tokenColor = randomColor();

  const { fillRect } = createBoard(canvas);

  const onCanvasClick = (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const x = clientX - left;
    const y = clientY - top;

    sock.emit('turn', { x, y, color: tokenColor });
  };

  sock.on('connect', () => log('connected'));
  sock.on('message', log);
  sock.on('turn', ({ x, y, color }) => fillRect(x, y, color));

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));

  canvas.addEventListener('click', onCanvasClick);
})();

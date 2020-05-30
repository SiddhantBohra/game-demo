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

const createBoard = (canvas) => {
  const ctx = canvas.getContext('2d');

  const fillRect = (x, y) => {
    ctx.fillStyle = '#cc4a73';
    ctx.fillRect(x, y, 50, 50);
  };

  return {
    fillRect
  };
};

(() => {
  log('welcome');

  const sock = io();
  const canvas = document.querySelector('canvas');

  const { fillRect } = createBoard(canvas);

  const onCanvasClick = (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const x = clientX - left;
    const y = clientY - top;

    fillRect(x, y);
  };

  sock.on('connect', () => log('connected'));
  sock.on('message', log);

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));

  canvas.addEventListener('click', onCanvasClick);
})();

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

const drawRect = (ctx, x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x - 10, y - 10, 20, 20);
};

(() => {
  const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;

  log('welcome');
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  const handleClick = (x, y) => {
    sock.emit('click', { x, y, color });
  };

  canvas.addEventListener('click', (e) => {
    const { top, left } = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    handleClick(clientX - left, clientY - top);
  });

  const sock = io();
  sock.on('connect', () => log('connected'));
  sock.on('click', ({ x, y, color }) => drawRect(ctx, x, y, color));
  sock.on('message', log);

  document
    .querySelector('#chat-form')
    .addEventListener('submit', onChatSubmitted(sock));
})();

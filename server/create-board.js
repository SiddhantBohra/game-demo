const createBoard = (size) => {

  const board = Array(size).fill().map(() => Array(size).fill(null));

  const makeTurn = (x, y, color) => {
    board[y][x] = color;
  };

  const getBoard = () => board;

  return {
    makeTurn,
    getBoard
  }
};

module.exports = createBoard;

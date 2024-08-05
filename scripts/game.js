import { DOMelements, gameOptions } from "./config.js";
import { updateHeaders } from "./dom.js";
import { endTimer, startTimer } from "./timer.js";
import { renderBoard } from "./render.js";

export function updateBoardSize() {
  document.documentElement.style.setProperty(
    "--board-width",
    gameOptions.width
  );
  document.documentElement.style.setProperty(
    "--board-height",
    gameOptions.height
  );
}

export function generateGame(board) {
  board.innerHTML = "";
  const gameBoard = generateBoard();

  updateHeaders();
  placeMines(gameBoard);
  calculateNeighbors(gameBoard);
  renderBoard(board, gameBoard);
}

export function setDifficulty(level) {
  switch (level) {
    case "beginner":
      gameOptions.width = 8;
      gameOptions.height = 8;
      gameOptions.mineCount = 10;
      break;
    case "intermediate":
      gameOptions.width = 16;
      gameOptions.height = 16;
      gameOptions.mineCount = 40;
      break;
    case "advanced":
      gameOptions.width = 30;
      gameOptions.height = 16;
      gameOptions.mineCount = 99;
      break;
    default:
      gameOptions.width = 16;
      gameOptions.height = 16;
      gameOptions.mineCount = 40;
  }
  updateBoardSize()
  console.log(`Difficulty set to ${level}: ${gameOptions.width}x${gameOptions.height}, ${gameOptions.mineCount} mines`);
}

function generateBoard() {
  const board = [];
  for (let i = 0; i < gameOptions.height; i++) {
    const row = [];
    for (let j = 0; j < gameOptions.width; j++) {
      row.push({
        mine: false,
        neighborMines: 0,
        revealed: false,
        flagged: false,
      });
    }
    board.push(row);
  }
  return board;
}

function placeMines(board) {
  let minesPlaced = 0;
  while (minesPlaced < gameOptions.mineCount) {
    const row = Math.floor(Math.random() * gameOptions.height);
    const col = Math.floor(Math.random() * gameOptions.width);
    if (!board[row][col].mine) {
      board[row][col].mine = true;
      minesPlaced++;
    }
  }
}

export function calculateNeighbors(board) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (let row = 0; row < gameOptions.height; row++) {
    for (let col = 0; col < gameOptions.width; col++) {
      if (board[row][col].mine) continue;

      let mineCount = 0;
      let flagCount = 0;
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (
          newRow >= 0 &&
          newRow < gameOptions.height &&
          newCol >= 0 &&
          newCol < gameOptions.width
        ) {
          if (board[newRow][newCol].mine) {
            mineCount++;
          }
          if (board[newRow][newCol].flagged) {
            flagCount++;
          }
        }
      }
      board[row][col].neighborMines = mineCount;
      board[row][col].neightborFlags = flagCount;
    }
  }
}

export function revealCell(board, row, col, cellElement) {
  if (board[row][col].revealed || board[row][col].flagged) return;
  board[row][col].revealed = true;

  if (board[row][col].mine) {
    cellElement.classList.add("mine");
    revealAllMines(board);
  } else {
    cellElement.classList.add("revealed");
    const neighborMines = board[row][col].neighborMines;
    cellElement.classList.add(`n${neighborMines}`);

    cellElement.innerText = neighborMines > 0 ? neighborMines : "";
    if (neighborMines === 0) {
      revealNeighbors(board, row, col);
    }
  }
}

export function revealNeighbors(board, row, col) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dx, dy] of directions) {
    const newRow = row + dx;
    const newCol = col + dy;
    if (
      newRow >= 0 &&
      newRow < gameOptions.height &&
      newCol >= 0 &&
      newCol < gameOptions.width
    ) {
      const cellElement = document.querySelector(
        `.cell[data-row='${newRow}'][data-col='${newCol}']`
      );
      revealCell(board, newRow, newCol, cellElement);
    }
  }
}


export function flagCell(board, row, col, cellElement) {
  if (board[row][col].revealed) return;

  if (board[row][col].flagged) {
    board[row][col].flagged = false;
    cellElement.classList.remove("flagged");
    gameOptions.flags--;
  } else {
    board[row][col].flagged = true;
    cellElement.classList.add("flagged");
    gameOptions.flags++;
  }
}

export function checkWin(board) {
  for (let row = 0; row < gameOptions.height; row++) {
    for (let col = 0; col < gameOptions.width; col++) {
      if (!board[row][col].mine && !board[row][col].revealed) {
        return false;
      }
    }
  }
  gameOptions.flags = gameOptions.mineCount;
  gameOptions.gameState = 3;
  updateHeaders();
  endTimer();
  flagAllMines(board);
  return true;
}

function revealAllMines(board) {
  for (let row = 0; row < gameOptions.height; row++) {
    for (let col = 0; col < gameOptions.width; col++) {
      if (board[row][col].mine) {
        const cellElement = document.querySelector(
          `.cell[data-row='${row}'][data-col='${col}']`
        );
        cellElement.classList.add("mine2");
      }
    }
  }
  gameOptions.gameState = 2;
  endTimer();
  updateHeaders();
}

function flagAllMines(board) {
  for (let row = 0; row < gameOptions.height; row++) {
    for (let col = 0; col < gameOptions.width; col++) {
      if (board[row][col].mine) {
        const cellElement = document.querySelector(
          `.cell[data-row='${row}'][data-col='${col}']`
        );
        cellElement.classList.add("flagged");
      }
    }
  }
}

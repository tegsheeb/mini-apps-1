let currentTurn = 'X';
let totalPlay = 0;
let gameOver = false;
let currentBoard = {
  t00: '', t01: '', t02: '',
  t10: '', t11: '', t12: '',
  t20: '', t21: '', t22: ''
}

// add x or o depending on currentTurn
function playOnce(e, mark) {
  if(e.target.innerHTML === '') {
    currentBoard[e.target.id] = mark;
    e.target.innerHTML = mark;
    totalPlay++;
  }
};

function changeTurn(){
  if(currentTurn === 'X') {
    currentTurn = 'O';
  } else {
    currentTurn = 'X';
  }
}

function checkWinner(turn) {
  const {t00, t01, t02, t10, t11, t12, t20, t21, t22} = currentBoard

  const winCom = [
    [t00, t01, t02],
    [t10, t11, t12],
    [t20, t21, t22],
    [t00, t10, t20],
    [t01, t11, t21],
    [t02, t12, t22],
    [t00, t11, t22],
    [t02, t11, t20]];

  for (let i = 0; i < winCom.length; i++) {
    if(winCom[i][0] === turn && winCom[i][1] === turn && winCom[i][2] === turn) {
      gameOver = true;
    }
  }
};


function toggle(e) {
  if (totalPlay !== 9 && gameOver !== true) {
    playOnce(e, currentTurn);
    checkWinner(currentTurn);

    if(gameOver === true) {
      var msg = `Game over. ${currentTurn} has won.`
      document.getElementById('whoseTurn').innerHTML = msg;
      return;
    }

    if (totalPlay === 9) {
      document.getElementById('whoseTurn').innerHTML = 'Board is full and game is a tie. Game over.';
      return;
    }

    changeTurn();
    document.getElementById('whoseTurn').innerHTML = `It is ${currentTurn}\'s turn`;

  }
}


function resetGame() {
  currentTurn = 'X';
  totalPlay = 0;
  gameOver = false;

  for (key in currentBoard) {
    currentBoard[key] = '';
    document.getElementById(`${key}`).innerHTML = '';
  }

  document.getElementById('whoseTurn').innerHTML = `${currentTurn} starts the game`;
}


// Event listener on board
const table = document.getElementById('board');
table.addEventListener('click', toggle, false);

// Reset button
const reset = document.getElementById('reset');
reset.addEventListener('click', resetGame, false);
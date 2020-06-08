const state = {
  currentTurn: 'X',
  totalPlay : 0,
  gameOver : false,
  board : {
    t00: '', t01: '', t02: '',
    t10: '', t11: '', t12: '',
    t20: '', t21: '', t22: ''
  },
  lastWinner : '',
  xWin: 0,
  oWin: 0,
  xName: '',
  oName: ''
}


// add x or o depending on currentTurn
const playOnce = (e, mark) => {
  if(e.target.innerHTML === '') {
    state.board[e.target.id] = mark;
    e.target.innerHTML = mark;
    state.totalPlay++;
  }
};

const changeTurn = ()=> {
  if(state.currentTurn === 'X') {
    state.currentTurn = 'O';
  } else {
    state.currentTurn = 'X';
  }
}

const checkWinner = (turn) => {
  const {t00, t01, t02, t10, t11, t12, t20, t21, t22} = state.board

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
      state.lastWinner = turn;
      trackScore(turn);
      updateScoreBoard();
      state.gameOver = true;
      return;
    }
  }
};

const trackScore = (turn) => {
  if (turn === 'X') {
    state.xWin++;
  } else {
    state.oWin++;
  }
}

const updateScoreBoard = () => {
  document.getElementById('xScore').innerHTML = state.xWin;
  document.getElementById('oScore').innerHTML = state.oWin;
}

const play = (e) => {
  if (state.totalPlay !== 9 && state.gameOver !== true) {
    playOnce(e, state.currentTurn);
    checkWinner(state.currentTurn);

    if(state.gameOver === true) {
      var msg = `Game over. ${state.currentTurn} has won.`
      document.getElementById('whoseTurn').innerHTML = msg;
      return;
    }

    if (state.totalPlay === 9) {
      document.getElementById('whoseTurn').innerHTML = 'Board is full and game is a tie. Game over.';
      return;
    }

    changeTurn();
    document.getElementById('whoseTurn').innerHTML = `It is ${state.currentTurn}\'s turn`;

  }
}

const resetGame = () => {
  if (state.lastWinner === '') {
    state.currentTurn = 'X';
    document.getElementById('whoseTurn').innerHTML = `${state.currentTurn} starts the game`;
  } else {
    state.currentTurn = state.lastWinner;
    document.getElementById('whoseTurn').innerHTML = `The last winner was ${state.lastWinner}, therefore ${state.lastWinner} starts the game.`;
  }
  state.totalPlay = 0;
  state.gameOver = false;

  for (key in state.board) {
    state.board[key] = '';
    document.getElementById(`${key}`).innerHTML = '';
  }
}

const handleClick = () => {
  play(event)
}

const submitName = () => {
  state.xName = document.getElementById('nameX').value;
  state.oName = document.getElementById('nameO').value;
  displayName();
}

const displayName = () => {
  document.getElementById('xName').innerHTML = state.xName;
  document.getElementById('oName').innerHTML = state.oName;
}

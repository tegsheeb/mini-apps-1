// window.alert('this is from app');
console.log('this is from app');
console.log(document.getElementById('t00'));

function addMark(e, mark) {
  if(e.target.innerHTML === '') {
    e.target.innerHTML = mark;
  } else {
    document.getElementById('instruction').innerHTML = 'Please press empty place'
  }
};


let currentTurn = 'X';

function alternate(e) {
  if (currentTurn === 'X') {
    addMark(e, currentTurn);
    currentTurn = 'O';
    document.getElementById('whoseTurn').innerHTML = 'It is O\'s turn';
  } else {
    addMark(e, currentTurn);
    currentTurn = 'X';
    document.getElementById('whoseTurn').innerHTML = 'It is X\'s turn';
  }
}

const table = document.getElementById('board');
table.addEventListener('click', alternate, false);

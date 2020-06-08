// window.alert('this is from app');
console.log('this is from app');
console.log(document.getElementById('t00'));

function putX(e) {
  if(e.target.innerHTML === '') {
    e.target.innerHTML = 'X';
  } else {
    document.getElementById('instruction').innerHTML = 'Please press empty place'
  }
};

function putO(e) {
  if(e.target.innerHTML === '') {
    e.target.innerHTML = 'O';
  } else {
    document.getElementById('instruction').innerHTML = 'Please press empty place'
  }
};


let currentTurn = 'X';

function alternate(e) {
  if (currentTurn === 'X') {
    putX(e);
    currentTurn = 'O';
    document.getElementById('whoseTurn').innerHTML = 'It is O\'s turn';
    console.log(currentTurn);
  } else {
    putO(e);
    currentTurn = 'X';
    document.getElementById('whoseTurn').innerHTML = 'It is X\'s turn';
  }
}

const table = document.getElementById('table');
table.addEventListener('click', alternate, false);

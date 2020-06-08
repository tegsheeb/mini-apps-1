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

const table = document.getElementById('table');
table.addEventListener('click', putX, false);

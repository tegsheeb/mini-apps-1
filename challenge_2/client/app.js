
// function to be invoked on submit
function sendData(event) {
  // event.preventDefault();
  console.log('submit clicked and sending data to server')

}

const form = document.getElementById('form');
form.addEventListener('submit', sendData);

// post request




const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.listen(port, () => {console.log(`we are listeing at http:/localhost:${port}`)})

app.get('/', (req, res) => {res.send('hello from express server')})

// app.use(express.static(./client/dist))

// MAIN GOAL
// 1 - Create connect four game

// TODOS
// - Use REACTJS for all views
// - Use Webpack get bundle.js
// - Express for server and API requests in server.js
// - All logic of the game will be in client code

// Setups
// - package.json
// - webpack config
// - install nodemon, react reac-dom




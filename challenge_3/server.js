const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const db = require('./database')


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.use('/', express.static(path.join(__dirname, '/public')))

// app.use(express.static('public'))

// app.get('/', (req, res) => res.send('Hello World!'))



// MAIN TODO
// 1. Use Express to serve index.html and its assets
// 2. Use REACT to build UI
// 3. Use Babel for pre-compile
// 4. Use MongoDB or MySQL fot database

// Set-up TODO
// - DONE No Webpack, use Babel to --watch
// - DONE use Nodemon to watch server.js
// - DONE Express app in server.js
// - DONE  Client app in /Client
// -  All React component in App.jsx
// - DONE Link transpiled file from index.html.

// Homepage
// - Homepage with checkout button
// - F1 & next
// - F2 & next
// - F3 & next
// - Finally, confirmation page which summarizes the data
// - Purchase button on confirmation page
// - when purchase completes, user return to homepage

// Database
// - every time checkout is completes, there is new record in DB.
// - each step in checkout, saves data into DB (when next is clickec)

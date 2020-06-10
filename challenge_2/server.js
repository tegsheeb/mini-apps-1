const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const _ = require('underscore')
const bodyParser = require('body-parser')
// const { parse } = require('json2csv');


// app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.use('/', express.static(path.join(__dirname, '/client')))

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

// Post request
app.post('/submit', (req, res) => {


  // console.log(req.body.jsonInput);

  let jsonInput = req.body.jsonInput;

  if(jsonInput.substring(-1) === ';') {
    jsonInput = jsonInput.substring(0, -1);
  }

  console.log(JSON.parse(jsonInput));
  console.log(typeof JSON.parse(jsonInput));
  //
  // res.send(req.body);
  res.send(jsonInput);

})


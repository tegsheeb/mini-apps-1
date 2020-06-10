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


  console.log(req.body.jsonInput);

  let jsonInput = req.body.jsonInput;
  console.log('got jsonInput', jsonInput);

  jsonInput = JSON.parse(jsonInput);

  // console.log(JSON.parse(jsonInput));
  // console.log(typeof JSON.parse(jsonInput));
  let csvReport = [];
  let header = Object.keys(jsonInput).slice(0, -1);
  // console.log(header);

  csvReport.push(header);

  const getCSV = function (obj) {
    let arr = [];
    for (i = 0; i < header.length; i++) {
      arr.push(obj[header[i]]);
    }
    csvReport.push(arr);

    if(obj.children === []) {
      return;
    }
    if (obj.children !== undefined ) {
      obj.children.map(child => getCSV(child));
    }
  }

  getCSV(jsonInput);
  // console.log(csvReport);

  csvReport.map(innerArr => innerArr.join(','));

  var result = csvReport.join("\n");

  console.log(result);
  res.send(result);

})


const express = require('express');
const bodyParser = require('body-parser');
const stripJsonComments = require('strip-json-comments');
const fs = require('fs');


const app = express();

// log requests
app.use(function(req, res, next) {
  console.log(req.url); 
  next()}
);


// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies




// serve admin files. HACK
app.get('/data_admin/:file', (req, res) => {
  fs.readFile('./server'+req.path, (err, data) => {
    if (err) throw err;
    console.log(data)
    res.send(stripJsonComments(data.toString()));
  });
});

/*
// middleware to strip out json comments
app.use((req, res, next) => {
  if (req.path.endsWith('.json')) {
    console.log(res);
    res.body = stripJsonComments(res.body);
  }
});
*/


// routes
const authRoutes = require('./server/routes/auth');
app.use('/auth', authRoutes);

const publicRoutes = require('./server/routes/public');
app.use('/public', publicRoutes);




// start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
});


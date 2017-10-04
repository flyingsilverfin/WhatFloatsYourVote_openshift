const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const db_funcs = require('../db/db');
const db_get_data = db_funcs.get_data;


const router = new express.Router();


router.get('/live', (req, res) => {
  db_get_data('live', (live) => {
    res.send({'status': 'success', 'data': live});
    res.status(400);
  });
});



module.exports = router;
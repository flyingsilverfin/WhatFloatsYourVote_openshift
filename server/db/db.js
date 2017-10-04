const MongoClient = require('mongodb').MongoClient;

// --- DB stuff ---

var url = 'mongodb://localhost:5000/data';
var db;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, conn) {
  console.log("Connected successfully to server");
  db = conn;

  let collection = db.collection('documents');
  collection.find({}).toArray(function(err, docs) {
    console.log(docs);
    if (docs.length < 2) {
      console.log("inserting basic docs");
      collection.insertMany([
        {
          name: 'live',
          data: {
              "parties": {
              },
              "topics": {
              }
          }
        },
        {
          name: 'staged',
          data: {
              "parties": {
              },
              "topics": {
              }
          }
        }
      ])
    }
  });
});



// this would be more elegant with a promise, once I figure those out
function get_data(name, callback) {
  db.collection('documents').findOne({name: name}, (err, doc) =>
    {
      if (err) throw err;
      callback(doc.data);
  });
}

function save_data(name, data, callback) {

  db.collection('documents').updateOne({name: name}, {name: name, data: data}, (err, result) => {
    if (err) throw err;
    callback(result);
  });

}

module.exports = {
    get_data: get_data,
    save_data: save_data
}
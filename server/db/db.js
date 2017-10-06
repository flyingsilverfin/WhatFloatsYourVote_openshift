//const MongoClient = require('mongodb').MongoClient;

// --- DB stuff ---
/*
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


*/


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
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
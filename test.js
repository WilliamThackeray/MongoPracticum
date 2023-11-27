require('dotenv').config()

var MongoClient = require('mongodb').MongoClient;
var url = process.env.URL

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});
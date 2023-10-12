// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   // Maximum number of connections in the pool
//   host: "localhost",
//   user: "root",
//   password: "pepsodent123",
//   database: "node-complete",
// });

// module.exports = pool.promise();

//using mongodb
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://saradchhetri20690:pepsodent123@cluster0.bfx60q2.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback(client);
    })
    .catch((error) => {
      console.log(error);
      throw err;
    });
};

const getdb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;

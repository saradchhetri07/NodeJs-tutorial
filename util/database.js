// const Sequelize = require("sequelize");

// const sequelize = new Sequelize("node-complete", "root", "pepsodent123", {
//   dialect: "mysql",
//   host: "localhost",
// });

// module.exports = sequelize;

const mysql = require("mysql2");

const pool = mysql.createPool({
  // Maximum number of connections in the pool
  host: "localhost",
  user: "root",
  password: "pepsodent123",
  database: "node-complete",
});

module.exports = pool.promise();

const { Client } = require("pg");

const db = new Client({
  connectionString: "rickllow"
});

db.connect();

module.exports = db;
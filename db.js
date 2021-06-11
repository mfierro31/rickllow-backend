const { Client } = require("pg");

const db = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql:///rickllow"
});

db.connect();

module.exports = db;
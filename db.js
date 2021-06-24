const { Client } = require("pg");

const db = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql:///rickllow",
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect();

module.exports = db;
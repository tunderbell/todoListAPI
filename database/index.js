// imports module for PostgreSQL connection pooling
// specifically toe Pool class from the 'pg' module
const { Pool } = require("pg");

// imports the database configuration from config file
const dbConfig = require("../config/db.config");

// creates a new instance with my database config
const pool = new Pool(dbConfig);

// handles connection errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// exports query method for executing SQL queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(), // For transactions
};

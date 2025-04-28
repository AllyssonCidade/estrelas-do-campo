
const { Pool } = require('pg');
require('dotenv').config(); // Ensure environment variables are loaded

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  // This error should ideally be caught during deployment or startup
  console.error("DATABASE_URL environment variable is not set.");
  // Depending on the flow, you might want to throw an error or exit
  // throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL for PostgreSQL connections
  // rejectUnauthorized: false is generally okay for Supabase free tier,
  // but for production, consider more secure SSL options if needed.
  ssl: {
    rejectUnauthorized: false
  }
});

// Optional: Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client from Supabase:', err.stack);
  }
  console.log('Successfully connected to Supabase PostgreSQL database.');
  // Optionally run a simple query to test
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release client back to pool
    if (err) {
      return console.error('Error executing query on Supabase:', err.stack);
    }
    // console.log('Current time from DB:', result.rows[0].now);
  });
});

module.exports = { pool };

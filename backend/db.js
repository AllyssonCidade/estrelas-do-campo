const { Pool } = require('pg');
require('dotenv').config();

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL for PostgreSQL connections
  ssl: {
    rejectUnauthorized: false // Adjust based on Supabase/Vercel requirements, might need specific certs in production
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client from Supabase', err.stack);
  }
  console.log('Successfully connected to Supabase PostgreSQL database.');
  // Optionally run a simple query to test
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release client back to pool
    if (err) {
      return console.error('Error executing query on Supabase', err.stack);
    }
    // console.log('Current time from DB:', result.rows[0].now);
  });
});

module.exports = { pool };

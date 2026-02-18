require('dotenv').config();
const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME
} = process.env;

/* ===============================
   DATABASE POOL (BEST PRACTICE)
================================ */

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT || 3306,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  timezone: 'Z',
  dateStrings: true,

  /* 🔥 VERY IMPORTANT for shared hosting */
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/* ===============================
   TEST CONNECTION
================================ */

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ Database connected: ${DB_NAME}`);
    conn.release();
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  }
})();

module.exports = pool;

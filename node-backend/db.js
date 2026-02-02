require('dotenv').config();
const mysql = require('mysql2');

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME
} = process.env;

/* ✅ connect WITHOUT DB first */
const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS
});

/* ✅ auto create database */
connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``,
  (err) => {
    if (err) throw err;
    console.log(`✅ Database ready: ${DB_NAME}`);
  }
);

/* ✅ create pool normally */
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,

  timezone: 'Z',        // 🔥 FIX 1
  dateStrings: true
});

module.exports = pool.promise();

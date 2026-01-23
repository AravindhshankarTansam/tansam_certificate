require('dotenv').config();
const db = require('../db');
(async () => {
  try {
    console.log('⏳ Creating tables...');
    /* =========================
       ADMIN USER TABLE
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_user (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* =========================
       LEADS TABLE
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS labs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');
    process.exit();

  } catch (err) {
    console.error('❌ Schema error:', err);
    process.exit(1);
  }
})();

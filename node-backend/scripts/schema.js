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

    /* =========================
      TEAM LEADS TABLE
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS team_leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        lab_id INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE
      )
    `);

    /* =========================
      CERTIFICATE SIGNATURE TABLE
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS certificate_signatures (
        id INT PRIMARY KEY AUTO_INCREMENT,

        name VARCHAR(150) NOT NULL,
        designation VARCHAR(150) NOT NULL,
        signature VARCHAR(255) NOT NULL,

        is_active BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    /* =========================
      ROLES TABLE
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    /* =========================
      USERS TABLE
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,

        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        mobile VARCHAR(20) NOT NULL,

        password VARCHAR(255) NOT NULL,

        role_id INT NOT NULL,

        is_active BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);




    console.log('✅ All tables created successfully');
    process.exit();

  } catch (err) {
    console.error('❌ Schema error:', err);
    process.exit(1);
  }
})();

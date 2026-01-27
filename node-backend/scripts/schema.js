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

    /* =========================
      SDP STUDENTS
    ========================= */
    await db.query(`
  CREATE TABLE IF NOT EXISTS sdp_students (
    id INT PRIMARY KEY AUTO_INCREMENT,

    student_name VARCHAR(150),
    register_no VARCHAR(100),
    college_name VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(150),

    lab_id INT,

    from_date DATE,
    to_date DATE,

    /* ================= PAYMENT (FINANCE ONLY) ================= */
    payment_mode ENUM('ONLINE','CASH') NULL,
    amount DECIMAL(10,2) NULL,
    transaction_id VARCHAR(150) NULL,
    payment_date DATE NULL,
    paid_status BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE SET NULL
  )
`);


    /* =========================
      FDP STAFF
    ========================= */
    await db.query(`
  CREATE TABLE IF NOT EXISTS fdp_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,

    staff_name VARCHAR(150),
    staff_id_no VARCHAR(100),

    college_name VARCHAR(255),
    department VARCHAR(255),

    phone VARCHAR(20),
    email VARCHAR(150),

    lab_id INT,

    from_date DATE,
    to_date DATE,

    /* ================= PAYMENT (FINANCE ONLY) ================= */
    payment_mode ENUM('ONLINE','CASH') NULL,
    amount DECIMAL(10,2) NULL,
    transaction_id VARCHAR(150) NULL,
    payment_date DATE NULL,
    paid_status BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE SET NULL
  )
`);


    /* =========================
      INDUSTRY STAFF
    ========================= */
    await db.query(`
  CREATE TABLE IF NOT EXISTS industry_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,

    industry_staff_name VARCHAR(150),
    industry_staff_id VARCHAR(100),

    industry_name VARCHAR(255),
    designation_name VARCHAR(255),

    phone VARCHAR(20),
    email VARCHAR(150),

    lab_id INT,

    from_date DATE,
    to_date DATE,

    /* ================= PAYMENT (FINANCE ONLY) ================= */
    payment_mode ENUM('ONLINE','CASH') NULL,
    amount DECIMAL(10,2) NULL,
    transaction_id VARCHAR(150) NULL,
    payment_date DATE NULL,
    paid_status BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE SET NULL
  )
`);

    console.log('✅ All tables created successfully');
    process.exit();

  } catch (err) {
    console.error('❌ Schema error:', err);
    process.exit(1);
  }
})();

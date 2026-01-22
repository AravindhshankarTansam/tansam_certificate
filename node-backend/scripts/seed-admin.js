require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db');

(async () => {
  try {

    const name = 'Admin lead';
    const email = 'aravindhshankar@tansam.org';
    const phone = '+91-8903305494';
    const password = 'Tansam@321';
    const role = 'Admin';

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO admin_user (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hash, role]
    );

    console.log('✅ Admin user created successfully');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

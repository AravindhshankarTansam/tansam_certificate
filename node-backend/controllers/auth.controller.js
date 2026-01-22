const bcrypt = require('bcryptjs');
const db = require('../db');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const [rows] = await db.query(
      'SELECT * FROM admin_user WHERE email = ?',
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: 'Admin not found' });

    const admin = rows[0];

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid)
      return res.status(401).json({ message: 'Wrong password' });

    /* ✅ session */
    req.session.user = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };

    res.json({ role: admin.role });

  } catch (err) {
    res.status(500).json(err);
  }
};

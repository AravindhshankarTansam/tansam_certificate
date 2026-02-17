const bcrypt = require('bcryptjs');
const db = require('../db');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

    /* =========================
       1️⃣ CHECK SUPER ADMIN
    ========================= */
    const [adminRows] = await db.query(
      'SELECT * FROM admin_user WHERE email=?',
      [email]
    );

    if (adminRows.length) {

      const admin = adminRows[0];

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid)
        return res.status(401).json({ message: 'Wrong password' });

      req.session.user = {
        id: admin.id,
        role: 'Admin'
      };

      return res.json({
        role: 'Admin',
        name: admin.name
      });
    }


    /* =========================
       2️⃣ CHECK SUB ADMIN / USERS
    ========================= */
  const [userRows] = await db.query(`
  SELECT 
    u.*, 
    r.name AS role_name,
    l.name AS lab_name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN labs l ON l.id = u.lab_id
  WHERE u.email=?
`, [email]);


    if (!userRows.length)
      return res.status(401).json({ message: 'User not found' });

    const user = userRows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ message: 'Wrong password' });

    if (!user.is_active)
      return res.status(403).json({ message: 'User inactive' });


    /* =========================
       3️⃣ SESSION
    ========================= */
req.session.user = {
  id: user.id,
  role: user.role_name,
  lab_id: user.lab_id   // ⭐ ADD THIS (VERY IMPORTANT)
};


    /* =========================
       4️⃣ RESPONSE
    ========================= */
res.json({
  role: user.role_name,
  name: user.name,
  lab_id: user.lab_id,
  lab_name: user.lab_name     // optional for debug
});


  } catch (err) {
    res.status(500).json(err);
  }
};

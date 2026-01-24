const db = require('../../../db');
const bcrypt = require('bcryptjs');

/* ================= GET USERS ================= */
exports.getUsers = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT u.*, r.name AS role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      ORDER BY u.id DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET ROLES FOR DROPDOWN ================= */
exports.getRolesDropdown = async (req, res) => {
  const [rows] = await db.query('SELECT id, name FROM roles');
  res.json(rows);
};


/* ================= ADD USER ================= */
exports.addUser = async (req, res) => {
  try {

    const { name, email, mobile, password, role_id, is_active } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await db.query(`
      INSERT INTO users
      (name,email,mobile,password,role_id,is_active)
      VALUES (?,?,?,?,?,?)
    `, [name, email, mobile, hash, role_id, is_active]);

    res.json({ message: 'Added successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE ================= */
exports.updateUser = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, email, mobile, role_id, is_active } = req.body;

    await db.query(`
      UPDATE users
      SET name=?, email=?, mobile=?, role_id=?, is_active=?
      WHERE id=?
    `, [name, email, mobile, role_id, is_active, id]);

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

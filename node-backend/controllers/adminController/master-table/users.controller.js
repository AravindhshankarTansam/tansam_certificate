const db = require('../../../db');
const bcrypt = require('bcryptjs');

/* ================= GET USERS ================= */
/* ================= GET USERS ================= */
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.*,
        r.name AS role_name,
        l.name AS lab_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN labs l ON l.id = u.lab_id
      ORDER BY u.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET ROLES DROPDOWN ================= */
exports.getRolesDropdown = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM roles');
    res.json(rows);
  } catch (err) {
    console.error('Error in getRolesDropdown:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET LABS DROPDOWN ================= */
exports.getLabsDropdown = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM labs');
    res.json(rows);
  } catch (err) {
    console.error('Error in getLabsDropdown:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD USER ================= */
exports.addUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role_id, lab_id, is_active } = req.body;

    // Basic validation
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ message: 'Name, email, password and role_id are required' });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, mobile, password, role_id, lab_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, mobile, hash, role_id, lab_id || null, is_active]
    );

    res.json({ message: 'Added successfully' });
  } catch (err) {
    console.error('Error in addUser:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE USER ================= */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role_id, lab_id, is_active, password } = req.body;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(`
        UPDATE users
        SET name=?, email=?, mobile=?, role_id=?, lab_id=?, is_active=?, password=?
        WHERE id=?`,
        [name, email, mobile, role_id, lab_id || null, is_active, hash, id]
      );
    } else {
      await db.query(`
        UPDATE users
        SET name=?, email=?, mobile=?, role_id=?, lab_id=?, is_active=?
        WHERE id=?`,
        [name, email, mobile, role_id, lab_id || null, is_active, id]
      );
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ message: err.message });
  }
};
/* ================= GET USER BY ID ================= */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT u.*, r.name AS role_name, l.name AS lab_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN labs l ON l.id = u.lab_id
       WHERE u.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ message: err.message });
  }
};

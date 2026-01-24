const db = require('../../../db');


/* ================= GET ================= */
exports.getRoles = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM roles ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= ADD ================= */
exports.addRole = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ message: 'Role name required' });

    await db.query(
      'INSERT INTO roles (name) VALUES (?)',
      [name]
    );

    res.json({ message: 'Added successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE ================= */
exports.updateRole = async (req, res) => {
  try {

    const { id } = req.params;
    const { name } = req.body;

    await db.query(
      'UPDATE roles SET name=? WHERE id=?',
      [name, id]
    );

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= DELETE ================= */
exports.deleteRole = async (req, res) => {
  try {

    const { id } = req.params;

    await db.query('DELETE FROM roles WHERE id=?', [id]);

    res.json({ message: 'Deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

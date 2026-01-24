const db = require('../../../db');

/* ================= GET ================= */
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM certificate_signatures ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= ADD ================= */
exports.add = async (req, res) => {
  try {

    const { name, designation, is_active } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Signature image required' });
    }

    const signature = req.file.filename;

    await db.query(
      `INSERT INTO certificate_signatures
      (name, designation, signature, is_active)
      VALUES (?, ?, ?, ?)`,
      [name, designation, signature, is_active]
    );

    res.json({ message: 'Added successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE ================= */
exports.update = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, designation, is_active } = req.body;

    let query = `
      UPDATE certificate_signatures
      SET name=?, designation=?, is_active=?`;

    const values = [name, designation, is_active];

    if (req.file) {
      query += `, signature=?`;
      values.push(req.file.filename);
    }

    query += ` WHERE id=?`;
    values.push(id);

    await db.query(query, values);

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

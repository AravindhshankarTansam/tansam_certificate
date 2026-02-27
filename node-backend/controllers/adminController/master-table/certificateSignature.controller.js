


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
/* ================= ADD ================= */
exports.add = async (req, res) => {
  try {
    console.log('Received body:', req.body);               // ← debug
    console.log('Received file:', req.file);               // ← debug (most important)

    const { name, designation, is_active, lab } = req.body;

    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ message: 'Signature image required' });
    }

    const signature = req.file.filename;

    await db.query(
      `INSERT INTO certificate_signatures
      (name, designation, signature, lab, is_active)
      VALUES (?, ?, ?, ?, ?)`,
      [name, designation, signature, lab, is_active === '1' || is_active === true ? 1 : 0]
    );

    res.json({ message: 'Added successfully' });
  } catch (err) {
    console.error('Add signature error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/* ================= UPDATE ================= */
exports.update = async (req, res) => {
  try {
    console.log('Update body:', req.body);
    console.log('Update file:', req.file);

    const { id } = req.params;
    const { name, designation, is_active, lab } = req.body;

    let query = `
      UPDATE certificate_signatures
      SET name = ?, designation = ?, lab = ?, is_active = ?`;
    let values = [name, designation, lab, is_active === '1' || is_active === true ? 1 : 0];

    if (req.file) {
      query += `, signature = ?`;
      values.push(req.file.filename);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Signature not found' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('Update signature error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
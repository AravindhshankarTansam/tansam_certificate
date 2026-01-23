const db = require('../../../db');


/* ================= GET ALL LABS ================= */
exports.getLabs = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM labs ORDER BY id DESC'
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= ADD LAB ================= */
exports.addLab = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Lab name required' });
    }

    const [result] = await db.query(
      'INSERT INTO labs (name) VALUES (?)',
      [name]
    );

    res.json({
      id: result.insertId,
      name
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE LAB ================= */
exports.updateLab = async (req, res) => {
  try {

    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Lab name required' });
    }

    await db.query(
      'UPDATE labs SET name=? WHERE id=?',
      [name, id]
    );

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

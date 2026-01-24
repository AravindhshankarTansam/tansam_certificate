const db = require('../../../db');


/* ================= GET ALL TEAM LEADS ================= */
exports.getTeamLeads = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT
        tl.*,
        l.name AS lab_name
      FROM team_leads tl
      JOIN labs l ON tl.lab_id = l.id
      ORDER BY tl.id DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET LABS (for dropdown) ================= */
exports.getLabsDropdown = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT id, name FROM labs ORDER BY name'
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= ADD TEAM LEAD ================= */
exports.addTeamLead = async (req, res) => {
  try {

    const { name, email, phone, lab_id, is_active } = req.body;

    if (!name || !email || !phone || !lab_id) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const [result] = await db.query(
      `INSERT INTO team_leads
      (name, email, phone, lab_id, is_active)
      VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, lab_id, is_active ?? true]
    );

    res.json({
      id: result.insertId,
      name,
      email,
      phone,
      lab_id,
      is_active
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE TEAM LEAD ================= */
exports.updateTeamLead = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, email, phone, lab_id, is_active } = req.body;

    await db.query(
      `UPDATE team_leads
       SET name=?, email=?, phone=?, lab_id=?, is_active=?
       WHERE id=?`,
      [name, email, phone, lab_id, is_active, id]
    );

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= DELETE TEAM LEAD ================= */
exports.deleteTeamLead = async (req, res) => {
  try {

    const { id } = req.params;

    await db.query('DELETE FROM team_leads WHERE id=?', [id]);

    res.json({ message: 'Deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

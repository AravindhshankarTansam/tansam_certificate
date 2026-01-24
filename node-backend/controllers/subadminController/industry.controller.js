const db = require('../../db');


/* ================= GET ================= */
exports.getAll = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT i.*, l.name AS lab_name
      FROM industry_staff i
      LEFT JOIN labs l ON l.id = i.lab_id
      ORDER BY i.id DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= ADD ================= */
exports.add = async (req, res) => {
  try {

    const {
      industry_staff_name,
      industry_staff_id,
      industry_name,
      designation_name,   // ✅ changed
      phone,
      email,
      lab_id,
      from_date,
      to_date
    } = req.body;

    await db.query(`
      INSERT INTO industry_staff
      (industry_staff_name, industry_staff_id, industry_name, designation_name, phone, email, lab_id, from_date, to_date)
      VALUES (?,?,?,?,?,?,?,?,?)
    `, [
      industry_staff_name,
      industry_staff_id,
      industry_name,
      designation_name,
      phone,
      email,
      lab_id,
      from_date,
      to_date
    ]);

    res.json({ message: 'Added successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE ================= */
exports.update = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      industry_staff_name,
      industry_staff_id,
      industry_name,
      designation_name,   // ✅ changed
      phone,
      email,
      lab_id,
      from_date,
      to_date
    } = req.body;

    await db.query(`
      UPDATE industry_staff
      SET
        industry_staff_name=?,
        industry_staff_id=?,
        industry_name=?,
        designation_name=?,
        phone=?,
        email=?,
        lab_id=?,
        from_date=?,
        to_date=?
      WHERE id=?
    `, [
      industry_staff_name,
      industry_staff_id,
      industry_name,
      designation_name,
      phone,
      email,
      lab_id,
      from_date,
      to_date,
      id
    ]);

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

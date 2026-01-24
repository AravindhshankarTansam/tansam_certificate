const db = require('../../db');


/* ================= GET ALL ================= */
exports.getAll = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT f.*, l.name AS lab_name
      FROM fdp_staff f
      LEFT JOIN labs l ON l.id = f.lab_id
      ORDER BY f.id DESC
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
      staff_name,
      staff_id_no,   // ✅ changed
      college_name,
      department,
      phone,
      email,
      lab_id,
      from_date,
      to_date
    } = req.body;

    await db.query(`
      INSERT INTO fdp_staff
      (staff_name, staff_id_no, college_name, department, phone, email, lab_id, from_date, to_date)
      VALUES (?,?,?,?,?,?,?,?,?)
    `, [
      staff_name,
      staff_id_no,
      college_name,
      department,
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
      staff_name,
      staff_id_no,
      college_name,
      department,
      phone,
      email,
      lab_id,
      from_date,
      to_date
    } = req.body;

    await db.query(`
      UPDATE fdp_staff
      SET
        staff_name=?,
        staff_id_no=?,
        college_name=?,
        department=?,
        phone=?,
        email=?,
        lab_id=?,
        from_date=?,
        to_date=?
      WHERE id=?
    `, [
      staff_name,
      staff_id_no,
      college_name,
      department,
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

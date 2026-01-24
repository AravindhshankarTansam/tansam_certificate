const db = require('../../db');


/* ================= GET ALL ================= */
exports.getAll = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT s.*, l.name AS lab_name
      FROM sdp_students s
      LEFT JOIN labs l ON l.id = s.lab_id
      ORDER BY s.id DESC
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
      student_name,
      register_no,
      college_name,
      department,
      phone,
      email,
      lab_id,
      from_date,
      to_date
    } = req.body;

    await db.query(`
      INSERT INTO sdp_students
      (student_name, register_no, college_name, department, phone, email, lab_id, from_date, to_date)
      VALUES (?,?,?,?,?,?,?,?,?)
    `, [
      student_name,
      register_no,
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
      student_name,
      register_no,
      college_name,
      department,
      phone,
      email,
      lab_id,
      from_date,
      to_date
    } = req.body;

    await db.query(`
      UPDATE sdp_students
      SET
        student_name=?,
        register_no=?,
        college_name=?,
        department=?,
        phone=?,
        email=?,
        lab_id=?,
        from_date=?,
        to_date=?
      WHERE id=?
    `, [
      student_name,
      register_no,
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

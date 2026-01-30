const db = require('../../db');

/* ================= GET ONLY MY LAB ================= */
exports.getMyLabStudents = async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT id, student_name, register_no, attendance_status
      FROM fdp_staff
      WHERE lab_id = ?
      ORDER BY id DESC
    `, [labId]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= MARK ATTENDANCE ONLY ================= */
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const labId = req.session.user.lab_id;
    const userId = req.session.user.id;

    await db.query(`
      UPDATE fdp_staff
      SET
        attendance_status = ?,
        attendance_marked_by = ?,
        attendance_date = CURDATE()
      WHERE id = ? AND lab_id = ?
    `, [status, userId, id, labId]);

    res.json({ message: 'Attendance updated' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const db = require('../../../db');


/* =====================================================
   GET HOLIDAYS
   Supports:
   ?year=2026&month=01  -> month wise
   ?year=2026           -> full year
   no query             -> all
===================================================== */
exports.getHolidays = async (req, res) => {
  try {

    const { year, month } = req.query;

    let query = `
      SELECT
        id,
        DATE_FORMAT(holiday_date, '%Y-%m-%d') AS holiday_date,
        holiday_name,
        type,
        created_by,
        is_locked,
        created_at
      FROM holidays
    `;

    const params = [];

    /* ================= FILTER LOGIC ================= */

    if (year && month) {
      // month wise
      query += ` WHERE DATE_FORMAT(holiday_date, '%Y-%m') = ?`;
      params.push(`${year}-${month}`);
    }
    else if (year) {
      // full year
      query += ` WHERE YEAR(holiday_date) = ?`;
      params.push(year);
    }

    query += ` ORDER BY holiday_date ASC`;

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching holidays' });
  }
};



/* =====================================================
   ADD HOLIDAY (ADMIN ONLY)
   POST /api/admin/holidays
===================================================== */
exports.addHoliday = async (req, res) => {
  try {
    const { holiday_date, holiday_name, type } = req.body;

    if (!holiday_date || !holiday_name) {
      return res.status(400).json({ message: 'Date & name required' });
    }

    await db.query(
      `INSERT INTO holidays (holiday_date, holiday_name, type, created_by)
       VALUES (?, ?, ?, ?)`,
      [
        holiday_date,
        holiday_name,
        type || 'G',
        req.session.user.id
      ]
    );

    res.json({ message: 'Holiday added & locked successfully' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Holiday already exists for this date' });
    }

    console.error(err);
    res.status(500).json({ message: 'Error adding holiday' });
  }
};


/* =====================================================
   DELETE HOLIDAY (ADMIN)
===================================================== */
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM holidays WHERE id=?`, [id]);

    res.json({ message: 'Holiday removed' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};


/* =====================================================
   UPDATE HOLIDAY
===================================================== */
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { holiday_name, type } = req.body;

    await db.query(
      `UPDATE holidays
       SET holiday_name=?, type=?
       WHERE id=?`,
      [holiday_name, type, id]
    );

    res.json({ message: 'Holiday updated' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

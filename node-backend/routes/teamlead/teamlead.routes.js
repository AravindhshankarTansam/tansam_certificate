const express = require('express');
const router = express.Router();
const db = require('../../db');

const { isAuth } = require('../../middleware/auth.middleware');
const { isTeamLead } = require('../../middleware/role.middleware');

/* =====================================================
   TEAM LEAD ATTENDANCE ROUTER (DATE WISE)
   - Only Team Lead
   - Only their lab
   - Store dates in JSON
===================================================== */


/* =====================================================
   🔵 SDP
===================================================== */

/* ---------- GET ---------- */
router.get('/sdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT
        id,
        student_name,
        register_no,
        college_name,
        department,
        phone,
        lab_id,
        from_date,
        to_date,
        present_dates
      FROM sdp_students
      WHERE lab_id=?
      ORDER BY id DESC
    `, [labId]);

    rows.forEach(r => {
      r.present_dates = r.present_dates
        ? JSON.parse(r.present_dates)
        : [];
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


/* ---------- MARK DATE ---------- */
router.post('/sdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(
      `SELECT present_dates FROM sdp_students WHERE id=? AND lab_id=?`,
      [id, labId]
    );

    if (!rows.length) return res.status(404).json({ message: 'Not found' });

    let dates = rows[0].present_dates
      ? JSON.parse(rows[0].present_dates)
      : [];

    // toggle
    if (dates.includes(date)) {
      dates = dates.filter(d => d !== date);
    } else {
      dates.push(date);
    }

    await db.query(
      `UPDATE sdp_students SET present_dates=? WHERE id=?`,
      [JSON.stringify(dates), id]
    );

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json(err);
  }
});



/* =====================================================
   🟢 FDP
===================================================== */

router.get('/fdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT *,
      present_dates
      FROM fdp_staff
      WHERE lab_id=?
    `, [labId]);

    rows.forEach(r => {
      r.present_dates = r.present_dates
        ? JSON.parse(r.present_dates)
        : [];
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/fdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;

    const [rows] = await db.query(
      `SELECT present_dates FROM fdp_staff WHERE id=?`,
      [id]
    );

    let dates = rows[0].present_dates
      ? JSON.parse(rows[0].present_dates)
      : [];

    if (dates.includes(date))
      dates = dates.filter(d => d !== date);
    else
      dates.push(date);

    await db.query(
      `UPDATE fdp_staff SET present_dates=? WHERE id=?`,
      [JSON.stringify(dates), id]
    );

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json(err);
  }
});



/* =====================================================
   🟡 INDUSTRY
===================================================== */

router.get('/industry/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT *,
      present_dates
      FROM industry_staff
      WHERE lab_id=?
    `, [labId]);

    rows.forEach(r => {
      r.present_dates = r.present_dates
        ? JSON.parse(r.present_dates)
        : [];
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/industry/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;

    const [rows] = await db.query(
      `SELECT present_dates FROM industry_staff WHERE id=?`,
      [id]
    );

    let dates = rows[0].present_dates
      ? JSON.parse(rows[0].present_dates)
      : [];

    if (dates.includes(date))
      dates = dates.filter(d => d !== date);
    else
      dates.push(date);

    await db.query(
      `UPDATE industry_staff SET present_dates=? WHERE id=?`,
      [JSON.stringify(dates), id]
    );

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../../db');

const { isAuth } = require('../../middleware/auth.middleware');
const { isTeamLead } = require('../../middleware/role.middleware');

const { getWorkingDays } = require('../../utils/attendance.helper');
const { generateCertificate } = require('../../utils/certificate.helper');




/* =====================================================
   COMMON FUNCTION (REUSABLE FOR ALL 3 TABLES)
===================================================== */

async function markAttendance(table, id, date, labId) {

  /* ---------- fetch row ---------- */
  const [[row]] = await db.query(`
    SELECT *
    FROM ${table}
    WHERE id=? AND lab_id=?`,
    [id, labId]
  );

  if (!row) throw new Error('Not found');

  let dates = row.present_dates || [];


  /* ---------- toggle ---------- */
  if (dates.includes(date))
    dates = dates.filter(d => d !== date);
  else
    dates.push(date);


  /* ---------- holidays ---------- */
  const year = row.from_date.substring(0, 4);

  const [holidayRows] = await db.query(
    `SELECT holiday_date FROM holidays WHERE YEAR(holiday_date)=?`,
    [year]
  );

  const holidays = holidayRows.map(h => h.holiday_date);


  /* ---------- calculate stats ---------- */
  const workingDays = getWorkingDays(row.from_date, row.to_date, holidays);

  const total = workingDays.length;
  const present = dates.length;
  const absent = total - present;
  const percentage = total
    ? ((present / total) * 100).toFixed(2)
    : 0;


  /* ---------- update DB ---------- */
  await db.query(`
    UPDATE ${table}
    SET
      present_dates=?,
      present_count=?,
      absent_count=?,
      total_days=?,
      attendance_percentage=?
    WHERE id=?`,
    [
      JSON.stringify(dates),
      present,
      absent,
      total,
      percentage,
      id
    ]
  );


  /* =====================================================
     🔥 AUTO CERTIFICATE TRIGGER (ADD HERE)
  ===================================================== */

  const [[updatedRow]] = await db.query(
    `SELECT * FROM ${table} WHERE id=?`,
    [id]
  );

  await generateCertificate(updatedRow, db);
}




/* =====================================================
   🔵 SDP
===================================================== */

router.get('/sdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT *
      FROM sdp_students
      WHERE lab_id=?
      ORDER BY id DESC
    `, [labId]);

 rows.forEach(r => {
  if (!r.present_dates) {
    r.present_dates = [];
  }
});


    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/sdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    await markAttendance('sdp_students', id, date, labId);

    res.json({ message: 'Updated with stats' });

  } catch (err) {
    res.status(500).json(err.message);
  }
});



/* =====================================================
   🟢 FDP
===================================================== */

router.get('/fdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT *
      FROM fdp_staff
      WHERE lab_id=?
    `, [labId]);

   rows.forEach(r => {
  if (!r.present_dates) {
    r.present_dates = [];
  }
});


    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/fdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    await markAttendance('fdp_staff', id, date, labId);

    res.json({ message: 'Updated with stats' });

  } catch (err) {
    res.status(500).json(err.message);
  }
});



/* =====================================================
   🟡 INDUSTRY
===================================================== */

router.get('/industry/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT *
      FROM industry_staff
      WHERE lab_id=?
    `, [labId]);

    rows.forEach(r => {
  if (!r.present_dates) {
    r.present_dates = [];
  }
});

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/industry/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    await markAttendance('industry_staff', id, date, labId);

    res.json({ message: 'Updated with stats' });

  } catch (err) {
    res.status(500).json(err.message);
  }
});


module.exports = router;

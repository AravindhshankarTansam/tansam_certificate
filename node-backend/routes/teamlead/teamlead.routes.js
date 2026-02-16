const express = require('express');
const router = express.Router();
const db = require('../../db');

const { isAuth } = require('../../middleware/auth.middleware');
const { isTeamLead } = require('../../middleware/role.middleware');

const { getWorkingDays } = require('../../utils/attendance.helper');
const { generateCertificate } = require('../../utils/certificate.helper');
const { generateIVCertNo } = require('../../utils/certNo.helper');
const { generateAccessToken } = require('../../utils/token.helper');
const { sendCertificateMail } = require('../../services/mail.service');
const { checkAndGenerateCertificate } = require('../../utils/certificateTrigger.helper');
const { tryGenerateCertificate } =
  require('../../utils/certificate.trigger');



/* =====================================================
   COMMON FUNCTION (REUSABLE)
===================================================== */
async function markAttendance(table, id, date, labId) {

  /* 1️⃣ FETCH USER */
  const [[row]] = await db.query(
    `SELECT * FROM ${table} WHERE id=? AND lab_id=?`,
    [id, labId]
  );

  if (!row) throw new Error('Not found');

  /* 2️⃣ NORMALIZE present_dates */
  let dates = [];

  if (Array.isArray(row.present_dates)) {
    dates = row.present_dates;
  } else if (typeof row.present_dates === 'string') {
    try {
      dates = JSON.parse(row.present_dates);
    } catch {
      dates = [];
    }
  }

  /* 3️⃣ TOGGLE DATE */
  if (dates.includes(date)) {
    dates = dates.filter(d => d !== date);
  } else {
    dates.push(date);
  }

  /* 4️⃣ HOLIDAYS */
  const year = row.from_date.substring(0, 4);

  const [holidayRows] = await db.query(
    `SELECT holiday_date FROM holidays WHERE YEAR(holiday_date)=?`,
    [year]
  );

  const holidays = holidayRows.map(h => h.holiday_date);

  /* 5️⃣ ATTENDANCE */
  const workingDays = getWorkingDays(
    row.from_date,
    row.to_date,
    holidays
  );

  const total = workingDays.length;
  const present = dates.length;
  const absent = total - present;

  const percentage =
    total > 0
      ? Number(((present / total) * 100).toFixed(2))
      : 0;

  /* 6️⃣ UPDATE */
  await db.query(
    `
    UPDATE ${table}
    SET
      present_dates=?,
      present_count=?,
      absent_count=?,
      total_days=?,
      attendance_percentage=?
    WHERE id=?
    `,
    [
      JSON.stringify(dates),
      present,
      absent,
      total,
      percentage,
      id
    ]
  );

  /* 7️⃣ FETCH UPDATED */
  const [[updatedRow]] = await db.query(
    `SELECT * FROM ${table} WHERE id=?`,
    [id]
  );
await checkAndGenerateCertificate(table, id);
  console.log("---- CERTIFICATE DEBUG ----");
  console.log("paid_status:", updatedRow.paid_status);
  console.log("attendance:", updatedRow.attendance_percentage);
  console.log("generated:", updatedRow.certificate_generated);

  /* =====================================================
     8️⃣ AUTO CERTIFICATE + EMAIL
  ===================================================== */
  if (
    updatedRow.paid_status &&
    Number(updatedRow.attendance_percentage) >= 90 &&
    !updatedRow.certificate_generated
  ) {

    const certShortMap = {
      sdp_students: 'SDP',
      fdp_staff: 'FDP',
      industry_staff: 'IND'
    };

    const short = certShortMap[table];

    if (!short) throw new Error('Invalid table');

    const certNo =
      updatedRow.certificate_no ||
      generateIVCertNo(short, updatedRow.to_date);

    /* PDF */
    await generateCertificate(
      {
        name:
          updatedRow.student_name ||
          updatedRow.staff_name ||
          updatedRow.industry_staff_name,

        institution:
          updatedRow.college_name ||
          updatedRow.industry_name,

        department:
          updatedRow.department ||
          updatedRow.designation_name,

        programme: short,
        startDate: updatedRow.from_date,
        endDate: updatedRow.to_date,
        certificateNo: certNo
      },
      db
    );

    /* SAVE */
    await db.query(
      `
      UPDATE ${table}
      SET certificate_no=?, certificate_generated=1
      WHERE id=?
      `,
      [certNo, id]
    );
     8️⃣ 🔥 CENTRALIZED CERTIFICATE TRIGGER
     (NO LOGIC HERE)
  ===================================================== */
  await tryGenerateCertificate(table, updatedRow, db);
}

    /* TOKEN */
    const token = generateAccessToken();

    await db.query(`
      INSERT INTO certificate_access (type, user_id, access_token)
      VALUES (?, ?, ?)
    `, [short.toLowerCase(), id, token]);

    console.log("Sending certificate mail...");

    if (updatedRow.email) {
      await sendCertificateMail(updatedRow.email, token);
    }
  }
}


/* =====================================================
   GET ROUTES
===================================================== */

/* SDP */
router.get('/sdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT * FROM sdp_students
      WHERE lab_id=?
      ORDER BY id DESC
    `, [labId]);

    rows.forEach(r => {
      if (!r.present_dates) r.present_dates = [];
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});

/* FDP */
router.get('/fdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT * FROM fdp_staff
      WHERE lab_id=?
    `, [labId]);

    rows.forEach(r => {
      if (!r.present_dates) r.present_dates = [];
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});

/* INDUSTRY */
router.get('/industry/get', isAuth, isTeamLead, async (req, res) => {
  try {
    const labId = req.session.user.lab_id;

    const [rows] = await db.query(`
      SELECT * FROM industry_staff
      WHERE lab_id=?
    `, [labId]);

    rows.forEach(r => {
      if (!r.present_dates) r.present_dates = [];
    });

    res.json(rows);

  } catch (err) {
    res.status(500).json(err);
  }
});


/* =====================================================
   POST ROUTES
===================================================== */

router.post('/sdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    await markAttendance('sdp_students', id, date, labId);

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/fdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    await markAttendance('fdp_staff', id, date, labId);

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/industry/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    const { id, date } = req.body;
    const labId = req.session.user.lab_id;

    await markAttendance('industry_staff', id, date, labId);

    res.json({ message: 'Updated' });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;

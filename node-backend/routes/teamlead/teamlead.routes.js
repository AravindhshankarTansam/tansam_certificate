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
  /* ================= BASIC INPUT CHECK ================= */
  if (!table || !id || !date || !labId) {
    throw new Error('Invalid attendance input');
  }

  if (isNaN(Date.parse(date))) {
    throw new Error('Invalid date format');
  }

  /* ================= FETCH RECORD ================= */
  const [[row]] = await db.query(
    `SELECT * FROM ${table} WHERE id=? AND lab_id=?`,
    [id, labId]
  );

  if (!row) {
    throw new Error('Not found');
  }

  /* ================= DATE RANGE SAFETY ================= */
  if (!row.from_date || !row.to_date) {
    throw new Error('Invalid date range');
  }

  const fromDate = new Date(row.from_date);
  const toDate = new Date(row.to_date);

  if (isNaN(fromDate) || isNaN(toDate) || fromDate > toDate) {
    throw new Error('Invalid date range');
  }

  /* ================= PRESENT DATES (SAFE JSON) ================= */
  let dates = [];

  try {
    dates = row.present_dates ? JSON.parse(row.present_dates) : [];
  } catch {
    dates = [];
  }

  if (!Array.isArray(dates)) {
    dates = [];
  }

  /* ================= TOGGLE DATE ================= */
  const formattedDate = new Date(date).toISOString().slice(0, 10);

  if (dates.includes(formattedDate)) {
    dates = dates.filter(d => d !== formattedDate);
  } else {
    dates.push(formattedDate);
  }

  /* ================= HOLIDAYS ================= */
  const year = fromDate.getFullYear();

  const [holidayRows] = await db.query(
    `SELECT holiday_date FROM holidays WHERE YEAR(holiday_date)=?`,
    [year]
  );

  const holidays = holidayRows.map(h =>
    new Date(h.holiday_date).toISOString().slice(0, 10)
  );

  /* ================= CALCULATE ATTENDANCE ================= */
  const workingDays = getWorkingDays(
    fromDate.toISOString().slice(0, 10),
    toDate.toISOString().slice(0, 10),
    holidays
  );

  const total = workingDays.length;
  const present = dates.length;
  const absent = total - present;

  const percentage = total > 0
    ? Number(((present / total) * 100).toFixed(2))
    : 0;

  /* ================= UPDATE DATABASE ================= */
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

  /* ================= RETURN DATA (OPTIONAL) ================= */
  return {
    id,
    present,
    absent,
    total,
    percentage
  };
}





/* =====================================================
   🔵 SDP
===================================================== */

router.get('/sdp/get', isAuth, isTeamLead, async (req, res) => {
  try {
    /* ================= SESSION SAFETY ================= */
    if (!req.session?.user?.lab_id) {
      return res.status(403).json({
        message: 'Lab not assigned to this Team Lead'
      });
    }

    const labId = req.session.user.lab_id;

    /* ================= FETCH DATA ================= */
    const [rows] = await db.query(
      `
      SELECT *
      FROM sdp_students
      WHERE lab_id = ?
      ORDER BY id DESC
      `,
      [labId]
    );

    /* ================= SAFE JSON PARSE ================= */
    rows.forEach(row => {
      try {
        row.present_dates = row.present_dates
          ? JSON.parse(row.present_dates)
          : [];
      } catch (e) {
        console.warn(
          `Invalid present_dates JSON for SDP ID ${row.id}`
        );
        row.present_dates = [];
      }
    });

    /* ================= RESPONSE ================= */
    return res.json(rows);

  } catch (err) {
    console.error('TEAM LEAD SDP GET ERROR:', err);
    return res.status(500).json({
      message: 'Failed to fetch SDP students'
    });
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
    /* ================= SESSION SAFETY ================= */
    if (!req.session?.user?.lab_id) {
      return res.status(403).json({
        message: 'Lab not assigned to this Team Lead'
      });
    }

    const labId = req.session.user.lab_id;

    /* ================= FETCH DATA ================= */
    const [rows] = await db.query(
      `
      SELECT *
      FROM fdp_staff
      WHERE lab_id = ?
      ORDER BY id DESC
      `,
      [labId]
    );

    /* ================= SAFE JSON PARSE ================= */
    rows.forEach(row => {
      try {
        row.present_dates = row.present_dates
          ? JSON.parse(row.present_dates)
          : [];
      } catch {
        console.warn(
          `Invalid present_dates JSON for FDP ID ${row.id}`
        );
        row.present_dates = [];
      }
    });

    return res.json(rows);

  } catch (err) {
    console.error('TEAM LEAD FDP GET ERROR:', err);
    return res.status(500).json({
      message: 'Failed to fetch FDP staff'
    });
  }
});


router.post('/fdp/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    /* ================= SESSION SAFETY ================= */
    if (!req.session?.user?.lab_id) {
      return res.status(403).json({
        message: 'Lab not assigned to this Team Lead'
      });
    }

    const labId = req.session.user.lab_id;

    /* ================= INPUT VALIDATION ================= */
    const { id, date } = req.body;

    if (!id || !date) {
      return res.status(400).json({
        message: 'id and date are required'
      });
    }

    /* ================= OPTIONAL DATE VALIDATION ================= */
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    /* ================= BUSINESS LOGIC ================= */
    await markAttendance('fdp_staff', id, date, labId);

    /* ================= SUCCESS RESPONSE ================= */
    return res.json({
      message: 'Attendance updated successfully'
    });

  } catch (err) {
    console.error('TEAM LEAD FDP MARK ERROR:', err);

    /* ================= KNOWN ERROR ================= */
    if (err.message === 'Not found') {
      return res.status(404).json({
        message: 'FDP staff not found for this lab'
      });
    }

    /* ================= UNKNOWN ERROR ================= */
    return res.status(500).json({
      message: 'Failed to update attendance'
    });
  }
});

/* =====================================================
   🟡 INDUSTRY
===================================================== */

router.get('/industry/get', isAuth, isTeamLead, async (req, res) => {
  try {
    /* ================= SESSION SAFETY ================= */
    if (!req.session?.user?.lab_id) {
      return res.status(403).json({
        message: 'Lab not assigned to this Team Lead'
      });
    }

    const labId = req.session.user.lab_id;

    /* ================= FETCH DATA ================= */
    const [rows] = await db.query(
      `
      SELECT *
      FROM industry_staff
      WHERE lab_id = ?
      ORDER BY id DESC
      `,
      [labId]
    );

    /* ================= SAFE JSON PARSE ================= */
    rows.forEach(row => {
      try {
        row.present_dates = row.present_dates
          ? JSON.parse(row.present_dates)
          : [];
      } catch {
        console.warn(
          `Invalid present_dates JSON for Industry ID ${row.id}`
        );
        row.present_dates = [];
      }
    });

    return res.json(rows);

  } catch (err) {
    console.error('TEAM LEAD INDUSTRY GET ERROR:', err);
    return res.status(500).json({
      message: 'Failed to fetch industry staff'
    });
  }
});



router.post('/industry/mark-date', isAuth, isTeamLead, async (req, res) => {
  try {
    /* ================= SESSION SAFETY ================= */
    if (!req.session?.user?.lab_id) {
      return res.status(403).json({
        message: 'Lab not assigned to this Team Lead'
      });
    }

    const labId = req.session.user.lab_id;

    /* ================= INPUT VALIDATION ================= */
    const { id, date } = req.body;

    if (!id || !date) {
      return res.status(400).json({
        message: 'id and date are required'
      });
    }

    /* ================= BUSINESS LOGIC ================= */
    await markAttendance('industry_staff', id, date, labId);

    return res.json({ message: 'Attendance updated successfully' });

  } catch (err) {
    console.error('TEAM LEAD INDUSTRY MARK ERROR:', err);

    /* ================= KNOWN ERROR ================= */
    if (err.message === 'Not found') {
      return res.status(404).json({
        message: 'Industry staff not found for this lab'
      });
    }

    /* ================= UNKNOWN ERROR ================= */
    return res.status(500).json({
      message: 'Failed to update attendance'
    });
  }
});


module.exports = router;

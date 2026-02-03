const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateCertificate } = require('../utils/certificate.helper');


/* ======================================================
   DOWNLOAD CERTIFICATE
====================================================== */

router.get('/generate/:type/:id', async (req, res) => {

  const { type, id } = req.params;

  const tables = {
    sdp: 'sdp_students',
    fdp: 'fdp_staff',
    industry: 'industry_staff'
  };

  const table = tables[type];

  if (!table) return res.status(400).send('Invalid type');

  const [[row]] = await db.query(
    `SELECT * FROM ${table} WHERE id=?`,
    [id]
  );

  if (!row) return res.status(404).send('Not found');


  /* ---------- eligibility ---------- */
  if (!row.paid_status || row.attendance_percentage < 90) {
    return res.status(400).send('Not eligible');
  }


  /* ---------- certificate number ---------- */
  const year = new Date().getFullYear();
  const certNo = `TCOE/${type.toUpperCase()}/${year}/${String(id).padStart(6,'0')}`;


  /* ---------- update DB ---------- */
  await db.query(`
    UPDATE ${table}
    SET certificate_no=?, certificate_generated=1
    WHERE id=?`,
    [certNo, id]
  );


  /* ---------- generate pdf ---------- */
  const pdf = await generateCertificate({
    name: row.student_name || row.staff_name || row.industry_staff_name,
    institution: row.college_name || row.industry_name,
    department: row.department || row.designation_name,
    programme: type.toUpperCase(),
    startDate: row.from_date,
    endDate: row.to_date,
    certificateNo: certNo
  },db);


  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=${certNo}.pdf`
  });

  res.send(pdf);
});


/* ======================================================
   VERIFY (QR page)
====================================================== */

router.get('/verify/:certNo', async (req, res) => {

  const certNo = req.params.certNo;

  const [rows] = await db.query(`
    SELECT certificate_no, staff_name AS name, from_date, to_date FROM fdp_staff WHERE certificate_no=?
    UNION
    SELECT certificate_no, student_name AS name, from_date, to_date FROM sdp_students WHERE certificate_no=?
    UNION
    SELECT certificate_no, industry_staff_name AS name, from_date, to_date FROM industry_staff WHERE certificate_no=?
  `, [certNo, certNo, certNo]);


    if (!rows.length) return res.send('Invalid certificate');

    res.json(rows[0]);
  });

module.exports = router;

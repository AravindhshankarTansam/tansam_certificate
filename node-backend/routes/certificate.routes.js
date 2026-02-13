const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateCertificate } = require('../utils/certificate.helper');
const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');

const generateSecureCode = () =>
  crypto.randomBytes(7).toString('hex').toUpperCase();


/* ======================================================
   DOWNLOAD CERTIFICATE
====================================================== */
router.get('/generate/:type/:id', async (req, res) => {

  try {
    const { type, id } = req.params;

    const tables = {
      sdp: 'sdp_students',
      fdp: 'fdp_staff',
      industry: 'industry_staff'
    };

    const table = tables[type];

    if (!table) return res.status(400).send('Invalid type');

const [[row]] = await db.query(
  `SELECT t.*, l.name AS lab_name
   FROM ${table} t
   LEFT JOIN labs l ON t.lab_id = l.id
   WHERE t.id=?`,
  [id]
);


    if (!row) return res.status(404).send('Not found');

    /* ================= ELIGIBILITY ================= */
    if (!row.paid_status || row.attendance_percentage < 90) {
      return res.status(400).send('Not eligible');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    let certNo = row.certificate_no;

    /* ================= GENERATE ONLY ONCE ================= */
    if (!certNo) {
      certNo = `TCOE-${type.toUpperCase()}-${year}-${month}-${generateSecureCode()}`;

      await db.query(`
        UPDATE ${table}
        SET certificate_no=?, certificate_generated=1
        WHERE id=?`,
        [certNo, id]
      );
    }


    /* ================= GENERATE PDF ================= */
      

    /* ================= SAVE LOW QUALITY ================= */
    // const folder = path.join(__dirname, `../uploads/${type}`);

    // if (!fs.existsSync(folder)) {
    //   fs.mkdirSync(folder, { recursive: true });
    // }

    // const filePath = path.join(folder, `${certNo}.pdf`);

    // fs.writeFileSync(filePath, lowQualityPDF);

 
      const pdfBuffer = await generateCertificate({
        name: row.student_name || row.staff_name || row.industry_staff_name,
        institution: row.college_name || row.industry_name,
        department: row.department || row.designation_name,
        programme: row.lab_name || type.toUpperCase(),
        startDate: row.from_date,
        endDate: row.to_date,
        certificateNo: certNo
      }, db);

      /* ================= SEND PDF ================= */
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${certNo}.pdf`
      });

      return res.send(pdfBuffer);

        

  } catch (err) {
    console.error(err);
    res.status(500).send('Certificate generation failed');
  }
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

  if (!rows.length) {
    return res.json({
      valid: false,
      message: "Certificate not found or fake"
    });
  }

  res.json({
    valid: true,
    data: rows[0]
  });
});


module.exports = router;

const db = require('../../db');
const fs = require('fs');
const path = require('path');
const { generateIVCertificate } = require('../../utils/ivCertificate.helper');
const { generateIVCertNo } = require('../../utils/certNo.helper');
const archiver = require('archiver');

/* ======================================================
   SMALL HELPERS
====================================================== */

// prevent ../../ attacks or weird chars
const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


/* ======================================================
   BULK UPLOAD (Excel + Students + Save File)
====================================================== */
exports.bulkUpload = async (req, res) => {
  try {

    const { collegeName, collegeShortName, visitDate } = req.body;

    if (!collegeName || !collegeShortName || !visitDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    /* ================= SAFE FOLDER ================= */

    const short = safeName(collegeShortName);

    const uploadDir = path.join(
      __dirname,
      `../../uploads/iv/${short}`
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    /* ================= SAVE EXCEL PATH ================= */

    let excelFilePath = null;

    if (req.file) {
      excelFilePath = `iv/${short}/${req.file.filename}`; // store relative path
    }

    /* ================= PARSE STUDENTS ================= */

    const parsedStudents = req.body.students
      ? JSON.parse(req.body.students)
      : [];

    if (!parsedStudents.length) {
      return res.status(400).json({ message: 'No students found' });
    }

    /* ================= INSERT VISIT ================= */

    const [visit] = await db.query(`
      INSERT INTO iv_visits
      (college_name, college_short_name, visit_date, excel_file, total_count)
      VALUES (?, ?, ?, ?, ?)
    `, [
      collegeName,
      short,
      visitDate,
      excelFilePath,
      parsedStudents.length
    ]);

    const visitId = visit.insertId;

    /* ================= INSERT STUDENTS ================= */

    const values = parsedStudents.map(s => [
      visitId,
      s.name,
      s['register number'],
      s['email id'],
      s['phone number'],
      s.department
    ]);

    await db.query(`
      INSERT INTO iv_students
      (visit_id, student_name, register_number, email, phone, department)
      VALUES ?
    `, [values]);


    res.json({
      message: 'Bulk upload successful',
      excelFile: excelFilePath
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};



/* ======================================================
   GET ALL VISITS (Finance)
====================================================== */
exports.getVisits = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM iv_visits ORDER BY id DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Failed to fetch visits' });
  }
};

/* ======================================================
   GET STUDENTS BY VISIT
====================================================== */
exports.getStudentsByVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT
        id,
        student_name,
        register_number,
        email,
        phone,
        department,
        certificate_no,
        certificate_generated,
        certificate_path,
        paid_status
      FROM iv_students
      WHERE visit_id = ?
      ORDER BY id ASC
    `, [id]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};



/* ======================================================
   MARK PAYMENT
====================================================== */
// exports.markPaid = async (req, res) => {
//   try {

//     const { id } = req.params;

//     await db.query(`
//       UPDATE iv_visits SET paid_status = 1 WHERE id = ?
//     `, [id]);

//     res.json({ message: 'Payment updated' });

//   } catch {
//     res.status(500).json({ message: 'Payment update failed' });
//   }
// };


/* ======================================================
   GENERATE CERTIFICATE (ONLY PAID)
====================================================== */
exports.generate = async (req, res) => {

  try {

    const { id } = req.params;

    const [[row]] = await db.query(`
      SELECT s.*, v.college_name, v.college_short_name, v.visit_date, v.paid_status
      FROM iv_students s
      JOIN iv_visits v ON s.visit_id = v.id
      WHERE s.id = ?
    `, [id]);

    if (!row) return res.status(404).send('Not found');
    if (!row.paid_status)
      return res.status(400).send('Payment not completed');


    /* ================= CERT NO ================= */
    let certNo = row.certificate_no;

    if (!certNo) {
      certNo = generateIVCertNo(
        row.college_short_name,
        row.visit_date
      );

      await db.query(`
        UPDATE iv_students
        SET certificate_generated = 1, certificate_no = ?
        WHERE id = ?
      `, [certNo, id]);
    }


    /* ================= ⭐ USE NEW IV HELPER ================= */
    const pdfBuffer = await generateIVCertificate({
      name: row.student_name,
      institution: row.college_name,
      department: row.department,
      visitDate: row.visit_date,
      certificateNo: certNo
    }, db);


    /* ================= SAVE FILE ================= */
    const short = safeName(row.college_short_name);

    const folder = path.join(
      __dirname,
      `../../uploads/iv/${short}`
    );

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const safeCertNo = certNo.replace(/[\/\\]/g, '_');
    const pdfPath = path.join(folder, `${safeCertNo}.pdf`);

    fs.writeFileSync(pdfPath, pdfBuffer);


    await db.query(`
      UPDATE iv_students
      SET certificate_path = ?
      WHERE id = ?
    `, [`iv/${short}/${safeCertNo}.pdf`, id]);


    /* ================= SEND ================= */
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${safeCertNo}.pdf`
    });

    res.send(pdfBuffer);

  }
  catch (err) {
    console.error(err);
    res.status(500).send('Certificate generation failed');
  }
};


/* ======================================================
   UPDATE PAYMENT (FINANCE)
====================================================== */
exports.updatePayment = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      payment_mode,
      amount,
      transaction_id,
      payment_date,
      received_by
    } = req.body;

    /* ================= VISIT UPDATE ================= */
    await db.query(`
      UPDATE iv_visits
      SET
        payment_mode = ?,
        amount = ?,
        transaction_id = ?,
        payment_date = ?,
        received_by = ?,
        paid_status = 1
      WHERE id = ?
    `, [payment_mode, amount, transaction_id, payment_date, received_by, id]);


    /* ================= GET STUDENTS ================= */
    const [students] = await db.query(`
      SELECT s.*, v.college_name, v.college_short_name, v.visit_date
      FROM iv_students s
      JOIN iv_visits v ON s.visit_id = v.id
      WHERE s.visit_id = ?
      AND s.certificate_generated = 0
    `, [id]);


    for (const student of students) {

      /* ========= CERTIFICATE NUMBER ========= */
      const certNo = generateIVCertNo(
        student.college_short_name,
        student.visit_date
      );

      /* ========= GENERATE PDF ========= */
      const pdfBuffer = await generateIVCertificate({
        name: student.student_name,
        institution: student.college_name,
        department: student.department,
        visitDate: student.visit_date,
        certificateNo: certNo
      }, db);

      const short = safeName(student.college_short_name);

      const folder = path.join(
        __dirname,
        `../../uploads/iv/${short}`
      );

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const safeCertNo = certNo.replace(/[\/\\]/g, '_');
      const pdfPath = path.join(folder, `${safeCertNo}.pdf`);

      fs.writeFileSync(pdfPath, pdfBuffer);

      /* ========= UPDATE DB ========= */
      await db.query(`
        UPDATE iv_students
        SET
          certificate_generated = 1,
          certificate_no = ?,
          certificate_path = ?,
          paid_status = 1
        WHERE id = ?
      `, [
        certNo,
        `iv/${short}/${safeCertNo}.pdf`,
        student.id
      ]);
    }

    /* ================= UPDATE VISIT COUNTS ================= */

// Count generated certificates
const [[countResult]] = await db.query(`
  SELECT COUNT(*) AS generated
  FROM iv_students
  WHERE visit_id = ?
  AND certificate_generated = 1
`, [id]);

const generatedCount = countResult.generated;

// Get total count
const [[visitInfo]] = await db.query(`
  SELECT total_count
  FROM iv_visits
  WHERE id = ?
`, [id]);

const totalCount = visitInfo.total_count;

// Update iv_visits
await db.query(`
  UPDATE iv_visits
  SET
    generated_count = ?,
    certificate_generated = ?
  WHERE id = ?
`, [
  generatedCount,
  generatedCount === totalCount,
  id
]);


    res.json({
      message: 'Payment updated and certificates generated successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
};


exports.getCertificateSummary = async (req, res) => {
  try {

    const [colleges] = await db.query(`
      SELECT
        v.id,
        v.college_name,
        COUNT(s.id) AS count
      FROM iv_visits v
      LEFT JOIN iv_students s
        ON s.visit_id = v.id
        AND s.certificate_generated = 1
      GROUP BY v.id, v.college_name
      ORDER BY v.id DESC
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) AS total
      FROM iv_students
      WHERE certificate_generated = 1
    `);

    res.json({
      colleges,
      total: total[0]?.total || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};


exports.bulkDownloadCertificates = async (req, res) => {
  try {

    const { visitId } = req.params;

    // Get visit info
    const [[visit]] = await db.query(`
      SELECT college_short_name
      FROM iv_visits
      WHERE id = ?
    `, [visitId]);

    if (!visit) return res.status(404).send('Visit not found');

    const short = safeName(visit.college_short_name);

    // Get generated certificates
    const [students] = await db.query(`
      SELECT certificate_no, certificate_path
      FROM iv_students
      WHERE visit_id = ?
      AND certificate_generated = 1
      AND certificate_path IS NOT NULL
    `, [visitId]);

    if (!students.length) {
      return res.status(400).send('No certificates generated');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${short}_certificates.zip`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    students.forEach(student => {
      const filePath = path.join(
        __dirname,
        `../../uploads/${student.certificate_path}`
      );

      if (fs.existsSync(filePath)) {
        archive.file(filePath, {
          name: `${student.certificate_no}.pdf`
        });
      }
    });

    await archive.finalize();

  } catch (err) {
    console.error(err);
    res.status(500).send('Bulk download failed');
  }
};

const db = require('../../db');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const { generateBulkSdpIfEligible } = require('../../utils/bulk_sdp_eligibility.helper');
const { generateSDPCertificate } = require('../../utils/bulkSDPcertificate.helper');
const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


/* ======================================================
   BULK UPLOAD (LAB BASED)
====================================================== */
exports.bulkUpload = async (req, res) => {

  try {

    const {
      collegeName,
      collegeShortName,
      fromDate,
      toDate,
      labId
    } = req.body;

    if (!collegeName || !collegeShortName || !fromDate || !toDate || !labId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const short = safeName(collegeShortName);

    const uploadDir = path.join(
      __dirname,
      `../../uploads/sdp_bulk/${short}`
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let excelFile = null;

    if (req.file) {
      excelFile = `sdp_bulk/${short}/${req.file.filename}`;
    }

    const students = req.body.students
      ? JSON.parse(req.body.students)
      : [];

    if (!students.length) {
      return res.status(400).json({ message: 'No students found' });
    }

    /* ===== INSERT BATCH ===== */
    const [batch] = await db.query(`
      INSERT INTO sdp_batches
      (college_name, college_short_name, from_date, to_date,
       excel_file, total_students, lab_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      collegeName,
      short,
      fromDate,
      toDate,
      excelFile,
      students.length,
      labId
    ]);

    const batchId = batch.insertId;

    /* ===== INSERT STUDENTS ===== */
    const values = students.map(s => [
      batchId,
      labId,
      s.student_name,
      s.register_no,
      s.department,
      s.phone,
      s.email,
      s.from_date,
      s.to_date
    ]);

    await db.query(`
      INSERT INTO sdp_students_bulk
      (batch_id, lab_id, student_name, register_no,
       department, phone, email, from_date, to_date)
      VALUES ?
    `, [values]);

    res.json({ message: 'SDP bulk upload success' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};


/* ======================================================
   GET ALL BATCHES
====================================================== */
exports.getBatches = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT
        id,
        college_name,
        college_short_name,
        from_date,
        to_date,
        total_students,
        payment_mode,
        amount,
        transaction_id,
        payment_date,
        received_by,
        paid_status,
        generated_count
      FROM sdp_batches
      ORDER BY id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
};



/* ======================================================
   GET STUDENTS
====================================================== */
exports.getStudents = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT s.*, l.name AS programme
      FROM sdp_students_bulk s
      JOIN labs l ON s.lab_id = l.id
      WHERE s.batch_id = ?
    `, [id]);

    res.json(rows);

  } catch {
    res.status(500).json({ message: 'Error' });
  }
};

/* ======================================================
   Mark Attendance by TL
====================================================== */
exports.markAttendance = async (req, res) => {
  try {

    const { studentId } = req.params;
    const { presentDates } = req.body;

    const presentCount = presentDates.length;

    const [[student]] = await db.query(`
      SELECT from_date, to_date, batch_id
      FROM sdp_students_bulk
      WHERE id = ?
    `, [studentId]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const start = new Date(student.from_date);
    const end = new Date(student.to_date);

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const percentage = (presentCount / totalDays) * 100;

    await db.query(`
      UPDATE sdp_students_bulk
      SET
        present_dates = ?,
        present_count = ?,
        total_days = ?,
        attendance_percentage = ?
      WHERE id = ?
    `, [
      JSON.stringify(presentDates),
      presentCount,
      totalDays,
      percentage,
      studentId
    ]);

    /* ⭐ Generate if eligible */
    await generateBulkSdpIfEligible(student.batch_id);

    res.json({ message: 'Attendance updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Attendance failed' });
  }
};

/* ======================================================
   PAYMENT + CERTIFICATE GENERATION
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

    await db.query(`
      UPDATE sdp_batches
      SET
        payment_mode = ?,
        amount = ?,
        transaction_id = ?,
        payment_date = ?,
        received_by = ?,
        paid_status = 1
      WHERE id = ?
    `, [payment_mode, amount, transaction_id, payment_date, received_by, id]);

    await generateBulkSdpIfEligible(id);

    res.json({
      message: 'Payment updated & certificates generated'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
};

/* ======================================================
   DOWNLOAD SINGLE CERTIFICATE
====================================================== */
exports.downloadSingleCertificate = async (req, res) => {
  try {

    const { studentId } = req.params;

    const [[student]] = await db.query(`
      SELECT
        s.*,
        b.college_name,
        l.name AS programme
      FROM sdp_students_bulk s
      JOIN sdp_batches b ON s.batch_id = b.id
      JOIN labs l ON s.lab_id = l.id
      WHERE s.id = ?
    `, [studentId]);

    if (!student || !student.certificate_generated) {
      return res.status(400).json({
        message: 'Not eligible or certificate not generated'
      });
    }

    const pdfBuffer = await generateSDPCertificate(
      {
        name: student.student_name,
        institution: student.college_name,
        department: student.department,
        programme: student.programme, // ✅ LAB NAME
        startDate: student.from_date,
        endDate: student.to_date,
        certificateNo: student.certificate_no
      },
      db
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${student.certificate_no}.pdf`
    );

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send('Download failed');
  }
};
/* ======================================================
   BULK DOWNLOAD
====================================================== */
exports.bulkDownload = async (req, res) => {

  const safeFileName = (name = '') =>
    name.replace(/[\/\\?%*:|"<>]/g, '-');

  try {

    const { batchId } = req.params;

    const [students] = await db.query(`
      SELECT
        s.*,
        b.college_name,
        l.name AS programme
      FROM sdp_students_bulk s
      JOIN sdp_batches b ON s.batch_id = b.id
      JOIN labs l ON s.lab_id = l.id
      WHERE s.batch_id = ?
      AND s.certificate_generated = 1
    `, [batchId]);

    if (!students.length) {
      return res.status(400).send('No certificates generated');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=SDP_CERTIFICATES_${batchId}.zip`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', err => {
      console.error('ZIP ERROR:', err);
      res.status(500).end();
    });

    archive.pipe(res);

for (const student of students) {

  const pdfBuffer = await generateSDPCertificate (
    {
      name: student.student_name,
      institution: student.college_name,
      department: student.department,
      programme: student.programme,
      startDate: student.from_date,
      endDate: student.to_date,
      certificateNo: student.certificate_no
    },
    db
  );

  // ✅ DEBUG
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    console.error("PDF generation failed for:", student.certificate_no);
    continue; // skip instead of crashing
  }

  const fileName = safeFileName(`${student.certificate_no}.pdf`);

  archive.append(pdfBuffer, { name: fileName });
}

    await archive.finalize();

  } catch (err) {
    console.error(err);
    res.status(500).send('Download failed');
  }
};

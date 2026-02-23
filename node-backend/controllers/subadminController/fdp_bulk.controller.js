const db = require('../../db');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const { generateBulkFdpIfEligible } = require('../../utils/bulk_fdp_eligibility.helper');
const { generateFDPCertificate } = require('../../utils/bulkFDPcertificate.helper');

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


/* ======================================================
   BULK UPLOAD (FACULTY BASED)
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
      `../../uploads/fdp_bulk/${short}`
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let excelFile = null;

    if (req.file) {
      excelFile = `fdp_bulk/${short}/${req.file.filename}`;
    }

    const staff = req.body.students
      ? JSON.parse(req.body.students)
      : [];

    if (!staff.length) {
      return res.status(400).json({ message: 'No faculty found' });
    }

    /* ===== INSERT BATCH ===== */
    const [batch] = await db.query(`
      INSERT INTO fdp_batches
      (college_name, college_short_name, from_date, to_date,
       excel_file, total_students, lab_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      collegeName,
      short,
      fromDate,
      toDate,
      excelFile,
      staff.length,
      labId
    ]);

    const batchId = batch.insertId;

    /* ===== INSERT FACULTY ===== */
    const values = staff.map(s => [
      batchId,
      labId,
      s.staff_name,
      s.staff_id,
      s.department,
      s.phone,
      s.email,
      s.from_date,
      s.to_date
    ]);

    await db.query(`
      INSERT INTO fdp_staff_bulk
      (batch_id, lab_id, staff_name, staff_id,
       department, phone, email, from_date, to_date)
      VALUES ?
    `, [values]);

    res.json({ message: 'FDP bulk upload success' });

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
      SELECT *
      FROM fdp_batches
      ORDER BY id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
};


/* ======================================================
   GET FACULTY
====================================================== */
exports.getStudents = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT s.*, l.name AS programme
      FROM fdp_staff_bulk s
      JOIN labs l ON s.lab_id = l.id
      WHERE s.batch_id = ?
    `, [id]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error' });
  }
};


/* ======================================================
   ATTENDANCE
====================================================== */
exports.markAttendance = async (req, res) => {
  try {

    const { studentId } = req.params;
    const { presentDates } = req.body;

    const presentCount = presentDates.length;

    const [[staff]] = await db.query(`
      SELECT from_date, to_date, batch_id
      FROM fdp_staff_bulk
      WHERE id = ?
    `, [studentId]);

    if (!staff) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const start = new Date(staff.from_date);
    const end = new Date(staff.to_date);

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const percentage = (presentCount / totalDays) * 100;

    await db.query(`
      UPDATE fdp_staff_bulk
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

    await generateBulkFdpIfEligible(staff.batch_id);

    res.json({ message: 'Attendance updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Attendance failed' });
  }
};


/* ======================================================
   PAYMENT
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
      UPDATE fdp_batches
      SET
        payment_mode = ?,
        amount = ?,
        transaction_id = ?,
        payment_date = ?,
        received_by = ?,
        paid_status = 1
      WHERE id = ?
    `, [payment_mode, amount, transaction_id, payment_date, received_by, id]);

    await generateBulkFdpIfEligible(id);

    res.json({ message: 'Payment updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
};


/* ======================================================
   BULK DOWNLOAD
====================================================== */
exports.bulkDownload = async (req, res) => {

  try {

    const { batchId } = req.params;

    const [staff] = await db.query(`
      SELECT s.*, b.college_name, l.name AS programme
      FROM fdp_staff_bulk s
      JOIN fdp_batches b ON s.batch_id = b.id
      JOIN labs l ON s.lab_id = l.id
      WHERE s.batch_id = ?
      AND s.certificate_generated = 1
    `, [batchId]);

    if (!staff.length) {
      return res.status(400).send('No certificates');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=FDP_CERTIFICATES_${batchId}.zip`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const s of staff) {

      const pdf = await generateFDPCertificate({
        name: s.staff_name,
        institution: s.college_name,
        department: s.department,
        programme: s.programme,
        startDate: s.from_date,
        endDate: s.to_date,
        certificateNo: s.certificate_no
      }, db);

      archive.append(pdf, { name: `${s.certificate_no}.pdf` });
    }

    await archive.finalize();

  } catch (err) {
    console.error(err);
    res.status(500).send('Download failed');
  }
};

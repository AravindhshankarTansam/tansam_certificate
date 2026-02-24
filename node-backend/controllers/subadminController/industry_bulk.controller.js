const db = require('../../db');
const archiver = require('archiver');

const { generateBulkIndustryIfEligible } = require('../../utils/bulk_industry_eligibility.helper');
const { generateIndustryCertificate } = require('../../utils/bulkIndustryCertificate.helper');

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


/* ======================================================
   BULK UPLOAD (INDUSTRY)
====================================================== */
exports.bulkUpload = async (req, res) => {
  try {

    const {
      companyName,
      companyShortName,
      fromDate,
      toDate,
      labId
    } = req.body;

    if (!companyName || !companyShortName || !fromDate || !toDate || !labId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const employees = req.body.employees
      ? JSON.parse(req.body.employees)
      : [];

    if (!employees.length) {
      return res.status(400).json({ message: 'No employees found' });
    }

    const short = safeName(companyShortName);

    /* ===== INSERT BATCH ===== */
    const [batch] = await db.query(`
      INSERT INTO industry_batches
      (company_name, company_short_name, from_date, to_date,
       total_employees, lab_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      companyName,
      short,
      fromDate,
      toDate,
      employees.length,
      labId
    ]);

    const batchId = batch.insertId;

    /* ===== INSERT EMPLOYEES ===== */
    const values = employees.map(e => [
      batchId,
      labId,
      e.employee_name,
      e.employee_id_no,
      e.department,
      e.phone,
      e.email,
      e.from_date,
      e.to_date
    ]);

    await db.query(`
      INSERT INTO industry_employee_bulk
      (batch_id, lab_id, employee_name, employee_id_no,
       department, phone, email, from_date, to_date)
      VALUES ?
    `, [values]);

    res.json({ message: 'Industry bulk upload success' });

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
      FROM industry_batches
      ORDER BY id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed' });
  }
};


/* ======================================================
   GET EMPLOYEES
====================================================== */
exports.getEmployees = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT e.*, l.name AS programme
      FROM industry_employee_bulk e
      JOIN labs l ON e.lab_id = l.id
      WHERE e.batch_id = ?
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

    const { employeeId } = req.params;
    const { presentDates } = req.body;

    const presentCount = presentDates.length;

    const [[emp]] = await db.query(`
      SELECT from_date, to_date, batch_id
      FROM industry_employee_bulk
      WHERE id = ?
    `, [employeeId]);

    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const start = new Date(emp.from_date);
    const end = new Date(emp.to_date);

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const percentage = (presentCount / totalDays) * 100;

    await db.query(`
      UPDATE industry_employee_bulk
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
      employeeId
    ]);

    await generateBulkIndustryIfEligible(emp.batch_id);

    res.json({ message: 'Attendance updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed' });
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
      UPDATE industry_batches
      SET
        payment_mode = ?,
        amount = ?,
        transaction_id = ?,
        payment_date = ?,
        received_by = ?,
        paid_status = 1
      WHERE id = ?
    `, [payment_mode, amount, transaction_id, payment_date, received_by, id]);

    await generateBulkIndustryIfEligible(id);

    res.json({ message: 'Payment updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed' });
  }
};


/* ======================================================
   BULK DOWNLOAD
====================================================== */
exports.bulkDownload = async (req, res) => {

  try {

    const { batchId } = req.params;

    const [employees] = await db.query(`
      SELECT e.*, b.company_name, l.name AS programme
      FROM industry_employee_bulk e
      JOIN industry_batches b ON e.batch_id = b.id
      JOIN labs l ON e.lab_id = l.id
      WHERE e.batch_id = ?
      AND e.certificate_generated = 1
    `, [batchId]);

    if (!employees.length) {
      return res.status(400).send('No certificates');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=INDUSTRY_CERTIFICATES_${batchId}.zip`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const e of employees) {

      const pdf = await generateIndustryCertificate({
        name: e.employee_name,
        institution: e.company_name,
        department: e.department,
        programme: e.programme,
        startDate: e.from_date,
        endDate: e.to_date,
        certificateNo: e.certificate_no
      }, db);

      archive.append(pdf, { name: `${e.certificate_no}.pdf` });
    }

    await archive.finalize();

  } catch (err) {
    console.error(err);
    res.status(500).send('Download failed');
  }
};
/* ======================================================
   DOWNLOAD SINGLE INDUSTRY CERTIFICATE
====================================================== */
exports.downloadSingleCertificate = async (req, res) => {
  try {

    const { employeeId } = req.params;

    const [[emp]] = await db.query(`
      SELECT
        e.*,
        b.company_name,
        l.name AS programme
      FROM industry_employee_bulk e
      JOIN industry_batches b ON e.batch_id = b.id
      JOIN labs l ON e.lab_id = l.id
      WHERE e.id = ?
    `, [employeeId]);

    if (!emp || !emp.certificate_generated) {
      return res.status(400).json({
        message: 'Not eligible or certificate not generated'
      });
    }

    /* ✅ Use original certificate number */
    const originalCertNo = emp.certificate_no;

    const pdfBuffer = await generateIndustryCertificate(
      {
        name: emp.employee_name,
        institution: emp.company_name,
        department: emp.department,
        programme: emp.programme,
        startDate: emp.from_date,
        endDate: emp.to_date,
        certificateNo: originalCertNo
      },
      db
    );

    /* ✅ Safe filename */
    const safeFileName =
      originalCertNo.replace(/[\/\\?%*:|"<>]/g, '-');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${safeFileName}.pdf`
    );

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send('Download failed');
  }
};

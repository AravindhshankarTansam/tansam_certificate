const db = require('../../db');
const { generateIVCertificate } = require('../../utils/ivCertificate.helper');
const { generateIVCertNo } = require('../../utils/certNo.helper');
const archiver = require('archiver');

/* ======================================================
   SMALL HELPERS
====================================================== */

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


/* ======================================================
   BULK UPLOAD
====================================================== */

exports.bulkUpload = async (req, res) => {
  try {

    const { collegeName, collegeShortName, visitDate } = req.body;

    if (!collegeName || !collegeShortName || !visitDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const short = safeName(collegeShortName);

    const parsedStudents = req.body.students
      ? JSON.parse(req.body.students)
      : [];

    if (!parsedStudents.length) {
      return res.status(400).json({ message: 'No students found' });
    }

    const [visit] = await db.query(`
      INSERT INTO iv_visits
      (college_name, college_short_name, visit_date, total_count)
      VALUES (?, ?, ?, ?)
    `, [
      collegeName,
      short,
      visitDate,
      parsedStudents.length
    ]);

    const visitId = visit.insertId;

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

    res.json({ message: 'Bulk upload successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};



/* ======================================================
   GET ALL VISITS
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
   GENERATE CERTIFICATE (DOWNLOAD)
====================================================== */

exports.generate = async (req, res) => {
  try {

    const { id } = req.params;

    const [[row]] = await db.query(`
      SELECT
        s.*,
        v.college_name,
        v.college_short_name,
        v.visit_date,
        v.paid_status
      FROM iv_students s
      JOIN iv_visits v ON s.visit_id = v.id
      WHERE s.id = ?
    `, [id]);

    if (!row) {
      return res.status(404).send('Student not found');
    }

    if (!row.paid_status) {
      return res.status(400).send('Payment not completed');
    }

    let certNo = row.certificate_no;

    if (!certNo) {

      certNo = generateIVCertNo(
        row.college_short_name,
        row.visit_date
      );

      await db.query(`
        UPDATE iv_students
        SET
          certificate_generated = 1,
          certificate_no = ?
        WHERE id = ?
      `, [certNo, id]);
    }

    const pdfBuffer = await generateIVCertificate({
      name: row.student_name,
      institution: row.college_name,
      department: row.department,
      visitDate: row.visit_date,
      certificateNo: certNo
    }, db);

    const safeCertNo = certNo.replace(/[\/\\]/g, '_');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${safeCertNo}.pdf`
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).send('Certificate generation failed');
  }
};



/* ======================================================
   UPDATE PAYMENT
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


    const [students] = await db.query(`
      SELECT s.*, v.college_short_name, v.visit_date
      FROM iv_students s
      JOIN iv_visits v ON s.visit_id = v.id
      WHERE s.visit_id = ?
      AND s.certificate_generated = 0
    `, [id]);


    for (const student of students) {

      const certNo = generateIVCertNo(
        student.college_short_name,
        student.visit_date
      );

      await db.query(`
        UPDATE iv_students
        SET
          certificate_generated = 1,
          certificate_no = ?,
          paid_status = 1
        WHERE id = ?
      `, [
        certNo,
        student.id
      ]);
    }


    const [[countResult]] = await db.query(`
      SELECT COUNT(*) AS generated
      FROM iv_students
      WHERE visit_id = ?
      AND certificate_generated = 1
    `, [id]);

    const generatedCount = countResult.generated;

    const [[visitInfo]] = await db.query(`
      SELECT total_count
      FROM iv_visits
      WHERE id = ?
    `, [id]);

    const totalCount = visitInfo.total_count;

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
      message: 'Payment updated and certificate numbers generated'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
};



/* ======================================================
   CERTIFICATE SUMMARY
====================================================== */

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



/* ======================================================
   BULK DOWNLOAD CERTIFICATES (ZIP)
====================================================== */

exports.bulkDownloadCertificates = async (req, res) => {
  try {

    const { visitId } = req.params;

    /* ===============================
       GET VISIT
    =============================== */
    const [[visit]] = await db.query(
      `SELECT college_short_name FROM iv_visits WHERE id = ?`,
      [visitId]
    );

    if (!visit) {
      return res.status(404).send("Visit not found");
    }

    const short = visit.college_short_name.replace(/[^a-zA-Z0-9_-]/g, "");

    /* ===============================
       GET STUDENTS
    =============================== */
    const [students] = await db.query(`
      SELECT
        s.student_name,
        s.department,
        s.certificate_no,
        v.college_name,
        v.visit_date
      FROM iv_students s
      JOIN iv_visits v ON s.visit_id = v.id
      WHERE s.visit_id = ?
      AND s.certificate_generated = 1
      ORDER BY s.id ASC
    `, [visitId]);

    if (!students.length) {
      return res.status(400).send("No certificates generated");
    }

    console.log("Generating certificates:", students.length);

    /* ===============================
       SET ZIP HEADERS
    =============================== */
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${short}_certificates.zip`
    );

    /* ===============================
       CREATE ARCHIVER
    =============================== */
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).send("Archive failed");
      }
    });

    archive.pipe(res);

    /* ===============================
       GENERATE PDFs AND ADD TO ZIP
    =============================== */
    for (const student of students) {
      try {

        const pdf = await generateIVCertificate({
          name: student.student_name,
          institution: student.college_name,
          department: student.department,
          visitDate: student.visit_date,
          certificateNo: student.certificate_no
        }, db);

        if (!pdf) {
          console.error("PDF empty:", student.certificate_no);
          continue;
        }

        const buffer = Buffer.from(pdf);

        const safeCertNo = student.certificate_no.replace(/[\/\\]/g, "_");

        archive.append(buffer, {
          name: `${safeCertNo}.pdf`
        });

      } catch (err) {
        console.error("Certificate failed:", student.certificate_no, err);
      }
    }

    /* ===============================
       FINALIZE ZIP
    =============================== */
    await archive.finalize();

  } catch (err) {
    console.error("Bulk download failed:", err);
    if (!res.headersSent) {
      res.status(500).send("Bulk download failed");
    }
  }
};

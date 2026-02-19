const db = require('../db');
const fs = require('fs');
const path = require('path');

const { generateCertificate } = require('./certificate.helper');
const { generateSDPCertNo } = require('./certNo.helper');

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


exports.generateBulkSdpIfEligible = async (batchId) => {
  try {

    const [students] = await db.query(`
      SELECT
        s.*,
        b.college_name,
        b.college_short_name,
        b.paid_status AS batch_paid
      FROM sdp_students_bulk s
      JOIN sdp_batches b ON s.batch_id = b.id
      WHERE s.batch_id = ?
        AND s.certificate_generated = 0
    `, [batchId]);

    let generatedCount = 0;

    for (const student of students) {

      if (
        student.batch_paid !== 1 ||
        student.attendance_percentage < 90
      ) continue;

      const certNo = generateSDPCertNo(
        student.college_short_name,
        student.from_date
      );

      /* ===== Generate PDF ===== */
      const pdfBuffer = await generateCertificate(
        {
          name: student.student_name,
          institution: student.college_name,
          department: student.department,
          programme: 'SDP',
          startDate: student.from_date,
          endDate: student.to_date,
          certificateNo: certNo
        },
        db
      );

      const short = safeName(student.college_short_name);

      const folder = path.join(
        __dirname,
        `../uploads/sdp/${short}`
      );

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const safeCertNo = certNo.replace(/[\/\\]/g, '_');

      fs.writeFileSync(
        path.join(folder, `${safeCertNo}.pdf`),
        pdfBuffer
      );

      await db.query(`
        UPDATE sdp_students_bulk
        SET
          certificate_generated = 1,
          certificate_no = ?,
          certificate_path = ?
        WHERE id = ?
      `, [
        certNo,
        `sdp/${short}/${safeCertNo}.pdf`,
        student.id
      ]);

      generatedCount++;
    }

    await db.query(`
      UPDATE sdp_batches
      SET generated_count = generated_count + ?
      WHERE id = ?
    `, [generatedCount, batchId]);

    return generatedCount;

  } catch (err) {
    console.error('Eligibility error:', err);
    throw err;
  }
};

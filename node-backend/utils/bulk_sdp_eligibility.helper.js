const db = require('../db');
const fs = require('fs');
const path = require('path');
const { generateSDPCertNo } = require('./certNo.helper');

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


exports.generateBulkSdpIfEligible = async (batchId) => {
  try {

    const [students] = await db.query(`
      SELECT
        s.*,
        b.paid_status AS batch_paid,
        b.college_short_name
      FROM sdp_students_bulk s
      JOIN sdp_batches b ON s.batch_id = b.id
      WHERE s.batch_id = ?
        AND s.certificate_generated = 0
    `, [batchId]);

    let generatedCount = 0;

    for (const student of students) {

      if (
        student.batch_paid !== 1 ||
        student.attendance_percentage < 90 ||
        student.certificate_generated === 1
      ) continue;

      const certNo = generateSDPCertNo(
        student.college_short_name,
        student.from_date
      );

      /* ✅ Only save certificate number */
      await db.query(`
        UPDATE sdp_students_bulk
        SET
          certificate_generated = 1,
          certificate_no = ?
        WHERE id = ?
      `, [certNo, student.id]);

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

const db = require('../db');
const { generateFDPCertNo } = require('./certNo.helper');

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


/* ======================================================
   FDP BULK ELIGIBILITY + CERTIFICATE NUMBER GENERATION
====================================================== */
exports.generateBulkFdpIfEligible = async (batchId) => {
  try {

    /* ===== FETCH STAFF ===== */
    const [staff] = await db.query(`
      SELECT
        s.*,
        b.paid_status AS batch_paid,
        b.college_short_name
      FROM fdp_staff_bulk s
      JOIN fdp_batches b ON s.batch_id = b.id
      WHERE s.batch_id = ?
        AND s.certificate_generated = 0
    `, [batchId]);

    let generatedCount = 0;

    for (const s of staff) {

      /* ===== ELIGIBILITY RULE ===== */
      if (
        s.batch_paid !== 1 ||          // Payment must be completed
        s.attendance_percentage < 90 || // Minimum attendance
        s.certificate_generated === 1
      ) continue;

      /* ===== GENERATE CERTIFICATE NUMBER ===== */
      const certNo = generateFDPCertNo(
        s.college_short_name,
        s.from_date
      );

      /* ===== UPDATE DATABASE ===== */
      await db.query(`
        UPDATE fdp_staff_bulk
        SET
          certificate_generated = 1,
          certificate_no = ?
        WHERE id = ?
      `, [certNo, s.id]);

      generatedCount++;
    }

    /* ===== UPDATE BATCH COUNT ===== */
    await db.query(`
      UPDATE fdp_batches
      SET generated_count = generated_count + ?
      WHERE id = ?
    `, [generatedCount, batchId]);

    return generatedCount;

  } catch (err) {
    console.error('FDP Eligibility error:', err);
    throw err;
  }
};

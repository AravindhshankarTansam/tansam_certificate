const db = require('../db');
const fs = require('fs');
const path = require('path');
const { generateIndustryCertNo } = require('./certNo.helper');

const safeName = (name = '') =>
  name.replace(/[^a-zA-Z0-9_-]/g, '');


exports.generateBulkIndustryIfEligible = async (batchId) => {
  try {

    const [employees] = await db.query(`
      SELECT
        e.*,
        b.paid_status AS batch_paid,
        b.company_short_name
      FROM industry_employee_bulk e
      JOIN industry_batches b ON e.batch_id = b.id
      WHERE e.batch_id = ?
        AND e.certificate_generated = 0
    `, [batchId]);

    let generatedCount = 0;

    for (const emp of employees) {

      /* ===== ELIGIBILITY ===== */
      if (
        emp.batch_paid !== 1 ||
        emp.attendance_percentage < 90 ||
        emp.certificate_generated === 1
      ) continue;

      /* ===== GENERATE CERTIFICATE NUMBER ===== */
      const certNo = generateIndustryCertNo(
        emp.company_short_name,
        emp.from_date
      );

      /* ===== UPDATE DATABASE ===== */
      await db.query(`
        UPDATE industry_employee_bulk
        SET
          certificate_generated = 1,
          certificate_no = ?
        WHERE id = ?
      `, [certNo, emp.id]);

      generatedCount++;
    }

    /* ===== UPDATE BATCH GENERATED COUNT ===== */
    await db.query(`
      UPDATE industry_batches
      SET generated_count = generated_count + ?
      WHERE id = ?
    `, [generatedCount, batchId]);

    return generatedCount;

  } catch (err) {
    console.error('Industry Eligibility error:', err);
    throw err;
  }
};
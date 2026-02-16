const db = require('../db');
const { generateCertificate } = require('./certificate.helper');
const { generateIVCertNo } = require('./certNo.helper');
const { generateAccessToken } = require('./token.helper');
const { sendCertificateMail } = require('../services/mail.service');

exports.checkAndGenerateCertificate = async (table, id) => {

  const [[row]] = await db.query(
    `SELECT * FROM ${table} WHERE id=?`,
    [id]
  );

  if (!row) return;

  if (
    row.paid_status &&
    Number(row.attendance_percentage) >= 90 &&
    !row.certificate_generated
  ) {

    const map = {
      sdp_students: 'SDP',
      fdp_staff: 'FDP',
      industry_staff: 'IND'
    };

    const short = map[table];

    const certNo =
      row.certificate_no ||
      generateIVCertNo(short, row.to_date);

    /* ===== Generate PDF ===== */
    await generateCertificate(
      {
        name:
          row.student_name ||
          row.staff_name ||
          row.industry_staff_name,

        institution:
          row.college_name ||
          row.industry_name,

        department:
          row.department ||
          row.designation_name,

        programme: short,
        startDate: row.from_date,
        endDate: row.to_date,
        certificateNo: certNo
      },
      db
    );

    /* ===== Save ===== */
    await db.query(
      `UPDATE ${table}
       SET certificate_no=?, certificate_generated=1
       WHERE id=?`,
      [certNo, id]
    );

    /* ===== Token ===== */
    const token = generateAccessToken();

    await db.query(
      `INSERT INTO certificate_access (type, user_id, access_token)
       VALUES (?, ?, ?)`,
      [short.toLowerCase(), id, token]
    );

    /* ===== Mail ===== */
    if (row.email) {
      await sendCertificateMail(row.email, token);
    }

    console.log('✅ Certificate generated & mail sent');
  }
};

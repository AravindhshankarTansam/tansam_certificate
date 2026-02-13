const { generateCertificate } = require('./certificate.helper');
const { generateIVCertNo } = require('./certNo.helper');

const certShortMap = {
  sdp_students: 'SDP',
  fdp_staff: 'FDP',
  industry_staff: 'IND'
};

exports.tryGenerateCertificate = async (table, row, db) => {
  if (
    row.paid_status === 1 &&
    Number(row.attendance_percentage) >= 90 &&
    row.certificate_generated === 0
  ) {
    const short = certShortMap[table];
    if (!short) return;

    const certNo =
      row.certificate_no ||
      generateIVCertNo(short, row.to_date);

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

    await db.query(
      `
      UPDATE ${table}
      SET
        certificate_no = ?,
        certificate_generated = 1
      WHERE id = ?
      `,
      [certNo, row.id]
    );
  }
};

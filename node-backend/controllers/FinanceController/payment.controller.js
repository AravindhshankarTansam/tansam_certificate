const db = require('../../db');
const { checkAndGenerateCertificate } = require('../../utils/certificateTrigger.helper');

const { tryGenerateCertificate } = require('../../utils/certificate.trigger');
/* =====================================================
   SDP PAYMENT
===================================================== */
exports.updateSDP = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_mode, amount, transaction_id, payment_date } = req.body;

    await db.query(
      `
      UPDATE sdp_students
      SET
        payment_mode=?,
        amount=?,
        transaction_id=?,
        payment_date=?,
        paid_status=1
      WHERE id=?
    `, [payment_mode, amount, transaction_id, payment_date, id]);
await checkAndGenerateCertificate('sdp_students', id);
      `,
      [payment_mode, amount, transaction_id, payment_date, id]
    );

    /* 🔥 FETCH UPDATED ROW */
    const [[row]] = await db.query(
      `SELECT * FROM sdp_students WHERE id=?`,
      [id]
    );

    /* 🔥 TRY AUTO CERTIFICATE */
    await tryGenerateCertificate('sdp_students', row, db);

    res.json({ message: 'SDP payment updated' });

  } catch (err) {
    console.error('SDP PAYMENT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};



/* =====================================================
   FDP PAYMENT
===================================================== */
exports.updateFDP = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_mode, amount, transaction_id, payment_date } = req.body;

    await db.query(
      `
      UPDATE fdp_staff
      SET
        payment_mode=?,
        amount=?,
        transaction_id=?,
        payment_date=?,
        paid_status=1
      WHERE id=?
    `, [payment_mode, amount, transaction_id, payment_date, id]);
await checkAndGenerateCertificate('fdp_staff', id);
      `,
      [payment_mode, amount, transaction_id, payment_date, id]
    );

    const [[row]] = await db.query(
      `SELECT * FROM fdp_staff WHERE id=?`,
      [id]
    );

    await tryGenerateCertificate('fdp_staff', row, db);

    res.json({ message: 'FDP payment updated' });

  } catch (err) {
    console.error('FDP PAYMENT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};



/* =====================================================
   INDUSTRY PAYMENT
===================================================== */
exports.updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_mode, amount, transaction_id, payment_date } = req.body;

    await db.query(
      `
      UPDATE industry_staff
      SET
        payment_mode=?,
        amount=?,
        transaction_id=?,
        payment_date=?,
        paid_status=1
      WHERE id=?
    `, [payment_mode, amount, transaction_id, payment_date, id]);
await checkAndGenerateCertificate('industry_staff', id);
      `,
      [payment_mode, amount, transaction_id, payment_date, id]
    );

    const [[row]] = await db.query(
      `SELECT * FROM industry_staff WHERE id=?`,
      [id]
    );

    await tryGenerateCertificate('industry_staff', row, db);

    res.json({ message: 'Industry payment updated' });

  } catch (err) {
    console.error('INDUSTRY PAYMENT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

const db = require('../../db');

/* =====================================================
   SDP PAYMENT
===================================================== */
exports.updateSDP = async (req, res) => {
  try {

    const { id } = req.params;
    const { payment_mode, amount, transaction_id, payment_date } = req.body;

    await db.query(`
      UPDATE sdp_students
      SET payment_mode=?,
          amount=?,
          transaction_id=?,
          payment_date=?,
          paid_status=TRUE
      WHERE id=?
    `, [payment_mode, amount, transaction_id, payment_date, id]);

    res.json({ message: 'SDP payment updated' });

  } catch (err) {
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

    await db.query(`
      UPDATE fdp_staff
      SET payment_mode=?,
          amount=?,
          transaction_id=?,
          payment_date=?,
          paid_status=TRUE
      WHERE id=?
    `, [payment_mode, amount, transaction_id, payment_date, id]);

    res.json({ message: 'FDP payment updated' });

  } catch (err) {
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

    await db.query(`
      UPDATE industry_staff
      SET payment_mode=?,
          amount=?,
          transaction_id=?,
          payment_date=?,
          paid_status=TRUE
      WHERE id=?
    `, [payment_mode, amount, transaction_id, payment_date, id]);

    res.json({ message: 'Industry payment updated' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

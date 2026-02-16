const db = require('../db');
const { sendOtpMail } = require('../services/mail.service');
const { generateOtp } = require('../services/otp.service');

exports.verifyId = async (req, res) => {

  const { token, idValue } = req.body;

  const [[access]] = await db.query(
    `SELECT * FROM certificate_access WHERE access_token=?`,
    [token]
  );

  if (!access) return res.status(400).json('Invalid link');

  const tableMap = {
    sdp: 'sdp_students',
    fdp: 'fdp_staff',
    industry: 'industry_staff'
  };

  const columnMap = {
    sdp: 'register_no',
    fdp: 'staff_id_no',
    industry: 'industry_staff_id'
  };

  const table = tableMap[access.type];
  const column = columnMap[access.type];

  const [[user]] = await db.query(
    `SELECT * FROM ${table} WHERE id=? AND ${column}=?`,
    [access.user_id, idValue]
  );

  if (!user) return res.status(400).json('Mismatch');

  const otp = generateOtp();

  await db.query(`
    UPDATE certificate_access
    SET otp=?, otp_expiry=DATE_ADD(NOW(), INTERVAL 5 MINUTE)
    WHERE id=?
  `, [otp, access.id]);

  await sendOtpMail(user.email, otp);

  res.json('OTP sent');
};


exports.verifyOtp = async (req, res) => {

  const { token, otp } = req.body;

  const [[access]] = await db.query(
    `SELECT * FROM certificate_access WHERE access_token=?`,
    [token]
  );

  if (!access || access.otp !== otp) {
    return res.status(400).json('Invalid OTP');
  }

  await db.query(`
    UPDATE certificate_access SET verified=1 WHERE id=?`,
    [access.id]
  );

  res.json('Verified');
};


exports.getProfile = async (req, res) => {

  const { token } = req.params;

  const [[access]] = await db.query(
    `SELECT * FROM certificate_access WHERE access_token=?`,
    [token]
  );

  if (!access || !access.verified) {
    return res.status(403).json('Unauthorized');
  }

  const tableMap = {
    sdp: 'sdp_students',
    fdp: 'fdp_staff',
    industry: 'industry_staff'
  };

  const table = tableMap[access.type];

  const [[user]] = await db.query(
    `SELECT * FROM ${table} WHERE id=?`,
    [access.user_id]
  );

  res.json(user);
};


exports.downloadCertificate = async (req, res) => {

  const { token } = req.params;

  const [[access]] = await db.query(
    `SELECT * FROM certificate_access WHERE access_token=?`,
    [token]
  );

  if (!access || !access.verified) {
    return res.status(403).send('Unauthorized');
  }

  // res.redirect(`/generate/${access.type}/${access.user_id}`);
  res.redirect(`/api/certificate/generate/${access.type}/${access.user_id}`);

};

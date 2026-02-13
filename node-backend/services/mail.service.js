const nodemailer = require('nodemailer');

let transporter;

/* =====================================================
   CREATE SMTP
===================================================== */
async function initMailer() {

  /* =========================
     PRODUCTION → HOSTINGER
  ========================= */
  if (process.env.NODE_ENV === 'production') {

    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    console.log('✅ Hostinger SMTP ready');

  } else {

    /* =========================
       LOCAL → ETHEREAL
    ========================= */
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('✅ Ethereal test mail ready');
  }
}

initMailer();


/* =====================================================
   CERTIFICATE MAIL
===================================================== */
exports.sendCertificateMail = async (email, token) => {

  const link = `${process.env.FRONTEND_URL}/certificate-access/${token}`;

  const info = await transporter.sendMail({
    from: `"Certificate Team" <${process.env.MAIL_USER || 'test@test.com'}>`,
    to: email,
    subject: 'Your Certificate is Ready',
    html: `
      <h2>Your Certificate is Ready 🎉</h2>
      <p>Click below to access:</p>
      <a href="${link}">${link}</a>
    `
  });

  /* Show preview in local */
  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Mail Preview:', nodemailer.getTestMessageUrl(info));
  }
};


/* =====================================================
   OTP MAIL
===================================================== */
exports.sendOtpMail = async (email, otp) => {

  const info = await transporter.sendMail({
    from: `"Certificate Team" <${process.env.MAIL_USER || 'test@test.com'}>`,
    to: email,
    subject: 'OTP Verification',
    html: `<h2>Your OTP: ${otp}</h2>`
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 OTP Preview:', nodemailer.getTestMessageUrl(info));
  }
};

const nodemailer = require('nodemailer');

let transporter;

/* =====================================================
   INITIALIZE MAILER
===================================================== */
async function getTransporter() {

  if (transporter) return transporter;

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

  return transporter;
}


/* =====================================================
   CERTIFICATE MAIL
===================================================== */
exports.sendCertificateMail = async (email, token) => {

  const transporter = await getTransporter();

  const link = `${process.env.FRONTEND_URL}/certificate-access/${token}`;

  const info = await transporter.sendMail({
    from: `"TANSAM Certificates - Do Not Reply" <${process.env.MAIL_USER || 'noreply@test.com'}>`,
    to: email,
    subject: 'Your Certificate is Ready',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your Certificate is Ready</h2>

        <p>
          Congratulations! Your certificate has been generated successfully.
        </p>

        <p>
          Click the secure button below to access your certificate.
        </p>

        <p>
          <a href="${link}"
             style="background:#2563eb;color:white;
             padding:12px 20px;text-decoration:none;
             border-radius:6px;">
             Access Certificate
          </a>
        </p>

        <p>
          This link requires OTP verification for security.
        </p>

        <hr/>

        <p style="font-size:12px;color:#666;">
          This is an automated email. Please do not reply to this message.
          If you need assistance, contact the TANSAM support team.
        </p>
      </div>
    `
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Mail Preview:', nodemailer.getTestMessageUrl(info));
  }
};



/* =====================================================
   OTP MAIL
===================================================== */
exports.sendOtpMail = async (email, otp) => {

  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"TANSAM OTP Service - Do Not Reply" <${process.env.MAIL_USER || 'noreply@test.com'}>`,
    to: email,
    subject: 'OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your OTP Code</h2>

        <h1 style="letter-spacing:4px;">${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>

        <hr/>

        <p style="font-size:12px;color:#666;">
          This is an automated message. Please do not reply.
        </p>
      </div>
    `
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 OTP Preview:', nodemailer.getTestMessageUrl(info));
  }
};

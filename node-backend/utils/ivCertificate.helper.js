const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');


/* ======================================
   DATE FORMAT
====================================== */
const formatDate = (d) => {
  if (!d) return '';

  const dt = new Date(d);

  return `${String(dt.getDate()).padStart(2,'0')}/${
    String(dt.getMonth()+1).padStart(2,'0')}/${
    dt.getFullYear()}`;
};


/* =====================================================
   SAFE BASE64 IMAGE
===================================================== */
const imgBase64 = (relPath) => {
  try {
    const full = path.resolve(process.cwd(), relPath);

    if (!fs.existsSync(full)) return '';

    const file = fs.readFileSync(full);
    const ext = path.extname(full).replace('.', '');

    return `data:image/${ext};base64,${file.toString('base64')}`;
  }
  catch {
    return '';
  }
};
/* ======================================
   SAFE BASE64 IMAGE
====================================== */
const toBase64 = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return '';
    return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
  } catch {
    return '';
  }
};


/* ======================================
   MAIN IV CERTIFICATE GENERATOR
====================================== */
exports.generateIVCertificate = async (data, db) => {

  /* ================= TEMPLATE ================= */
  let html = fs.readFileSync(
    path.join(__dirname, '../templates_iv/iv_certificate.html'),
    'utf8'
  );

  const css = fs.readFileSync(
    path.join(__dirname, '../templates_iv/iv_certificate.css'),
    'utf8'
  );

  html = html.replace('{{styles}}', `<style>${css}</style>`);


  /* ================= SIGNATURE ================= */
  const [[sign]] = await db.query(`
    SELECT name, designation, signature
    FROM certificate_signatures
    WHERE is_active=1
    LIMIT 1
  `);

  const signatureImg = sign
    ? toBase64(
        path.join(__dirname, `../uploads/signatures/${sign.signature}`)
      )
    : '';


      /* =============================
     STATIC IMAGES
  ============================== */
const logo = toBase64(path.join(__dirname, '../public/images/logo.png'));
const tidco = toBase64(path.join(__dirname, '../public/images/tidco.png'));
const tansam = toBase64(path.join(__dirname, '../public/images/tansam.png'));
const siemens = toBase64(path.join(__dirname, '../public/images/siemens1.png'));
const watermark = toBase64(path.join(__dirname, '../public/images/watermark.png'));




  /* ================= QR ================= */
  const qr = await QRCode.toDataURL(
    `http://localhost:4200/verify/${encodeURIComponent(data.certificateNo)}`,
    { width: 500 }
  );


  /* ================= REPLACER ================= */
  const r = (k,v) =>
    html = html.replace(new RegExp(k,'g'), v || '');


  r('{{name}}', data.name);
  r('{{college_name}}', data.institution);
  r('{{visited_date}}', formatDate(data.visitDate));
  r('{{department}}', data.department);
  r('{{certificateNo}}', data.certificateNo);
  r('{{qrCode}}', qr);
  r('{{signatureImage}}', signatureImg);
  r('{{signName}}', sign?.name);
  r('{{signDesignation}}', sign?.designation);
  r('{{logoPath}}', logo);
  r('{{tidcoLogo}}', tidco);
  r('{{tansamLogo}}', tansam);
  r('{{siemensLogo}}', siemens);
  r('{{watermark}}', watermark);

  /* ================= PUPPETEER ================= */
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });

  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true
  });

  await browser.close();

  return pdf;
};

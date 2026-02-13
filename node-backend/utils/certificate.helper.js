const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');


/* =====================================================
   PDF QUALITY + LANDSCAPE HELPER
===================================================== */
const createPDF = async (page, quality = 'high') => {

  const base = {
    format: 'A4',
    landscape: true,      // ⭐ landscape mode
    printBackground: true
  };

  // smaller stored copy
  if (quality === 'low') {
    return page.pdf({
      ...base,
      scale: 0.9
    });
  }

  // high quality download
  return page.pdf({
    ...base,
    scale: 1
  });
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


/* =====================================================
   DATE FORMAT
===================================================== */
const formatDate = (d) => {
  if (!d) return '';

  const dt = new Date(d);

  return `${String(dt.getDate()).padStart(2,'0')}/${
    String(dt.getMonth()+1).padStart(2,'0')}/${
    dt.getFullYear()}`;
};


/* =====================================================
   MAIN GENERATOR
===================================================== */
exports.generateCertificate = async (data, db) => {

  let html = fs.readFileSync(
    path.join(__dirname, '../templates/certificate.html'),
    'utf8'
  );

  const css = fs.readFileSync(
    path.join(__dirname, '../templates/certificate.css'),
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

  const emptyImg =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

  const signatureImg = sign
    ? imgBase64(`uploads/signatures/${sign.signature}`) || emptyImg
    : emptyImg;

  /* ================= IMAGES ================= */
  const logo = imgBase64('public/images/logo.png') || emptyImg;
  const tidco = imgBase64('public/images/tidco.png') || emptyImg;
  const tansam = imgBase64('public/images/tansam.png') || emptyImg;
  const siemens = imgBase64('public/images/siemens1.png') || emptyImg;
  const watermark = imgBase64('public/images/watermark.png') || emptyImg;

  /* ================= QR ================= */
  const qr = await QRCode.toDataURL(
    `http://localhost:4200/verify/${data.certificateNo}`,
    { width: 600, margin: 1 }
  );

  /* ================= REPLACE ================= */
  const r = (k, v) =>
    html = html.replace(new RegExp(k, 'g'), v ?? '');

  r('{{name}}', data.name);
  r('{{institution}}', data.institution);
  r('{{department}}', data.department);
  r('{{programme}}', data.programme);
  r('{{startDate}}', formatDate(data.startDate));
  r('{{endDate}}', formatDate(data.endDate));
  r('{{certificateNo}}', data.certificateNo);
  r('{{qrCode}}', qr);
  r('{{logoPath}}', logo);
  r('{{tidcoLogo}}', tidco);
  r('{{tansamLogo}}', tansam);
  r('{{siemensLogo}}', siemens);
  r('{{signatureImage}}', signatureImg);
  r('{{signName}}', sign?.name || '');
  r('{{signDesignation}}', sign?.designation || '');
  r('{{watermark}}', watermark);

  /* ================= PUPPETEER ================= */
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'load'
  });

  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    scale: 1
  });

  await browser.close();

  return pdf; // 🔥 THIS IS THE KEY
};

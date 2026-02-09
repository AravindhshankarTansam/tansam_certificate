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


  /* =============================
     SIGNATURE FROM DB
  ============================== */
  const [[sign]] = await db.query(`
    SELECT name, designation, signature
    FROM certificate_signatures
    WHERE is_active=1
    LIMIT 1
  `);

  const signatureImg = sign
    ? imgBase64(`uploads/signatures/${sign.signature}`)
    : '';

  const signName = sign?.name || '';
  const signDesignation = sign?.designation || '';


  /* =============================
     STATIC IMAGES
  ============================== */
  const logo = imgBase64('public/images/logo.png');
  const tidco = imgBase64('public/images/tidco.png');
  const tansam = imgBase64('public/images/tansam.png');
  const siemens = imgBase64('public/images/siemens1.png');
  const watermark = imgBase64('public/images/watermark.png');


  /* =============================
     QR
  ============================== */
  const verifyUrl =
    `http://192.168.1.79:4200/verify/${encodeURIComponent(data.certificateNo)}`;

  const qr = await QRCode.toDataURL(verifyUrl, {
    width: 600,
    margin: 1
  });


  /* =============================
     REPLACE VALUES
  ============================== */
  const r = (k,v) =>
    html = html.replace(new RegExp(k,'g'), v || '');

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
  r('{{signName}}', signName);
  r('{{signDesignation}}', signDesignation);
  r('{{watermark}}', watermark);

  /* =============================
     PUPPETEER
  ============================== */
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });

  const highQualityPDF = await createPDF(page, 'high');
  const lowQualityPDF  = await createPDF(page, 'low');

  await browser.close();

  return {
    highQualityPDF,
    lowQualityPDF
  };
};

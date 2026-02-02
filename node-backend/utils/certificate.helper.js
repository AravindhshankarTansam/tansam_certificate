const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');


/* =====================================================
   SAFE BASE64 IMAGE + DEBUG
===================================================== */
const imgBase64 = (relPath) => {
  try {
    const full = path.resolve(process.cwd(), relPath);

    console.log('📂 Loading image ->', full);

    if (!fs.existsSync(full)) {
      console.log('❌ File NOT FOUND:', full);
      return '';
    }

    const file = fs.readFileSync(full);
    const ext = path.extname(full).replace('.', '');

    console.log('✅ Image loaded OK');

    return `data:image/${ext};base64,${file.toString('base64')}`;
  }
  catch (e) {
    console.log('❌ Image error:', e.message);
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

  console.log('\n==============================');
  console.log('🎓 GENERATING CERTIFICATE');
  console.log('Name:', data.name);
  console.log('Certificate No:', data.certificateNo);
  console.log('==============================\n');


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
     🔥 SIGNATURE FROM DB (DEBUG)
  ============================== */
  const [[sign]] = await db.query(`
    SELECT name, designation, signature
    FROM certificate_signatures
    WHERE is_active=1
    LIMIT 1
  `);

  console.log('🖊 Signature row from DB ->', sign);

  const signatureImg = sign
    ? imgBase64(`uploads/signatures/${sign.signature}`)
    : '';

  if (!signatureImg)
    console.log('❌ Signature BASE64 empty');
  else
    console.log('✅ Signature BASE64 ready');

  const signName = sign?.name || '';
  const signDesignation = sign?.designation || '';


  /* =============================
     🔥 STATIC IMAGES
  ============================== */
  const logo = imgBase64('public/images/logo.png');
  const tidco = imgBase64('public/images/tidco.png');
  const tansam = imgBase64('public/images/tansam.png');
  const siemens = imgBase64('public/images/siemens1.png');


  /* =============================
     🔥 QR
  ============================== */
  const verifyUrl =
    `http://localhost:4200/api/certificate/verify/${data.certificateNo}`;

  console.log('🔗 QR URL ->', verifyUrl);

const qr = await QRCode.toDataURL(verifyUrl, {
  width: 600,   // 🔥 high resolution
  margin: 1
});


  if (!qr)
    console.log('❌ QR FAILED');
  else
    console.log('✅ QR GENERATED');


  /* =============================
     🔥 REPLACE
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


  /* =============================
     🔥 PUPPETEER
  ============================== */
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
    printBackground: true
  });

  await browser.close();

  console.log('✅ PDF GENERATED SUCCESS\n');

  return pdf;
};

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


/* ======================================
   SAFE BASE64 IMAGE
====================================== */
const toBase64 = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log("Missing file:", filePath);
      return '';
    }
    return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
  } catch (e) {
    console.log("Base64 error:", e);
    return '';
  }
};


exports.generateIndustryCertificate = async (data, db) => {

  try {

    /* ===== TEMPLATE ===== */
    const templatePath = path.join(
      process.cwd(),
      'templates/certificate.html'
    );

    const cssPath = path.join(
      process.cwd(),
      'templates/certificate.css'
    );

    console.log("Industry Template path:", templatePath);
    console.log("Industry CSS path:", cssPath);
    console.log("Generating Industry certificate:", data.certificateNo);


    let html = fs.readFileSync(templatePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    html = html.replace('{{styles}}', `<style>${css}</style>`);


    /* ===== SIGNATURE ===== */
    const [[sign]] = await db.query(`
      SELECT name, designation, signature
      FROM certificate_signatures
       WHERE is_active = 1 AND designation = 'CEO'
      LIMIT 1
    `);

    const signatureImg = sign
      ? toBase64(
          path.join(process.cwd(), 'uploads/signatures', sign.signature)
        )
      : '';


    /* ===== STATIC IMAGES ===== */
    const logo = toBase64(path.join(process.cwd(), 'public/images/logo.png'));
    const tidco = toBase64(path.join(process.cwd(), 'public/images/tidco.png'));
    const tansam = toBase64(path.join(process.cwd(), 'public/images/tansam.png'));
    const siemens = toBase64(path.join(process.cwd(), 'public/images/siemens1.png'));
    const watermark = toBase64(path.join(process.cwd(), 'public/images/watermark.png'));


    /* ===== QR ===== */
    const qr = await QRCode.toDataURL(
      `http://localhost:4200/verify/${encodeURIComponent(data.certificateNo)}`,
      { width: 500 }
    );


    /* ===== REPLACE ===== */
    const r = (k, v) =>
      html = html.replace(new RegExp(k, 'g'), v || '');

    r('{{name}}', data.name);
    r('{{institution}}', data.institution); // company name
    r('{{department}}', data.department);
    r('{{programme}}', data.programme);
    r('{{startDate}}', formatDate(data.startDate));
    r('{{endDate}}', formatDate(data.endDate));
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


    /* ===== PUPPETEER ===== */
const browser = await puppeteer.launch({
  headless: true,
  // args: [
  //   '--no-sandbox',
  //   '--disable-setuid-sandbox',
  //   '--disable-dev-shm-usage',
  //   '--disable-gpu',
  //   '--no-zygote',
  //   '--single-process'
  // ]
});

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true
    });

    await browser.close();

    return pdf;

  } catch (err) {
    console.error("Industry CERT ERROR FULL:", err.stack || err);
    return null;
  }
};

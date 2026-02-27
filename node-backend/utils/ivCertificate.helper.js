const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

/* DATE FORMAT */
const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${
    String(dt.getMonth()+1).padStart(2,'0')}/${
    dt.getFullYear()}`;
};

/* SAFE BASE64 IMAGE */
const toBase64 = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn("Missing signature/image file:", filePath);
      return '';
    }
    const ext = path.extname(filePath).slice(1).toLowerCase() || 'png';
    const buffer = fs.readFileSync(filePath);
    return `data:image/${ext};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error("Base64 conversion failed:", e);
    return '';
  }
};

exports.generateIVCertificate = async (data, db) => {
  try {
    /* ================= TEMPLATE & CSS ================= */
    const templatePath = path.join(process.cwd(), 'templates_iv/iv_certificate.html');
    const cssPath = path.join(process.cwd(), 'templates_iv/iv_certificate.css');

    console.log("Template path:", templatePath);
    console.log("CSS path:", cssPath);
    console.log("Generating IV certificate for:", data.certificateNo);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file missing: ${templatePath}`);
    }
    if (!fs.existsSync(cssPath)) {
      throw new Error(`CSS file missing: ${cssPath}`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');

    html = html.replace('{{styles}}', `<style>${css}</style>`);

    /* ================= FETCH TWO ACTIVE SIGNATURES ================= */
    const [signatures] = await db.query(`
      SELECT name, designation, signature
      FROM certificate_signatures
      WHERE is_active = 1
      ORDER BY id ASC
      LIMIT 2
    `);

    const leftSign = signatures[0] || null;
    const leftSignatureImg = leftSign 
      ? toBase64(path.join(process.cwd(), 'uploads/signatures', leftSign.signature))
      : '';

    const rightSign = signatures[1] || null;
    const rightSignatureImg = rightSign 
      ? toBase64(path.join(process.cwd(), 'uploads/signatures', rightSign.signature))
      : '';

    /* ================= STATIC IMAGES ================= */
const logo = toBase64(path.join(__dirname, '../public/images/logo.png'));
const tidco = toBase64(path.join(__dirname, '../public/images/tidco.png'));
const tansam = toBase64(path.join(__dirname, '../public/images/tansam.png'));
const siemens = toBase64(path.join(__dirname, '../public/images/siemens1.png'));
const watermark = toBase64(path.join(__dirname, '../public/images/watermark.png'));

    /* ================= QR CODE ================= */
    const qr = await QRCode.toDataURL(
      `http://localhost:4200/verify/${encodeURIComponent(data.certificateNo)}`,
      { width: 500 }
    );

    /* ================= REPLACE PLACEHOLDERS ================= */
    const r = (key, value) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    };

    r('name', data.name);
    r('college_name', data.institution || data.college_name || '');
    r('department', data.department || '');
    r('visited_date', formatDate(data.visitDate));
    r('certificateNo', data.certificateNo);
    r('qrCode', qr);

    r('leftSignatureImage', leftSignatureImg);
    r('leftSignName', leftSign?.name || '');
    r('leftSignDesignation', leftSign?.designation || '');

    r('rightSignatureImage', rightSignatureImg);
    r('rightSignName', rightSign?.name || '');
    r('rightSignDesignation', rightSign?.designation || '');

    r('logoPath', logo);
    r('tidcoLogo', tidco);
    r('tansamLogo', tansam);
    r('siemensLogo', siemens);
    r('watermark', watermark);

    /* ================= PUPPETEER PDF GENERATION ================= */
    const browser = await puppeteer.launch({
      headless: 'new',
    
      timeout: 60000
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000
    });

    // Compatible delay (works in all puppeteer versions)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      timeout: 60000
    });

    await browser.close();

    console.log("PDF generated successfully, size:", pdf.length, "bytes");

    return pdf;

  } catch (err) {
    console.error("IV CERTIFICATE GENERATION ERROR:", err.message || err);
    console.error("Full error stack:", err.stack);
    throw err;
  }
};
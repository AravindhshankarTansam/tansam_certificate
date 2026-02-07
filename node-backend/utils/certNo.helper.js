const crypto = require('crypto');

const pad = n => String(n).padStart(2,'0');

const randomCode = () =>
  crypto.randomBytes(5)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g,'')
    .substring(0,7)
    .toUpperCase();

exports.generateIVCertNo = (short, date) => {

  const d = new Date(date);

  const ym = `${d.getFullYear()}${pad(d.getMonth()+1)}`;
  const full = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;

  return `TCOE/${ym}/${short}/${full}/${randomCode()}`;
};

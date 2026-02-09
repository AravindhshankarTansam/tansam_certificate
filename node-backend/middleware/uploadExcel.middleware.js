const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ========= SAFE NAME ========= */
const safeName = (name) =>
  name.replace(/[^a-zA-Z0-9_-]/g, ''); // prevent ../ hacks


/* ========= STORAGE ========= */
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const short = safeName(req.body.collegeShortName || 'common');

    const uploadDir = path.join(
      __dirname,
      `../uploads/iv/${short}`
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const date = new Date().toISOString().split('T')[0];

    cb(null, `${date}-${Date.now()}${path.extname(file.originalname)}`);
  }
});


/* ========= FILE FILTER ========= */
const fileFilter = (req, file, cb) => {

  const allowed = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files allowed'), false);
  }
};


/* ========= EXPORT ========= */
module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

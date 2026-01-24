const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'uploads/signatures',
  filename: (_, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (_, file, cb) => {
  if (file.mimetype === 'image/png') cb(null, true);
  else cb(new Error('Only PNG allowed'), false);
};

module.exports = multer({ storage, fileFilter });

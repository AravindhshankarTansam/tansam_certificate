const router = require('express').Router();
const controller = require('../controllers/certificateAccess.controller');

router.post('/verify-id', controller.verifyId);
router.post('/verify-otp', controller.verifyOtp);

router.get('/profile/:token', controller.getProfile);
router.get('/download/:token', controller.downloadCertificate);

module.exports = router;

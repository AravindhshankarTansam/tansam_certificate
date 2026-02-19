const express = require('express');
const router = express.Router();

const controller = require('../../controllers/subadminController/sdp_bulk.controller');
const uploadExcel = require('../../middleware/uploadExcel.middleware');

const {
  isAdminOrSubAdmin,
  isFinance,
  isTeamLead
} = require('../../middleware/role.middleware');


/* ================= BULK UPLOAD ================= */
router.post(
  '/bulk-upload',
  isAdminOrSubAdmin,
  uploadExcel.single('file'),
  controller.bulkUpload
);

/*  COMMON BATCH LIST */
router.get('/batches', controller.getBatches);

/* ================= STUDENTS ================= */
router.get('/batch/:id/students', controller.getStudents);

/* ================= ATTENDANCE ================= */
router.put('/attendance/:studentId', isTeamLead, controller.markAttendance);

/* ================= PAYMENT ================= */
router.put('/payment/:id', isFinance, controller.updatePayment);

/* ================= DOWNLOAD ================= */
router.get('/bulk-download/:batchId', controller.bulkDownload);

module.exports = router;

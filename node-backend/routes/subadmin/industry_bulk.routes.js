const express = require('express');
const router = express.Router();

const controller = require('../../controllers/subadminController/industry_bulk.controller');
const uploadExcel = require('../../middleware/uploadExcel.middleware');
const {
  isAdminOrSubAdmin,
  isFinance,
  isTeamLead
} = require('../../middleware/role.middleware');


router.post('/bulk-upload',
  isAdminOrSubAdmin,
  uploadExcel.single('file'),
  controller.bulkUpload
);

router.get('/batches', controller.getBatches);
router.get('/batch/:id/employees', controller.getEmployees);
router.put('/attendance/:employeeId', isTeamLead, controller.markAttendance);
router.put('/payment/:id', isFinance, controller.updatePayment);
router.get('/bulk-download/:batchId', controller.bulkDownload);
/* ================= SINGLE DOWNLOAD ================= */
router.get('/download/:employeeId', controller.downloadSingleCertificate);

module.exports = router;

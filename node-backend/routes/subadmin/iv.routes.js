const express = require('express');
const router = express.Router();

const controller = require('../../controllers/subadminController/iv.controller');
const uploadExcel = require('../../middleware/uploadExcel.middleware');

const { isAdminOrSubAdmin, isFinance } =
  require('../../middleware/role.middleware');


/* ==============================
   BULK UPLOAD + FILE SAVE
============================== */

router.post(
  '/bulk-generate',
  isAdminOrSubAdmin,
  uploadExcel.single('file'),   // ⭐ important
  controller.bulkUpload
);

router.get('/visits', isFinance, controller.getVisits);
router.get('/sub-admin/visits', isAdminOrSubAdmin,controller.getVisits)
router.get('/visit/:id/students', controller.getStudentsByVisit);
router.put('/visit/payment/:id', isFinance, controller.updatePayment);
router.put('/pay/:id', isFinance, controller.markPaid);
router.get('/generate/:id', controller.generate);

module.exports = router;

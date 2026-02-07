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
router.put('/pay/:id', isFinance, controller.markPaid);
router.get('/generate/:id', isFinance, controller.generate);

module.exports = router;

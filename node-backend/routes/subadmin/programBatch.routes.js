const express = require('express');
const router = express.Router();

const controller =
  require('../../controllers/subadminController/programBatch.controller');

const uploadBatchExcel =
  require('../../middleware/uploadBatchExcel.middleware');

const {
  isAdmin,
  isSubAdmin,
  isAdminOrSubAdmin,
  isFinance
} = require('../../middleware/role.middleware');

router.post(
  '/batch-upload',
  isAdminOrSubAdmin,
  uploadBatchExcel.single('file'),
  controller.bulkUploadBatch
);


/* =====================================================
   GET ALL BATCHES
===================================================== */
router.get(
  '/batches',
  isAdminOrSubAdmin,
  isFinance, // Only finance can see all batches
  controller.getBatches
);


/* =====================================================
   GET SINGLE BATCH
===================================================== */
router.get(
  '/batch/:id',
  isAdminOrSubAdmin,
  controller.getBatchById
);

module.exports = router;

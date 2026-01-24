const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/adminController/master-table/certificateSignature.controller');
const upload = require('../../../middleware/uploadSignature');

const { isAuth } = require('../../../middleware/auth.middleware');
const { isAdmin } = require('../../../middleware/role.middleware');


router.get('/get', isAuth, isAdmin, controller.getAll);

router.post('/post',
  isAuth,
  isAdmin,
  upload.single('signature'),
  controller.add
);

router.put('/update/:id',
  isAuth,
  isAdmin,
  upload.single('signature'),
  controller.update
);

module.exports = router;

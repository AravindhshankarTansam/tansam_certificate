const express = require('express');
const router = express.Router();

const labsController = require('../../../controllers/adminController/master-table/labs.controller');

const { isAuth } = require('../../../middleware/auth.middleware');
const { isAdmin } = require('../../../middleware/role.middleware');
const { isAdminOrSubAdmin } = require('../../../middleware/role.middleware');

/* ================= ROUTES ================= */

router.get('/get', isAuth, isAdminOrSubAdmin, labsController.getLabs);
router.post('/post', isAuth, isAdminOrSubAdmin, labsController.addLab);

router.put('/update/:id', isAuth, isAdmin, labsController.updateLab);

module.exports = router;

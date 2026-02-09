const express = require('express');
const router = express.Router();

const controller = require('../../controllers/subadminController/fdp.controller');

const { isAuth } = require('../../middleware/auth.middleware');
const { isAdminOrSubAdmin, isAdmin } = require('../../middleware/role.middleware');

router.get('/get', isAuth, isAdminOrSubAdmin, controller.getAll);
router.post('/post', isAuth, isAdminOrSubAdmin, controller.add);
router.put('/update/:id', isAuth, isAdminOrSubAdmin, controller.update);

module.exports = router;

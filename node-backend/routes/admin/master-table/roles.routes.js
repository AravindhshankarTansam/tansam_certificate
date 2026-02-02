const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/adminController/master-table/roles.controller');
const { isAdminOrSubAdmin } = require('../../../middleware/role.middleware');
const { isAuth } = require('../../../middleware/auth.middleware');
const { isAdmin } = require('../../../middleware/role.middleware');


router.get('/get', isAuth, isAdmin, controller.getRoles);
router.post('/post', isAuth, isAdminOrSubAdmin, controller.addRole);
router.put('/update/:id', isAuth, isAdmin, controller.updateRole);
router.delete('/delete/:id', isAuth, isAdmin, controller.deleteRole);

module.exports = router;

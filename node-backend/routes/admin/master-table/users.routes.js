const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/adminController/master-table/users.controller');

const { isAuth } = require('../../../middleware/auth.middleware');
const { isAdmin } = require('../../../middleware/role.middleware');

router.get('/get', isAuth, isAdmin, controller.getUsers);
router.get('/roles', isAuth, isAdmin, controller.getRolesDropdown);

router.post('/post', isAuth, isAdmin, controller.addUser);
router.put('/update/:id', isAuth, isAdmin, controller.updateUser);

module.exports = router;

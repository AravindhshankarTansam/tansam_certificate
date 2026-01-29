const express = require('express');
const router = express.Router();

const holidaysController = require('../../../controllers/adminController/master-table/holidays.controller');

const { isAuth } = require('../../../middleware/auth.middleware');
const { isAdmin, isAdminOrSubAdmin } = require('../../../middleware/role.middleware');


/* ================= ROUTES ================= */

/* GET holidays (view) */
router.get(
  '/get',
  isAuth,
  isAdminOrSubAdmin,
  holidaysController.getHolidays
);


/* ADD holiday */
router.post(
  '/post',
  isAuth,
  isAdminOrSubAdmin,
  holidaysController.addHoliday
);


/* UPDATE holiday */
router.put(
  '/update/:id',
  isAuth,
  isAdmin,
  holidaysController.updateHoliday
);


/* DELETE holiday */
router.delete(
  '/delete/:id',
  isAuth,
  isAdmin,
  holidaysController.deleteHoliday
);


module.exports = router;

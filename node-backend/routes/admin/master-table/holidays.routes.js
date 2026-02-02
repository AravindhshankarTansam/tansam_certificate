const express = require('express');
const router = express.Router();

const holidaysController = require('../../../controllers/adminController/master-table/holidays.controller');

const { isAuth } = require('../../../middleware/auth.middleware');
const { allowRoles, isAdmin } = require('../../../middleware/role.middleware');
const { isTeamLead } = require('../../../middleware/role.middleware');


/* =====================================================
   HOLIDAYS ROUTES
===================================================== */


/* =====================================================
   GET HOLIDAYS (View only)
   ✅ Admin
   ✅ Sub Admin
   ✅ Team Lead
===================================================== */
router.get(
  '/get',
  isAuth,
  allowRoles('admin', 'sub admin', 'team lead'),
  holidaysController.getHolidays
);


/* =====================================================
   ADD HOLIDAY
   ✅ Admin
   ✅ Sub Admin
===================================================== */
router.post(
  '/post',
  isAuth,
  allowRoles('admin', 'sub admin'),
  holidaysController.addHoliday
);


/* =====================================================
   UPDATE HOLIDAY
   ✅ Admin only
===================================================== */
router.put(
  '/update/:id',
  isAuth,
  isAdmin,
  holidaysController.updateHoliday
);


/* =====================================================
   DELETE HOLIDAY
   ✅ Admin only
===================================================== */
router.delete(
  '/delete/:id',
  isAuth,
  isAdmin,
  holidaysController.deleteHoliday
);

/* =====================================================
   TEAM LEAD → VIEW HOLIDAYS ONLY (READ ONLY)
===================================================== */

router.get(
  '/get',
  isAuth,
  isTeamLead,
  holidaysController.getHolidays
);


module.exports = router;

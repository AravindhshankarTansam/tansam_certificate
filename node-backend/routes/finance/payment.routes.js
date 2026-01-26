const router = require('express').Router();

const { isLoggedIn, isFinance } = require('../../middleware/role.middleware');
const controller = require('../../controllers/FinanceController/payment.controller');


/* ================= FINANCE ONLY ================= */

router.put('/sdp/:id', isLoggedIn, isFinance, controller.updateSDP);

router.put('/fdp/:id', isLoggedIn, isFinance, controller.updateFDP);

router.put('/industry/:id', isLoggedIn, isFinance, controller.updateIndustry);

module.exports = router;

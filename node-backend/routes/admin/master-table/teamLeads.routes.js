const express = require('express');
const router = express.Router();

const teamLeadsController = require('../../../controllers/adminController/master-table/teamLeads.controller');

const { isAuth } = require('../../../middleware/auth.middleware');
const { isAdmin } = require('../../../middleware/role.middleware');


/* ================= ROUTES ================= */

/* GET ALL TEAM LEADS */
router.get('/get', isAuth, isAdmin, teamLeadsController.getTeamLeads);

/* GET LABS FOR DROPDOWN */
router.get('/labs', isAuth, isAdmin, teamLeadsController.getLabsDropdown);

/* ADD TEAM LEAD */
router.post('/post', isAuth, isAdmin, teamLeadsController.addTeamLead);

/* UPDATE TEAM LEAD */
router.put('/update/:id', isAuth, isAdmin, teamLeadsController.updateTeamLead);

/* DELETE TEAM LEAD (optional but recommended) */
router.delete('/delete/:id', isAuth, isAdmin, teamLeadsController.deleteTeamLead);


module.exports = router;

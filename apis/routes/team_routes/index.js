const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction"); //to authentication
let roleAccess = require("../../middlewares/roleAccess");//to check applied role match with token role

const teamMemberController = require('../../controllers/teamMemberController');

router.get('/team-member', authentication.checkUserAuthentication, teamMemberController.getTeamMember);
router.get('/get-am-admin',authentication.checkUserAuthentication, teamMemberController.getAmAdmin);
router.get('/get-vm-admin',authentication.checkUserAuthentication, teamMemberController.getVmAdmin);
router.get('/get-am-associate', authentication.checkUserAuthentication, teamMemberController.getAmAssociate);
router.get('/get-vm-associate', authentication.checkUserAuthentication, teamMemberController.getVmAssociate);
router.get('/get-sales-manager', authentication.checkUserAuthentication, teamMemberController.getSalesManager);
router.get('/team-member/:id', authentication.checkUserAuthentication, teamMemberController.getSingleTeamMember);
router.post('/team-member', authentication.checkUserAuthentication, teamMemberController.addTeamMember);
router.delete('/team-member/:id', authentication.checkUserAuthentication, teamMemberController.deleteTeamMember);
router.put('/team-member/:id', authentication.checkUserAuthentication, teamMemberController.updateTeamMember);
router.post('/change-status/:id', authentication.checkUserAuthentication, teamMemberController.changeStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction"); //to authentication
let roleAccess = require("../../middlewares/roleAccess");//to check applied role match with token role

const scheduleInterview = require('../../controllers/interviewScheduleController');
const teamMemberController = require('../../controllers/teamMemberController');
const interviewSheduleController = require('../../controllers/interviewScheduleController');
const resourceAttendanceController = require('../../controllers/resourceAttendence');

router.get('/client-name/', authentication.checkUserAuthentication, scheduleInterview.getClientName);
router.delete("/delete-client/:id", authentication.checkUserAuthentication, teamMemberController.deleteClient);
router.put("/edit-client/:id", authentication.checkUserAuthentication, teamMemberController.updateClient);
router.get("/search-client", authentication.checkUserAuthentication, teamMemberController.searchClient);
router.post("/add-client", [authentication.checkUserAuthentication, roleAccess.checkRole(['admin','account-manager-admin','account-manager','sales-manager','finance'])], teamMemberController.addClientNew); 
router.get("/get-client", [authentication.checkUserAuthentication], teamMemberController.getClientNew);
router.get("/get-single-client/:id", authentication.checkUserAuthentication, teamMemberController.getSingleClientNew);
router.put("/modify-client/:id", authentication.checkUserAuthentication, teamMemberController.modifyClient);
router.get("/getClientFromInterviewschedules", authentication.checkUserAuthentication, teamMemberController.getClientFromInterviewschedules);//for getting client Name and adding to client and pocs
router.post("/addMultiClient", authentication.checkUserAuthentication, teamMemberController.addMultiClient);
router.post("/addClientPocByClientId", authentication.checkUserAuthentication, teamMemberController.addClientPocByClientId);
router.get("/client-hired-resources/:client_id", authentication.checkUserAuthentication, interviewSheduleController.clientHiredResouces);
router.post("/addClientIdInInterviewSchedulesColl", authentication.checkUserAuthentication, interviewSheduleController.addClientIdInInterviewSchedulesColl);//one time api for live 
router.get("/client-resource-attendance/:id", authentication.checkUserAuthentication, resourceAttendanceController.clientResourceAttendence);
router.get("/client-resource-timesheet/:id",authentication.checkUserAuthentication,interviewSheduleController.clientResourceTimeSheet);
router.post("/add-review-for-client/:id", authentication.checkUserAuthentication, teamMemberController.addReviewsForClient);

module.exports = router;
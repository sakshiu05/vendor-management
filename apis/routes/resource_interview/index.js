const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction");
let roleAccess = require("../../middlewares/roleAccess");
const awsfileUpload = require("../../middlewares/aws-fileupload").awsfileUpload;

const interviewResult = require('../../controllers/interviewResultController');
const scheduleInterview = require('../../controllers/interviewScheduleController');
const interviewSheduleController = require('../../controllers/interviewScheduleController');

router.post('/interview-result', authentication.checkUserAuthentication, interviewResult.addInterviewResult);
router.get('/interview-result/:id', authentication.checkUserAuthentication, interviewResult.getInterviewResult);

router.post('/schedule-interview',authentication.checkUserAuthentication,scheduleInterview.addInterviewSchedule);
router.put('/schedule-interview/:id', authentication.checkUserAuthentication, scheduleInterview.editInterviewSchedule);
router.get('/schedule-interview/:id', authentication.checkUserAuthentication, scheduleInterview.getInterViewSchedule);
router.put('/add-interview-result/:id', [authentication.checkUserAuthentication, awsfileUpload('resource').single("qualifying_screenshot")], scheduleInterview.addInterviewResult);
router.put('/cancel-interview-result/:id', authentication.checkUserAuthentication, scheduleInterview.cancelInterview);

router.get('/get-sheduled-interview-info/:id', authentication.checkUserAuthentication, scheduleInterview.getSheduledInterviewInfo);
router.put('/reject-resource/:id', authentication.checkUserAuthentication, scheduleInterview.rejectResource);

router.post("/add-feedback-status", authentication.checkUserAuthentication, interviewSheduleController.addFeedbackStatus);
router.get("/get-feedback-status", authentication.checkUserAuthentication, interviewSheduleController.getFeedbackStatus);
router.post("/assign-account-manager", authentication.checkUserAuthentication, roleAccess.checkRole(['admin', 'account-manager-admin','finance']), interviewSheduleController.assignAccountManager);

router.get("/role_testing", [authentication.checkUserAuthentication, roleAccess.checkRole(['admin', 'tech-partner-admin','finance'])], interviewSheduleController.role_testing);
router.get("/forzohotesting", interviewSheduleController.forzohotesting);

module.exports = router;
const express = require("express");
const router = express.Router();
let authentication = require("../../common/commonfunction"); //to authentication
let roleAccess = require("../../middlewares/roleAccess");

let hackerEarthController = require("../../controllers/hackerEarthController");

router.post("/create-invitation-link", hackerEarthController.createInvitationLink);
router.post("/delete-particular-test", hackerEarthController.deleteParticularTest);
router.post("/publish-test", hackerEarthController.publishTest);
router.post("/get-test-report", hackerEarthController.getTestReport);
router.post("/reset-test", hackerEarthController.resetTest);
router.post("/extend-time-for-particular-test", hackerEarthController.extendTimeForParticularTest);
router.post("/cancel-invites", hackerEarthController.cancelInvites);
router.post("/get-bulk-candidate-reports", hackerEarthController.getAllBulkCandidateReports);
router.post("/get-event-list", hackerEarthController.getEventList);
router.post("/get-candidates-report", hackerEarthController.getCandidatesReport);

module.exports = router;
const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction");
let roleAccess = require("../../middlewares/roleAccess");

const resumeController = require('../../controllers/resumeController');

router.post("/add-resume", authentication.checkUserAuthentication, resumeController.addResume);
router.delete("/resume/:id", authentication.checkUserAuthentication, resumeController.deleteResumeById);
router.get("/resume", authentication.checkUserAuthentication, resumeController.getAllResume);
router.get("/get-resume/:id", authentication.checkUserAuthentication, resumeController.getResumeById);
router.patch("/update-resume/:id", authentication.checkUserAuthentication, resumeController.updateResume)
router.get("/AddclientTeckStackId",resumeController.AddclientTeckStackId);


module.exports = router;
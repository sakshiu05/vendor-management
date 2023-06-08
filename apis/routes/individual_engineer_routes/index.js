const express = require('express');
const router = express.Router();
var multer = require("multer");
const path = require("path");
let authentication = require('../../common/commonfunction');
const awsfileUpload = require("../../middlewares/aws-fileupload").awsfileUpload;

const Engineer = require('../../controllers/engineerController');
const adminController = require("../../controllers/adminController");

router.post('/register-engineer',Engineer.registerEngineer);
router.post('/engineer-edu-details/:id',authentication.checkUserAuthentication, Engineer.engineerEduDetails);
router.get("/get-engineer-edu-details/:id", authentication.checkUserAuthentication, Engineer.getEngineerEduDetails);
router.put("/update-engineer-edu-details/:id", authentication.checkUserAuthentication, Engineer.updateEngineerEduDetails );
router.post("/add-engineer-work-details/:id", authentication.checkUserAuthentication, Engineer.addEngineerWorkDetails )
router.get("/get-engineer-work-details/:id", authentication.checkUserAuthentication, Engineer.getEngineerWorkDetails);
router.put("/update-engineer-work-details/:id", authentication.checkUserAuthentication, Engineer.updateEngineerProjectDetails )
router.post("/add-engineer-project-details/:id", authentication.checkUserAuthentication, Engineer.addEngineerProjectDetails )
router.get("/get-engineer-project-details/:id", authentication.checkUserAuthentication, Engineer.getEngineerProjectDetails);
router.put("/update-engineer-project-details/:id", authentication.checkUserAuthentication, Engineer.updateEngineerProjectDetails )
// router.post("/engg-self-intro/:id", authentication.checkUserAuthentication, uploadPostData, Engineer.addSelfIntro);
router.get("/engineers-list", authentication.checkUserAuthentication, Engineer.engineersList);
// router.put("/update-self-intro/:id", authentication.checkUserAuthentication, uploadPostData, Engineer.updateSelfIntro)
// // router.get("/get-all-ind-engg", authentication.checkUserAuthentication, Engineer.getAllIndividualEngg);
router.post("/add-basic-test-ques", authentication.checkUserAuthentication, Engineer.addBasicTestQues);
router.get("/get-basic-test-ques", authentication.checkUserAuthentication, Engineer.getBasicTestQues);
router.post("/add-basic-test-ans/:id", authentication.checkUserAuthentication, Engineer.addBasicTestAns);
router.get("/get-basic-test-result/:id", authentication.checkUserAuthentication, Engineer.getBasicTestResult);
router.get("/download-ind-engg", authentication.checkUserAuthentication, Engineer.downloadIndEngg);
router.post("/add-skill-set", authentication.checkUserAuthentication, Engineer.addSkillSet);
router.get("/get-all-skill-set",authentication.checkUserAuthentication, Engineer.showAllSkills);
router.post("/add-answer/:id",authentication.checkUserAuthentication, Engineer.addAnswer);
router.post("/add-engg-screening/:id",authentication.checkUserAuthentication, Engineer.addEngineerScreening );
router.get("/get-engg-screening/:id", authentication.checkUserAuthentication, Engineer.getEnggScreening);
router.put("/update-engg-screening/:id", authentication.checkUserAuthentication, Engineer.updateEnggScreening)
router.put("/modify-enggineer-basic-test/:id", authentication.checkUserAuthentication, Engineer.modifyEnggineerBasicTest);

router.post("/add-engineer-details/:id", [authentication.checkUserAuthentication, awsfileUpload('individual_engineer').fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }])], Engineer.addEnggDetails);
router.post("/add-engineer-info/:id", [authentication.checkUserAuthentication,awsfileUpload('individual_engineer').fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }])], Engineer.addEngineerInfo);
router.get("/engineer-info/:id", authentication.checkUserAuthentication, Engineer.engineerInfo);
router.put("/modify-engineer-info/:id", authentication.checkUserAuthentication, awsfileUpload('individual_engineer').fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), Engineer.modifyEngineerInfo);
router.post("/resume-parser",awsfileUpload('resume_parser').single("file"), Engineer.resumeParser);

router.post("/engg-self-intro/:id", [authentication.checkUserAuthentication, awsfileUpload('individual_engineer').single('selfIntroVideo')], Engineer.addSelfIntro);
router.put("/update-self-intro/:id", [authentication.checkUserAuthentication, awsfileUpload('individual_engineer').single('selfIntroVideo')], Engineer.updateSelfIntro);
module.exports = router;
const express = require('express');
const router = express.Router();
var multer = require("multer");
const path = require("path");
const uploadFile = require("../../middlewares/file_upload").upload;
let authentication = require("../../common/commonfunction");
let roleAccess = require("../../middlewares/roleAccess");
const awsfileUpload = require("../../middlewares/aws-fileupload").awsfileUpload;
const func = require("../../common/commonfunction");

// const resourceController = require('../../resource/resource.controller');
const resourceController = require('../../controllers/resourceController');
const resourceAttendanceController = require('../../controllers/resourceAttendence');

router.post("/resource/:vendorId?",[authentication.checkUserAuthentication, awsfileUpload('resource').fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), roleAccess.checkRole(['admin','vendor-associate','tech-partner-admin','vendor','finance']) ],resourceController.saveResourceNew);
router.delete("/remove-resource/:id",authentication.checkUserAuthentication,resourceController.removeResource);
router.get("/resources",authentication.checkUserAuthentication,resourceController.viewResources);
router.get("/resource/:id",authentication.checkUserAuthentication,resourceController.showResource);
router.put("/modify-resource-basic-info/:id",authentication.checkUserAuthentication,resourceController.modifyResourceBasicInfo);
router.put("/resource-status/:id",[authentication.checkUserAuthentication, awsfileUpload('resource').single("qualifying_screenshot")],resourceController.modifyResourceSkills);
router.get("/qualified-resources",authentication.checkUserAuthentication,resourceController.qualifiedResources);
router.get("/qualified-resources-new",authentication.checkUserAuthentication,resourceController.qualifiedResourcesNew);
router.get("/my-download-qualified-resources",resourceController.mydownloadQualifiedResources);// authentication.checkUserAuthentication,
router.put("/qualified-resources/:id",authentication.checkUserAuthentication,resourceController.modifyQualifiedResourceStatus);
router.get("/vendor-resource-count",authentication.checkUserAuthentication,resourceController.vendorAndResourceCount);
router.get("/resource-count-accordingToFeedback",authentication.checkUserAuthentication,resourceController.resourceCountAccordingToFeedback);
router.put("/resource/:id",[authentication.checkUserAuthentication, awsfileUpload('resource').fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resume', maxCount: 1 }])],resourceController.updateResourceAllInfo);
router.get("/vendor-resources/:id",authentication.checkUserAuthentication,resourceController.viewVendorResources);
router.post("/imageMiddlewareTesting",awsfileUpload('resource').single('file'),resourceController.imageUploadTesting);
router.get("/hired-resources",authentication.checkUserAuthentication,resourceController.hiredResources);
router.put("/add-account-manager/:id",authentication.checkUserAuthentication,resourceController.addAccountManager);
router.put("/can-take-interview/:id",authentication.checkUserAuthentication,resourceController.canTakeInterview);
router.put("/pullBack-resource/:id",authentication.checkUserAuthentication,resourceController.resourcePullBack);
router.put("/notice-period-resources",authentication.checkUserAuthentication,resourceController.noticePeriodResource);
router.put("/startDate-endDate/:id",authentication.checkUserAuthentication,resourceController.contractStartEndDate);
router.put("/update-client-price/:id",authentication.checkUserAuthentication,resourceController.updateClientPrice);
router.post("/add-resource-review/:id",authentication.checkUserAuthentication,resourceController.addResourceReview);
router.put("/mark-resource-status/:id",authentication.checkUserAuthentication,resourceController.markResourceStatus);
router.post("/add-client-reviews/:id",[authentication.checkUserAuthentication, roleAccess.checkRole(['admin','client','account-manager','account-manager-admin','finance'])],resourceController.addClientReviews);
router.get("/get-client-reviews/:id",authentication.checkUserAuthentication,resourceController.getClientReviews);
router.put("/addKey",authentication.checkUserAuthentication,resourceController.addKey);
router.put("/addHiredKey",authentication.checkUserAuthentication,resourceController.addHiredKey);
router.put("/addExpKey",authentication.checkUserAuthentication,resourceController.addExpKey);
router.get("/download-qualified-resources",resourceController.downloadQualifiedResources);// authentication.checkUserAuthentication,
router.get("/download-hired-resources",resourceController.downloadHiredResources);// authentication.checkUserAuthentication,
router.get("/download-pullback-resources",resourceController.downloadPullbackResources);// authentication.checkUserAuthentication,
router.put("/update-resource-mobile-number/:id",resourceController.updateResourceMobileNumber);
router.post("/resource-daily-task/:id", authentication.checkUserAuthentication, resourceController.addResourceDailyTask);
router.get("/get-single-resource-task/:id",authentication.checkUserAuthentication, resourceController.getSingleResourceTask );
router.get("/get-all-resource-task/:id",authentication.checkUserAuthentication, resourceController.getAllResourceTask );
router.put("/modify-resource-task/:id", authentication.checkUserAuthentication, resourceController.modifyResourceTask);
router.put("/modify-resource-info/:id", authentication.checkUserAuthentication, resourceController.modifyResourceInfo);
router.put("/add-resource-timesheet-status/:id?",authentication.checkUserAuthentication,resourceController.addResourceTimesheetStatus);
router.put("/update-resource-description/:id", authentication.checkUserAuthentication,resourceController.updateResourceDescription);
router.put("/move-resource-to-release/:id",authentication.checkUserAuthentication,resourceController.moveResourceToRelease);
router.put("/move-released-resource", authentication.checkUserAuthentication,resourceController.modifyReleasedResource);
//*********************** screening routes ***************
router.post("/screening/:id",[authentication.checkUserAuthentication,awsfileUpload('resource').single("qualifying_screenshot")],resourceController.addScreening);
router.get("/screening/:id",authentication.checkUserAuthentication,resourceController.getScreening);

//*********************** attendance routes ***************
router.post("/attendance/:id",authentication.checkUserAuthentication,resourceController.addAttendance);
router.get("/attendance/:id",authentication.checkUserAuthentication,resourceController.getAttendance);
router.get("/generate-attendance-csv/:id",authentication.checkUserAuthentication,resourceController.generateAttendanceCSV);
router.put("/update-resource-price/:id",authentication.checkUserAuthentication,resourceController.updateResourcePrice);
  
//*********************** feedback routes ***************
router.post("/feedback/:id",authentication.checkUserAuthentication,resourceController.addFeedback);
router.post("/add-account-manager-reviews/:id",[authentication.checkUserAuthentication,roleAccess.checkRole(['admin','client-admin','account-manager','finance'])],resourceController.addAccountManagerReview);
router.get("/get-account-manager-reviews/:id",resourceController.getAccountManagerReviews);
router.post("/upload-resource-docs/:id",[authentication.checkUserAuthentication, awsfileUpload('resource').fields([{ name: 'aadhar_front', maxCount: 1 }, { name: 'aadhar_back', maxCount: 1 },{ name: 'pancard', maxCount: 1 }])], resourceController.uploadResourceDocs);
router.get("/resource-stacks", resourceController.resourceStacks);//,[authentication.checkUserAuthentication,roleAccess.checkRole(['admin'])]
router.get("/skill-name-change", resourceController.skillNameChange);
router.put("/modify-resource-status/:id", authentication.checkUserAuthentication, resourceController.modifyResourceStatus);
router.get("/throwCheck", resourceController.throwCheck);
router.get("/hackerEarthInviteCandidate", resourceController.hackerEarthInviteCandidate);
router.get("/save-multi-resource/:id", resourceController.saveMultiResource);

//*********************** Attendence Status Manage ***************
router.post("/add-attendence-status", authentication.checkUserAuthentication, resourceAttendanceController.addAttendenceStatus);
router.get("/get-attendence-status", authentication.checkUserAuthentication, resourceAttendanceController.getAttendenceStatus);

router.get("/HiredResourceExcel", resourceController.HiredResourceExcel);

//*********************** Resource Attendence ***************
router.post("/add-resource-attendance", authentication.checkUserAuthentication, resourceAttendanceController.addAttendence);
router.put("/edit-resource-attendance/:id", authentication.checkUserAuthentication, resourceAttendanceController.updateAttendance);
router.get("/show-resource-attendance/:id", authentication.checkUserAuthentication, resourceAttendanceController.showResourceAttendence);

//---------------------Resource Access -------------------------//
router.post("/register-resource", authentication.checkUserAuthentication, resourceController.registerResource);

// router.post("/resourceOld/:vendorId?",authentication.checkUserAuthentication,uploadPostData,  resourceController.saveResource);// used
router.put("/update-vendor-associate-id",resourceController.updateVendorAssociateId);
router.put("/certify-task",[authentication.checkUserAuthentication,roleAccess.checkRole(['admin','account-manager-admin','account-manager','finance'])] ,resourceController.certify_task);
module.exports = router;
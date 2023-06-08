const express = require('express');
const router = express.Router();
var multer = require("multer");
const path = require("path");
let authentication = require('../../common/commonfunction');
const awsfileUpload = require("../../middlewares/aws-fileupload").awsfileUpload;

const adminController = require("../../controllers/adminController");
const Engineer = require('../../controllers/engineerController');

router.post('/login', adminController.login);
router.post('/otp', adminController.generateOtp);
router.post('/verify-otp', adminController.verifyOtp);
router.post('/logout',authentication.checkUserAuthentication,adminController.logout);

router.put('/update-userProfile/:id', [authentication.checkUserAuthentication, awsfileUpload('profile').single("profilePic")], adminController.updateProfile);
router.get('/daily-global-log', authentication.checkUserAuthentication, adminController.daily_global_log);
module.exports = router;
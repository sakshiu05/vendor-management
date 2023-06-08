const express = require("express");
const router = express.Router();

// const vendorController = require("../../vendor/vendor.controller");
const vendorController = require("../../controllers/vendorController");
let authentication = require("../../common/commonfunction"); //to authentication

router.get("/vendor",authentication.checkUserAuthentication,vendorController.show);
router.post("/vendor",authentication.checkUserAuthentication,vendorController.vendorSignUp);
router.put("/vendor/:id",authentication.checkUserAuthentication,vendorController.editVendor);
router.delete("/vendor/:id",authentication.checkUserAuthentication,vendorController.deleteVender);
router.get("/vendor/:id",authentication.checkUserAuthentication,vendorController.vendorInfo); //show single vendor
router.put("/modify-vendor-credential",authentication.checkUserAuthentication,vendorController.changeVendorCredential); //update vendor password
router.get("/getVenderPointOfContact",authentication.checkUserAuthentication,vendorController.getVenderPointOfContact);
router.get("/get-account-manager",authentication.checkUserAuthentication,vendorController.getAccountManager);
router.put("/add-mobile-number",vendorController.addMobileNumber);
router.post("/add-engineer-vendor",authentication.checkUserAuthentication,vendorController.addEngineerVendor);

module.exports = router;

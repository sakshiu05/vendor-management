const express = require("express");
const router = express.Router();
let authentication = require("../../common/commonfunction"); //to authentication
let roleAccess = require("../../middlewares/roleAccess");
const awsfileUpload = require("../../middlewares/aws-fileupload").awsfileUpload;
let financeController = require("../../controllers/financeController");

router.post("/signup-finance-user", financeController.registerFinanceUser);
router.post("/add-finance-data", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.addFinanceData);
router.get("/get-finance-data", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.getFinanceData);
router.put("/update-finance-data/:id", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.updateFinanceData);
router.post("/add-operational-profitabiltiy", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.addOperationalProfitabiltiyData);
router.put("/update-operational-profitabiltiy", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.updateoperationalProfitabiltiyData);
router.get("/get-all-operational-profitabiltiy", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.getAllOperationalProfitabiltiyData);
router.get("/get-single-operational-profitabiltiy", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.getSingleDataOperationalProfitabiltiy);

router.post("/add-client-attachments/:id", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance']), awsfileUpload('finance').fields([{ name: 'attachments', maxCount: 5 }])], financeController.addClientAttachments);
router.get("/get-client-attachments/:id", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.getParticularClientAttachments);
router.get("/get-talentpartner", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.getTalentPartnerForFinance);
router.get("/get-resources-of-talentpartner/:id", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.getResourcesOfTalentpartner);

router.get("/get-financeData-in-excel", financeController.getFinanceDataInExcel);
router.get("/forward-data-to-next-month-for-cron", financeController.forwardDataToNextMonthForCron);
router.get("/forward-data-to-next-month", [authentication.checkUserAuthentication, roleAccess.checkRole(['finance'])], financeController.forwardDataToNextMonth);

module.exports = router;
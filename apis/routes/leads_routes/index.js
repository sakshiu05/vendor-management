const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction");
let roleAccess = require("../../middlewares/roleAccess");


const leadsController = require("../../controllers/leadController");


router.post("/create-leads", authentication.checkUserAuthentication, leadsController.createLead);
router.post("/add-icp",authentication.checkUserAuthentication, leadsController.icpPointers);
router.get("/get-icp",authentication.checkUserAuthentication,  leadsController.geticpPointers)
router.get("/get-leads", authentication.checkUserAuthentication, leadsController.getleads);
router.put("/update-leads/:id",authentication.checkUserAuthentication, leadsController.updateLeads);
router.delete("/delete-lead/:id",authentication.checkUserAuthentication, leadsController.deleteLeads);
router.post("/add-lead-status",authentication.checkUserAuthentication, leadsController.addLeadStatus)
router.get("/get-lead-status",authentication.checkUserAuthentication, leadsController.getLeadStatus);
router.put("/modify-client-lead-status/:id",authentication.checkUserAuthentication, leadsController.modifyClientLeadStatus);
router.get("/status-wise-leads",authentication.checkUserAuthentication, leadsController.statusWiseLead);
router.get("/get-available-lead-resource/:id", authentication.checkUserAuthentication, leadsController.getAvailableLeadResources);
router.get("/get-lead-logs", authentication.checkUserAuthentication, leadsController.getLeadLogs);

module.exports = router;
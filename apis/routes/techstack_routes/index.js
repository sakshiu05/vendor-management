const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction");
let roleAccess = require("../../middlewares/roleAccess");

const techStackController = require("../../controllers/techStackController");

router.post("/add-tech-stack", authentication.checkUserAuthentication, techStackController.addTechStack);
router.get("/get-tech-stack", authentication.checkUserAuthentication, techStackController.getTechStack);

module.exports = router;
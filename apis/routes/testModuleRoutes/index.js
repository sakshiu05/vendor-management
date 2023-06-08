const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction"); //to authentication
let roleAccess = require("../../middlewares/roleAccess");//to check applied role match with token role

let domainListController = require("../../controllers/domainListController");
const interviewSchedule = require("../../models/interviewSchedule").interviewSchedule;
const Resource = require("../../models/resource").Resources;

router.get("/get-domain-list", authentication.checkUserAuthentication,domainListController.GetDomainList);
router.get("/socket-testing",domainListController.socketTesting);
router.post("/sendgrid-testing",domainListController.sendgridTesting);
router.get("/routeTesting",domainListController.routeTesting);
router.get("/AddclientTeckStackId",domainListController.AddclientTeckStackId);

router.post("/test-notification", (req, res) => {
    let { sendNotification, sendNotificationToAllConnected } = require('../../middlewares/socket')
    sendNotification(req, ['61deb5651600b63fcff362ee'], { message: "hello world i am working" })
    // sendNotificationToAllConnected(req, { message: "hello this should come in all client" })
    return res.send({ success: true });
});

const skill_set_list = require("../../models/skill_set_list").skill_set_list;
const ObjectId = require("mongodb").ObjectID;
let mongoose = require("mongoose");
router.get("/update-datatype-objectId", async (req, res) => {
    const ObjectId = require("mongodb").ObjectID;
    var requests = [];    
    let cursor = await Resource.find({ "techStack" : { $type : "string" },_id:'62ba95e6830d78c713852cd1' }, { "techStack": 1 });
    let d = ['627e5649f6b28f0218258a08'];
    // console.log(cursor);
    cursor.forEach( document => {
        d.map(s => mongoose.Types.ObjectId(s));
        /* requests.push( { 
            "updateOne": {
                "filter": { "_id": document._id },
                "update": { "$set": { "techStack": ObjectId(document.techStack) } }
            }
        }); */

        /* if (requests.length === 1000) {
            // Execute per 1000 operations and re-init
             interviewSchedule.bulkWrite(requests);
            requests = [];
        } */
    });
    
    // Clean up queues
   /* if (requests.length > 0){
    interviewSchedule.bulkWrite(requests);
    return res.send("data type updated sucessfully .!");
   } */
   return res.send("asdf");   
});

module.exports = router;
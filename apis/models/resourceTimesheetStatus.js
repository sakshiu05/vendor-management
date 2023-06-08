'use strict';

/*
* --------------------------------------------------------------------------
* Include required modules
* ---------------------------------------------------------------------------
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema

/*
* --------------------------------------------------------------------------
* Define resource collection
* ---------------------------------------------------------------------------
*/


let timeSheetSchema = new Schema({
    resource_id : {type : Schema.Types.ObjectId, required : true},
    month : { type : Number , required : true},
    year : {type : Number , required : true},
    status : {type : String, required : true, enum : [ "waiting-for-approval", "submission-pending", "approved"], default : null}
}, {timestamps : true});


let resourceTimesheetStatus = mongoose.model("resourceTimesheetStatus", timeSheetSchema , "timesheet_status");
module.exports = {
    resourceTimesheetStatus : resourceTimesheetStatus
}
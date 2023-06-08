'use strict';

/*
* --------------------------------------------------------------------------
* Include required modules
* ---------------------------------------------------------------------------
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,

/*
* --------------------------------------------------------------------------
* Define resource collection
* ---------------------------------------------------------------------------
*/
 interviewScheduleSchema = new Schema({

    clientName: { type: String, required: true },
    client_id : { type: Schema.Types.ObjectId , required : false, ref: "admin" },
    interviewDate: {type: Date, required: true },
    interviewStatus: { type: String, required: false, enum: ["Hired", "Rejected", "Cancelled", "Released"]},
    meetingLink : { type : String, required : false },
    clientPrice : { type: Number, required: false },
    rating: {type: Number, required: false },
    comment:{type: String, required: false},
    addedTo:{type:mongoose.Schema.Types.ObjectId, required: true}, // resource id for which interview is scheduled(resource table)
    addedBy:{type:mongoose.Schema.Types.ObjectId, required: true}, // id of vendor-associate who added the interview schedule for the resource (admin table)
    // client_id: {type:Object,required:false,default:null,ref:'admin'},
    techStack:{type:Object,required:true},
    vendor_associate_id : {type : Schema.Types.ObjectId, required : false}, // vendor-associate id who did the screening of the resource and marked qualified (admin table)
    qualifying_screenshot : { type : String, required : false, default : null },
    release_date : { type : Date, required : false}
}, {timestamps:true})

let interviewSchedule = mongoose.model('interviewSchedule', interviewScheduleSchema);
module.exports = {
    interviewSchedule:interviewSchedule
}
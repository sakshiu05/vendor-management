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
* Define attendence status collection
* ---------------------------------------------------------------------------
*/
attendenceStatusSchema = new Schema({
    status : {type: String, required: true},
    alias_name : {type: String, required:false},
    // resource_attendence : [ {type: Schema.Types.String,ref:'resourceAttendence.status'} ]
}, {timestamps:true})

let attendenceStatus = mongoose.model('attendenceStatus', attendenceStatusSchema);
module.exports = {
    attendenceStatus:attendenceStatus
}
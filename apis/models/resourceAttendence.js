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
 resourceAttendenceSchema = new Schema({
    resource_id : {type: Schema.Types.ObjectId, required: true, ref: 'resource'},
    client_id   : {type: Schema.Types.ObjectId, required:true, ref: 'admin'},
    date        : {type:Date, required:true},//start date
    status      : {type:Schema.Types.ObjectId, required:true, ref: 'attendencestatus'},
    attendence_marked_by   : {type:Schema.Types.ObjectId, required:true},
    comment     : {type:String, required:false, default: ""},
}, {timestamps:true})

let resourceAttendence = mongoose.model('resourceAttendence', resourceAttendenceSchema);
module.exports = {
    resourceAttendence:resourceAttendence
}
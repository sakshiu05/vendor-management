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
resource_login_logsSchema = new Schema({
    date: {type : Date, required:true},
    resource_id: {type : Schema.Types.ObjectId, required:true},
    description: {type : String, required:true},
    last_login_id : {type : Schema.Types.ObjectId, required:false},//resource logged in _id
    time_track : {type: Number, required: false},//To store logged-in time duration 
    client_id: {type : Schema.Types.ObjectId, required:false},//make it true lator
},  {timestamps:true})

let resource_login_logs = mongoose.model('resource_login_logs', resource_login_logsSchema);
module.exports = {
    resource_login_logs
}
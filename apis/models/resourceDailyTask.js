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

let dailyTaskSchema = new Schema({
    resource_id : {type : Schema.Types.ObjectId, required : true},
    description : {type : String, required : true},
    updated_desc : {type : String, required : false, default : null},
    date_of_submission : {type : Date, required : false},
    job_title : {type : String, required : false},
    client_id : {type : Schema.Types.ObjectId, required : false},
    updated_desc : {type : String, required : false, default : null},
    desc_status : {type : String, required : false, default : 'task-added'}
}, {timestamps : true});

let dailyTask = mongoose.model("dailyTask", dailyTaskSchema);
module.exports = {
    dailyTask : dailyTask
}
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


var projectDetailsSchema = new Schema({
    project_name: { type: String, required: false },
    engineer_id: { type: Schema.Types.ObjectId, required: false },
    start_date: { type: Date, required: false},
    end_date: { type: Date, required: false},
    project_duration: { type: String, required: false },
    about_project: { type: String, required: false },
    skills_used: { type: Array, required: false },
    createdAt: { type: Date, required: false },
    updatedAt: { type: Date, required: false },
    currentlyWorking: { type: Boolean, required: false, default: false },
    role_in_project: { type: String, required: false, default: false }//get data from ritwik then uncomment
})

let projectDetails = mongoose.model("projectDetails", projectDetailsSchema);
module.exports = {
    projectDetails: projectDetails
}
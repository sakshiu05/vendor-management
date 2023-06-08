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
 interviewResultSchema = new Schema({

    interviewStatus: { type: String, required: true, enum: ["Hired", "Rejected"]},
    rating: {type: Number, required: true },
    comment:{type: String, required: false},
    addedTo:{type: String, required: true},
    addedBy:{type: String, required: true}
}, {timestamps:true})

let interviewResult = mongoose.model('interviewResult', interviewResultSchema);
module.exports = {
    interviewResult:interviewResult
}
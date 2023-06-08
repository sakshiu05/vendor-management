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
* Define feedback status collection
* ---------------------------------------------------------------------------
*/
feedbackStatusSchema = new Schema({
    status : {type: String, required: true}
}, {timestamps:true})

let feedbackstatus = mongoose.model('feedback_status', feedbackStatusSchema);
module.exports = {
    feedbackstatus:feedbackstatus
}
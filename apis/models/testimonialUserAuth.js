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
var testimonialUserAuthSchema = new Schema({
    token: { type: String, required: true },
    userId: {type: String, required: true },
    isActive: {type: Boolean, required: true },
}, {timestamps:true})

let testimonialUserAuth = mongoose.model('testimonialUserAuth',testimonialUserAuthSchema);
module.exports = {
    testimonialUserAuth:testimonialUserAuth
}
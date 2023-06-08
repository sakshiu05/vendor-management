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
var domainListSchema = new Schema({
    domain: { type: String, required: true },
    domain_image: {type: String, required: false, default:null },
    status: {type: Boolean, required: true,default:true },
}, {timestamps:true})

let domainListAuth = mongoose.model('domain_list',domainListSchema);
module.exports = {
    domainListAuth:domainListAuth
}
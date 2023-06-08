'use strict';

/*
* --------------------------------------------------------------------------
* Include required modules
* ---------------------------------------------------------------------------
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    // mongoosePaginate = require('mongoose-paginate'),
    bcrypt = require('bcryptjs');

/*
* --------------------------------------------------------------------------
* Define resource collection
* ---------------------------------------------------------------------------
*/
var userAuthSchema = new Schema({
    token: { type: String, required: true },
    adminId: {type: String, required: true },
    isActive: {type: Boolean, required: true },
    systemIp: {type: String, required: false },
}, {timestamps:true})

let userAuth = mongoose.model('userAuth',userAuthSchema);
module.exports = {
    userAuth:userAuth
}
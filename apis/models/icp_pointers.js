"use strict";

/*
 * --------------------------------------------------------------------------
 * Include required modules
 * ---------------------------------------------------------------------------
 */
let mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  // mongoosePaginate = require('mongoose-paginate'),
  bcrypt = require("bcryptjs");

/*
 * --------------------------------------------------------------------------
 * Define client lead collection
 * ---------------------------------------------------------------------------
 */


let icpSchema = new Schema({
    status : {type : String, required : false},
    type : {type : String, required: false},
    isDelete : {type : Boolean, required : false, default : false}
}, {timestamps : true});

let icp_pointers = mongoose.model("icp_pointers", icpSchema);
module.exports = {
    icp_pointers : icp_pointers
}
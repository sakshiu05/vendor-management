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
 * Define sales manager  collection
 * ---------------------------------------------------------------------------
 */

let salesManagerSchema = new Schema({
sales_manager_name: {type : String, required : false},
sales_manager_id : {type : Schema.Types.ObjectId, required : false},
client_name : {type : String, required : false},
client_id : {type : Schema.Types.ObjectId, required: false}
},{timestamps : true});

let sales_manager_list = mongoose.model("sales_manager_list", salesManagerSchema);
module.exports = {
  sales_manager_list : sales_manager_list
}
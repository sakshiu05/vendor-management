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


let clientICPSchema = new Schema({
    company_status : {type : Schema.Types.ObjectId, required : false},
    brand : {type : Schema.Types.ObjectId, required : false},
    expected_revenue : {type : Schema.Types.ObjectId, required : false},
    no_of_interviews : {type : Schema.Types.ObjectId, required : false},
    payment_cycle : {type : Schema.Types.ObjectId, required : false},
    turn_around_time : {type : Schema.Types.ObjectId, required : false},
    client_id : {type : Schema.Types.ObjectId, required : false},
    icp_done_by :  {type : Schema.Types.ObjectId, required : false} // id reference from admin table 
},{timestamps : true});

let client_icp = mongoose.model("client_icp", clientICPSchema);
module.exports = {
    client_icp : client_icp
}
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

let clientLeadSchema = new Schema({
    client_name : {type : String, required : true},
    sales_manager : { type : Schema.Types.ObjectId,required : false},
    company_status : { type : String, required : false },
    brand: { type : String, required : false },
    expected_revenue : { type : String, required : false },
    interview_rounds : { type : String, required : false },
    payment_cycle : { type : String, required : false },
},{timestamps : true});

let client_lead = mongoose.model("client_lead", clientLeadSchema );
module.exports = {
    client_lead : client_lead
}
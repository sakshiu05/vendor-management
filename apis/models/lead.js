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


let leadSchema = new Schema({
    isDelete : {type : Boolean, required: false, default : false},
    client_name : {type : String, required : false},
    client_id : {type : Schema.Types.ObjectId, required : false},
    lead_title : { type : String, required: false },
    job_description : { type : String, required: false },
    amount : { type : String, required : false },
    developer_required : { type : String, required : false },
    techStack : { type : Schema.Types.ObjectId, required : false },
    experiance : { type : String, required : false },
    assign_to : { type : Schema.Types.ObjectId, required : false },// sales manager id (admin table)
    lead_status : { type : Schema.Types.ObjectId, required : false }
},{timestamps : true});

let leads = mongoose.model("leads", leadSchema);
module.exports ={
    leads : leads
}
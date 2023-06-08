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
 * Define resource collection
 * ---------------------------------------------------------------------------
 */
var leadLogSchema = new Schema(
  {
    lead_id : {type :Schema.Types.ObjectId, required : true, ref: "leads"},
    updatedBy: { type: Schema.Types.ObjectId, required: true , ref: "Admin" },//id of person
    updatedAt: {type: Date , required: true },//date time of updation
    role: { type: String, required: true },//role of person
    task: { type: String, required: true },// what user did
    data: { type: Object, required: false },//all data that send by user
}, {timestamps:true})

let leadLog = mongoose.model("leadLog", leadLogSchema);
module.exports = {
    leadLog: leadLog,
};

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
var resourceLogSchema = new Schema(
  {
    updatedBy: { type: Schema.Types.ObjectId, required: true , ref: "Admin" },//id of person
    updatedAt: {type: Date , required: true },//date time of updation
    role: { type: String, required: true },//role of person
    task: { type: String, required: true },// what user did
    data: { type: Object, required: false },//all data that send by user
}, {timestamps:true})

let ResourceLog = mongoose.model("ResourceLog", resourceLogSchema);
module.exports = {
    ResourceLog: ResourceLog,
};

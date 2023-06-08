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
var attendanceSchema = new Schema(
  {
    addedBy: { type: Schema.Types.ObjectId, required: true },//id of person
    addedTo: { type: Schema.Types.ObjectId, required: true },//id of person
    comment: { type: String, required: false},//all data that send by user
    date: { type: Date, required: false },
    status: {
        type: String,
        required: true,
        enum: ["Present", "Absent", "On-Leave"],
      },
}, {timestamps:true})

let attendance = mongoose.model("attendance", attendanceSchema);
module.exports = {
    attendance: attendance,
};

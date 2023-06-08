"use strict";

const { json } = require("body-parser");

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
var otpSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true},//id of person
    otp: {type: Number , required: true },
    email: {type: String , required: true },
}, {timestamps:true})

let otp = mongoose.model("otp", otpSchema);
module.exports = {
    otp: otp
};

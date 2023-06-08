"use strict";
/*
 * --------------------------------------------------------------------------
 * Include required modules
 * ---------------------------------------------------------------------------
 */
let mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/*
 * --------------------------------------------------------------------------
 * Define resource collection
 * ---------------------------------------------------------------------------
 */
var testimonialClientOtpSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true},//id of person
    otp: {type: Number , required: true },
    email: {type: String , required: true },
}, {timestamps:true})

let testimonialClientOtp = mongoose.model("testimonialClientOtp", testimonialClientOtpSchema);
module.exports = {
    testimonialClientOtp: testimonialClientOtp,
};

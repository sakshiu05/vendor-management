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

var feedbackSchema = new Schema(
  {
    addedBy: { type: Schema.Types.ObjectId, required: false },//id of person
    resource_id: { type: Schema.Types.ObjectId, required: false },//id of person
    client_id: { type: Schema.Types.ObjectId, required: false },
    comment: { type: String, required: false},//all data that send by user
    review_date : { type : Date, required : false},
    feedback: {
        type: Schema.Types.ObjectId,
        required: true
      },
}, {timestamps:true})

let feedback = mongoose.model("feedback", feedbackSchema);
module.exports = {
    feedback: feedback,
};

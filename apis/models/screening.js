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
var screeningSchema = new Schema(
  {
    addedBy: { type: Schema.Types.ObjectId, required: true },//id of vendor-associate who added the screening(admin table)
    addedTo: { type: Schema.Types.ObjectId, required: true },//id of resource for which the screening is added(resource table)
    comm_skill_points: { type: Number, required: true },//communication points
    comm_tech_points: { type: Number, required: true },//tech points
    presentability : {type : Number, required : true},
    attentiveness : {type : Number, required : true},
    comment: { type: String, required : false},//all data that send by user
    status: {
        type: String,
        required: false,
        enum: ["Pending", "Qualified", "Rejected"],
      },
      qualifying_screenshot : { type : String, required : false, default : null },// screenshot of the time screening is done by vendor-associate

}, {timestamps:true})

let screening = mongoose.model("screening", screeningSchema);
module.exports = {
    screening: screening,
};

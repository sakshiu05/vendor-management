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
var resourceSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, required: true, ref: "Admin" },
    name: { type: String, required: true }, //unique:true
    techStack: { type: Array, required: true }, // change type string to array
    experiance: { type: String, required: false }, //Number
    exp_years : { type: Number, required: false },
    exp_months : { type: Number, required: false }, 
    domain  : { type : Schema.Types.ObjectId, required : false, default : null },
    price: { type: String, required: true },
    clientPrice : { type: String, required: false },
    mobile: { type: String, required: false },
    internationalNumberOther : {type : String , required : false },//Number
    nationalNumberOther : {type : String , required : false },//Number
    e164NumberOther : {type : String , required : false },//Number
    countryCodeOther : {type : String , required : false },//Number
    dialCodeOther : {type : String , required : false },//Number
    email: { type: String, required: false },
    noticePeriod: { type: String, required: false },
    isAvailable: { type: String, required: false, select: false }, // not neccessarily required for resource
    available_date: { type: Date, required: false },
    available_time: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Qualified", "Rejected"],
    },
    comm_skill_points: { type: Number, required: false },
    comm_tech_points: { type: Number, required:false },
    presentability :{type : Number, required : false},
    attentiveness : {type : Number, required:false},
    comment: { type: String, required : false},
    qualified_by: {  type:mongoose.Schema.Types.ObjectId, required: false },
    qualified_on: { type: Date, required: false },
    account_manager: { type:mongoose.Schema.Types.ObjectId, required: false },//type: String
    project_startDate: { type: Date, required: false },
    project_endDate: { type: Date, required: false },
    resumeDocUrl: { type: String, required: true },
    profileImage: { type: String, required: false },
    isHired: { type: Boolean, default: false },
    isPullBack: { type: Boolean, default: false },
    interview: { type: Boolean, required: false },
    isDelete: { type: Boolean, default: false },
    onNoticePeriod : { type: Boolean, default: false,required:true },
    isPullBack:{type:Boolean,default:false,required:false},
    aadhar_front:{type:String, default:null, required:false},
    aadhar_back:{type:String, default:null, required:false},
    pancard:{type:String, default:null, required:false}
  },
  { timestamps: true }
);

let Resources = mongoose.model("Resources", resourceSchema);
module.exports = {
  Resources: Resources,
};

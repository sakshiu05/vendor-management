"use strict";

/*
 * --------------------------------------------------------------------------
 * Include required modules
 * ---------------------------------------------------------------------------
 */
let mongoose = require("mongoose"),
  Schema = mongoose.Schema,

/*
 * --------------------------------------------------------------------------
 * Define client leadStatus collection
 * ---------------------------------------------------------------------------
 */


leadStatusSchema = new Schema({
    status : {type : String, required : false,default:null},
    isDeleteStatus:{type:Boolean,required:false,default:false},
    sequence_number : {type : Number, required : true}   
},  { timestamps: true });

let leadStatus = mongoose.model("leadstatus", leadStatusSchema);
module.exports ={
    leadStatus : leadStatus
}
'use strict';

/*
* --------------------------------------------------------------------------
* Include required modules
* ---------------------------------------------------------------------------
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema

/*
* --------------------------------------------------------------------------
* Define finance collection
* ---------------------------------------------------------------------------
*/

var screeningSchema = new Schema({

  engineer_id : {type: String , required :false},
  addedBy : {type : mongoose.Types.ObjectId, required : false},
  role : { type : String , required :false },
  comm_skills : {type : Number , required : true},
  tech_skills : {type : Number , required : true},
  presentability : {type : Number , required : true},
  attentiveness : {type : Number , required : true},
  status : {type : String , required : false , default : "pending"},

},{timestamps : true});

let engineer_screening = mongoose.model("engineer_screening", screeningSchema)
module.exports = {
    engineer_screening : engineer_screening
}
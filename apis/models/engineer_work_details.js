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
* Define resource collection
* ---------------------------------------------------------------------------
*/

var workDetailsSchema = new Schema({
    first_name : { type : String, required : false},
    last_name : { type : String, required : false },
    email : { type : String , required : false },
    mobile_number : { type : String, required : false },
    // designation: { type: String, required: false },
    exp_year: { type: String, required: false },
    exp_month: { type: String, required: false },
    skills: { type: Array, required: false },
    engineer_id: { type: Schema.Types.ObjectId, required: false },
    linkdinUrl: { type: String, required: false },
    resume :{ type : String, required : false },
    profileImage : { type : String, required : false },
    languages : { type : String, required : false },
    profiency : { type : Number, required : false },
    monthlyExpectations : { type : Number, required : false},
    month: {type: Number, required: true,default:0},
    year: {type:Number, required:true,default:0},
    work_detail_completed_status: {type:String, required:false,default:"incomplete",enum : ["incomplete", "complete" ] },
    basic_info_completed:{type:Boolean,default:false,required:false,default:false},
    basic_test_completed:{type:Boolean,default:false,required:false,default:false},
    assigned_vendor_id:{type:Schema.Types.ObjectId, required:false,default:null},
    domain:{type:Schema.Types.ObjectId, required:false,default:null}
}, { timestamps: true })

let workDetails = mongoose.model("workDetails", workDetailsSchema);
module.exports = {
    workDetails: workDetails
}
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

var engineerEduSchema = new Schema({
     college_name : {type : String , required : false},
     degree : {type : String , required : false},
     study_field :{type : String , required : false},
     engineer_id : {type : Schema.Types.ObjectId , required : false},//, ref : "Admin"
     start_date : { type : Date , required : false, default : null},
     end_date : { type : Date , required : false, default: null }
    },
     {timestamps : true} 
    );

    let engineer_edu_info = mongoose.model("engineer_edu_info", engineerEduSchema);
    module.exports = {
        engineer_edu_info : engineer_edu_info
    }
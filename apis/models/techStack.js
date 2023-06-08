'use strict';

/*
* --------------------------------------------------------------------------
* Include required modules
* ---------------------------------------------------------------------------
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,

/*
* --------------------------------------------------------------------------
* Define attendence status collection
* ---------------------------------------------------------------------------
*/

  techStackSchema = new Schema({
    status : {type: String, required: false, default : true},
    techStack : {type : String, required : true},
    isDelete : {type : Boolean , required :false, deafult : false},
    createdAt : {type : Date , required : false},
    updatedAt : {type : Date, required : false}
}, {timestamps:true});

let techStack = mongoose.model('techStack', techStackSchema);
module.exports = {
    techStack : techStack 
}
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
role_in_projectSchema = new Schema({
    role: {type : String, required:false,default:null},//true
    status: {type : Boolean, required:false, default:true},//to show/hide role
},  {timestamps:true})

let role_in_project = mongoose.model('role_in_project', role_in_projectSchema);
module.exports = {
    role_in_project:role_in_project
}
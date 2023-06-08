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

var skillSetSchema = new Schema({
    skill : {type : String , required : false, unique:true},
    status : {type : Boolean, required : false, default : true}
}, {timestamps : true});


let  skill_set_list = mongoose.model("skill_set_list", skillSetSchema)
module.exports = {
    skill_set_list : skill_set_list
}
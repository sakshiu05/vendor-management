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

let basicQuesSchema = new Schema({
    question : { type: String , required : false },
    category : { type: String , required : false },
    isDelete : { type : String , required : false , default : false },

}, {timestamps : true});

let basicQues = mongoose.model("basicQues", basicQuesSchema);
module.exports = {
    basicQues : basicQues 
}
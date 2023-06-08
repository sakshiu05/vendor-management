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

let testAnsSchema = new Schema({
    category : {type : String, default : "basic-test"},
    answer : { type : String, required : false },
    engineer_id : { type:mongoose.Schema.Types.ObjectId, ref:'Admin'},
    question : { type:String, ref:'basicque', required: false},
}, {timestamps : true})


let basicTestAns = mongoose.model("basicTestAns", testAnsSchema);
module.exports = {
    basicTestAns : basicTestAns
}
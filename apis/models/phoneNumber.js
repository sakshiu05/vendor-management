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

phoneNumberSchema = new Schema({
    number : {type : String, required : false},//Number
    otherNumber : {type : String, required : false},//Number
    internationalNumber : {type : String , required : false , default : null},//Number
    nationalNumber : {type : String , required : false , default : null},//Number
    e164Number : {type : String , required : false , default : null},//Number
    countryCode : {type : String , required : false , default : null},//Number
    dialCode : {type : String , required : false , default : null},//Number
    user_id : {type : Schema.Types.ObjectId , required : false, ref : "resources"}, // user_id refer to resource id as well as vendor id
    phone1 : {type : String , required : false},
    phone2 : {type: String, required : false}
}, {timestamps : true});

let phone = mongoose.model("phone", phoneNumberSchema);
module.exports = {
    phone : phone
} 
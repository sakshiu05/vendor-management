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
clientPocsSchema = new Schema({
    POCName: {type : String, required:false,default:null},//true
    phoneNumber: {type : Array, required:false, default:null},//contain number,internationalNumber,nationalNumber,e164Number,countryCode,dialCode
    email: {type : String, required:false,default:null},//true
    department: {type : String, required:false, default:null},
    comment: {type : String, required:true},
    client_id: { type:mongoose.Schema.Types.ObjectId, ref:'Admin' }//refers to admin_id //added by id
},  {timestamps:true})

let clientPocs = mongoose.model('client_pocs', clientPocsSchema);
module.exports = {
    clientPocs:clientPocs
}
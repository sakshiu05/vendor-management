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

let selfIntroSchema = new Schema({
    language : { type : String , required : true },
    profiency : { type : Number , required : true },
    engineer_id : { type:mongoose.Schema.Types.ObjectId, ref:'Admin', required : false },
    selfIntroVideo : { type : String, required : false },
    resumeDocUrl : { type: String, required : false},
    image : { type: String , required : false }
},{timestamps : true});

let selfIntro = mongoose.model("selfIntro", selfIntroSchema);
module.exports = {
    selfIntro : selfIntro
}
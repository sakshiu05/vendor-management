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
testimonial_clientSchema = new Schema({
    token: { type: String, default:null },
    active: { type: Boolean, default: true},
    name: { type: String, required: false,default:null },
    email: {type : String, required:true,default:null},
    password: { type: String, required: true, select: false },
    create_a_wall:{type:Boolean, default: false},
    wall_name: {type:String,required:false,default:null},
    image : { type: String ,required:false,default:null},
    brand_colour:{type:String,required:false,default:null},
    customer_review_template:{type:Boolean, default: false},
    employee_review_template:{type:Boolean, default: false},
},  {timestamps:true})

let testimonial_client = mongoose.model('testimonial_client', testimonial_clientSchema);
module.exports = {
    testimonial_client:testimonial_client
}
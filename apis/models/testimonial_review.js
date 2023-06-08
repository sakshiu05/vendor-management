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
    testimonial_reviewSchema = new Schema({
        client_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'testimonial_client' },
        textReview: { type: Boolean, default: false },
        vedioReview: { type: Boolean, default: false },
        socialReview: { type: Boolean, default: false },
        title_name: { type: String, required: false, default: null },
        title_comment: { type: String, required: false, default: null },
        image: { type: Array, required: false, default: null },
        client_anonymous: { type: Boolean, default: false },
        client_name: { type: String, required: false ,default:null},
        client_designation: { type: String, required: false,default:null },
        client_profile: { type: String, required: false, default: null }
    }, { timestamps: true })

let testimonial_review = mongoose.model('testimonial_review', testimonial_reviewSchema);

module.exports = {
    testimonial_review: testimonial_review
}
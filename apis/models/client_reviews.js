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
* Define resource collection
* ---------------------------------------------------------------------------
*/

 clientReviewsSchema = new Schema({
    resource_id : {type : Schema.Types.ObjectId, required : false},
    client_id : {type : Schema.Types.ObjectId, required : false},
    client_name : {type : String , required : false},
    createdAt : {type : Date , required: false},
    comment : {type : String , required : false, default : ""},
    active_communication : {type : Number , required : true},
    task_completion : {type : Number , required : true},
    code_quality : {type : Number , required : true},
    daily_updates : {type :Number, required: true},
    review_date : {type : Date, required : false},
    feedback : {type: Schema.Types.ObjectId , required : true,ref: 'feedback_statuses'}
 },{timestamps:true});

 var clientFeedbackSchema = new Schema({
    client_id : {type : Schema.Types.ObjectId, required : false},
    client_name : {type : String , required : false},
    comment : {type : String , required : false, default : ""},
    review_date : {type : Date, required : false},
    review : {type: Schema.Types.ObjectId , required : true,ref: 'feedback_statuses'}
 },{timestamps:true});

 let client_reviews = mongoose.model('client_reviews', clientReviewsSchema);
 let client_feedbacks = mongoose.model('client_feedbacks', clientFeedbackSchema);
module.exports = {
    client_reviews:client_reviews,
    client_feedbacks: client_feedbacks
}
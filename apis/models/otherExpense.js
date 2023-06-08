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

var otherExpenseSchema = new Schema({
    operationId: {type:Object,required:true,default:null,ref:'operational_profitabiltiy'},
    month: {type : Number , required: true, default : null},
    year: {type : Number , required: true, default : null},
    otherName: {type:Number,required:true,default:null},
    status: { type: String, required: true, enum: ["otherIncome", "empBenifit","financeExp","marketingExp","softExp","otherExp","admCost"]},

}, {timestamps : true});

let otherExpenseModel = mongoose.model("other_expense", otherExpenseSchema)
module.exports = {
    otherExpenseModel : otherExpenseModel
}
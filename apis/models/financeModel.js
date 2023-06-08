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


var financeSchema = new Schema({
    month: { type: Number, required: true, default: null },
    year: { type: Number, required: true, default: null },
    client: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    clientBillingName: { type: String, required: false, default: null },
    talentPartners: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    resource: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    technology: { type: Array, required: false, default: null },
    projectStartDate: { type: Date, required: false },
    clientBillingCycle: { type: String, required: false, default: null },
    paymentCycleVendor: { type: String, required: false, default: null },
    rate: { type: Number, required: false, default: 0 },
    budgetedSales: { type: Number, required: false, default: 0 },
    budgetedSalesDollar: { type: Number, required: false, default: 0 },
    totalNoWorkingDay: { type: Number, required: false, default: 0 },
    actualBilableDays: { type: Number, required: false, default: 0 },
    actualSales: { type: Number, required: false, default: 0 },
    actualSalesDollar: { type: Number, required: false, default: 0 },
    budgetedCost: { type: Number, required: false, default: 0 },
    totalWorkingDaysVendor: { type: Number, required: false, default: 0 },
    actualbillableDaysVendor: { type: Number, required: false, default: 0 },
    actualCost: { type: Number, required: false, default: 0 },
    actualCostDollar: { type: Number, required: false, default: 0 },
    profit: { type: Number, required: false, default: 0 },
    profitDollar: { type: Number, required: false, default: 0 },
    profitInPercentage: { type: Number, required: false, default: 0 },
    geoBusiness: { type: String, required: false,default:null, enum: [null,"international", "domestic"] },
    currentStatus: { type: String, required: false, default:null, enum: [null,"continue", "drop", "addition"] },
    remarks: { type: String, required: false, default: null },
    attachments: { type: Array, required: false, default: null },
    status: { type: String, required: false, default: "draft", enum: ["draft", "completed"] },
    carriedForwardStatus: { type: String, required: false, default:"not-forward", enum: [null,"forward", "not-forward"] },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
}, { timeStamps: true });


let financeModel = mongoose.model("financeModel", financeSchema)
module.exports = {
    financeModel: financeModel
}
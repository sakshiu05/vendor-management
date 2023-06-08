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

var operationalProfitabiltiySchema = new Schema({
    month: {type : Number , required: true, default : null},
    year: {type : Number , required: true, default : null},

    //Other Income..
    OtherIncome:  { type: Number, required: false, default : 0 }, 

    //Employee Benifites Expense..
    salaryNonBillable: { type: Number, required: false, default : 0 },
    PF: { type: Number, required: false, default : 0 },
    ESIC: { type: Number, required: false, default : 0 },
    PT: { type: Number, required: false, default : 0 },
    empContractorExp: { type: Number, required: false, default : 0 },
    internshipStipend: { type: Number, required: false, default : 0 },
    incentives: { type: Number, required: false, default : 0 },
    bonus: { type: Number, required: false, default : 0 },
    // other: { type: Number, required: false, default : 0 },

    //Finance Expenses.
    interestExpenses: { type: Number, required: false, default : 0 },
    bankCharge: { type: Number, required: false, default : 0 },

    // other: { type: Number, required: false, default : 0 },

    //Marketing Expenses..
   advertisingPromotiom: { type: Number, required: false, default : 0 },
   contentWriterExp: { type: Number, required: false, default : 0 },
   digitalMarketing: { type: Number, required: false, default : 0 },
   eventExp: { type: Number, required: false, default : 0 },
   marketingExp: { type: Number, required: false, default : 0 },

//    other: { type: Number, required: false, default : 0 },

   //Software & tolls expenses..

   hrSoftware: { type: Number, required: false, default : 0 },
   accountingSoftware: { type: Number, required: false, default : 0 },
   softwareToolExp: { type: Number, required: false, default : 0 },
//    other: { type: Number, required: false, default : 0 },

   //Other Expenses ...

   otherExpenses: { type: Number, required: false, default : 0 },
//    other: { type: Number, required: false, default : 0 },


   // Administrator Cost..

    compExpense: { type: Number, required: false, default : 0 },
    contractorExpense: { type: Number, required: false, default : 0 },
    electricityBill: { type: Number, required: false, default : 0},
    generatorRent: { type: Number, required: false, default : 0 },
    housekeepingCharges: { type: Number, required: false, default : 0 },
    insuranceExpense: { type: Number, required: false, default : 0 },
    internetExpense: { type: Number, required: false, default : 0 },
    officeRent: { type: Number, required: false, default : 0 },
    officeGeneralAdministrative: { type: Number, required: false, default : 0 },
    telExpense: { type: Number, required: false, default : 0 },
    travelExpense: { type: Number, required: false, default : 0 },
    waterExpense: { type: Number, required: false, default : 0 },
    empPartyExpense: { type: Number, required: false, default : 0 },
    exchange: { type: Number, required: false, default : 0 },
    keymanExpPolicy: { type: Number, required: false, default : 0 },
   
    staffWelfareExp: { type: Number, required: false, default : 0 },
    repairMaintenance: { type: Number, required: false, default : 0 },

    ROC: { type: Number, required: false, default : 0 },
    mealEntertainment: { type: Number, required: false, default : 0 },
    legalExpenses:{ type: Number, required: false, default : 0 },
    stationaryExpense: { type: Number, required: false, default : 0 },
    systemRent: { type: Number, required: false, default : 0 },
    officeEquipment: { type: Number, required: false, default : 0 },
    bussniessLicensePermits: { type: Number, required: false, default : 0 },

    // other:{ type: Number, required: false, default : 0 }

   //Common Field...
    status: { type: String, required: true, enum: ["otherIncome", "empBenifit","financeExp","marketingExp","softExp","otherExp","admCost"]},


}, {timestamps : true});

let operationalProfitabiltiyModel = mongoose.model("operational_profitabiltiy", operationalProfitabiltiySchema)
module.exports = {
    operationalProfitabiltiyModel: operationalProfitabiltiyModel
}
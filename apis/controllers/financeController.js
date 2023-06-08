
// "use strict";

const operationalProfitabiltiyModel = require("../models/operationalProfitabiltiy").operationalProfitabiltiyModel;
const financeModel = require("../models/financeModel").financeModel;
const otherExpenseModel = require("../models/otherExpense").otherExpenseModel;

let Admin = require("../models/admin").Admin;
// const Resources = require("../resource/resource.model").Resources;
const Resources = require("../models/resource").Resources;
let userAuth = require("../models/userAuth").userAuth;
const skill_set_list = require("../models/skill_set_list").skill_set_list;
var bcrypt = require("bcryptjs");
let func = require("../common/commonfunction");
const Skillset_list = require("../models/skill_set_list").skill_set_list;

var ObjectId = require('mongodb').ObjectID;
const { base64encode, base64decode } = require("nodejs-base64");
const moment = require("moment");
var ExcelJs = require("exceljs");
const { upload, awsFileDelete } = require("../middlewares/aws-fileupload");


/***
 * Created By: Shubhankar Kesharwani
 * Created At: 31-05-2022
 * Desc: Signup finance user 
 * Function : registerFinance
 * Api: signup-finance-user
 */

const registerFinanceUser = async (req, res) => {
    try {
        let data = req.body;
        let randomText = "finance" + Math.floor(100000 + Math.random() * 900000);

        if (!data.first_name) {
            return res.status(400).send({ message: "Please enter first name", status: false });
        }
        if (!data.last_name) {
            return res.status(400).send({ message: "Please enter last name", status: false });
        }
        if (!data.email) {
            return res.status(400).send({ message: "Please enter email id", status: false });
        }
        if (!data.mobile_number) {
            return res.status(400).send({ message: "Please enter mobile number", status: false });
        }
        // if (data.mobile_number) {
        //     if (!data.mobile_number.number) {
        //         return res.status(400).send({ message: "Please enter mobile number", status: false });
        //     }
        //     if (!data.mobile_number.internationalNumber) {
        //         return res.status(400).send({ message: "Please enter international number", status: false });
        //     }
        //     if (!data.mobile_number.nationalNumber) {
        //         return res.status(400).send({ message: "Please enter national number", status: false });
        //     }
        //     if (!data.mobile_number.e164Number) {
        //         return res.status(400).send({ message: "Please enter e16 number", status: false });
        //     }
        //     if (!data.mobile_number.countryCode) {
        //         return res.status(400).send({ message: "Please enter country number", status: false });
        //     }
        //     if (!data.mobile_number.dialCode) {
        //         return res.status(400).send({ message: "Please enter dialcode number", status: false });
        //     }
        // }
        if (!data.password) {
            return res.status(400).send({ message: "Please enter password", status: false });
        } else if (data.password.length < 8 || data.password.length > 10) {
            return res.status(400).send({ message: "Password must be of 8 to 10 chacacters", status: false });
        }

        data.firstName = data.first_name.toLowerCase();//data.firstName+ ' ' + data.lastName
        data.lastName = data.last_name.toLowerCase();
        data.role = "finance";
        data.phone = data.mobile_number;
        data.email = data.email;
        data.name = data.email;
        // data.individualEnggPhoneNumber = data.mobile_number;

        delete data.first_name;
        delete data.last_name;
        // delete data.mobile_number;
        // delete data.name;
        let adminData = await Admin.findOne({ $or: [{ email: data.email, role: "finance" }, { phone: data.phone, role: "finance" }] });
        if (adminData) {
            return res.status(400).send({ message: "Error! Email Id or Mobile number already exist.", status: false });
        } else {
            let engineerData = await Admin(data).save();
            if (!engineerData) {
                return res.status(400).send({ message: "Error while registering finance", status: false });
            } else {
                let password = data.password;
                engineerData.comparePassword(password, function (err, isMatch) {
                    if (err) {
                        // logger.info('Incorrect Credentials');

                        return res
                            .status(400)
                            .send({ message: "Incorrect Credentials", status: false });
                    } else {
                        if (!isMatch) {
                            return res.status(400).send({
                                message: "Please enter valid Password",
                                status: false,
                            });
                        } else {
                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(password, salt, function (err, hash) {
                                    password = hash;

                                    var token = func.createToken(engineerData);
                                    var ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                                    var data = {};
                                    data._id = engineerData._id;
                                    data.email = engineerData.email;
                                    data.password = password;
                                    engineerData.token = token;

                                    let userAuthData = new userAuth();
                                    userAuthData.token = token;
                                    userAuthData.adminId = engineerData._id;
                                    userAuthData.isActive = true;
                                    userAuthData.systemIp = ipAddress;

                                    userAuthData.save().then(function (data, err) {
                                        if (err) {
                                            return res
                                                .status(400)
                                                .send({ message: "Token issue", status: false });
                                        }
                                        return res.status(200).send({
                                            message: "Finance Data Added successfully",
                                            status: true,
                                            token,
                                            data: engineerData,
                                        });
                                    });
                                });
                            });
                        }
                    }
                });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To add finance data on particular month & year bases ..
 * API: add-finance-data
 * Function: addFinanceData
 */

const addFinanceData = async (req, res) => {
    try {
        let data = req.body;
        // let actualSales = parseFloat(data.budgetedSales * (data.billableDays / data.totalWorkingDays)).toFixed(2);
        // let actualCost = parseFloat(data.budgetedSales * (data.billableDays / data.totalWorkingDaysVendor)).toFixed(2);
        // let profit = parseFloat(actualSales - actualCost).toFixed(2); 
        // let profitInPercentage = parseFloat((profit / actualSales) * 100).toFixed(2);
        // let res_data = {
        //     month: data.month,
        //     year: data.year, 
        //     client: data.client,
        //     talentPartners: data.talentPartners,
        //     resource: data.resource,
        //     technology: data.technology,
        //     projectStartDate: data.projectStartDate,
        //     clientBillingCycle: data.clientBillingCycle,
        //     paymentCycleVendor: data.paymentCycleVendor,
        //     budgetedSales: data.budgetedSales,
        //     actualSales: actualSales,
        //     totalWorkingDays: data.totalWorkingDays,
        //     billableDays: data.billableDays,
        //     actualCost: actualCost,
        //     totalWorkingDaysVendor: data.totalWorkingDaysVendor,
        //     profit: profit,
        //     profitInPercentage: profitInPercentage,
        //     agreementStartDate: data.agreementStartDate,
        //     agreementEndDate: data.agreementEndDate,
        //     remarks: data.remarks,
        //     attachments: data.attachments,
        // }

        if (data.client == null && data.clientBillingName == null 
            && data.talentPartners == null &&
            data.resource == null && data.technology == null &&
            data.projectStartDate == null && data.rate == null &&
            data.clientBillingCycle == null && data.paymentCycleVendor == null &&
            data.budgetedSales == null && data.budgetedSalesDollar == null
             && data.totalNoWorkingDay == null &&
            data.actualBilableDays == null && data.actualSales == null &&
            data.actualSalesDollar == null && 
            data.budgetedCost == null && data.totalWorkingDaysVendor == null &&
            data.actualbillableDaysVendor == null && data.actualCost == null &&
            data.actualCostDollar == null &&
            data.profit == null  && data.profitDollar == null 
            && data.profitInPercentage == null && data.geoBusiness == null &&
            data.currentStatus == null &&
            data.remarks == null) {
            return res.status(400).send({ message: "Please Enter atleast one Field ..!", status: false });

        }



         if (data.client && data.clientBillingName 
            && data.talentPartners &&
            data.resource && data.technology &&
            data.projectStartDate && data.rate &&
            data.clientBillingCycle && data.paymentCycleVendor &&
            data.budgetedSales && data.budgetedSalesDollar
             && data.totalNoWorkingDay &&
            data.actualBilableDays && data.actualSales &&
            data.actualSalesDollar && 
            data.budgetedCost && data.totalWorkingDaysVendor &&
            data.actualbillableDaysVendor && data.actualCost &&
            data.actualCostDollar &&
            data.profit  && data.profitDollar 
            && data.profitInPercentage && data.geoBusiness &&
            data.currentStatus &&
            data.remarks) {
         
            data.status = "completed";
        }
   
        data.month = parseInt(data.month);
        data.year = parseInt(data.year);
 

        let monthArray =
            [
                { num: 1, month: 4, name: 'April', year: data.year },
                { num: 2, month: 5, name: 'May', year: data.year },
                { num: 3, month: 6, name: 'June', year: data.year },
                { num: 4, month: 7, name: 'July', year: data.year },
                { num: 5, month: 8, name: 'August', year: data.year },
                { num: 6, month: 9, name: 'September', year: data.year },
                { num: 7, month: 10, name: 'October', year: data.year },
                { num: 8, month: 11, name: 'November', year: data.year },
                { num: 9, month: 12, name: 'December', year: data.year },
                { num: 10, month: 1, name: 'January', year: data.year + 1 },
                { num: 11, month: 2, name: 'Febraury', year: data.year + 1 },
                { num: 12, month: 3, name: 'March', year: data.year + 1 },
            ];
           let findMonth = monthArray.find(item => item.num === parseInt(data.month));
           data.month = findMonth.month;
           data.year = findMonth.year;

           if(data.technology != null){
           data.technology = await data.technology.map((element)=>{
            return ObjectId(element.trim());
           });
          }

        let finance_res = await financeModel(data).save();
        let response = {
            finance_res
        }
        return res.status(200).send({ message: "Data added successfully", status: true, response });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message,line:error.stack })
    }
}


/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To get finance data on particular month & year bases ..
 * API: get-finance-data
 * Function: getFinanceData
 */

const getFinanceData = async (req, res) => {
    if (!req.query.month && !req.query.year) {
        return res.status(400).send({ message: "Please pass month and year..!", status: false });
    }
    try {
        req.query.year = req.query.year.split("-")[0];
        let finalYear = parseInt(req.query.year);
        let monthArray =
        [
            { num: 1, month: 4, name: 'April', year: finalYear },
            { num: 2, month: 5, name: 'May', year: finalYear },
            { num: 3, month: 6, name: 'June', year: finalYear },
            { num: 4, month: 7, name: 'July', year: finalYear },
            { num: 5, month: 8, name: 'August', year: finalYear },
            { num: 6, month: 9, name: 'September', year: finalYear },
            { num: 7, month: 10, name: 'October', year: finalYear },
            { num: 8, month: 11, name: 'November', year: finalYear },
            { num: 9, month: 12, name: 'December', year: finalYear },
            { num: 10, month: 1, name: 'January', year: finalYear + 1 },
            { num: 11, month: 2, name: 'Febraury', year: finalYear + 1 },
            { num: 12, month: 3, name: 'March', year: finalYear + 1 },
        ];
        let findMonth = monthArray.find(item => item.num === parseInt(req.query.month));

        // let finance_data = await financeModel.find({ month: findMonth.month, year: findMonth.year });

        let finance_data = await financeModel.aggregate([
            { $match: {month: findMonth.month, year: findMonth.year} },
            {
                $lookup : {
                  from: 'admins',
                  localField: 'client',
                  foreignField: '_id',
                  as: 'clientInfo'
                }
              },
          
              {
                $lookup : {
                  from: 'resources',
                  localField: 'resource',
                  foreignField: '_id',
                  as: 'resourceInfo'
                }
              },
              {
                $lookup : {
                  from: 'skill_set_lists',
                  localField: 'technology',
                  foreignField: '_id',
                  as: 'technology'
                }
              },
              {
                $lookup : {
                  from: 'admins',
                  localField: 'talentPartners',
                  foreignField: '_id',
                  as: 'talentPartnerInfo'
                }
              },
              {
                $project:{
                    "month": 1,
                    "year": 1,
                    "client": 1,
                    "clientBillingName": 1,
                    "talentPartners": 1,
                    "resource": 1,
                    "technology": 1,
                    "clientBillingCycle": 1,
                    "paymentCycleVendor": 1,
                    "rate": 1,
                    "budgetedSales": 1,
                    "budgetedSalesDollar": 1,
                    "totalNoWorkingDay": 1,
                    "actualBilableDays": 1,
                    "actualSales": 1,
                    "actualSalesDollar": 1,
                    "budgetedCost": 1,
                    "totalWorkingDaysVendor": 1,
                    "actualbillableDaysVendor": 1,
                    "actualCost": 1,
                    "actualCostDollar": 1,
                    "profit": 1,
                    "profitDollar": 1,
                    "profitInPercentage": 1,
                    "geoBusiness": 1,
                    "currentStatus": 1,
                    "remarks":1,
                    "status": 1,
                    "carriedForwardStatus": 1,
                    "_id": 1,
                    "projectStartDate": 1,
                    "clientInfo.name":1,
                    "talentPartnerInfo.name":1,
                    "resourceInfo.name":1,

                    // "client_name": 1,
                    // "talentPartners_name": 1,
                    // "resource_name":1,
                }
              }
            ]);

        finance_data = JSON.parse(JSON.stringify(finance_data));
        // for (let i = 0; i < finance_data.length; i++) {
        //     if (finance_data[i].client != null) {
        //         let getClientName = await Admin.findOne({ _id: ObjectId(finance_data[i].client), role: 'client', isDelete: false }).select('_id name role');
        //         if (getClientName != null) {
        //             finance_data[i].client = getClientName._id;
        //             finance_data[i].client_name = getClientName.name;
        //         }
        //     }

        //     if (finance_data[i].talentPartners != null) {
        //         let getTalentPartnerName = await Admin.findOne({ _id: finance_data[i].talentPartners, role: 'vendor', isDelete: false }).select('_id name role');

        //         if (getTalentPartnerName != null) {
        //             finance_data[i].talentPartners = getTalentPartnerName._id;
        //             finance_data[i].talentPartners_name = getTalentPartnerName.name;
        //         }
        //     }

        //     if (finance_data[i].resource != null) {
        //         let ResourcesName = await Resources.findOne({ _id: finance_data[i].resource, isPullBack: false, isDelete: false });
        //         if (ResourcesName != null) {
        //             finance_data[i].resource = ResourcesName != null ? ResourcesName._id : "";
        //             finance_data[i].resource_name = ResourcesName != null ? ResourcesName.name : "";
        //         }
        //     }


        //     if (finance_data[i].technology != null) {
        //         let TechStackData = [];
        //         for (let j = 0; j < finance_data[i].technology.length; j++) {
        //             if (finance_data[i].technology[j]) {
        //                 let skill_set_listData = await skill_set_list.findOne({ _id: finance_data[i].technology[j] }).select('_id skill');
        //                 TechStackData.push(skill_set_listData)
        //             }
        //         }
        //         finance_data[i].technology = TechStackData;
        //     }
        // }

        let finance_data_total = await financeModel.aggregate([
            {
                $match: {
                    month: findMonth.month,
                    year: findMonth.year
                }
            },
            {
                $group: {
                    _id: null,
                    sum: { $sum: '$profit' }
                    //  client:{$first:'$client'}
                }
            }


        ]);


        let response = {
            finance_data,
            finance_data_total
        }

        if (finance_data.length <= 0) {
            return res.status(200).send({ response, message: "Data not found", status: false });
        }
        else {
            return res.status(200).send({ response, message: "Data found", status: false });

        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, line: error.stack });
    }
}


/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To update finance data on particular record bases for given record ID
 * API: update-finance-data/:id
 * Function: updateFinanceData
 */

const updateFinanceData = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let res_data = await financeModel.findOne({ _id: id });
        if (res_data.length <= 0) {
            return res.status(400).send({ message: "Data not found", status: false });
        }
        else {

            if (data.client && data.clientBillingName 
                && data.talentPartners &&
                data.resource && data.technology &&
                data.projectStartDate && data.rate &&
                data.clientBillingCycle && data.paymentCycleVendor &&
                data.budgetedSales && data.budgetedSalesDollar
                 && data.totalNoWorkingDay &&
                data.actualBilableDays && data.actualSales &&
                data.actualSalesDollar && 
                data.budgetedCost && data.totalWorkingDaysVendor &&
                data.actualbillableDaysVendor && data.actualCost &&
                data.actualCostDollar &&
                data.profit  && data.profitDollar 
                && data.profitInPercentage && data.geoBusiness &&
                data.currentStatus &&
                data.remarks) {
             
                data.status = "completed";
            }

            data.month = parseInt(data.month);
            data.year = parseInt(data.year);

            let deleteTechnology = await financeModel.updateOne( { _id: ObjectId(id) },{ $unset : {"technology" : 1}});
             if(data.technology != null){
            data.technology = await data.technology.map((element)=>{
                return ObjectId(element.trim());
              });
            }
             let updatedFinanceData = await financeModel.updateOne(
                { _id: ObjectId(id) },
                {
                    $set: data 
                });

            if (!updatedFinanceData) {
                return res.status(400).send({ message: "Bad Request", status: false })
            }
            else {
                return res.status(200).send({ message: "Data updated successfully", status: true });
            }


        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message,line:error.stack });
    }
}



/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To get single operational profitability data to update data on monthly bases..
 * API: get-single-operational-profitabiltiy
 * Function: getSingleDataOperationalProfitabiltiy 
 */

const getSingleDataOperationalProfitabiltiy = async (req, res) => {
    if (!req.query.month && !req.query.year) {
        return res.status(400).send({ message: "Please pass month and year..!", status: false });
    }
    try {
        let condition = {};
        condition["month"] = parseInt(req.query.month);
        condition["year"] = parseInt(req.query.year);

        if (req.query.status) {
            condition["status"] = req.query.status;
        }

        let operationalProfitabiltiy = await operationalProfitabiltiyModel.aggregate([
            {
                $match: condition
            },
            {
                $lookup: {
                    from: "other_expenses",
                    localField: "_id",
                    foreignField: "operationId",
                    as: "other_info"
                }
            }
        ]);
        let fillterData = [];
        for (let i = 0; i < operationalProfitabiltiy.length; i++) {
            if (operationalProfitabiltiy[i].status == "otherIncome") {
                fillterData.push({ "otherIncome": operationalProfitabiltiy[i] })
            }
            else if (operationalProfitabiltiy[i].status == "empBenifit") {
                fillterData.push({ "empBenifit": operationalProfitabiltiy[i] })
            }
            else if (operationalProfitabiltiy[i].status == "financeExp") {
                fillterData.push({ "financeExp": operationalProfitabiltiy[i] })
            }
            else if (operationalProfitabiltiy[i].status == "marketingExp") {
                fillterData.push({ "marketingExp": operationalProfitabiltiy[i] })
            }
            else if (operationalProfitabiltiy[i].status == "softExp") {
                fillterData.push({ "softExp": operationalProfitabiltiy[i] })
            }
            else if (operationalProfitabiltiy[i].status == "otherExp") {
                fillterData.push({ "otherExp": operationalProfitabiltiy[i] })
            }
            else if (operationalProfitabiltiy[i].status == "admCost") {
                fillterData.push({ "admCost": operationalProfitabiltiy[i] })
            }

        }


        let finance_data_total = await financeModel.aggregate([
            {
                $match: {
                    month: parseInt(req.query.month),
                    year: parseInt(req.query.year)
                }
            },
            {
                $group: {
                    _id: null,
                    sum: { $sum: '$profit' }
                    //  client:{$first:'$client'}
                }
            }


        ]);


        let response = {
            fillterData,
            finance_data_total
        }

        if (operationalProfitabiltiy.length <= 0) {
            return res.status(200).send({ response, message: "Data not found", status: false });
        }
        else {
            return res.status(200).send({ response, message: "Data found", status: false });

        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, line: error.stack });
    }
}


/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To get all operational profitability data for whole year on monthly bases..
 * API: get-all-operational-profitabiltiy
 * Function: getAllOperationalProfitabiltiyData 
 */


const getAllOperationalProfitabiltiyData = async (req, res) => {
    if (!req.query.year) {
        return res.status(400).send({ message: "Please pass  year..!", status: false });
    }
    try {
        //    let dDate = new Date(req.query.year +"-" + +"-"+"01");
        // let startDate = new Date(req.query.year);
        // let endDate = new Date(req.query.year, 11, 31);
        let one = parseInt(req.query.year) + '-04-01';
        let two = parseInt(req.query.year) + 1 + '-03-31';
        let startDate = new Date(one);
        let endDate = new Date(two);

        // To find the data from created at field and sum thae key...  

        let monthWiseData = await operationalProfitabiltiyModel.aggregate([
            {
                $match: {
                    $and: [
                        { createdAt: { $gte: startDate } },
                        { createdAt: { $lte: endDate } }
                    ]
                }
            },
            // {"$group":{
            //   "_id":{"month":{"$month":"$createdAt"},"year":{"$year":"$createdAt"}},
            //   "data":{"$push":"$$ROOT"}
            // }},
            // {"$sort":{"month":-1,"year":-1}}
        ]);



        // let monthWiseData = await operationalProfitabiltiyModel.aggregate([
        //     {
        //         $match: {
        //             $and: [
        //                 { createdAt: { $gte: startDate } },
        //                 { createdAt: { $lte: endDate } }
        //             ]
        //         }
        //     },
        //     // { $group: { _id : null,
        //     //              sum : { $sum: '$profit' }
        //     //             //  client:{$first:'$client'}
        //     //           } }
        //     // }



        // ]);

        let response = {
            monthWiseData
        }

        // if (monthWiseData.length <= 0) {
        //     return res.status(200).send({  message: "Data not found", status: false });
        // }
        // else {
        return res.status(200).send({ response, message: "Data found", status: false });

        // }

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To add operational profitability data
 * API: add-operational-profitabiltiy
 * Function: addOperationalProfitabiltiyData 
 */

const addOperationalProfitabiltiyData = async (req, res) => {

    try {
        let data = req.body;

        if (!data.status) {
            return res.status(400).send({ message: "Please send status", status: false });
        }
        if (!data.month || !data.year) {
            return res.status(400).send({ message: "Please pass month and year..!", status: false });
        }

        data.month = parseInt(data.month);
        data.year = parseInt(data.year);

        let opProfit_res = await operationalProfitabiltiyModel(data).save();

        if (opProfit_res) {
            if (data.other) {
                for (let i = 0; i < data.other.length; i++) {
                    let myOtherData = {
                        operationId: opProfit_res._id,
                        month: data.month,
                        year: data.year,
                        otherName: parseFloat(data.other[i]),
                        status: data.status
                    }
                    let other_data = await otherExpenseModel(myOtherData).save();
                }
            }
        }

        // let res_data = {
        //     financeId: data.financeId,
        //     compExpense: data.compExpense,
        //     contractorExpense: data.contractorExpense,
        //     electricityBill: data.electricityBill,
        //     generatorRent: data.generatorRent,
        //     housekeepingCharges: data.housekeepingCharges,
        //     insuranceExpense: data.insuranceExpense,
        //     internetExpense: data.internetExpense,
        //     officeRent: data.officeRent,
        //     admExpense: data.admExpense,
        //     telExpense: data.telExpense,
        //     travelExpense: data.travelExpense,
        //     waterExpense: data.waterExpense,
        //     empPartyExpense: data.empPartyExpense,
        //     exchange: data.exchange,
        //     keymanExpPolicy: data.keymanExpPolicy,
        //     welfareExpense: data.welfareExpense,
        //     maintainance: data.maintainance,
        //     ROC: data.ROC,
        //     entertainment: data.entertainment,
        //     stationaryExpense: data.stationaryExpense,
        //     systemRent: data.systemRent,
        //     officeEquipment: data.officeEquipment,
        //     licenseAndPermits: data.licenseAndPermits
        // }

        if (opProfit_res)
            return res.status(200).send({ message: "Data added successfully", status: true });
        else
            return res.status(400).send({ message: "Not added Error in data..", status: false });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message })
    }

}


/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To update operational profitability data
 * API: update-operational-profitabiltiy
 * Function: updateoperationalProfitabiltiyData 
 */

const updateoperationalProfitabiltiyData = async (req, res) => {

    try {
        let data = req.body;
        let id = data.id;
        let otherData = data.other;

        if (data.month || data.year) {
            return res.status(200).send({ message: "You can not update month & year.", status: false });
        }

        let res_data = await operationalProfitabiltiyModel.findOne({ _id: id });
        if (res_data.length <= 0) {
            return res.status(200).send({ message: "Data not found", status: false });
        }
        else {
            delete data.id;
            delete data.other;
            // let myUpperData = {

            //     hrSoftware : parseFloat(data.hrSoftware),
            //     accountingSoftware : parseFloat( data.accountingSoftware)
            // }
            let updatedFinanceValue = await operationalProfitabiltiyModel.updateOne({ _id: ObjectId(id) }, { $set: data });

            if (otherData) {
                for (let i = 0; i < otherData.length; i++) {

                    let updateOtherValue = await otherExpenseModel.updateOne(
                        {
                            _id: ObjectId(otherData[i]._id),
                            operationId: ObjectId(id)
                        },
                        {
                            $set: { otherName: parseFloat(otherData[i].value) }
                        }
                    )

                }
            }


            if (!updatedFinanceValue) {
                return res.status(200).send({ message: "Bad Request", status: false })
            }
            else {
                return res.status(200).send({ message: "Data updated successfully", status: true });
            }


        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**
 * Created By: Shubhankar kesharwani
 * Created Date: 13-06-2022
 * Desc: To add client attachments 
 * API: add-client-attachments/:id (id is base64 encoded _id) 
 * Function: addClientAttachments 
 */

const addClientAttachments = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the id", status: false });
    }
    try {
        let client_id = base64decode(req.params.id);
        let client_attachments = [];
        if (req.files && req.files.attachments) {
            req.files.attachments.map(file => {
                client_attachments.push(file.location);
            });
        }

        let alreadyFinanceData = await financeModel.findOne({ _id: client_id });
        if (alreadyFinanceData.attachments != null) {
            let delData = await awsFileDelete(alreadyFinanceData.attachments);
        }


        let financeAttachmentUpdate = await financeModel.updateOne(
            { _id: client_id },
            {
                $set: { attachments: client_attachments },
            });

        if (financeAttachmentUpdate) {
            return res.status(200).send({ message: "Data added sucessfully ..!", status: true });
        }
        else {
            return res.status(200).send({ message: "Data not added ..!", status: false });
        }

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}



/**
 * Created By: Shubhankar Kesharwani
 * Created Date: 16-06-2022
 * Desc: To get all particular client attachments
 * API:get-client-attachments/:id
 * Function: getParticularClientAttachments
 */

const getParticularClientAttachments = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the id", status: false });
    }
    try {
        let client_id = base64decode(req.params.id);

        let response = await financeModel.findOne({ _id: client_id })

        if (response) {
            return res.status(200).send({ response: response.attachments, message: "Data found sucessfully ..!", status: true });
        }
        else {
            return res.status(200).send({ message: "Data not found ..!", status: false });
        }

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/**
 * Created By: Shubhankar Kesharwani
 * Created Date: 14-06-2022
 * Desc: To get all telant partner for finance module 
 * API:get-talentpartner
 * Function: getTalentPartnerForFinance
 */
const getTalentPartnerForFinance = async (req, res) => {

    try {
        let condition = {};
        condition["role"] = 'vendor';
        condition["isDelete"] = 'false';

        if (req.query.search && req.query.search.length != 0) {
            condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
        }

        let getAllTalentPartner = await Admin.find(condition).select('_id name role');
        return res.status(200).send({ message: "all data..!", status: true, getAllTalentPartner });


    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/**
 * Created By: Shubhankar Kesharwani
 * Created Date: 30-06-2022
 * Desc: To get resources and there technolog (techStck,skill) of given talentPartner Id... 
 * API:get-resources-of-talentpartner/:id
 * Function: getResourcesOfTalentpartner
 */

const getResourcesOfTalentpartner = async (req, res) => {

    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the id", status: false });
    }

    try {
        let id = base64decode(req.params.id);

        let condition = {};
        condition["vendorId"] = ObjectId(id);
        condition["isPullBack"] = false;
        condition["isDelete"] = false;

        if (req.query.search && req.query.search.length != 0) {
            condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
        }

        let response = await Resources.aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: 'skill_set_lists',
                    localField: 'techStack',
                    foreignField: '_id',
                    as: 'skillset_info'
                }
            },
            {
                $project: {
                    "name": 1,
                    "skillset_info._id": 1,
                    "skillset_info.skill": 1
                }
            }
        ])


        // let getAllTalentPartner = await Admin.findOne({ role: 'vendor', isDelete: false, ebPOC: ObjectId(id) });
        // if (getAllTalentPartner != null) {
        // let response = await Resources.find(condition).select("_id name techStack");

        return res.status(200).send({ message: "all data..!", status: true, response });


    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**
 * Created By: Shubhankar Kesharwani
 * Created Date: 17-06-2022
 * Desc: To get all data for particular month & year wise ... 
 * API:get-financeData-in-excel
 * Function: getFinanceDataInExcel
 */
const getFinanceDataInExcel = async (req, res) => {
    if (!req.query.month && !req.query.year) {
        return res.status(400).send({ message: "Please pass month & year..!", status: false });
    }
    try {
        let workbook = new ExcelJs.Workbook();
        let worksheet = workbook.addWorksheet("finance");
        worksheet.columns = [
            { header: "s_no", key: "s_no", width: 10 },
            { header: "Client", key: "client", width: 20 },
            { header: "Client Billing Name", key: "clientBillingName", width: 20 },
            { header: "Talent Parnter", key: "talent_parnter", width: 20 },
            { header: "Resource", key: "resource", width: 20 },
            { header: "Technology", key: "technology", width: 35 },
            { header: "Project Start Date", key: "project_start_date", width: 25 },
            { header: "Client billing cycle", key: "client_billing_cycle", width: 25 },
            { header: "Payment Cycle (Vendor)", key: "payment_cycle", width: 25 },
            { header: "Rate", key: "rate", width: 25 },
            { header: "Budgeted Sales", key: "budgetedSales", width: 25 },
            { header: "Budgeted Sales Dollar", key: "budgetedSalesDollar", width: 25 },
            { header: "Total No of working days", key: "total_no_of_working_days", width: 20 },
            { header: "Actual billable days", key: "actual_billable_days", width: 20 },
            { header: "Actual Sales", key: "actual_sales", width: 20 },
            { header: "Actual Sales Dollar", key: "actualSalesDollar", width: 20 },
            { header: "Budgeted cost", key: "budgeted_cost", width: 25 },
            { header: "Total working days (Vendor)", key: "total_working_days", width: 25 },
            { header: "Actual billable days (Vendor)", key: "actual_billable_days_vendor", width: 25 },
            { header: "Actual Cost", key: "actual_cost", width: 25 },
            { header: "Actual Cost Dollar", key: "actualCostDollar", width: 25 },
            { header: "Profit", key: "profit", width: 20 },
            { header: "Profit Dollar", key: "profitDollar", width: 20 },
            { header: "Profit %", key: "profit_percentage", width: 20 },
            { header: "Geo. Business", key: "geoBusiness", width: 20 },
            { header: "Current Status", key: "currentStatus", width: 20 },
            // { header: "Agreement Start Date", key: "agreement_start_date", width: 20 },
            // { header: "Agreemet End Date", key: "agreemet_end_date", width: 20 },
            { header: "Remarks", key: "remarks", width: 20 },

        ];

        //  req.query.year = req.query.year.split("-")[0];

        let finalYear = parseInt(req.query.year);
        let monthArray =
        [
            { num: 1, month: 4, name: 'April', year: finalYear },
            { num: 2, month: 5, name: 'May', year: finalYear },
            { num: 3, month: 6, name: 'June', year: finalYear },
            { num: 4, month: 7, name: 'July', year: finalYear },
            { num: 5, month: 8, name: 'August', year: finalYear },
            { num: 6, month: 9, name: 'September', year: finalYear },
            { num: 7, month: 10, name: 'October', year: finalYear },
            { num: 8, month: 11, name: 'November', year: finalYear },
            { num: 9, month: 12, name: 'December', year: finalYear },
            { num: 10, month: 1, name: 'January', year: finalYear + 1 },
            { num: 11, month: 2, name: 'Febraury', year: finalYear + 1 },
            { num: 12, month: 3, name: 'March', year: finalYear + 1 },
        ];
        let findMonth = monthArray.find(item => item.num === parseInt(req.query.month));
        let finance_data = await financeModel.find({ month: parseInt(findMonth.month), year: parseInt(findMonth.year) });
        finance_data = JSON.parse(JSON.stringify(finance_data));
        let tutorials = [];

        for (let i = 0; i < finance_data.length; i++) {
            let a = [];
            if(finance_data[i].technology !== null)
            {
                for (let j = 0; j < finance_data[i].technology.length; j++) {
                    if (ObjectId.isValid(finance_data[i].technology[j]) == true) {
                        var skillSetListData = await Skillset_list.findOne({ _id: finance_data[i].technology[j] }).select("_id skill");
                        a.push(skillSetListData.skill)
                    }
                }
            }

            if (finance_data[i].client != null) {
                let getClientName = await Admin.findOne({ _id: ObjectId(finance_data[i].client), role: 'client', isDelete: false });
                if (getClientName != null) {
                    finance_data[i].client = getClientName.name;
                }
            }

            if (finance_data[i].talentPartners != null) {
                let getTalentPartnerName = await Admin.findOne({ _id: finance_data[i].talentPartners, role: 'vendor', isDelete: false });

                if (getTalentPartnerName != null) {
                    finance_data[i].talentPartners = getTalentPartnerName.name;

                }
            }

            if (finance_data[i].resource != null) {
                let ResourcesName = await Resources.findOne({ _id: finance_data[i].resource, isPullBack: false, isDelete: false });
                if (ResourcesName != null) {
                    finance_data[i].resource = ResourcesName.name;
                }
            }
            tutorials.push({
                s_no: i + 1,
                client: finance_data[i].client,
                clientBillingName:finance_data[i].clientBillingName,
                talent_parnter: finance_data[i].talentPartners,
                resource: finance_data[i].resource,
                technology: a.join(", "),
                project_start_date: finance_data[i].projectStartDate,
                client_billing_cycle: finance_data[i].clientBillingCycle,
                payment_cycle: finance_data[i].paymentCycleVendor,
                rate:finance_data[i].rate,
                budgetedSales:finance_data[i].budgetedSales,
                budgetedSalesDollar:finance_data[i].budgetedSalesDollar,
                budgeted_sales: finance_data[i].budgetedSales,
                total_no_of_working_days: finance_data[i].totalNoWorkingDay,
                actual_billable_days: finance_data[i].actualBilableDays,
                actual_sales: finance_data[i].actualSales,
                actualSalesDollar:finance_data[i].actualSalesDollar,
                budgeted_cost: finance_data[i].budgetedCost,
                total_working_days: finance_data[i].totalWorkingDaysVendor,
                actual_billable_days_vendor: finance_data[i].actualbillableDaysVendor,
                actual_cost: finance_data[i].actualCost,
                actualCostDollar:finance_data[i].actualCostDollar,
                profit: finance_data[i].profit,
                profitDollar:finance_data[i].profitDollar,
                profit_percentage: finance_data[i].profitInPercentage,
                geoBusiness:finance_data[i].geoBusiness,
                currentStatus:finance_data[i].currentStatus,
                remarks: finance_data[i].remarks
            })
        }

        tutorials.map(res => { worksheet.addRow(res); })
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "Finance Data" + " (" + req.query.month + " - " + req.query.year + ")" + '.xlsx'
        );
        return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
        });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}



/**
 * Created By: Shubhankar Kesharwani
 * Created Date: 30-06-2022
 * Desc: To carried forward data from one month to another, at the end of month ... 
 * API:forward-data-to-next-month
 * Function: forwardDataToNextMonth
 */

const forwardDataToNextMonth = async (req, res) => {
    if (!req.query.month && !req.query.year) {
        return res.status(400).send({ message: "Please pass month & year..!", status: false });
    }
    try {console.log("haha working fine");
        return res.send("ha ha working fine");
        req.query.year = req.query.year.split("-")[0];
        let finalYear = parseInt(req.query.year);
        let monthArray =
        [
            { num: 1, month: 4, name: 'April', year: finalYear },
            { num: 2, month: 5, name: 'May', year: finalYear },
            { num: 3, month: 6, name: 'June', year: finalYear },
            { num: 4, month: 7, name: 'July', year: finalYear },
            { num: 5, month: 8, name: 'August', year: finalYear },
            { num: 6, month: 9, name: 'September', year: finalYear },
            { num: 7, month: 10, name: 'October', year: finalYear },
            { num: 8, month: 11, name: 'November', year: finalYear },
            { num: 9, month: 12, name: 'December', year: finalYear },
            { num: 10, month: 1, name: 'January', year: finalYear + 1 },
            { num: 11, month: 2, name: 'Febraury', year: finalYear + 1 },
            { num: 12, month: 3, name: 'March', year: finalYear + 1 },
        ];

        let findMonth = monthArray.find(item => item.num === parseInt(req.query.month));

        let finance_data = await financeModel.find({ month: parseInt(findMonth.month), year: parseInt(findMonth.year), currentStatus: { $nin: 'drop' },carriedForwardStatus:"not-forward" });
        finance_data = JSON.parse(JSON.stringify(finance_data));

        if (finance_data.length > 0) {
            for (let i = 0; i < finance_data.length; i++) {
                if (finance_data[i].month === 12) {
                    finance_data[i].month = 1; // to increase month
                    finance_data[i].year = finance_data[i].year + 1 // to increase year
                }
                else {
                    finance_data[i].month = finance_data[i].month + 1 //for rest 11 months increment
                }
                 
                let oldRecordId = finance_data[i]._id;
                delete finance_data[i]._id;
                delete finance_data[i].createdAt;
                delete finance_data[i].updatedAt;
                delete finance_data[i].__v;

                let againEntryforNextmonth = await financeModel(finance_data[i]).save();
              
                //If data is forward into next month than current month record carriedForwardStatus will change into (forward) 
                if(againEntryforNextmonth){
                    let updatedFinanceDataCurrentMonthRecord = await financeModel.updateOne(
                        { _id: ObjectId(oldRecordId) },
                        { $set: {carriedForwardStatus:"forward"}});
                }

            }
        }
        return res.status(200).send({ message: "Data forward to the next month Sucessfully", status: true, totalDataForward: finance_data.length });

    } catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, line: error.stack });
    }
}

/**
 * Created By: Shubhankar Kesharwani
 * Created Date: 30-06-2022
 * Desc: To carried forward data from one month to another, at the end of month ... 
 * API:forward-data-to-next-month-for-cron
 * Function: forwardDataToNextMonthForCron
 */

 const forwardDataToNextMonthForCron = async (req, res) => {
    if (!req.query.month && !req.query.year) {
        return res.status(400).send({ message: "Please pass month & year..!", status: false });
    }
    try {
        req.query.year = req.query.year.split("-")[0];
        let finalYear = parseInt(req.query.year);
        let monthArray =
        [
            { num: 1, month: 4, name: 'April', year: finalYear },
            { num: 2, month: 5, name: 'May', year: finalYear },
            { num: 3, month: 6, name: 'June', year: finalYear },
            { num: 4, month: 7, name: 'July', year: finalYear },
            { num: 5, month: 8, name: 'August', year: finalYear },
            { num: 6, month: 9, name: 'September', year: finalYear },
            { num: 7, month: 10, name: 'October', year: finalYear },
            { num: 8, month: 11, name: 'November', year: finalYear },
            { num: 9, month: 12, name: 'December', year: finalYear },
            { num: 10, month: 1, name: 'January', year: finalYear + 1 },
            { num: 11, month: 2, name: 'Febraury', year: finalYear + 1 },
            { num: 12, month: 3, name: 'March', year: finalYear + 1 },
        ];

        let findMonth = monthArray.find(item => item.num === parseInt(req.query.month));
        let finance_data = await financeModel.find({ month: parseInt(findMonth.month), year: parseInt(findMonth.year), currentStatus: { $nin: 'drop' },carriedForwardStatus:"not-forward" });
        finance_data = JSON.parse(JSON.stringify(finance_data));
        if (finance_data.length > 0) {
            for (let i = 0; i < finance_data.length; i++) {
                if (finance_data[i].month === 12) {
                    finance_data[i].month = 1; // to increase month
                    finance_data[i].year = finance_data[i].year + 1 // to increase year
                }
                else {
                    finance_data[i].month = finance_data[i].month + 1 //for rest 11 months increment
                }
                 
                let oldRecordId = finance_data[i]._id;
                delete finance_data[i]._id;
                delete finance_data[i].createdAt;
                delete finance_data[i].updatedAt;
                delete finance_data[i].__v;

                let againEntryforNextmonth = await financeModel(finance_data[i]).save();
              
                //If data is forward into next month than current month record carriedForwardStatus will change into (forward) 
                if(againEntryforNextmonth){
                    let updatedFinanceDataCurrentMonthRecord = await financeModel.updateOne(
                        { _id: ObjectId(oldRecordId) },
                        { $set: {carriedForwardStatus:"forward"}});
                }

            }
        }
        return res.status(200).send({ message: "Data forward to the next month Sucessfully", status: true, totalDataForward: finance_data.length });

    } catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, line: error.stack });
    }
}

module.exports = {
    registerFinanceUser,
    addFinanceData,
    getFinanceData,
    updateFinanceData,
    addOperationalProfitabiltiyData,
    updateoperationalProfitabiltiyData,
    getAllOperationalProfitabiltiyData,
    getSingleDataOperationalProfitabiltiy,
    addClientAttachments,
    getParticularClientAttachments,
    getTalentPartnerForFinance,
    getResourcesOfTalentpartner,
    getFinanceDataInExcel,
    forwardDataToNextMonth,
    forwardDataToNextMonthForCron
}

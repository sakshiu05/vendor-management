// 'use strict';
// const Vendor = require('./vendor.model').Vendor;
const Vendor = require("../models/admin").Admin;
let func = require("../common/commonfunction");
let Admin = require("../models/admin").Admin;
const adminLog = require("../models/adminLog").adminLog;
// const Resource = require("../resource/resource.model").Resources;
const Resource = require("../models/resource").Resources;
const phoneModel = require("../models/phoneNumber").phone;
const engineerWorkDetail = require("../models/engineer_work_details").workDetails;
const Premium_logs = require("../common/logs_message");

const _ = require("lodash");
const { base64encode, base64decode } = require("nodejs-base64");
var bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectID;


/*
 * --------------------------------------------------------------------------
 * vendor listing API start
 * ---------------------------------------------------------------------------
 */
/**
 * Function - show
 * Description - to see all vendors
 * API - vendor
 * Developer -
 * Created on -
 * Updates - 28-12-2021
 * Updated by - Shubham Kumar
 * Updated on - added filter
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const show = async (req, res, next) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  // func.checkUserAuthentication(req, res, async function (payload) {
  try {
    let condition = {};
    condition["role"] = "vendor";
    condition["isDelete"] = false;
    if(res.userRole == "vendor-associate"){
      condition["ebPOC"] = res.userId;
    }
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = {
        $regex: ".*" + req.query.search.toLowerCase() + ".*",
      };
    }
    if (req.query.email && req.query.email.length != 0) {
      condition["email"] = { $regex: req.query.email };
    }
    if (req.query.ebPOC && req.query.ebPOC.length != 0) {
      let ebPOCId = base64decode(req.query.ebPOC);
      condition["ebPOC"] = { $all: ebPOCId };
    }
    var vendorData = await Admin.find(condition).sort({ _id: -1 }).skip(offset).limit(limit);
    
    if (vendorData.length > 0) {
      let newObj = [];

      for (let index = 0; index < vendorData.length; index++) {
        var obj = {};

        const element = vendorData[index];


        obj.name = element.name;
        obj.vendorId = element._id;
        obj.email = element.email;
        obj.phone = element.phone;
        obj.otherPhone = element.otherPhone;
        obj.vendorContactPerson = element.vendorContactPerson;
        if(element.ebPOC){
          obj.ebPOC = await Admin.find({ _id: element.ebPOC }, {_id:1, name:1});
        }

        for (let index = 0; index < vendorData.length; index++) {
          var obj = {};

          const element = vendorData[index];

          obj.name = element.name;
          if(element.ebPOC){
            obj.ebPOC =  await Admin.find({ _id: element.ebPOC },  {_id:1, name:1});
          }
          obj.vendorId = element._id;
          obj.email = element.email;
          obj.phone = element.phone;
          obj.vendorContactPerson = element.vendorContactPerson;

          var resourceData = await Resource.findOne({
            vendorId: ObjectId(element._id),
          }).lean();

        let PendingResourceData = 0;
        let RejectedResourceData = 0;
        let QualifiedResourceData = 0;
        let HiredResourceData = 0;
        let DraftData = 0; //only for individual engineer 
          if(element.email == "engineervendor@gmail.com"){
            PendingResourceData = await engineerWorkDetail
              .find({"basic_info_completed":true,"basic_test_completed":true}).select("_id");//lator correct by countDocuments()
            RejectedResourceData = [];
            QualifiedResourceData = [];
            HiredResourceData = 0;
            
            DraftData1 = await Admin.aggregate([
              { $match: {role:'engineer'} },
              {
                $lookup: {
                  from:"workdetails",
                  localField:"_id",
                  foreignField:"engineer_id",
                  as:"engineer_work_info"
                }
              },
              {$project: {
                "_id":1, "engineer_work_info.basic_info_completed":1, "engineer_work_info.basic_test_completed":1
              }}
            ]);
            let enggIncompleteProfileCount= 0;
            for(let x=0; x<DraftData1.length; x++){
              if(!DraftData1[x].engineer_work_info[0]){
                enggIncompleteProfileCount++;
              }else if(DraftData1[x].engineer_work_info[0].basic_info_completed == false || DraftData1[x].engineer_work_info[0].basic_test_completed == false ){
                enggIncompleteProfileCount++;
              }
            }
            
            DraftData = enggIncompleteProfileCount;

          }else{
            PendingResourceData = await Resource.find({
              vendorId: element._id,
              status: "Pending",
              isDelete: false,
              isPullBack: {$ne: true}
            }).lean();

            RejectedResourceData = await Resource.find({
              vendorId: element._id,
              status: "Rejected",
              isDelete: false,
              isPullBack: {$ne: true}
            }).lean();

            QualifiedResourceData = await Resource.find({
              vendorId: element._id,
              status: "Qualified",
              isDelete: false,
              isHired: false,
              isPullBack: {$ne: true}
            }).lean();

            HiredResourceData = await Resource.find({
              vendorId: element._id, 
              isDelete: false,
              status: "Qualified",
              isHired: true,
              isPullBack: {$ne: true}
            })
            .countDocuments();

          }

          if (resourceData) {
            obj["lastResourceAdded"] = resourceData.createdAt;
            obj.lastResourceVerified = resourceData.updatedAt;
          } else {
            obj.lastResourceAdded = "NA";
            obj.lastResourceVerified = "NA";
          }

          // obj.lastResourceAdded =
          //   resourceData && resourceData.createdAt ? obj.lastResourceAdded : null;
          // obj.lastResourceVerified =
          //   resourceData && resourceData.updatedAt
          //     ? obj.lastResourceVerified
          //     : null;

          if (PendingResourceData.length == 0) {
            obj.PendingResources = 0;
          } else {
            obj.PendingResources = PendingResourceData.length;
          }

          if (RejectedResourceData.length == 0) {
            obj.RejectedResources = 0;
          } else {
            obj.RejectedResources = RejectedResourceData.length;
          }

          if (QualifiedResourceData.length == 0) {
            obj.QualifiedResources = 0;
          } else {
            obj.QualifiedResources = QualifiedResourceData.length;
          }          

          // if (HiredResourceData >= 0) {
            obj.HiredResources = HiredResourceData;
          // }

          // let pullBackResourceData = await Resource.find({
          //   vendorId: element._id, isDelete: false,
          //   isPullBack: true,
          // }).countDocuments();
          let pullBackResourceData = await Resource.find({ isDelete: false, vendorId: element._id, isPullBack: true }).countDocuments();
          if (pullBackResourceData >= 0) {
            obj.pullBackResources = pullBackResourceData;
          }

          if(element.email == "engineervendor@gmail.com"){
            obj.DraftCount = DraftData;
          }
          newObj.push(obj);
        }

        // if (_.isEmpty(vendorData)) {
        //   return res.status(200).send({
        //     message: "vendor data not found",
        //     status: false,
        //   });
        // }

        //filter info
       
        // if(res.userRole == "vendor-associate"){
        //    tot_vendor = await Admin.find({ role: "vendor" , ebPOC: res.userId}).countDocuments();
        // }else{
        //    tot_vendor = await Admin.find({ role: "vendor" }).countDocuments();
        // }
        let tot_vendor;
        let tot_resource;
        let qualified_resource;
        let pending_resource;
        let rejected_resource;
        let hired_resource;
        let pullBack_resource;

        let total = await Admin.find(condition).countDocuments();//var name interchanged by shubham
        tot_vendor = await Admin.find({"role":"vendor","isDelete":false}).countDocuments();
        
        if (res.userRole == "vendor-associate" || condition["name"] ||  condition["email"] ||  condition["ebPOC"]) {
          let venderFromPOC = await Admin.find(condition, { _id: 1 })
          const idArr = new Array();
          venderFromPOC.forEach(element => {
            idArr.push(element.id);
          });
          tot_resource = await Resource.find({isDelete: false, vendorId:{ $in: idArr }}).countDocuments();
          qualified_resource = await Resource.find({status: "Qualified", isPullBack: false,isDelete: false, isHired:false, vendorId:{ $in: idArr }}).countDocuments();
          pending_resource = await Resource.find({status: "Pending", isPullBack:false, isDelete: false, vendorId:{ $in: idArr }}).countDocuments();
          rejected_resource = await Resource.find({ status: "Rejected", isPullBack: false, isDelete: false, vendorId:{ $in: idArr }}).countDocuments();
          hired_resource = await Resource.find({status: "Qualified", isPullBack: false, isDelete: false,isHired: true, vendorId:{ $in: idArr }}).countDocuments();
          pullBack_resource = await Resource.find({isDelete: false, isPullBack: true, vendorId:{ $in: idArr }}).countDocuments();
          //  if(pullBack_resource > 0){
          //    qualified_resource = qualified_resource - pullBack_resource; 
          //  }
        }else{
          tot_resource = await Resource.find({isDelete: false}).countDocuments();
          qualified_resource = await Resource.find({status: "Qualified",isPullBack: false, isDelete: false, isHired:false}).countDocuments();
          pending_resource = await Resource.find({status: "Pending", isPullBack: false, isDelete: false}).countDocuments();
          rejected_resource = await Resource.find({ status: "Rejected", isPullBack: false, isDelete: false}).countDocuments();
          hired_resource = await Resource.find({status: "Qualified", isPullBack: false, isDelete: false,isHired: true,}).countDocuments();
          pullBack_resource = await Resource.find({isDelete: false,isPullBack: true,}).countDocuments();
          // if(pullBack_resource > 0){
          //   qualified_resource = qualified_resource - pullBack_resource; 
          // }
        }
        
      

        let filter_info = {};
        filter_info["total_vendor"] = tot_vendor;
        filter_info["all_resources"] = tot_resource;
        filter_info["rejected_resource"] = rejected_resource;
        filter_info["qualified_resource"] = qualified_resource;
        filter_info["pending_resource"] = pending_resource;
        filter_info["hired_resource"] = hired_resource;
        filter_info["pullBack_resource"] = pullBack_resource;
        filter_info["total"] = total;
        //filter info end

        return res.json({
          status: 200,
          message: "Data found",
          data: newObj,
          filter_info: filter_info
        });
      }

    } else {
      let filter_info = {};
      filter_info["total_vendor"] = 0;
      filter_info["all_resources"] = 0;
      filter_info["rejected_resource"] = 0;
      filter_info["qualified_resource"] = 0;
      filter_info["pending_resource"] = 0;
      filter_info["hired_resource"] = 0;
      filter_info["pullBack_resource"] = 0;
      return res.json({
        status: false,
        message: "Data not found",
        filter_info: filter_info,
      });
    }

  } catch (e) {
    return res.status(200).send({
      message: e.message,
      status: false,
      line:e.stack
    });
  }
  // });
};

/*
 * --------------------------------------------------------------------------
 * vendor signUp API start
 * ---------------------------------------------------------------------------
 */

const vendorSignUp = async (req, res) => {
  // func.checkUserAuthentication(req, res, async function (payload) {
  const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
  const tokenInfo = func.decodeToken(usertoken);
  const admin = new Admin();
  const data = req.body;
  let randomText = "guest" + Math.floor(100000 + Math.random() * 900000);

  // admin.password = randomText; // password removed as of now sachin sir said on call.
  if (!data.email) {
    return res
      .status(400)
      .send({ message: "Please fill vendor email.", status: false });
  }
  if (!data.name) {
    return res
      .status(400)
      .send({ message: "Please fill vendor name.", status: false });
  }
  if (!data.ebPOC) {
    return res
      .status(400)
      .send({ message: "Please fill ebPOC.", status: false });
  }
  if (!data.vendorContactPerson) {
    return res
      .status(400)
      .send({ message: "Please fill name of contact person.", status: false });
  } else {
    admin.vendorContactPerson = data.vendorContactPerson;
  }
  let mob_no1 = [];
  if(data.mobile_number){
    mob_no1 = data.mobile_number;
  }
  if(data.mobile_number){
    // data.mobile_number = JSON.parse(data.mobile_number);
      if (!data.mobile_number.number) {
        return res.status(400).send({message : "Please enter the number", status : false})
      }
    if (data.mobile_number.internationalNumber) {
      data.internationalNumber = data.mobile_number.internationalNumber;
    }
    if (data.mobile_number.nationalNumber) {
      data.nationalNumber = data.mobile_number.nationalNumber
    }
    if (data.mobile_number.e164Number) {
        data.e164Number = data.mobile_number.e164Number
    }
    if (data.mobile_number.countryCode) {
      data.countryCode = data.mobile_number.countryCode
    }
    if (data.mobile_number.dialCode) {
      data.dialCode = data.mobile_number.dialCode
    }
} 
let mob_no2 = [];
  if(data.other_number){
    mob_no2 = data.other_number;
  }
if(data.other_number){
  // data.mobile_number = JSON.parse(data.mobile_number);
    if (data.other_number.number) {
      data.number = data.other_number.number;
    }
  if (data.other_number.internationalNumber) {
    data.internationalNumber = data.other_number.internationalNumber;
  }
  if (data.other_number.nationalNumber) {
    data.nationalNumber = data.other_number.nationalNumber
  }
  if (data.other_number.e164Number) {
      data.e164Number = data.other_number.e164Number
  }
  if (data.other_number.countryCode) {
    data.countryCode = data.other_number.countryCode
  }
  if (data.other_number.dialCode) {
    data.dialCode = data.other_number.dialCode
  }
} 
let phone_arr = {};
if(req.body.mobile_number && req.body.mobile_number.number){
  phone_arr["number"] = data.mobile_number.number,
  phone_arr["internationalNumber"]= data.mobile_number.internationalNumber,
  phone_arr["nationalNumber"]= data.mobile_number.nationalNumber,
  phone_arr["e164Number"] = data.mobile_number.e164Number,
  phone_arr["countryCode"] = data.mobile_number.countryCode,
  phone_arr["dialCode"] = data.mobile_number.dialCode
}

let other_phone_arr = {};
if(req.body.other_number && req.body.other_number.number){
    other_phone_arr["number"] = data.other_number.number,
    other_phone_arr["internationalNumber"]= data.other_number.internationalNumber,
    other_phone_arr["nationalNumber"]= data.other_number.nationalNumber,
    other_phone_arr["e164Number"] = data.other_number.e164Number,
    other_phone_arr["countryCode"] = data.other_number.countryCode,
    other_phone_arr["dialCode"] = data.other_number.dialCode
}
// let phone = await new phoneModel(phone_arr).save();

  admin.role = "vendor";
  admin.email = req.body.email;
  admin.name = req.body.name.toLowerCase();
  admin.ebPOC = req.body.ebPOC
  admin.addedBy = tokenInfo.sub;
  if(req.body.mobile_number && req.body.mobile_number.number){
    admin.phone = req.body.mobile_number.number;
  }
  if(req.body.other_number && req.body.other_number.number){
    admin.otherPhone = req.body.other_number.number;
  }
  let adminData = await Admin.find({ $or: [{ email: admin.email, role:"vendor" }, { name: admin.name, role:"vendor" }, { phone: admin.phone, role:"vendor"}] });
  if (adminData.length > 0 && adminData[0].isDelete == false) {
    return res.status(400).send({ message: `User already exist as a ${adminData[0].role}`, status: false });
  }else{
    if(adminData.length > 0 && adminData[0].isDelete == true){
      let deleteVendor = await Admin.deleteOne({_id: adminData[0]._id})
    }
    try {
      // admin.added_by_admin_id = res.userId;
      let admin_data =await admin.save(data);
      
      if(admin_data){
         if(data.mobile_number){ 
          if(req.body.mobile_number && mob_no1.number){
          mob_no1 = JSON.parse(JSON.stringify(mob_no1));
            phone_arr["user_id"]= admin._id;
            let phone = new phoneModel(phone_arr).save();
          }
        }
        if(data.other_number){ 
          if(req.body.other_number && mob_no2.number){
            mob_no2 = JSON.parse(JSON.stringify(mob_no2));
            other_phone_arr["user_id"]= admin._id;
            let phone = new phoneModel(other_phone_arr).save();
          }
        }
      }
      
      //--------------to add logged in user info in log start-------------------//
      let log_data = {"user_id":res.userId, 
                      "message":"Added",
                      "action_for_id": admin_data._id
      };
      Premium_logs.add_global_log(log_data);
      //--------------to add logged in user info in log end-------------------//

      return res.status(200).send({message : "Vendor created successfully", status : true, admin_data});
    } catch (e) {
      return res.status(200).send({
        message: e.message,
        status: false,
        line:e.stack
      });
    }
  }
}

// edit vander

const editVendor = async (req, res) => {
  // func.checkUserAuthentication(req, res, async function (payload) {
  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  }
  const admin = new Admin();
  const data = req.body;
  let randomText = "guest" + Math.floor(100000 + Math.random() * 900000);
  let id = base64decode(req.params.id);

  // admin.password = randomText; // password removed as of now sachin sir said on call.
  if (!data.email) {
    return res
      .status(400)
      .send({ message: "Please fill vendor email.", status: false });
  }
  if (!data.name) {
    return res
      .status(400)
      .send({ message: "Please fill vendor name.", status: false });
  }
  if (!data.ebPOC) {
    return res
      .status(400)
      .send({ message: "Please fill ebPOC.", status: false });
  }
  if(data.mobile_number){
    // data.mobile_number = JSON.parse(data.mobile_number);
      if (!data.mobile_number.number) {
        return res.status(400).send({message : "Please enter the number", status : false})
      }
    if (data.mobile_number.internationalNumber) {
      data.internationalNumber = data.mobile_number.internationalNumber;
    }
    if (data.mobile_number.nationalNumber) {
      data.nationalNumber = data.mobile_number.nationalNumber
    }
    if (data.mobile_number.e164Number) {
        data.e164Number = data.mobile_number.e164Number
    }
    if (data.mobile_number.countryCode) {
      data.countryCode = data.mobile_number.countryCode
    }
    if (data.mobile_number.dialCode) {
      data.dialCode = data.mobile_number.dialCode
    }
} 

if(data.other_number){
  // data.mobile_number = JSON.parse(data.mobile_number);
    if (data.other_number.number) {
      data.number = data.other_number.number;
    }
  if (data.other_number.internationalNumber) {
    data.internationalNumber = data.other_number.internationalNumber;
  }
  if (data.other_number.nationalNumber) {
    data.nationalNumber = data.other_number.nationalNumber
  }
  if (data.other_number.e164Number) {
      data.e164Number = data.other_number.e164Number
  }
  if (data.other_number.countryCode) {
    data.countryCode = data.other_number.countryCode
  }
  if (data.other_number.dialCode) {
    data.dialCode = data.other_number.dialCode
  }
} 

let phone_arr ={
  "_id" : data.mobile_number._id,
  "number" : data.mobile_number.number,
  "internationalNumber": data.mobile_number.internationalNumber,
  "nationalNumber": data.mobile_number.nationalNumber,
  "e164Number" : data.mobile_number.e164Number,
  "countryCode" : data.mobile_number.countryCode,
  "dialCode" : data.mobile_number.dialCode,
  "user_id" : id
}

let other_phone_arr = {};
if(req.body.other_number && req.body.other_number.number){
    // other_phone_arr["_id"] = data.other_number._id,
    other_phone_arr["number"] = data.other_number.number,
    other_phone_arr["internationalNumber"]= data.other_number.internationalNumber,
    other_phone_arr["nationalNumber"]= data.other_number.nationalNumber,
    other_phone_arr["e164Number"] = data.other_number.e164Number,
    other_phone_arr["countryCode"] = data.other_number.countryCode,
    other_phone_arr["dialCode"] = data.other_number.dialCode,
    other_phone_arr["user_id"] = id
}
  if (!data.vendorContactPerson) {
    return res
      .status(400)
      .send({ message: "Please fill name of contact person.", status: false });
  } 
  admin.role = "vendor";
  admin.email = req.body.email;
  admin.name = req.body.name.toLowerCase();
  admin.ebPOC = req.body.ebPOC;
  // admin.phone = req.body.mobile_number.number;
  if(req.body.mobile_number && req.body.mobile_number.number){
    admin.phone = req.body.mobile_number.number;
  }
  if(req.body.other_number && req.body.other_number.number){
    admin.otherPhone = req.body.other_number.number;
  }
  admin.vendorContactPerson =  req.body.vendorContactPerson;
  delete phone_arr.user_id;
  let mobile_id = phone_arr._id;
  delete phone_arr._id;
  let get_phone_data1 = await phoneModel.findOne({user_id: id});
  let phoneUpdate1 = await phoneModel.updateOne({user_id: id, _id:mobile_id }, phone_arr);
  let phoneNoUpdate = await Admin.updateOne({user_id: id},{phone:phone_arr.number});
  if(req.body.other_number && req.body.other_number.number){
    if(data.other_number._id){
      let phoneUpdate2 = await phoneModel.updateOne({user_id: id, _id:data.other_number._id },other_phone_arr);
    }else{
      let phoneUpdate2 = await phoneModel(other_phone_arr).save();
    }
  }

  let adminData = await Admin.find({_id:{$ne:id}, $or: [{ email: admin.email }, { phone: admin.phone }] }).countDocuments();
  if (adminData > 0) {
    return res.status(400).send({ message: "Email or phone already exist!", status: false });
  }
  const isodate = new Date().toISOString();
  try {
    const where = { _id: id };
    const update = { $set: { 
      role                : "vendor",
      email               : req.body.email,
      name                : req.body.name.toLowerCase(),
      ebPOC               : req.body.ebPOC,
      phone               : admin.phone,
      otherPhone          : admin.otherPhone,
      vendorContactPerson : req.body.vendorContactPerson,
      updatedAt           : isodate
    } };
    const options = { upsert: false };
    Admin.updateOne(where, update).then( async (data, err) => {
      if (err) {
        console.log(err);
        let msg = "some error occurred";
        console.log(msg);
      } else {
        dminLog_response = await adminLog({
          updatedBy: res.userId,
          updatedAt: isodate,
          role: res.userRole,
          task: "vender-update",
          data: admin,
        }).save();

        //--------------to add logged in user info in log start-------------------//
        let log_data = {"user_id":res.userId, 
                        "message":"Modified",
                        "action_for_id": id
                      };
        Premium_logs.add_global_log(log_data);
        //--------------to add logged in user info in log end-------------------//

        let msg = "Vender updated successfully";
        return res.status(200).send({ message: msg, status: true, data });
      }
    });
  } catch (e) {
    return res.status(200).send({
      message: e.message,
      status: false,
    });
  }
  // });
};

const vendorInfo = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: "Id not found", status: false });
    } else {
      let id = base64decode(req.params.id);
      // data=req.body;
      let vendorExists = await Admin.findOne({ _id: id });
      const response = {};
      if (!vendorExists) {
        return res
          .status(404)
          .send({ message: "vendor not found", status: false });
      } else {
        response["_id"] = vendorExists._id;
        response["email"] = vendorExists.email;
        response["name"] = vendorExists.name;
        response["role"] = vendorExists.role;
        if(vendorExists){
          response["ebPOC"] = await Admin.find({ _id: vendorExists.ebPOC }, {_id:1, name:1});
          response["addedBy"] = await Admin.find({_id : vendorExists.addedBy}, {_id:1, name:1});
          response["lastDeveloperAddedInfo"] = await Resource.find({vendorId : id}, {_id:1, name:1, createdAt:1}).sort({createdAt:-1}).limit(1);
        }
        // response["phone"] = vendorExists.phone;
        // response["otherPhone"] = vendorExists.otherPhone;
        response["vendorContactPerson"] = vendorExists.vendorContactPerson;
        response["createdAt"] = vendorExists.createdAt;
        response["updatedAt"] = vendorExists.updatedAt;

        let temp_arr = [];
        let phone_no1 = [];
        let phone_no2 = [];//console.log(vendorExists.phone)
        if(vendorExists.phone){        //number : parseInt(vendorExists.phone),
         let phone1 = await phoneModel.findOne({user_id : vendorExists._id }).select("number , internationalNumber , nationalNumber , e164Number , countryCode , dialCode");
          if(phone1){
            phone1 = JSON.parse(JSON.stringify(phone1));
            // phone1.contacts ="phone";
            temp_arr.push(phone1);
            phone_no1.push(phone1);
          }
      }

        if(vendorExists.otherPhone){//number:{$ne : vendorExists.phone},
          let phone2 = await phoneModel.findOne({user_id : vendorExists._id}).select("number , internationalNumber , nationalNumber , e164Number , countryCode , dialCode").skip(1).limit(1);
            if(phone2){
              phone2 = JSON.parse(JSON.stringify(phone2));
              // phone2.contacts ="otherPhone";
              temp_arr.push(phone2);
              phone_no2.push(phone2);
            }
        }

        // if(temp_arr.length > 0){
        //   response["mobile_number"] = temp_arr;
        // }
        if(phone_no1.length > 0){
          response["mobile_number"] = phone_no1;  
        }
        if(phone_no2.length > 0){
          response["other_number"] = phone_no2;  
        }
        return res
          .status(200)
          .send({ message: "success", status: true, response: response });
      }
    }
  } catch (error) {
    return res.status(400).send({ message: error.message, status: false });
  }
};
//  delete vander
const deleteVender = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      const isodate = new Date().toISOString();
      // let id = (req.params.id);
      let findResponse = await Admin.find({ _id: id });
      if(findResponse[0].email == "engineervendor@gmail.com"){
          res.status(404).json({ message: "Individual engineer vendor cannot be deleted." });
      }else{
        if (findResponse.length != 0) {
          let delete_teamMember = await Admin.updateOne({ _id: id }, { isDelete: true});
          if (delete_teamMember) {
            dminLog_response = await adminLog({
              updatedBy: res.userId,
              updatedAt: isodate,
              role: res.userRole,
              data: findResponse[0],
              task: "vender-delete",
            }).save();

            //--------------to add logged in user info in log start-------------------//
            let log_data = {"user_id":res.userId, 
                            "message":"Removed",
                            "action_for_id": id
            };
            Premium_logs.add_global_log(log_data);
            //--------------to add logged in user info in log end-------------------//

            return res
              .status(200)
              .send({ message: "Vender removed successfully", status: true });
          }
        } else {
          return res
            .status(400)
            .send({ message: "Vender not found", status: false });
        }
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    res.status(404).json({ message: "Something went wrong", error: error });
  }
};

// changeVendorCredential
const changeVendorCredential = async (req, res) => {
  data = req.body;
  const passwordRegex = /^(?=[^\d_].*?\d)\w(\w|[!@#$%]){8,15}/; //length:8-15,alphanumeric start with char,should have 1 special char
  if (!data.password) {
    return res
      .status(400)
      .send({ message: "Please fill your current password", status: false });
  }

  if (!data.newPassword) {
    return res
      .status(400)
      .send({ message: "Please fill your new password", status: false });
  }
  // else if(data.newPassword.length<=7 || data.newPassword.length>15){
  //   return res.status(400).send({ message: "Password must be between 8 to 15 characters", status: false });
  // }
  // else if(!passwordRegex.test(data.newPassword)){
  //   return res.status(400).send({ message: "Password must be alphanumeric, must contain 1 special character", status: false });
  // }

  try {
    let vendorInfo = await Admin.findOne(
      { _id: res.userId },
      { password: 1, email: 1 }
    );
    if (vendorInfo) {
      let comparision = await bcrypt.compare(
        data.password,
        vendorInfo.password
      );
      if (!comparision) {
        return res
          .status(400)
          .json({ message: "Invalid password!", status: false });
      } else {
        let hashPass = await bcrypt.hash(data.newPassword, 10);
        let updated_res = await Admin.updateOne(
          { _id: vendorInfo._id },
          {
            $set: {
              password: hashPass,
            },
          }
        );
        if (!updated_res) {
          return res
            .status(400)
            .send({ message: "Something went wrong", status: false });
        } else {
          return res
            .status(200)
            .send({ message: "Password changed succesfully", status: true });
        }
      }
    } else {
      return res
        .status(404)
        .json({ message: "User not found!", status: false });
    }

  } catch (error) {
    return res.status(400).send({ message: error.message, status: false });
  }
};


const getVenderPointOfContact = async (req, res) => {
  try {
    let find_response
    if(res.userRole == 'admin' || res.userRole == "sales-manager" ||  res.userRole =="tech-partner-admin" ||  res.userRole == "client-admin" || res.userRole == "account-manager" || res.userRole == "account-manager-admin"){
       find_response = await Admin.find({ role: 'vendor-associate', isDelete: false }, { _id: 1, name: 1 });
    }else if(res.userRole == 'vendor-associate'){
       find_response = await Admin.find({_id: res.userId, role: 'vendor-associate', isDelete: false }, { _id: 1, name: 1 });
    }
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "Vender associate not found", status: false });
    } else {
      return res.status(200).send({ message: "Vender associate Found", status: true, response: find_response });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const getAccountManager = async (req, res) => {

  try {
    let find_response = await Admin.find({ role : {$in:["account-manager","account-manager-admin"]}, isDelete: false }, { _id: 1, name: 1 });
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "account manager not found", status: false });
    } else {
      return res.status(200).send({ message: "account manager Found", status: true, response: find_response });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}


/**
 * Created By: Shubham Kumar
 * Created Date: 13-05-2022
 * Desc: To add a vendor for individual engineer assigned to
 * Function : addEngineerVendor 
 * API : add-engineer-vendor
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const addEngineerVendor = async (req, res) => {
  const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
  const tokenInfo = func.decodeToken(usertoken);
  const admin = new Admin();
  const data = req.body;
  
  admin.role = "vendor";
  admin.email = "engineervendor@gmail.com";
  admin.name = "engineers-vendor";
  admin.ebPOC = "628218b24aa3c30f346eab6c";
  admin.addedBy = "62305a886ace8e5f77c3c136";
  admin.phone = "9999888877";
  admin.otherPhone = "8888777766";
  admin.vendorContactPerson = "talent partner poc";
  admin.password = "$2a$10$bFWFPZVpZ1zGON17mezbvezWtAOFmQJKbhppCtAvuNJ3Cywnlp8vu";//password
  
  let adminData = await Admin.find({ $or: [{ email: admin.email }, { name: admin.name }, { phone: admin.phone }] }).countDocuments();
 
  if (adminData) {
    return res.status(400).send({ message: 'User already exist', status: false });
  }else{
    try {
      admin.save().then((data, err) => {
        if (err) {
          let msg = "some error occurred";
          return res.status(200).send({ message: "Error occurred while adding vendor for individual engineer", status: true,status:false });
        } else {
          let msg = "Individual Engineer Vender created successfully";
          return res.status(200).send({ message: msg, status: true, data });
        }
      });
    } catch (error) {
      return res.status(200).send({message: error.message,status: false,});
    }
  }
}

const addMobileNumber = async(req,res)=>{
  try{
    let vendor_data = await Admin.find({ isDelete : false, role : "vendor"}).select(" _id , phone , otherPhone");
    // console.log(vendor_data);
    // let phone_number = await phoneModel.find({user_id : vendor_data._id}).select("user_id");
    let new_number = {};
    let other_number = {};

    for(i=0 ; i<vendor_data.length;i++){
      if(vendor_data[i].phone){
      new_number["number"] = vendor_data[i].phone,
      new_number["internationalNumber"] = "+91 " + vendor_data[i].phone,
      new_number["nationalNumber"] = "0" + vendor_data[i].phone,
      new_number["e164Number"] = vendor_data[i].phone,
      new_number["countryCode"] = "IN",
      new_number["dialCode"] = "+91",
      new_number["user_id"] = vendor_data[i]._id,
      new_number["phone1"]  = "phone1"
      let save_number = await phoneModel(new_number).save();
      }
    if(vendor_data[i].otherPhone){
        other_number["number"] = vendor_data[i].otherPhone,
        other_number["internationalNumber"] = "+91 " + vendor_data[i].otherPhone,
        other_number["nationalNumber"] = "0" + vendor_data[i].otherPhone,
        other_number["e164Number"] = vendor_data[i].otherPhone,
        other_number["countryCode"] = "IN",
        other_number["dialCode"] = "+91",
        other_number["user_id"] = vendor_data[i]._id,
        other_number["phone2"]  = "phone2"
      let save_other_number = await phoneModel(other_number).save();
        }
    }
    return res.status(200).send({message : "Mobile number added successfully", status : true})
  }
  catch(error){
    return res.status(400).send({message : "Something went wrong", status : false, error : error.message});
  }
}


module.exports = {
  show,
  vendorSignUp,
  editVendor,
  vendorInfo,
  deleteVender,
  changeVendorCredential,
  getVenderPointOfContact,
  getAccountManager,
  addEngineerVendor,
  addMobileNumber
}
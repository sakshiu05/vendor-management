// 'use strict';
var randomize = require("randomatic");
var bcrypt = require("bcryptjs");
let func = require("../common/commonfunction");
var multer = require("multer");
var ExcelJs = require("exceljs");
const { base64encode, base64decode } = require("nodejs-base64");
const ObjectId = require("mongodb").ObjectID;
const globalCalls = require("../common/functions");
const moment = require("moment");
const config = require("../../config");
const path = require("path");
const json2csv = require('json2csv').parse;
const fs = require('fs');
const emailRegexp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const timeRegex = /^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/;
const dateRegex =
  /^[0,1]?\d{1}\/(([0-2]?\d{1})|([3][0,1]{1}))\/(([1]{1}[9]{1}[9]{1}\d{1})|([2-9]{1}\d{3}))$/;
const isodate = new Date().toISOString(); //current date time

const Resources = require("../models/resource").Resources;
const resourceLog = require("../models/resourceLog").ResourceLog;
const screening = require("../models/screening").screening;
const feedback = require("../models/feedback").feedback;
const feedbackStatus = require("../models/feedback_status").feedbackstatus;
const attendance = require("../models/attendance").attendance;
const clientReview = require("../models/client_reviews").client_reviews;
const phoneModel = require("../models/phoneNumber").phone;
const skill_set_list = require("../models/skill_set_list").skill_set_list;
const domain = require("../models/domain_list").domainListAuth;
const engineer_work_detail = require("../models/engineer_work_details").workDetails;
const Skillset_list = require("../models/skill_set_list").skill_set_list;
const dailyTask = require("../models/resourceDailyTask").dailyTask;
const admin = require("../controllers/adminController");
const { forEach } = require("underscore");
const resource_login_logs = require("../models/resource_login_logs").resource_login_logs;
const resourceTimesheetStatus = require("../models/resourceTimesheetStatus").resourceTimesheetStatus;
let Admin = require("../models/admin").Admin;
const interviewScheduleModel = require('../models/interviewSchedule').interviewSchedule;
let global_logs = require("../models/admin").all_roles_log;
const Premium_logs = require("../common/logs_message");

/*
 * --------------------------------------------------------------------------
 * upload profile photo Api start
 * ---------------------------------------------------------------------------
 */

const uploadResume = async function (req, res, next) {
  let file = req.file;

  if (file) {
    res.send({
      status: 200,
      message: "resume uploaded",
      imageUrl: "https://52.66.251.29/uploads/documents/" + file.filename,
    });
  } else if (!file) {
    res.send({
      status: 400,
      message: "resume not uploaded",
    });
  }
};

/**
 * Created By: Shubham Kumar
 * Created Date: 13-06-2022
 * Desc: Recreating resource api
 * @param {*} req 
 * @param {*} res 
 */
const saveResourceNew = async (req, res) => {
  let data = req.body;
  let id = '';
  let orConditionData = [];
  let check_exist_mob_no;
  try {
    data.isAvailable = false;
    data.available_date = "";
    data.available_time = "";
    if (!req.files.resume) {
      return res.status(404).json({ message: "Please select resume." });
    }
    if (!data.name) {
      return res.status(404).json({ message: "Please fill resource name." });
    } else if (data.name.length <= 0 || data.name.length >= 30) {
      return res.status(404).json({ message: "Name should be 30 characters." });
    } else {
      data.name = data.name.trim().toLowerCase();
    }

    if (!data.techStack) {
      return res.status(404).json({ message: "Please fill techStack." });
    }

    if (!data.exp_years) {
      return res.status(400).send({ message: "Please enter the experience in years", status: false });
    }

    if (!data.exp_months) {
      return res.status(400).send({ message: "Please enter the experience in months", status: false });
    }

    if (!data.domain) {
      return res.status(400).send({ message: "Please enter the domain for the resource", status: false });
    } else {
      data.domain = data.domain.trim();
    }

    if (!data.price) {
      return res.status(404).json({ message: "Please fill price." });
    } else if (isNaN(data.price)) {
      return res.status(404).json({ message: "Error! You have passed invalid price." });
    }

    if (data.isAvailable == true) {
      if (!data.available_date) {
        return res.status(404).json({ message: "Please fill your from availabile date.", status: false });
      }
      else if (!dateRegex.test(data.available_date)) {
        return res.status(404).json({ message: "Please fill correct available date.", status: false });
      }

      if (!data.available_time) {
        return res.status(404).json({ message: "Please fill your to availabile time.", status: false });
      }
      else if (!timeRegex.test(data.available_time)) {
        return res.status(404).json({ message: "Please fill correct availabile time.", status: false });
      }
    }

    if (req.files) {
      if (req.files.resume) {
        data.resumeDocUrl = req.files.resume[0].location;
      }
      if (req.files.profileImage) {
        data.profileImage = req.files.profileImage[0].location;
      }
    }

    // data.name = data.name.toLowerCase().trim();

    data.status = "Pending";
    data.comm_skill_points = "";
    data.comm_tech_points = "";
    data.comment = "";

    data.techStack = data.techStack.split(',');
    data.techStack = data.techStack.map((element)=>{
      return ObjectId(element.trim());
    })


    let mob_no = []; let phone_arr = [];
    if (data.mobile_number) {
      mob_no = data.mobile_number;
      mob_no = JSON.parse(mob_no);
       data.mobile_number = JSON.parse(data.mobile_number);

      if (data.mobile_number.number) {
        // data.mobile_number = data.mobile_number.number;
        phone_arr["number"] = data.mobile_number.number;
        phone_arr["internationalNumber"] = data.mobile_number.internationalNumber;
        phone_arr["nationalNumber"] = data.mobile_number.nationalNumber;
        phone_arr["e164Number"] = data.mobile_number.e164Number;
        phone_arr["countryCode"] = data.mobile_number.countryCode;
        phone_arr["dialCode"] = data.mobile_number.dialCode;
      }
      if (data.mobile_number.internationalNumber) { data.internationalNumber = data.mobile_number.internationalNumber; }
      if (data.mobile_number.nationalNumber) { data.nationalNumber = data.mobile_number.nationalNumber; }
      if (data.mobile_number.e164Number) { data.e164Number = data.mobile_number.e164Number; }
      if (data.mobile_number.countryCode) { data.countryCode = data.mobile_number.countryCode; }
      if (data.mobile_number.dialCode) { data.dialCode = data.mobile_number.dialCode; }
      // data.mobile_number = JSON.parse(data.mobile_number);
      orConditionData.push({ mobile: data.mobile_number.number });
      check_exist_mob_no = data.mobile_number.number;
    }
    if (data.email) { orConditionData.push({ email: data.email }); }

    if (res.userRole == "vendor") {

    }
    else if (res.userRole == "admin" || res.userRole == "vendor-associate" || res.userRole == "tech-partner-admin") {
      if (!req.params.vendorId) { return res.status(404).json({ message: "Please fill vendor id", status: false }); }
      vendor_id = base64decode(req.params.vendorId);
      let adminData = await Admin.findOne({ _id: vendor_id, role: 'vendor', isDelete: false });
      if (!adminData) {
        return res.status(404).json({ message: "Vendor not exist", status: false });
      }
      else {
        data.vendorId = vendor_id;
      }
    }

    if (orConditionData.length > 0) {
      
      let isResourcExist = await Resources.find({ $or: orConditionData });
      let isPhoneExist = await phoneModel.find({ number: check_exist_mob_no });

      for(let i=0;i<isResourcExist.length;i++){
        if (data.email === isResourcExist[i].email) {
          console.log(data.email === isResourcExist[i].email)
          return res.status(404).send({ message: "Email-id already exist" });
        }
      }
    
      for(let j=0;j<isPhoneExist.length;j++){
        if (data.mobile_number.number === isPhoneExist[j].number) {
          return res.status(404).send({ message: "Phone no. already exist" });
        }
      }
    }

      let Resource_res = await new Resources(data).save();
      if (Resource_res) {
        if (data.mobile_number) {
          // mob_no = JSON.parse(mob_no);
          if (data.mobile_number && mob_no.number) {
            phone_arr["user_id"] = Resource_res._id;
            let phone = await new phoneModel(phone_arr).save();
          }
        }
        return globalCalls.okResponse(res, "", "Resource inserted successfully");
      } else {
        return res.status(400).json({ message: "Error in adding Resource", status: false });
      }


  } catch (error) {
    return res.status(404).json({ message: "Something went wrong", error: error.message, line_error: error.stack });
  }
}

/**
 * Function - resource
 * Description - To add vendor resource (id is not optional but base64encoded service_id)
 * Developer - Shubham Kumar
 * Created on - 17 December 2021
 * Updates - As an admin  i also should be able to add resource on behalf of vendor by vendor id
 * Updated by - Shubham Kumar
 * Updated on - 06-01-2022
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const saveResource = async (req, res) => {
  data = req.body;
  let resume = req.body.resume;
  let profileImage = req.body.profileImage;
  let id = '';
  let orConditionData = [];
  let check_exist_mob_no;
  if (resume) {
    var resumeDocUrl = "resourceResume/" + resume.replace('/\\/g', '/');
  }
  else if (!resume) {
    return res.status(404).json({
      message: "resume not uploaded",
    });
  }
  if (profileImage) {
    var imageUrl = "resourceImage/" + profileImage.replace('/\\/g', '/');
  }

  if (!data.name) {
    return res.status(404).json({ message: "Please fill resource name." });
  } else if (data.name.length <= 0 || data.name.length >= 30) {
    return res.status(404).json({ message: "Name should be 30 characters." });
  } else {
    orConditionData.push({ name: data.name });
  }
  data.name = data.name.toLowerCase().trim();
  if (!data.techStack) {
    return res.status(404).json({ message: "Please fill techStack." });
  }

  if (!data.exp_years) {
    return res.status(400).send({ message: "Please enter the experience in years", status: false });
  }

  if (!data.exp_months) {
    return res.status(400).send({ message: "Please enter the experience in months", status: false });
  }

  if (!data.domain) {
    return res.status(400).send({ message: "Please enter the domain for the resource", status: false });
  }
  if (!data.price) {
    return res.status(404).json({ message: "Please fill price." });
  } else if (isNaN(data.price)) {
    return res
      .status(404)
      .json({ message: "Error! You have passed invalid price." });
  }
  let mob_no = [];
  if (data.mobile_number) {
    mob_no = data.mobile_number;
  }
  if (data.mobile_number) {
    if (data.mobile_number.number) {
      data.mobile_number = data.mobile_number.number;
    }
    if (data.mobile_number.internationalNumber) {
      data.internationalNumber = data.mobile_number.internationalNumber;
    }
    if (data.mobile_number.nationalNumber) {
      data.nationalNumber = data.mobile_number.nationalNumber;
    }
    if (data.mobile_number.e164Number) {
      data.e164Number = data.mobile_number.e164Number;
    }
    if (data.mobile_number.countryCode) {
      data.countryCode = data.mobile_number.countryCode;
    }
    if (data.mobile_number.dialCode) {
      data.dialCode = data.mobile_number.dialCode;
    }
    data.mobile_number = JSON.parse(data.mobile_number);

    orConditionData.push({ mobile: data.mobile_number.number });
    check_exist_mob_no = data.mobile_number.number;
  }

  let phone_arr = [];
  if (req.body.mobile_number && req.body.mobile_number.number) {
    phone_arr["number"] = data.mobile_number.number,
      phone_arr["internationalNumber"] = data.mobile_number.internationalNumber,
      phone_arr["nationalNumber"] = data.mobile_number.nationalNumber,
      phone_arr["e164Number"] = data.mobile_number.e164Number,
      phone_arr["countryCode"] = data.mobile_number.countryCode,
      phone_arr["dialCode"] = data.mobile_number.dialCode
  }

  if (data.email) {
    orConditionData.push({ email: data.email })
    if (!emailRegexp.test(data.email)) {
      return res.status(404).json({ message: "Please enter a valid email id." });
    }
  }

  if (data.isAvailable == true) {
    if (!data.available_date) {
      return res.status(404).json({
        message: "Please fill your from availabile date.",
        status: false,
      });
    } else if (!dateRegex.test(data.available_date)) {
      return res.status(404).json({
        message: "Please fill correct available date.",
        status: false,
      });
    }

    if (!data.available_time) {
      return res.status(404).json({
        message: "Please fill your to availabile time.",
        status: false,
      });
    } else if (!timeRegex.test(data.available_time)) {
      return res.status(404).json({
        message: "Please fill correct availabile time.",
        status: false,
      });
    }
  } else {
    data.isAvailable = false;
    data.available_date = "";
    data.available_time = "";
  }
  try {
    // orConditionData.push({ name: data.name })
    let checkResource = [];
    let isPhoneExist = [];
    if (orConditionData.length > 0) {
      checkResource = await Resources.find({ $or: orConditionData });
      if (check_exist_mob_no) {
        isPhoneExist = await phoneModel.find({ mobile: check_exist_mob_no });
        if (isPhoneExist.length > 0) {
          for (let k = 0; k < isPhoneExist.length; k++) {
            if (data.mobile_number.number == isPhoneExist[k].number) {
              return res.status(404).json({ message: "Mobile no already exist" });
              break;
            }
          }
        }
      }
    }

    if (checkResource.length > 0) {
      for (let z = 0; z < checkResource.length; z++) {
        if (checkResource[z].name == data.name) {
          return res.status(404).json({ message: "Name already exist" });
          break;
        }
        if (checkResource[z].email == data.email) {
          return res.status(404).json({ message: "Email already exist" });
          break;
        }

      }
      return res.status(404).json({ message: "Name, Mobile no or email already exist" });
    } else {
      if (req.body.mobile_number && req.body.mobile_number.number) {
        data.mobile_number = data.mobile_number.number;
      }
      const resource = {
        vendorId: res.userId, //get this from token
        name: data.name.toLowerCase(),
        techStack: data.techStack.split(','),
        experiance: data.experiance,
        exp_years: data.exp_years,
        exp_months: data.exp_months,
        domain: data.domain,
        price: data.price,
        mobile: data.mobile_number,
        email: data.email,
        noticePeriod: data.noticePeriod,
        resumeDocUrl: resumeDocUrl,
        profileImage: imageUrl,
        status: "Pending",

        comm_skill_points: "",
        comm_tech_points: "",
        comment: "",

        isAvailable: data.isAvailable,
        available_date: data.available_date,
        available_time: data.available_time,
      };

      if (res.userRole == "vendor") {
        let Resource_res = await new Resources(resource).save();
        if (data.mobile_number) {
          mob_no = JSON.parse(mob_no);
          if (req.body.mobile_number && mob_no.number) {
            phone_arr["user_id"] = Resource_res._id;
            let phone = await new phoneModel(phone_arr).save();
          }
        }
        if (Resource_res) {
          return globalCalls.okResponse(res, "", "resource inserted successfully");
        } else {
          return res.status(200).json({
            message: "Something went wrong while inserting",
            status: false,
          });
        }

      }

      //----------------new code------------------- 

      else if (res.userRole == "admin" || res.userRole == "vendor-associate" || res.userRole == "tech-partner-admin") {
        if (!req.params.vendorId) {
          return res.status(404).json({ message: "Please fill vendor id", status: false });
        }
        id = base64decode(req.params.vendorId);//vendor id
        // const checkVendor = await Admin
        let adminData = await Admin.findOne({ _id: id, role: 'vendor' }).countDocuments();//replate email by _id:id later
        if (adminData == 0) {
          return res.status(404).json({ message: "Invalid vendor id", status: false });
        } else {
          let checkResource = [];
          if (orConditionData.length > 0) {
            checkResource = await Resources.find({ $or: orConditionData });
          }

          if (checkResource.length > 0) {
            return res.status(404).json({ message: "Name, Mobile no or email already exist" });
            //console.log(checkResource.length)
          } else {
            if (req.body.mobile_number && req.body.mobile_number.number) {
              data.mobile_number = data.mobile_number.number;
            }
            const resourceData = {
              vendorId: id, //get this from params
              name: data.name.toLowerCase(),
              techStack: data.techStack.split(','),
              experiance: data.experiance,
              exp_years: data.exp_years,
              exp_months: data.exp_months,
              domain: data.domain,
              price: data.price,
              mobile: data.mobile_number,
              email: data.email,
              noticePeriod: data.noticePeriod,
              resumeDocUrl: resumeDocUrl,
              profileImage: imageUrl,
              status: "Pending",

              comm_skill_points: "",
              comm_tech_points: "",
              comment: "",

              isAvailable: data.isAvailable,
              available_date: data.available_date,
              available_time: data.available_time,
            };

            let Resource_res = await new Resources(resourceData).save();
            if (data.mobile_number) {
              mob_no = JSON.parse(mob_no);
              if (req.body.mobile_number && mob_no.number) {
                phone_arr["user_id"] = Resource_res._id;
                let phone = await new phoneModel(phone_arr).save(); //console.log(phone)
              }
            }

            if (Resource_res) {
              return globalCalls.okResponse(res, "", "resource inserted successfully");
            } else {
              return res.status(200).json({ message: "Something went wrong while inserting", status: false, });
            }
          }
        }


      } else {
        return res
          .status(400)
          .json({ message: "Invalid User!", status: false });
      }
    }
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Something went wrong", error: error.message, line_error: error.stack });
  }
};

/**
 * Function - remove-resource/:id (id is base64encoded resource id)
 * Description - To remove vendor resource
 * Developer - Shubham Kumar
 * Created on - 17 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const removeResource = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      const isodate = new Date().toISOString();
      let resource = await Resources.find({ _id: id });
      if (resource.length != 0) {
        let delete_resource = await Resources.updateOne({ _id: id }, { isDelete: true });
        if (delete_resource) {
          resourceLog_response = await resourceLog({
            updatedBy: res.userId,
            updatedAt: isodate,
            role: res.userRole,
            task: "delete-resource",
            data: resource[0],
          }).save();
          return res
            .status(200)
            .send({ message: "Resource removed successfully", status: true });
        }
      } else {
        return res
          .status(400)
          .send({ message: "Resource not found", status: false });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    res.status(404).json({ message: "Something went wrong", error: error });
  }
};

/**
 * API - resources
 * Description - To show all vendor resources
 * Developer - Shubham Kumar
 * Created on - 17 December 2021
 * Updates - to show all resource if admin login,verdor resource if vendor login
 * Updated by - Shubham Kumar
 * Updated on - 23-12-2021
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const viewResources = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let response = {};
    let condition = {};
    condition["isDelete"] = false;
    if (res.userRole == "vendor-associate") {
      let venderFromPOC = await Admin.find({ ebPOC: res.userId }, { _id: 1 })
      const idArr = new Array();
      venderFromPOC.forEach(element => {
        idArr.push(element.id);
      });
      condition["vendorId"] = { $in: idArr }
    }

    const sts = "Pending";
    if (req.query.status) {
      let sts = req.query.status;

      if (sts == "Pending") {
        condition = { status: "Pending" };
      } else if (sts == "Qualified") {
        condition = { status: "Qualified" };
      } else if (sts == "Rejected") {
        condition = { status: "Rejected" };
      } else if (sts == "Hired") {
        condition = { isHired: true };
      } else if (sts == "PullBack") {
        condition = { isPullBack: true };
      } else {
        condition = { "": "" };
      }
    }
    if (req.query.search) {
      condition["name"] = {
        $regex: ".*" + req.query.search.toLowerCase() + ".*",
      };
    }

    if (req.query.ebPOC) {
      let ebPOCId = base64decode(req.query.ebPOC);
      let venderFromPOC = await Admin.find({ ebPOC: ebPOCId }, { _id: 1, name: 1 })
      const idArr = new Array();
      venderFromPOC.forEach(element => {
        idArr.push(element.id);
      });
      condition["vendorId"] = { $in: idArr }
    }

    if (req.query.techStack) {
      condition["techStack"] = { $all: req.query.techStack.split(',') }
    }
    if (req.query.noticePeriod) {
      if (isNaN(req.query.noticePeriod)) {
        return res
          .status(404)
          .json({ message: "Error! You have passed invalid notice period." });
      } else {
        condition["noticePeriod"] = {
          $regex: ".*" + req.query.noticePeriod + ".*",
        };
      }
    }
    if (req.query.price) {
      if (isNaN(req.query.price)) {
        return res
          .status(404)
          .json({ message: "Error! You have passed invalid price." });
      } else {
        condition["price"] = { $regex: ".*" + req.query.price + ".*" };
      }
    }
    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }

    let resourceDataForCount = await Resources.find(condition).lean();
    let pendingCount1 = 0;
    let rejectedCount1 = 0;
    let qualifiedCount1 = 0;

    response["total_resource"] = resourceDataForCount.length;
    resourceDataForCount.forEach(element => {
      if (element.status == "Pending") {
        pendingCount1++;
      }
      if (element.status == "Rejected") {
        rejectedCount1++;
      }
      if (element.status == "Qualified") {
        qualifiedCount1++;
      }
    });
    response["pending_resource"] = pendingCount1;
    response["rejected_resource"] = rejectedCount1;
    response["qualified_resource"] = qualifiedCount1;


    // if (res.userRole == "admin") {

    let resourceData = await Resources.find(condition).lean()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit); //  status:sts
    for (let i = 0; i < resourceData.length; i++) {
      if (resourceData[i].domain) {
        let domain_info = await domain.findOne({ "_id": resourceData[i].domain }).select("_id domain domain_image");
        if (domain_info) {
          resourceData[i].domain_info = domain_info;
        }
      }
      if (resourceData[i].status == "Qualified") {
        let adminInfo = await Admin.findOne({ _id: resourceData[i].qualified_by }, { name: 1, _id: 1 });
        if (adminInfo) {
          resourceData[i].qualified_by = adminInfo;
        }
      }
    }
    for (let i = 0; i < resourceData.length; i++) {
      if (resourceData[i].vendorId) {
        let adminInfo = await Admin.findOne({ _id: resourceData[i].vendorId }, { name: 1, _id: 1, ebPOC: 1 });
        if (adminInfo) {
          let vendorPOC = await Admin.findOne({ _id: adminInfo.ebPOC }, { name: 1, _id: 1 });
          adminInfo.ebPOC = vendorPOC;
          resourceData[i].vendorId = adminInfo;
        }
      }
    }
    for (let i = 0; i < resourceData.length; i++) {
      if (resourceData[i].vendorId) {
        let phone = await phoneModel.findOne({ user_id: resourceData[i]._id }).select("number , internationalNumber , nationalNumber , e164Number , countryCode , dialCode");
        if (phone) {
          resourceData[i].mobile_number = phone;
        }
      }
    }
    for (let i = 0; i < resourceData.length; i++) {
      if (resourceData[i].vendorId) {
        let field = { _id: 1, comm_skill_points: 1, comm_tech_points: 1, presentability: 1, attentiveness: 1, comment: 1, status: 1, createdAt: 1 }
        let adminInfo = await screening.find({ addedTo: resourceData[i]._id }, field);
        if (adminInfo) {
          resourceData[i].screeningData = adminInfo;
        }
      }
    }
    return res.status(200).send({
      message: "Data Found",
      status: true,
      resources: resourceData,
      filter_info: response,
    });
    // } else if (res.userRole == "vendor") {
    //   let vendorCondition = {};
    //   condition["vendorId"] = res.userId;
    //   let resourceData = await Resources.find(condition)
    //     .sort({ createdAt: -1 })
    //     .skip(offset)
    //     .limit(limit);
    //   return res.status(200).send({
    //     message: "Data Found",
    //     status: true,
    //     resources: resourceData,
    //     filter_info: response,
    //   });
    // } else {
    //   return res.status(400).json({ message: "Invalid User", status: false });
    // }
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Something went wrong", error: error.message });
  }
};

/**
 * Function - modifyResourceSkills
 * API : resource-status/:id
 * Description - To reject/qualify a resource
 * Developer - Shubham Kumar
 * Created on - 17 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const modifyResourceSkills = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      data = req.body;
      if (res.userRole == "vendor") {
        return res
          .status(400)
          .send({ message: "User not authorized", status: false });
      }
      if (!req.file) {
        return res.status(400).send({ message: "Please enter the resource screenshot", status: false });
      }
      if (!data.comm_skill_points) {
        return res.status(400).send({
          message: "Please fill communication skills.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication skills.");
      } else if (isNaN(data.comm_skill_points)) {
        return res.status(400).send({
          message: "Error! You have passed invalid skill points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid skill points.");
      } else if (data.comm_skill_points < 1 || data.comm_skill_points > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid skill points.",
          status: false,
        });
      }

      if (!data.comm_tech_points) {
        return res.status(400).send({
          message: "Please fill communication technology.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication technology.");
      } else if (isNaN(data.comm_tech_points)) {
        return res.status(400).send({
          message: "Error! You have passed invalid technology points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid technology points.");
      } else if (data.comm_tech_points < 1 || data.comm_tech_points > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid skill points.",
          status: false,
        });
      }

      // Added presentability field

      if (!data.presentability) {
        return res.status(400).send({
          message: "Please fill presentability.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication technology.");
      } else if (isNaN(data.presentability)) {
        return res.status(400).send({
          message: "Error! You have passed invalid presentability points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid technology points.");
      } else if (data.presentability < 1 || data.presentability > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid presentability points.",
          status: false,
        });
      }

      // Added attentiveness field

      if (!data.attentiveness) {
        return res.status(400).send({
          message: "Please fill attentiveness.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication technology.");
      } else if (isNaN(data.attentiveness)) {
        return res.status(400).send({
          message: "Error! You have passed invalid attentiveness points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid technology points.");
      } else if (data.attentiveness < 1 || data.attentiveness > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid attentiveness points.",
          status: false,
        });
      }

      if (!data.status) {
        return res
          .status(400)
          .send({ message: "Please fill status.", status: false });
        // throw globalCalls.badRequestError("Please fill comment.");
      } else if (data.status != "Qualified" && data.status != "Rejected" && data.status != "Pending") {
        return res
          .status(400)
          .send({ message: "Wrong status inserted.", status: false });
      }
      const isodate = new Date().toISOString();

      Resources.updateOne(
        { _id: id },
        {
          $set: {
            comm_skill_points: data.comm_skill_points,
            comm_tech_points: data.comm_tech_points,
            presentability: data.presentability,
            attentiveness: data.attentiveness,
            comment: data.comment,
            status: data.status,
            updatedAt: isodate,
            qualified_on: isodate,
            qualified_by: res.userId,
          },
        },
        async function (err, resp) {
          if (err) {
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {

            const screeningData = {
              comm_skill_points: data.comm_skill_points,
              comm_tech_points: data.comm_tech_points,
              presentability: data.presentability,
              attentiveness: data.attentiveness,
              comment: data.comment,
              status: data.status,
              addedTo: id,
              addedBy: res.userId,
            }
            if (req.file) {
              if (req.file.fieldname == "qualifying_screenshot") {
                screeningData.qualifying_screenshot = req.file.location;
              }
            }
            let addScreening_res = await new screening(screeningData).save();
            if (addScreening_res) {
              return res
                .status(200)
                .send({ message: "Status added successfully", status: true });
            } else {
              return res
                .status(400)
                .send({ message: "Bad Request", status: false });

            }
            // return res
            //   .status(200)
            //   .send({ message: "Status Changed successfully", status: true });
          }
        }
      );
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "something went wrong", status: false });
    // throw globalCalls.badRequestError("something went wrong");
  }
};

/**
 * API - resource/:id
 * Description - To show a vendor resource
 * Developer - Shubham Kumar
 * Created on - 17 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const showResource = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: "Id not found", status: false });
    } else {
      let id = base64decode(req.params.id);
      data = req.body;
      Resources.findOne({ _id: id, isDelete: false }, { comm_skill_points: 0, comm_tech_points: 0, presentability: 0, attentiveness: 0, available_date: 0, available_time: 0 }, async function (err, foundUser) {//console.log(foundUser)
        if (err) {
          return res
            .status(400)
            .send({ message: "Resource not found", status: false });
        } else {
          if (foundUser.status == "Qualified") {
            let adminInfo = await Admin.findOne({ _id: foundUser.qualified_by }, { name: 1, _id: 1 });
            if (adminInfo) {
              foundUser.qualified_by = adminInfo;
            }
          }

          if (foundUser.domain) {
            let domain_data = await domain.findOne({ _id: foundUser.domain }).select("_id , domain , domain_image");
            if (domain_data) {
              foundUser.domain_info = domain_data;
            }
          }
          if (foundUser._id) {
            let phone = await phoneModel.findOne({ user_id: foundUser._id }).select("_id number , internationalNumber , nationalNumber , e164Number , countryCode , dialCode");
            foundUser.mobile_number = phone;
          }

          if (foundUser.mobile) {
            let phone = await phoneModel.findOne({ user_id: foundUser._id }).select("_id number , internationalNumber , nationalNumber , e164Number , countryCode , dialCode");
            if (phone) {
              foundUser.mobile_number = phone;
            }
          }

          if (foundUser.vendorId) {
            let adminInfo = await Admin.findOne({ _id: foundUser.vendorId }, { name: 1, _id: 1, email: 1, phone: 1, ebPOC: 1, vendorContactPerson: 1 }).lean();
            if (adminInfo) {
              foundUser.vendorId = adminInfo;
            }
            let vendorPOC = await Admin.findOne({ _id: adminInfo.ebPOC }, { name: 1, _id: 1, email: 1, phone: 1 });
            if (vendorPOC) {
              foundUser.ebPOC = vendorPOC;
            }
            let feedback_response = await feedback.find({ addedTo: foundUser._id }, { id: 1, status: 1, createdAt: 1 }).sort({ _id: -1 }).limit(1);
            if (feedback_response) {
              foundUser.feedback = feedback_response;
            }
          }
          let interviewData = await interviewScheduleModel.findOne({ addedTo: foundUser._id, interviewStatus: 'Hired' }).sort({ updatedAt: -1 }).limit(1);
          // console.log(interviewData);
          if (interviewData) {
            let sales_person = await Admin.findOne({ _id: interviewData.addedBy, isDelete: false }).select("_id name email");
            foundUser.sales_person = sales_person;
            let client_data = await Admin.findOne({ name: interviewData.clientName }, { _id: 1, name: 1 });
            // console.log(client_data);
            // foundUser.clientName = interviewData ? interviewData.clientName : "";
            foundUser.clientData = client_data;
          }
          if (foundUser.vendorId) {
            let field = { status: 1, createdAt: 1, comment: 1 }
            let adminInfo = await screening.find({ addedTo: foundUser._id }, { comm_skill_points: 1, comm_tech_points: 1, presentability: 1, attentiveness: 1, status: 1, createdAt: 1, comment: 1 }).sort({ createdAt: -1 }).limit(1);
            if (adminInfo) {
              foundUser.screeningData = adminInfo;
            }
            let interviewData = await interviewScheduleModel.findOne({ addedTo: foundUser._id, interviewStatus: 'Hired' }).sort({ updatedAt: -1 }).limit(1);
            // console.log(interviewData);
            if (interviewData) {
              let client_data = await Admin.findOne({ name: interviewData.clientName }, { _id: 1, name: 1 });
              // console.log(client_data);
              // foundUser.clientName = interviewData ? interviewData.clientName : "";
              foundUser.clientData = client_data;
            }
          }
          if (foundUser.vendorId) {
            let am_feedback = await feedback.find({ resource_id: foundUser._id }, { updatedAt: 0 });
            am_feedback = JSON.parse(JSON.stringify(am_feedback))
            if (am_feedback) {
              for (i = 0; i < am_feedback.length; i++) {
                let feedback_status = await feedbackStatus.findOne({ _id: am_feedback[i].feedback });
                am_feedback[i].status = feedback_status.status;
                foundUser.am_reviews = am_feedback;
              }
            }
          }
          if (foundUser.vendorId) {
            let client_review = await clientReview.find({ resource_id: foundUser._id }, { updatedAt: 0 });
            client_review = JSON.parse(JSON.stringify(client_review));
            if (client_review) {
              for (i = 0; i < client_review.length; i++) {
                let feedback_status = await feedbackStatus.findOne({ _id: client_review[i].feedback });
                client_review[i].status = feedback_status.status;
                foundUser.client_reviews = client_review;
              }
            }
          }

          if (foundUser.techStack) {
            let temp_var = [];
            for (let i = 0; i < foundUser.techStack.length; i++) {
              let tech_info = await skill_set_list.findOne({ _id: foundUser.techStack[i] }).select("_id skill");
              temp_var.push(tech_info);
            }
            foundUser.tech_info = temp_var;
          }

          let client_reviews = await clientReview.aggregate([
            { $match: { resource_id: foundUser._id } },
            {
              $lookup: {
                from: 'feedback_statuses',
                localField: 'feedback',
                foreignField: '_id',
                as: 'status_info'
              }
            },
            {
              $lookup: {
                from: 'admins',
                localField: 'client_id',
                foreignField: '_id',
                as: 'client_info'
              }
            },
            {
              "$group": {
                "_id": { "month": { "$month": "$review_date" }, "year": { "$year": "$review_date" } },
                "data": { "$push": "$$ROOT" }
              }
            },
            { "$sort": { "month": -1, "year": -1 } }
          ]);

          let account_manager_reviews = await feedback.aggregate([
            { $match: { resource_id: foundUser._id } },
            {
              $lookup: {
                from: 'feedback_statuses',
                localField: 'feedback',
                foreignField: '_id',
                as: 'status_info'
              }
            },
            {
              $lookup: {
                from: 'admins',
                localField: 'client_id',
                foreignField: '_id',
                as: 'client_info'
              }
            },
            {
              "$group": {
                "_id": { "month": { "$month": "$review_date" }, "year": { "$year": "$review_date" } },
                "data": { "$push": "$$ROOT" }
              }
            },
            { "$sort": { "month": -1, "year": -1 } }
          ]);

          let client_all_reviews = []; let account_manager_all_reviews = [];
          for (let i = 0; i < client_reviews.length; i++) {
            let temp_arr = {};
            temp_arr.month = client_reviews[i]._id.month;
            temp_arr.year = client_reviews[i]._id.year;
            temp_arr.review = client_reviews[i].data;
            client_all_reviews.push(temp_arr);
          }

          for (let i = 0; i < account_manager_reviews.length; i++) {
            let temp_arr = {};
            temp_arr.month = account_manager_reviews[i]._id.month;
            temp_arr.year = account_manager_reviews[i]._id.year;
            temp_arr.review = account_manager_reviews[i].data;
            account_manager_all_reviews.push(temp_arr);
          }

          foundUser.client_reviews = client_all_reviews;
          foundUser.account_manager_reviews = account_manager_all_reviews;

          // This code is for check resources is currently login or not ..
          let checkUserIsCurrentlyLogin = await resource_login_logs.findOne({ resource_id: foundUser._id }).sort({ createdAt: -1 });
          if (checkUserIsCurrentlyLogin !== null) {
            foundUser.isCurrentlyUserLogin = checkUserIsCurrentlyLogin.description
          }

          //Below three lines are not used yet
          // let response = {
          //   foundUser
          // }
          return res.status(200).send({ message: "Data Found", status: true, response: foundUser });
        }
      }).lean();
    }
  } catch (error) {
    return res.status(400).send({ message: "something went wrong", status: false });
    // throw globalCalls.badRequestError(error.message)
  }
};
/**
 * Function - modify-resource-basic-info/:id
 * Description - To update resource slot availability
 * Developer - Shubham Kumar
 * Created on - 17 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const modifyResourceBasicInfo = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  } else {
    let id = base64decode(req.params.id);
    data = req.body;

    if (data.isAvailable == true) {
      if (!data.available_date) {
        res
          .status(404)
          .json({ message: "Please fill your from availability." });
        // throw globalCalls.badRequestError("Please fill your from availability.");
      }
      /*else if(moment(data.availabe_from,"LT",true).isValid()==false){
              //LT moment("12:44 PM","LT",true).isValid() //should return true for time validation//format: 12:44 PM
          }*/

      if (!data.available_time) {
        res.status(404).json({ message: "Please fill your to availability." });
        // throw globalCalls.badRequestError("Please fill your to availability.");
      }
      /*else if(moment(data.availabe_to,"LT",true).isValid()==false){
  
          }else if(1==1){
  
          }*/
    } else {
      data.isAvailable = false;
      data.available_date = "";
      data.available_time = "";
    }
    Resources.findOne({ _id: id }, function (err, resourceData) {
      if (err) {
        return res
          .status(400)
          .send({ message: "Resource not found", status: false });
      } else {
        //resource found
        if (resourceData.status != "Pending") {
          return res.status(400).send({
            message: "Resource info cannot be updated",
            status: false,
          });
        } else {
          Resources.updateOne(
            { _id: id },
            {
              $set: {
                isAvailable: data.isAvailable,
                available_from: data.available_date,
                available_to: data.available_time,
              },
            },
            function (err, resp) {
              if (err) {
                return res
                  .status(400)
                  .send({ message: "Bad Request", status: false });
              } else {
                return res.status(200).send({
                  message: "Status Changed successfully",
                  status: true,
                });
              }
            }
          );
        }
        // return res.status(200).send({ message: "Data Found", status: true, resource:resourceData });
      }
    });
  }
};

/**
 * Function - qualifiedResources
 * Description - As an admin to see all qualified resources
 * Api - qualified-resources
 * Developer - Shubham Kumar
 * Created on - 21 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const qualifiedResources = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);

  try {
    let condition = {}; let listing = [];
    condition["isDelete"] = false;
    condition["status"] = "Qualified";
    if (res.userRole == "vendor-associate") {
      let venderFromPOC = await Admin.find({ ebPOC: res.userId }, { _id: 1 })
      const idArr = new Array();
      venderFromPOC.forEach(element => {
        idArr.push(element.id);
      });
      condition["vendorId"] = { $in: idArr }
    }
    if (req.query.search) {
      let srch = req.query.search.toString().toLowerCase();
      condition["name"] = { $regex: ".*" + srch + ".*" };
    }
    if (req.query.ebPOC) {
      let ebPOCId = base64decode(req.query.ebPOC);
      let venderFromPOC = await Admin.find({ ebPOC: ebPOCId }, { _id: 1 })
      const idArr = new Array();
      venderFromPOC.forEach(element => {
        idArr.push(element.id);
      });
      condition["vendorId"] = { $in: idArr }
    }

    if (req.query.techStack) {
      let y = req.query.techStack.split(',');
      let object_teckStack = y.map(function (val) { return ObjectId(`${val}`); });
      condition["techStack"] = { $in: object_teckStack }//req.query.techStack.split(',')
    }


    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }

    if (req.query.status) {
      if (req.query.status == "hired") {
        condition['isDelete'] = false;
        condition['isHired'] = true;
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
      }
      if (req.query.status == "available") {
        condition['isDelete'] = false;
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
        condition['isHired'] = false;

      }
      if (req.query.status == "pullback") {//pullBack
        condition['isDelete'] = false;
        condition['isPullBack'] = true;
      }

    }
    if (req.query.startDate || req.query.endDate) {
      let dateCondition;
      if (req.query.startDate) {
        dateCondition = { $gte: new Date(req.query.startDate) }
      }
      if (req.query.endDate) {
        dateCondition = { $lte: new Date(req.query.endDate) }
      }
      if (req.query.startDate && req.query.endDate) {
        dateCondition = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) }
      }
      condition['qualified_on'] = dateCondition;
    }

    let qualified_resource = await Resources.find(condition)
      .sort({ updatedAt: -1 })// .sort({ qualified_on: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    //------------------------------testing area start--------------------------//
    /* let intSchedule = await interviewScheduleModel.aggregate([
      { $match : {interviewStatus : {$nin: ['Hired','Rejected','Cancelled'] } }},
      { $limit: limit},
      { $skip: offset}
     ]);
     for(let a=0; a<intSchedule.length; a++){
      let resource_all_info = await Resources.find({isDelete:false});
     }
     console.log(intSchedule); */
    //------------------------------testing area end--------------------------//

    let total_resource_count = await Resources.find({ isDelete: false }).countDocuments();//, status: "Qualified"
    let available_resource_count = await Resources.find({ isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false }).countDocuments();
    let hired_resource_count = await Resources.find({ isDelete: false, isHired: true, isPullBack: { $ne: true }, status: "Qualified" }).countDocuments();
    let Qualified_pullBack_count = await Resources.find({ isDelete: false, isPullBack: true, status: "Qualified" }).countDocuments();
    delete condition['status'];
    let PullBack_resource_count = await Resources.find({ isDelete: false, isPullBack: true }).countDocuments();

    let filter_info = {
      total_resource: total_resource_count,
      available_resource: available_resource_count,
      hired_resource: hired_resource_count,
      pullBack_resource_count: PullBack_resource_count,
      qualified_pullBack_count: Qualified_pullBack_count
    };

    for (let i = 0; i < qualified_resource.length; i++) {
      //get domain of resource start
      let domain_info = await domain.findOne({ _id: qualified_resource[i].domain });
      if (domain_info) {
        qualified_resource[i].domain_info = { "_id": domain_info._id, "domain": domain_info.domain };
      }
      //get domain of resource end

      if (qualified_resource[i].status == "Qualified") {
        let adminInfo = await Admin.findOne({ _id: qualified_resource[i].qualified_by }, { _id: 1, name: 1 });
        if (adminInfo) {
          qualified_resource[i].qualified_by = adminInfo;
        }
      }
    }
    for (let i = 0; i < qualified_resource.length; i++) {
      let domain_data = await domain.find({ _id: qualified_resource[i].domain }).select(" _id , domain , domain_image ")
      if (domain_data) {
        qualified_resource[i].domain_info = domain_data;
      }
    }
    for (let i = 0; i < qualified_resource.length; i++) {
      let adminInfo = await Admin.findOne({ _id: qualified_resource[i].vendorId }, { name: 1, _id: 1, ebPOC: 1, email: 1, phone: 1 }).lean();
      if (adminInfo) {
        let vendorPOC = await Admin.findOne({ _id: adminInfo.ebPOC }, { name: 1, _id: 1, email: 1, phone: 1 });
        adminInfo.ebPOC = vendorPOC;
        qualified_resource[i].vendorId = adminInfo;

      }
    }
    for (let i = 0; i < qualified_resource.length; i++) {
      if (qualified_resource[i].vendorId) {
        let field = { _id: 1, comm_skill_points: 1, comm_tech_points: 1, presentability: 1, attentiveness: 1, comment: 1, status: 1, createdAt: 1 }
        let adminInfo = await screening.find({ addedTo: qualified_resource[i]._id }, field).sort({ createdAt: -1 });
        if (adminInfo) {
          qualified_resource[i].screeningData = adminInfo;
        }
      }
    }
    for (let i = 0; i < qualified_resource.length; i++) {
      if (qualified_resource[i].vendorId) {

        let ccond = { addedTo: qualified_resource[i]._id, interviewStatus: "Hired" };
        let adminInfo = await interviewScheduleModel.find(ccond).sort({ updatedAt: -1 });
        let resourceScheduleCount = await interviewScheduleModel.find({ addedTo: qualified_resource[i]._id }).sort({ updatedAt: 1 }).countDocuments();
        if (adminInfo) {
          adminInfo = JSON.parse(JSON.stringify(adminInfo));
          for (let i = 0; i < adminInfo.length; i++) {
            // console.log(adminInfo[i])
            let sales_person = await interviewScheduleModel.find({ addedTo: qualified_resource[i]._id, interviewStatus: "Hired" }).select("addedBy");

            if (sales_person.length > 0) {
              let find_sm = await Admin.findOne({ _id: sales_person[i].addedBy, isDelete: false, role: "sales-manager" }).select("_id name ");

              adminInfo[i].sales_person = find_sm;
            }
            let getClientName = await Admin.findOne({ _id: adminInfo[i].client_id });
            if (getClientName) {//console.log(getClientName._id)
              adminInfo[i].client_id = getClientName._id;
              adminInfo[i].clientName = getClientName.name;
              let accountManagerInfo = await Admin.findOne({ _id: getClientName.accountManager }).select("_id name");//to get account manager name
              if (accountManagerInfo) {
                adminInfo[i].accountManagerId = accountManagerInfo._id;
                adminInfo[i].accountManagerName = accountManagerInfo.name;
              } else {
                adminInfo[i].accountManagerId = null;
                adminInfo[i].accountManagerName = null;
              }
            } else {
              adminInfo[i].client_id = null
            }
          }
          qualified_resource[i].interviewSchedule = adminInfo;
          let hiredCount = 0;
          let rejectedCount = 0;
          adminInfo.forEach(element => {
            if (element.interviewStatus) {
              qualified_resource[i].interviewStatus = element.interviewStatus;
            }
            if (element.interviewStatus == "Hired") {
              hiredCount++;
            }
            if (element.interviewStatus == "Rejected") {
              rejectedCount++
            }
          });
          qualified_resource[i].totalScheduleCount = resourceScheduleCount;
          qualified_resource[i].hiredCount = hiredCount;
          qualified_resource[i].rejectedCount = rejectedCount;

        }
      }

      // This code is for check resources is currently login or not ..
      let checkUserIsCurrentlyLogin = await resource_login_logs.findOne({ resource_id: qualified_resource[i]._id }).sort({ createdAt: -1 });
      if (checkUserIsCurrentlyLogin !== null) {
        qualified_resource[i].isCurrentlyUserLogin = checkUserIsCurrentlyLogin.description
      }
    }


    for (let i = 0; i < qualified_resource.length; i++) {
      let skill_arr = [];
      for (let j = 0; j < qualified_resource[i].techStack.length; j++) {
        let temp_arr = {};
        if (ObjectId.isValid(qualified_resource[i].techStack[j]) == true) {
          let skillSetListData = await Skillset_list.findOne({ _id: qualified_resource[i].techStack[j] }).select("_id skill");
          if (skillSetListData) {
            temp_arr['_id'] = skillSetListData._id;
            temp_arr['skill'] = skillSetListData.skill;
            skill_arr.push(temp_arr);
          }
        }
      }
      if (skill_arr) {
        qualified_resource[i].skill_info = skill_arr;
      }

      //----------------------Get Resource Client Start-------------------------//
      let resource_client = await interviewScheduleModel.findOne({ interviewStatus: "Hired", addedTo: qualified_resource[i]._id });

      if (resource_client) {
        let client_data = await Admin.findOne({ name: resource_client.clientName }).select("_id name");
        if (client_data) {
          qualified_resource[i].client_info = client_data;
        }
      }
      //----------------------Get Resource Client End---------------------------//

      //----------------------Resource Cred Start-------------------------//
      let resource_cred = await Admin.findOne({ resource_id: qualified_resource[i]._id }).select("_id email role");
      if (resource_cred) {
        qualified_resource[i].credentials_info = resource_cred;
      }
      //----------------------Resource Cred End---------------------------//

    }

    return res.status(200).send({
      message: "Data Found",
      status: true,
      response: qualified_resource,
      filter_info: filter_info,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(400)
      .send({ message: "Something went wrong", status: false, error: error.message });
  }
};

/**
 * Created BYy: Sakshi
 * Created Date: 28-06-2022
 * Desc: To show qualified resources according to filter
 * API: qualified-resources-new
 * Function : qualifiedResourcesNew
 * Updated By: Shubham Kumar
 * Updated Desc: Added condition to show not schedule and schedule in filter
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const qualifiedResourcesNew = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  
  try {
    let condition = {};
    condition["isDelete"] = false;
    condition["status"] = "Qualified";

    if (res.userRole == "vendor-associate") {
      let venderFromPOC = await Admin.find({ ebPOC: res.userId }).select("_id");
      const vendor_ids = new Array();
      venderFromPOC.forEach(element => {  vendor_ids.push(ObjectId(element.id) )  });
      condition["vendorId"] = { $in: vendor_ids }
    }

    if (req.query.search) {
      condition["name"] = { $regex: ".*" + req.query.search.toString().toLowerCase() + ".*" };
    }

    if (req.query.ebPOC) {
      let ebPOCId = base64decode(req.query.ebPOC);
      let venderContactPerson = await Admin.find({ ebPOC: ebPOCId }, { _id: 1 });
      const vendor_ids = new Array();
      venderContactPerson.forEach(contact_person => {  vendor_ids.push(ObjectId(contact_person.id)) });
      condition["vendorId"] = { $in: vendor_ids };
    }
    
    if (req.query.techStack) {
      let tech_arr = [];
      let techs = req.query.techStack.split(',');
      let object_teckStack = techs.map(function (tech) { return ObjectId(`${tech}`); });
      condition["techStack"] = { $in: object_teckStack };
    }
    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }

    //---------------------Filter by logged in and logged out Hired resources start ------------------//
    if (req.query.log_status) {
      if(req.query.log_status != "logged-in" && req.query.log_status != "logged-out"){
        return res.status(400).send({ message: "Invalid log status", status: false });
      }
      let resources_log = await resource_login_logs.aggregate([
        {$group: 
          {_id: '$resource_id',
          dateTime:{$max: "$createdAt"},
          description:{$max: "$description"},
          }
        },
      ]);
      let logged_ids = [];//resource ids
      if(resources_log.length > 0){
        for(let z=0; z<resources_log.length; z++){
          if(req.query.log_status == "logged-in" && resources_log[z].description == "logged-in"){
            logged_ids.push(resources_log[z]._id);
          }
          else if(req.query.log_status == "logged-out" && resources_log[z].description == "logged-out"){
            logged_ids.push(resources_log[z]._id);
          }
        }
          condition['_id'] = {$in : logged_ids};
      }
    }
    //---------------------Filter by logged in and logged out Hired resources end ------------------//

    if (req.query.status) {
      condition['isDelete'] = false;
      if (req.query.status == "hired") {
        condition['isHired'] = true;
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
      }
      if (req.query.status == "available") {
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
        condition['isHired'] = false;
      }
      if (req.query.status == "pullback") {
        condition['isPullBack'] = true;
      }
      if (req.query.status.toLowerCase() == "released") {
        let distinct_released_resources = await interviewScheduleModel.distinct("addedTo",{interviewStatus:"Released"});
        let distinct_released_resource_id = [];
        distinct_released_resources.forEach(element => {distinct_released_resource_id.push(element) });
        condition['_id'] = {$in : distinct_released_resource_id};
      }
    }
    if (req.query.startDate || req.query.endDate) {
      let dateCondition;
      if (req.query.startDate) {
        dateCondition = { $gte: new Date(req.query.startDate) }
      }
      if (req.query.endDate) {
        dateCondition = { $lte: new Date(req.query.endDate) }
      }
      if (req.query.startDate && req.query.endDate) {
        dateCondition = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) }
      }
      condition['qualified_on'] = dateCondition;
    }

    if(req.query.status == "not-scheduled"){
      condition['isPullBack'] = { $ne: true };
      condition['status'] = "Qualified";
      condition['isHired'] = false;

      let distinct_interviewed_resources = await interviewScheduleModel.distinct("addedTo");
      let distinct_resource_id = [];

      for(let p=0; p<distinct_interviewed_resources.length; p++ ){
        let res_all_interviews = await interviewScheduleModel.findOne({addedTo: distinct_interviewed_resources[p] }).countDocuments();
        if(res_all_interviews == 1){
          let interviewCnt = await interviewScheduleModel.findOne({interviewStatus : {$in : ['Rejected','Cancelled'] },addedTo: distinct_interviewed_resources[p] }).countDocuments();
          if(interviewCnt > 0){
            continue;
          }
        }else if(res_all_interviews > 1){
          let pendingSts = await interviewScheduleModel.findOne({"interviewStatus": { "$exists": false },addedTo: distinct_interviewed_resources[p] }).countDocuments();
          if(pendingSts == 0){
            continue;
          }
        }
        distinct_resource_id.push(distinct_interviewed_resources[p]);
      }

      // distinct_interviewed_resources.forEach(element => {
      //   distinct_resource_id.push(element);
      // });
      condition['_id'] = {$nin : distinct_resource_id};
    }

    if(req.query.status == "scheduled"){
      condition['isPullBack'] = { $ne: true };
      condition['status'] = "Qualified";
      condition['isHired'] = false;

      let distinct_interviewed_resources = await interviewScheduleModel.distinct("addedTo");
      let distinct_resource_id = [];

      for(let p=0; p<distinct_interviewed_resources.length; p++ ){
        let status_pending_res = await interviewScheduleModel.findOne({"interviewStatus": { "$exists": false } ,addedTo: distinct_interviewed_resources[p] }).countDocuments();//"interviewStatus": { "$exists": false }  //"interviewStatus": { $nin : ['Hired','Rejected','Pending','Cancelled'] }
        if(status_pending_res > 0){
           distinct_resource_id.push(distinct_interviewed_resources[p]);
        }
      }
      // distinct_interviewed_resources.forEach(element => {
      //     distinct_resource_id.push(element);
      // });
      condition['_id'] = {$in : distinct_resource_id };
    }
    
    let qualified_resources = await Resources.aggregate([
      { $match: condition },
      { $sort: { updatedBy: -1 } },
      { $skip: offset },
      { $limit: limit },

      //to get domain info of the resource using resource _id
      {
        $lookup: {
          from: 'domain_lists',
          localField: 'domain',
          foreignField: '_id',
          as: 'domain_info'
        }
      },
      // {$unwind: '$domain_info'},

      //to get the vendor_associate id and name that qualified the resource after screening
      {
        $lookup: {
          from: 'admins',
          localField: 'qualified_by',
          foreignField: '_id',
          as: 'qualified_by'
        }
      },

      //to get the name and id of the resource vendor from admins table
      {
        $lookup: {
          from: 'admins',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorId'
        }
      },

      //to get the vendor associate id and name associated with the resource vendor from admins table
      {
        $lookup: {
          from: 'admins',
          localField: 'vendorId.ebPOC',
          foreignField: '_id',
          as: 'ebPOC_info'
        }
      },

      //to get the screening results of the resource done by vendor associate from screening table
      {
        $lookup: {
          from: 'screenings',
          let: { resource_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$addedTo", "$$resource_id"] }
              }
            },
            { $sort: { createdAt: -1 } }
          ],
          as: 'screeningData'
        }
      },
      // {$unwind: '$screeningData'},
      //to get the login-logout info of the resource from resource_login_logs table
      {
        $lookup: {
          from: 'resource_login_logs',
          let: { resource_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$resource_id", "$$resource_id"] }
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'isCurrentlyUserLogin'
        }
      },
      //to get the interview status of the resource from interviewSchedule table
      {
        $lookup: {
          from: 'interviewschedules',
          let: { resource_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$addedTo", "$$resource_id"] },
                    { $eq: ["$interviewStatus", "Hired"] }
                  ]
                }
              }
            },
            { $sort: { "createdAt": -1 } },
            { $limit: 1 }
          ],
          as: 'interview_info'
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'interview_info.addedBy',
          foreignField: '_id',
          as: 'admin_info'
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'interview_info.clientName',
          foreignField: 'name',
          as: 'client_info'
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'client_info.accountManager',
          foreignField: '_id',
          as: 'AM_info'
        }
      },
      {
        $lookup: {
          from: 'skill_set_lists',
          localField: 'techStack',
          foreignField: '_id',
          as: 'skill_info'
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: '_id',
          foreignField: 'resource_id',
          as: 'credentials_info'
        }
      },
      {
        "$project": {

          "_id": 1, "name": 1, "isHired": 1, "isPullBack": 1, "techStack": 1,
          "isDelete": 1, "experiance": 1, "price": 1, "resumeDocUrl": 1,
          "status": 1, "comment": 1, "project_endDate": 1, "project_startDate": 1, "interview": 1,
          "exp_months": 1, "exp_years": 1, "experiance": 1, "available_date": 1, "available_time": 1, 
          "qualified_on": 1, "aadhar_front": 1, "aadhar_back": 1, "pancard": 1, "createdAt":1, "updatedAt":1,

          "domain_info._id": 1, "domain_info.domain": 1,

          "vendorId._id": 1, "vendorId.name": 1, "vendorId.name": 1, "vendorId.email": 1, "vendorId.phone": 1,
          "vendorId.ebPOC": 1, "ebPOC_info._id": 1, "ebPOC_info.name": 1, "ebPOC_info.email": 1, "ebPOC_info.phone": 1,

          "screeningData.comm_skill_points": 1, "screeningData.comm_tech_points": 1,
          "screeningData.presentability": 1, "screeningData.attentiveness": 1, "screeningData.status": 1,
          "screeningData.comment": 1, "screeningData._id": 1, "screeningData.createdAt": 1,
          
          "interview_info.clientName": 1, "interview_info.name": 1, "interview_info.interviewStatus": 1,
          "interview_info.client_id": 1, "interview_info.comment": 1, "interview_info.addedBy": 1, 
          "interview_info.addedTo": 1, "interview_info.qualifying_screenshot": 1, 
          "interview_info.interviewDate": 1, "interview_info.meetingLink": 1, "interview_info.techStack": 1, 
          "interview_info._id": 1, "interview_info.createdAt": 1,

          "isCurrentlyUserLogin": 1,

          "credentials_info._id": 1, "credentials_info.email": 1, "credentials_info.role": 1,

          "skill_info._id": 1, "skill_info.skill": 1,

          "admin_info._id": 1, "admin_info.name": 1,

          "AM_info._id": 1, "AM_info.name": 1,

          "qualified_by._id": 1, "qualified_by.name": 1
        }
      }
    ]);

    let totalScheduleCount = 0;
    for (let i = 0; i < qualified_resources.length; i++) {
      let hired_data = await interviewScheduleModel.find({ addedTo: ObjectId(qualified_resources[i]._id), interviewStatus: "Hired" }).countDocuments();
      qualified_resources[i].hiredCount = hired_data;
      let rejected_data = await interviewScheduleModel.find({ addedTo: ObjectId(qualified_resources[i]._id), interviewStatus: "Rejected" }).countDocuments();
      qualified_resources[i].rejectedCount = rejected_data;
      if (qualified_resources[i].hiredCount != 0 && qualified_resources[i].rejectedCount != 0) {
        qualified_resources[i].totalScheduleCount = hired_data + rejected_data;
      }
      else {
        qualified_resources[i].totalScheduleCount = totalScheduleCount;
      }

    }

    let total_resource_count = available_resource_count = hired_resource_count = Qualified_pullBack_count = PullBack_resource_count = 0;
    let distint_resources_ids = [];
    let distint_resources = await interviewScheduleModel.distinct("addedTo");
    for(let dis_res = 0; dis_res<distint_resources.length; dis_res++){
      //------------------- condition for not schedule count start -----------------------//
      let res_all_interviews_count = await interviewScheduleModel.findOne({addedTo: distint_resources[dis_res] }).countDocuments();
      if(res_all_interviews_count == 1){
        let interviewCnt_count = await interviewScheduleModel.findOne({interviewStatus : {$in : ['Rejected','Cancelled'] },addedTo: distint_resources[dis_res] }).countDocuments();
        if(interviewCnt_count > 0){
          continue;
        }
      }else if(res_all_interviews_count > 1){
        let pendingSts_count = await interviewScheduleModel.findOne({"interviewStatus": { "$exists": false },addedTo: distint_resources[dis_res] }).countDocuments();
        if(pendingSts_count == 0){
          continue;
        }
      }
      //------------------- condition for not schedule count end -----------------------//
      distint_resources_ids.push(distint_resources[dis_res]);
    }
    // distint_resources.forEach(element => {distint_resources_ids.push(element) });

    let distinct_released_resources_ids = await interviewScheduleModel.distinct("addedTo",{interviewStatus:"Released"});
    let distinct_released_resourceId = [];
    distinct_released_resources_ids.forEach(element => {distinct_released_resourceId.push(element) });

    if(res.userRole == "vendor-associate"){
      total_resource_count = await Resources.aggregate([
        {$match : {isDelete:false, vendorId: condition["vendorId"] }, },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      available_resource_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, vendorId: condition["vendorId"]} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      hired_resource_count = await Resources.aggregate([
        {$match : {isDelete: false, isHired: true, isPullBack: { $ne: true }, status: "Qualified", vendorId: condition["vendorId"] } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      Qualified_pullBack_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: true, status: "Qualified", vendorId: condition["vendorId"] }, },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      PullBack_resource_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: true, vendorId: condition["vendorId"]} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      schedule_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, _id : {$in : distint_resources_ids}, vendorId: condition["vendorId"] } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      notschedule_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, _id : {$nin : distint_resources_ids}, vendorId: condition["vendorId"] } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      released_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: true, _id : {$in : distinct_released_resourceId}, vendorId: condition["vendorId"] } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);
      
    }else{

      total_resource_count = await Resources.aggregate([
        {$match : {isDelete:false} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      available_resource_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      hired_resource_count = await Resources.aggregate([
        {$match : {isDelete: false, isHired: true, isPullBack: { $ne: true }, status: "Qualified"} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      Qualified_pullBack_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: true, status: "Qualified"} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      PullBack_resource_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: true} },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      schedule_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, _id : {$in : distint_resources_ids} } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      notschedule_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, _id : {$nin : distint_resources_ids} } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      released_count = await Resources.aggregate([
        {$match : {isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: true, _id : {$in : distinct_released_resourceId} } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);
    }

    // let schedule_count = await Resources.find({ isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, _id : {$in : distint_resources_ids} }).countDocuments();
    // let notschedule_count = await Resources.find({ isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: false, _id : {$nin : distint_resources_ids} }).countDocuments();
    // let released_count = await Resources.find({ isDelete: false, isPullBack: { $ne: true }, status: "Qualified", isHired: true, _id : {$in : distinct_released_resourceId} }).countDocuments();
    let total = await Resources.find(condition).countDocuments();

    let filter_info = {
      total_resource:           total_resource_count[0] ? total_resource_count[0].count : 0,
      available_resource:       available_resource_count[0] ? available_resource_count[0].count : 0,
      hired_resource:           hired_resource_count[0] ? hired_resource_count[0].count : 0,
      pullBack_resource_count:  PullBack_resource_count[0] ? PullBack_resource_count[0].count : 0,
      qualified_pullBack_count: Qualified_pullBack_count[0] ? Qualified_pullBack_count[0].count : 0,
      scheduled:                schedule_count[0] ? schedule_count[0].count : 0,
      notscheduled:             notschedule_count[0] ? notschedule_count[0].count : 0,
      released:                 released_count[0] ? released_count[0].count : 0
    };

    let responseData = {
      qualified_resources,
      "filter_info": filter_info,
      "total":total
    }
    return res.status(200).send({ responseData, message: "Qualified resources found successfully", status: true });
  }
  catch (error) {
    return res
      .status(400)
      .send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }

}

const downloadQualifiedResources = async (req, res) => {

  try {
    let condition = {};
    condition["isDelete"] = false;
    condition["status"] = "Qualified";
    // condition["isPullBack"] = {$ne: true}; //{$in: [null, false]};
    if (res.userRole == "vendor-associate") {
      let venderFromPOC = await Admin.find({ ebPOC: res.userId }, { _id: 1 })
      const idArr = new Array();
      venderFromPOC.forEach(element => {
        idArr.push(element.id);
      });
      condition["vendorId"] = { $in: idArr }
    }
    if (req.query.search) {
      let srch = req.query.search.toString().toLowerCase();
      condition["name"] = { $regex: ".*" + srch + ".*" };
    }
    if (req.query.ebPOC) {
      let ebPOCId = base64decode(req.query.ebPOC);
      let venderFromPOC = await Admin.find({ ebPOC: ebPOCId }, { _id: 1 })
      const idArr = new Array();
      venderFromPOC.forEach(element => {
        idArr.push(element.id);
      });
      condition["vendorId"] = { $in: idArr }
    }

    if (req.query.techStack) {
      condition["techStack"] = { $all: req.query.techStack.split(',') }
    }


    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }

    if (req.query.status) {
      if (req.query.status == "hired") {
        condition['isHired'] = true;
      }
      if (req.query.status == "available") {
        condition['isHired'] = { $ne: true };
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
      }
      if (req.query.status == "pullBack") {
        condition['isPullBack'] = true;
        condition['status'] = "Qualified";
      }

    }
    if (req.query.startDate || req.query.endDate) {
      let dateCondition;
      if (req.query.startDate) {
        dateCondition = { $gte: new Date(req.query.startDate) }
      }
      if (req.query.endDate) {
        dateCondition = { $lte: new Date(req.query.endDate) }
      }
      if (req.query.startDate && req.query.endDate) {
        dateCondition = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) }
      }
      condition['qualified_on'] = dateCondition;
    }

    let qualified_resource = await Resources.find(condition).sort({ qualified_on: -1 }).lean();


    for (let i = 0; i < qualified_resource.length; i++) {
      if (qualified_resource[i].status == "Qualified") {
        let adminInfo = await Admin.findOne({ _id: qualified_resource[i].qualified_by }, { _id: 1, name: 1 });
        if (adminInfo) {
          qualified_resource[i].qualified_by = adminInfo;
        }
      }
    }
    for (let i = 0; i < qualified_resource.length; i++) {
      let adminInfo = await Admin.findOne({ _id: qualified_resource[i].vendorId }, { name: 1, _id: 1, ebPOC: 1 }).lean();
      if (adminInfo) {
        let vendorPOC = await Admin.findOne({ _id: adminInfo.ebPOC }, { name: 1, _id: 1 });
        adminInfo.ebPOC = vendorPOC;
        qualified_resource[i].tech_partner = adminInfo.name;
        qualified_resource[i].inhouse_POC = adminInfo.ebPOC.name;

      }
    }
    // for (let i = 0; i < qualified_resource.length; i++) {
    //   if (qualified_resource[i].vendorId) {
    //     let field = { _id: 1, comm_skill_points: 1, comm_tech_points: 1, comment: 1, status: 1, createdAt: 1 }
    //     let adminInfo = await screening.find({ addedTo: qualified_resource[i]._id }, field);
    //     if (adminInfo) {
    //       qualified_resource[i].screeningData = adminInfo;
    //     }
    //   }
    // }
    // for (let i = 0; i < qualified_resource.length; i++) {
    //   if (qualified_resource[i].vendorId) {
    //     let adminInfo = await interviewScheduleModel.find({ addedTo: qualified_resource[i]._id }).sort({ updatedAt: 1 });
    //     if (adminInfo) {
    //       qualified_resource[i].interviewSchedule = adminInfo;
    //       let hiredCount = 0;
    //       let rejectedCount = 0;

    //       adminInfo.forEach(element => {
    //         if (element.interviewStatus) {
    //           qualified_resource[i].interviewStatus = element.interviewStatus;
    //         }
    //         if (element.interviewStatus == "Hired") {
    //           hiredCount++;
    //         }
    //         if (element.interviewStatus == "Rejected") {
    //           rejectedCount++
    //         }
    //       });
    //       qualified_resource[i].hiredCount = hiredCount;
    //       qualified_resource[i].rejectedCount = rejectedCount;

    //     }
    //   }
    // }
    //For unique file name
    const dateTime = new Date().toISOString().slice(-24).replace(/\D/g, '').slice(0, 14);
    const filePath = path.join(__dirname, "../../", "apis", "resourceResume", "qualified-resource-csv-" + dateTime + ".csv");
    let csv;
    const student = qualified_resource;
    const fields = ['name', 'techStack', 'experiance', 'tech_partner', 'inhouse_POC', 'price', 'qualified_on', 'status'];
    try {
      csv = json2csv(student, { fields });
    } catch (err) {
      return res.status(500).json({ err });
    }
    fs.writeFile(filePath, csv, function (err) {
      if (err) {
        return res.json(err).status(500);
      }
      else {
        setTimeout(function () {
          fs.unlink(filePath, function (err) { // delete this file after 30 seconds
            if (err) {
              console.error(err);
            }
            console.log('File has been Deleted');
          });

        }, 30000);
        // res.download(filePath);
        return res.status(200).send({ message: "Qualified resource data Found", status: true, fileName: "qualified-resource-csv-" + dateTime + ".csv" });
      }
    })

  } catch (error) {
    return res
      .status(400)
      .send({ message: "Something went wrong", status: false, error: error });
  }
};

const hiredResources = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);

  try {

    let condition = {};
    condition["isDelete"] = false;
    condition["isHired"] = true;
    if (req.query.feedback) {
      let hired_resource_data = await Resources.find(condition).lean()
      for (let i = 0; i < hired_resource_data.length; i++) {
        if (hired_resource_data[i].vendorId) {
          let feedback_response = await feedback.find({ addedTo: hired_resource_data[i]._id }, { status: 1 }).sort({ _id: -1 }).limit(1);
          if (feedback_response.length > 0) {
            hired_resource_data[i].feedback = feedback_response[0].status;
          }
        }
      }
      const idArr = new Array();
      hired_resource_data.forEach(element => {
        if (element.feedback == req.query.feedback)
          idArr.push(element._id);
      });
      // console.log("test", idArr)
      condition["_id"] = { $in: idArr }
    }

    if (res.userRole == "account-manager") {
      condition["account_manager"] = res.userId
    }
    if (req.query.search) {
      let srch = req.query.search.toString().toLowerCase();
      condition["name"] = { $regex: ".*" + srch + ".*" };
    }
    if (req.query.account_manager) {
      condition["account_manager"] = req.query.account_manager
    }

    if (req.query.techStack) {
      condition["techStack"] = { $all: req.query.techStack.split(',') }
    }

    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }



    let hired_resource = await Resources.find(condition)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    let total_resource_count = await Resources.find(condition).countDocuments();
    let availableCondition;
    availableCondition = { $and: [condition, { "account_manager": { $exists: true, $ne: null } }] }
    let managerAssignedCount = await Resources.find(availableCondition).countDocuments();


    let filter_info = {
      total_resource: total_resource_count,
      managerAssignedCount: managerAssignedCount,
    };
    for (let i = 0; i < hired_resource.length; i++) {
      if (hired_resource[i].account_manager) {
        let adminInfo = await Admin.findOne({ _id: hired_resource[i].account_manager }, { _id: 1, name: 1 });
        if (adminInfo) {
          hired_resource[i].account_manager = adminInfo;
        }
      }
    }
    for (let i = 0; i < hired_resource.length; i++) {
      let domain_data = await domain.find({ _id: hired_resource[i].domain }).select(" _id , domain , domain_image ");
      if (domain_data) {
        hired_resource[i].domain_info = domain_data;
      }
    }
    for (let i = 0; i < hired_resource.length; i++) {
      let adminInfo = await Admin.findOne({ _id: hired_resource[i].vendorId }, { name: 1, _id: 1, ebPOC: 1, email: 1, phone: 1 }).lean();
      if (adminInfo) {
        let vendorPOC = await Admin.findOne({ _id: adminInfo.ebPOC }, { name: 1, _id: 1, email: 1, phone: 1 });
        adminInfo.ebPOC = vendorPOC;
        hired_resource[i].vendorId = adminInfo;
      }

    }
    for (let i = 0; i < hired_resource.length; i++) {
      if (hired_resource[i].vendorId) {
        let field = { _id: 1, comm_skill_points: 1, comm_tech_points: 1, comment: 1, status: 1, createdAt: 1 }
        let feedback_response = await feedback.find({ addedTo: hired_resource[i]._id }, field).sort({ _id: -1 }).limit(1);
        if (feedback_response) {
          hired_resource[i].feedback = feedback_response;
        }
      }
      let interviewData = await interviewScheduleModel.findOne({ addedTo: hired_resource[i]._id, interviewStatus: 'Hired' }).sort({ updatedAt: -1 }).limit(1);
      hired_resource[i].clientName = interviewData ? interviewData.clientName : "";
    }

    return res.status(200).send({
      message: "Data Found",
      status: true,
      response: hired_resource,
      filter_info: filter_info,
    });
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Something went wrong", status: false, error: error });
  }
};

const addAccountManager = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  } else {
    let id = base64decode(req.params.id);
    data = req.body;

    if (!data.account_manager) {
      res.status(404).json({ message: "Please fill account manager." });
    }
    // if (!data.project_startDate) {
    //   res.status(404).json({ message: "Please fill project startDate." });
    // }
    // if (!data.project_endDate) {
    //   res.status(404).json({ message: "Please fill project endDate." });
    // }
    // if (!data.mobile) {
    //   res.status(404).json({ message: "Please fill mobile number." });
    // }

    Resources.findOne({ _id: id }, function (err, resourceData) {
      if (err) {
        return res
          .status(400)
          .send({ message: "Resource not found", status: false });
      } else {
        //resource found
        Resources.updateOne(
          { _id: id },
          {
            $set: {
              account_manager: data.account_manager,
              project_startDate: null,
              project_endDate: null,
              // project_startDate: data.project_startDate,
              // project_endDate: data.project_endDate,
              // mobile: data.mobile,
              // email: data.email
            },
          },
          function (err, resp) {
            if (err) {
              return res
                .status(400)
                .send({ message: "Bad Request", status: false });
            } else {
              return res.status(200).send({
                message: "Status Changed successfully",
                status: true,
              });
            }
          }
        );
      }
    });
  }
};

const canTakeInterview = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  } else {
    let id = base64decode(req.params.id);
    data = req.body;
    // if (!data.interview) {
    //   res.status(404).json({ message: "Please select option for interview." });
    // }
    Resources.findOne({ _id: id }, function (err, resourceData) {
      if (err) {
        return res
          .status(400)
          .send({ message: "Resource not found", status: false });
      } else {
        //resource found
        Resources.updateOne(
          { _id: id },
          {
            $set: {
              interview: data.interview,
            },
          },
          function (err, resp) {
            if (err) {
              return res
                .status(400)
                .send({ message: "please enter valid interview option", status: false });
            } else if (data.interview == null) {
              res.status(404).json({ message: "Please enter valid interview option", status: false })
            } else {
              return res.status(200).send({
                message: "Status Changed successfully",
                status: true,
              });
            }
          }
        );
      }
    });
  }
};
/**
 * Function - modifyQualifiedResourceStatus
 * Description - To change qualified resources is Hired status
 * Api - qualified-resource/:id
 * Developer - Shubham Kumar
 * Created on - 22 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const modifyQualifiedResourceStatus = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: "Id not found", status: false });
    } else {
      if (res.userRole != "admin") {
        return res.status(404).send({ message: "Invalid role", status: false });
      } else {
        let id = base64decode(req.params.id);
        data = req.body;
        let resourceExists = await Resources.findOne({
          _id: id,
          status: "Qualified",
        });
        if (!resourceExists) {
          return res
            .status(400)
            .send({ message: "Resource not found", status: false });
        } else {
          let isHired = true;
          if (
            resourceExists["isHired"] == undefined ||
            resourceExists["isHired"] == false
          ) {
            isHired = true;
          } else {
            isHired = false;
          }
          const query = { _id: id };
          const update = { $set: { isHired: isHired } };
          const options = { upsert: true };
          let update_response = await Resources.updateOne(
            query,
            update,
            options
          );
          if (update_response) {
            return res
              .status(200)
              .send({ message: "Status changed successfully", status: true });
          } else {
            return res
              .status(200)
              .send({ message: "Error in updating", status: true });
          }
        }
      }
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "Something went wrong", status: false, error: error });
  }
};

/**
 * Function - updateResourceAllInfo
 * Description - To update resource all info (by admin)
 * Api - resource/:id
 * Developer - Shubham Kumar
 * Created on - 22 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const updateResourceAllInfo = async (req, res) => {
  data = req.body;
  let resume = req.body.resume;
  // let profileImage = req.body.profileImage;
  const isodate = new Date().toISOString();
  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  }
  const resource = {};
  let mob_no = 0;
  if (data.mobile_number) {
    mob_no = JSON.parse(data.mobile_number);
  }

  if (req.files) {
    if (req.files.resume) {
      var resumeDocUrl = req.files.resume[0].location;
      resource["resumeDocUrl"] = resumeDocUrl;
    }
    if (req.files.profileImage) {
      var imageUrl = req.files.profileImage[0].location;
      resource["profileImage"] = imageUrl;
    }
  }
  // if (resume) {
  //   var resumeDocUrl = "resourceResume/" + resume.replace('/\\/g', '/');
  //   resource["resumeDocUrl"] = resumeDocUrl;

  // }
  // if (profileImage) {
  //   var imageUrl = "resourceImage/" + profileImage.replace('/\\/g', '/');
  //   resource["profileImage"] = imageUrl;
  // }

  if (data.name) {
    if (data.name.length <= 0 || data.name.length >= 30) {
      return res.status(404).json({ message: "Name should be 30 characters." });
    } else {
      resource["name"] = data.name;
    }
  }

  if (data.techStack) {
    // resource["techStack"] = data.techStack.split(',');
    let skillData = data.techStack.split(',');
    resource["techStack"] = skillData.map((element)=>{
      return ObjectId(element.trim());
    });
  }

  if (data.exp_years && data.exp_years != '') {
    resource['exp_years'] = data.exp_years;
  }

  if (data.exp_months && data.exp_months != '') {
    resource['exp_months'] = data.exp_months;
  }

  if (data.domain) {
    resource['domain'] = data.domain;
  }
  if (data.price) {
    if (isNaN(data.price)) {
      return res
        .status(400)
        .json({ message: "Error! You have passed invalid price." });
    } else {
      resource["price"] = data.price;
    }
  }

  if (data.email) {
    if (!emailRegexp.test(data.email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email id." });
    }
  }

  resource["noticePeriod"] = data.noticePeriod;

  //format supported date : 01/01/1990, time: 23:59
  if (data.isAvailable) {
    if (data.isAvailable == true) {
      if (!data.available_date) {
        return res.status(404).json({
          message: "Please fill your from availabile date.",
          status: false,
        });
      } else if (!dateRegex.test(data.available_date)) {
        return res.status(404).json({
          message: "Please fill correct available date.",
          status: false,
        });
      } else {
        resource["available_date"] = data.available_date;
      }

      if (!data.available_time) {
        return res.status(404).json({
          message: "Please fill your to availabile time.",
          status: false,
        });
      } else if (!timeRegex.test(data.available_time)) {
        return res.status(404).json({
          message: "Please fill correct availabile time.",
          status: false,
        });
      } else {
        resource["available_time"] = data.available_time;
      }
      resource["isAvailable"] = data.isAvailable;
    } else {
      resource["isAvailable"] = false;
      resource["available_date"] = "";
      resource["available_time"] = "";
    }
  }
  try {
    let id = base64decode(req.params.id);
    const checkResource = await Resources.find({ _id: id });
    if (checkResource.length == 0) {
      return res
        .status(404)
        .json({ message: "Resource not exist!", status: false });
    } else {
      //console.log(resource);
      if (data.email) {
        if (checkResource[0].email != data.email) {
          const isEamilExist = await Resources.find({ email: data.email });
          if (isEamilExist.length != 0) {
            //email id already exist
            return res
              .status(400)
              .json({ message: "Email id already exist!", status: false });
          } else {
            resource["email"] = data.email;
          }
        }
      }

      if (mob_no == 0) {
        console.log("kuch mat karna")
      }
      else if (mob_no != 0) {
        if (mob_no.number) {
          resource["mobile_number"] = mob_no.number;
        }
        if (mob_no.internationalNumber) {
          resource["internationalNumber"] = mob_no.internationalNumber;
        }
        if (mob_no.nationalNumber) {
          resource["nationalNumber"] = mob_no.nationalNumber
        }
        if (mob_no.e164Number) {
          resource["e164Number"] = mob_no.e164Number
        }
        if (mob_no.countryCode) {
          resource["countryCode"] = mob_no.countryCode
        }
        if (mob_no.dialCode) {
          resource["dialCode"] = mob_no.dialCode
        }
        resource["mobile_number"] = mob_no.mobile_number;

      }

      // let temp_mob_arr = JSON.parse(data.mobile_number);
      let phone_arr = {
        "number": mob_no.number,
        "internationalNumber": mob_no.internationalNumber,
        "nationalNumber": mob_no.nationalNumber,
        "e164Number": mob_no.e164Number,
        "countryCode": mob_no.countryCode,
        "dialCode": mob_no.dialCode,
        "user_id": id,
        "phone1": mob_no.number
      }

      /* if (data.mobile_number) {
        if (data.mobile_number.number) {
          resource["mobile_number"] = data.mobile_number.number;
        }
        if (data.mobile_number.internationalNumber) {
          resource["internationalNumber"] = data.mobile_number.internationalNumber;
        }
        if (data.mobile_number.nationalNumber) {
          resource["nationalNumber"] = data.mobile_number.nationalNumber
        }
        if (data.mobile_number.e164Number) {
          resource["e164Number"] = data.mobile_number.e164Number
        }
        if (data.mobile_number.countryCode) {
          resource["countryCode"] = data.mobile_number.countryCode
        }
        if (data.mobile_number.dialCode) {
          resource["dialCode"] = data.mobile_number.dialCode
        }
       resource["mobile_number"] = JSON.parse(data.mobile_number);

      } 
      let temp_mob_arr = JSON.parse(data.mobile_number);
      let phone_arr ={
        "number" : temp_mob_arr.number,
        "internationalNumber": temp_mob_arr.internationalNumber,
        "nationalNumber": temp_mob_arr.nationalNumber,
        "e164Number" : temp_mob_arr.e164Number,
        "countryCode" : temp_mob_arr.countryCode,
        "dialCode" : temp_mob_arr.dialCode,
        "user_id" : id,
        "phone1" : temp_mob_arr.number
      }
      */

      if (mob_no == 0) {
        // console.log("do nothing")
      }
      else if (mob_no != 0 && mob_no._id) {
        // console.log(mob_no._id)
        let phone = await phoneModel.updateOne({ _id: mob_no._id }, phone_arr);
      } else {
        // console.log("else work")
        let phone = await phoneModel(phone_arr).save();
      }
      // let phone = await phoneModel.updateOne({user_id : id},phone_arr);


      // if(data.mobile_number && data.mobile_number._id){
      //   let phone = await phoneModel.updateOne({_id : data.mobile_number._id},phone_arr);
      // }else{
      //   let phone = await phoneModel(phone_arr).save();
      // }
      // let phone = await phoneModel.updateOne({user_id : id},phone_arr);
      // console.log(phone)

      resource["updatedAt"] = isodate;
      // if(res.userRole=="vendor"){
      const where = { _id: id };
      const update = { $set: resource };
      const options = { upsert: false };
      resource_response = await Resources.updateOne(where, update, options);
      if (resource_response) {
        resourceLog_response = await resourceLog({
          updatedBy: res.userId,
          updatedAt: isodate,
          role: res.userRole,
          task: "update-resource",
          data: resource,
        }).save();
        return res
          .status(200)
          .json({ message: "Resource updated successfully", status: true });
      } else {
        return res
          .status(400)
          .json({ message: "Error in updating!", status: false });
      }
      // }else{
      //   return res.status(400).json({"message":"Invalid User!",status:false});
      // }
    }
  } catch (error) {
    console.log(error.stack)
    return res
      .status(404)
      .json({ message: "Something went wrong", error: error.message });
    // throw globalCalls.badRequestError("Something went wrong");
  }
};

/**
 * Function - viewVendorResources
 * Description - as an admin i should be able to see resources of a vendor
 * API - vendor-resources/:id
 * Developer - Shubham Kumar
 * Created on - 23 December 2021
 * Updates -
 * Updated by -
 * Updated on -
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const viewVendorResources = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? parseInt(req.query.offset) : limit * (page - 1);

  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  }
  try {
    let vendorId = base64decode(req.params.id);

    let condition = {};
    condition["isDelete"] = false;
    condition["vendorId"] = vendorId;

    if (req.query.status) {
      let sts = req.query.status;

      if (sts == "Pending") {
        condition["status"] = "Pending";
        condition["isPullBack"] = false;
      } else if (sts == "Qualified") {
        condition["status"] = "Qualified";
        condition["isPullBack"] = false;
        condition['isHired'] = false;
      } else if (sts == "Rejected") {
        condition["status"] = "Rejected";
        condition["isPullBack"] = false;
      } else if (sts == "Hired") {
        condition["isHired"] = true;
        condition["isPullBack"] = false;
      } else if (sts == "PullBack") {
        condition["isPullBack"] = true;
      }
      else {
        condition = { "": "" };
      }
    }

    if (req.query.search) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }
    if (req.query.techStack) {
      condition["techStack"] = { $all: req.query.techStack.split(',') }
    }
    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }
    let tot_resource = await Resources.find({ isDelete: false, vendorId: vendorId }).lean();

    let tot_count = await Resources.find({ isDelete: false, vendorId: vendorId }).countDocuments();
    let pending_count = await Resources.find({ isDelete: false, vendorId: vendorId, status: 'Pending', isPullBack: false }).countDocuments();
    let rejected_count = await Resources.find({ isDelete: false, vendorId: vendorId, status: 'Rejected', isPullBack: false }).countDocuments();
    let qualified_count = await Resources.find({ isDelete: false, vendorId: vendorId, status: 'Qualified', isPullBack: false, isHired: false }).countDocuments();
    let hired_count = await Resources.find({ isDelete: false, vendorId: vendorId, status: 'Qualified', isHired: true, isPullBack: false }).countDocuments();
    let pullback_count = await Resources.find({ isDelete: false, vendorId: vendorId, isPullBack: true }).countDocuments();
    // console.log("tot_count " + tot_count + ",pending_count " + pending_count + ",rejected_count " + rejected_count + ",qualified_count " + qualified_count + ",hired_count " + hired_count + ",pullback_count " + pullback_count);

    let pending_resource = 0;
    let rejected_resource = 0;
    let qualified_resource = 0;
    let hired_resource = 0;
    let pullBack_resource = 0;
    tot_resource.forEach(element => {
      if (element.status == "Pending") {
        pending_resource++;
      }
      if (element.status == "Rejected") {
        rejected_resource++;
      }
      if (element.status == "Qualified") {
        qualified_resource++;
      }
      if (element.isHired == true) {
        hired_resource++;
      }
      if (element.isPullBack == true && element.isHired == true) {
        pullBack_resource++;
        hired_resource--;
      }
      if (element.isPullBack == true && element.status == "Qualified") {
        pullBack_resource++;
        qualified_resource--;
      }
      if (element.isPullBack == true && element.status == "Pending") {
        pullBack_resource++;
        pending_resource--;
      }
      if (element.isPullBack == true && element.status == "Rejected") {
        pullBack_resource++;
        rejected_resource--;
      }

    });

    let response = {};
    //--------------------------------old count code start ----------------------------//
    // response["total_resource"] = tot_resource.length;
    // response["pending_resource"] = pending_resource;
    // response["rejected_resource"] = rejected_resource;
    // response["qualified_resource"] = qualified_resource;
    // response["hired_resource"] = hired_resource;
    // response["pullBack_resource"] = pullBack_resource;
    //--------------------------------old count code end ----------------------------//

    //--------------------------------new count code start ----------------------------//
    response["total_resource"] = tot_count;
    response["pending_resource"] = pending_count;
    response["rejected_resource"] = rejected_count;
    response["qualified_resource"] = qualified_count;
    response["hired_resource"] = hired_count;
    response["pullBack_resource"] = pullback_count;
    //--------------------------------new count code end ----------------------------//

    if (res.userRole == "admin" || res.userRole == "vendor-associate" || res.userRole == "sales-manager" || res.userRole == "tech-partner-admin") {
      let resourceData = await Resources.find(condition)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      for (let i = 0; i < resourceData.length; i++) {
        let adminInfo = await Admin.findOne({ _id: resourceData[i].vendorId }, { name: 1, _id: 1, ebPOC: 1 }).lean();
        if (adminInfo) {
          let vendorPOC = await Admin.findOne({ _id: adminInfo.ebPOC }, { name: 1, _id: 1 });
          adminInfo.ebPOC = vendorPOC;
          resourceData[i].vendorId = adminInfo;
        }
      }
      for (let i = 0; i < resourceData.length; i++) {
        if (resourceData[i].status == "Qualified") {
          let adminInfo = await Admin.findOne({ _id: resourceData[i].qualified_by }, { _id: 1, name: 1 });
          if (adminInfo) {
            resourceData[i].qualified_by = adminInfo;
          }
        }
      }
      for (let i = 0; i < resourceData.length; i++) {
        if (resourceData[i].isHired == true) {
          let adminInfo = await Resources.findOne({ _id: resourceData[i]._id }, { _id: 1, name: 1 });
          if (adminInfo) {
            resourceData[i].hiredResources = adminInfo;
          }
        }
      }
      for (let i = 0; i < resourceData.length; i++) {
        if (resourceData[i].domain) {
          let domain_info = await domain.findOne({ "_id": resourceData[i].domain }).select("_id domain domain_image");
          if (domain_info) {
            resourceData[i].domain_info = domain_info;
          }
        }
      }
      for (let i = 0; i < resourceData.length; i++) {
        if (resourceData[i].vendorId) {
          let field = { _id: 1, comm_skill_points: 1, comm_tech_points: 1, presentability: 1, attentiveness: 1, comment: 1, status: 1, createdAt: 1 }
          let adminInfo = await screening.find({ addedTo: resourceData[i]._id }, field).sort({ createdAt: -1 });
          if (adminInfo) {
            resourceData[i].screeningData = adminInfo;
          }
        }
      }
      for (let i = 0; i < resourceData.length; i++) {
        if (resourceData[i].isPullBack == true) {
          let field = { _id: 1, name: 1, status: 1, createdAt: 1 }
          let resourceInfo = await Resources.find({ _id: resourceData[i]._id }, field);
          if (resourceInfo) {
            resourceData[i].pullBackData = resourceInfo;
          }
        }
      }

      //-----individual engineer code start-------//
      let engg_vendor = await Admin.findOne({ _id: ObjectId(vendorId), email: "engineervendor@gmail.com" }).select("email");
      if (engg_vendor) {
        let condition = {};
        if (req.query.status) {
          let sts = req.query.status;
          if (sts == "Draft") {
            condition.basic_info_completed = false;
            condition.basic_test_completed = false;
          }
          else if (sts == "Pending") {
            condition.basic_info_completed = true;
            condition.basic_test_completed = true;
          } else {
            condition.exp_year = -1;
          }
        } else {
          condition.basic_info_completed = true;
          condition.basic_test_completed = true;
        }

        let engineer_new_key_arr = [];
        if (req.query.status != "Draft") {
          let engineers = await engineer_work_detail.aggregate([
            {
              $match: condition
            },
            { $limit: limit },
            { $skip: offset },
            {
              $lookup: {
                from: "admins",
                let: { engg_id: "$engineer_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          // {$eq: ["role",'engineer'] },
                          { $eq: ["$_id", "$$engg_id"] }
                        ]
                      }
                    }
                  }
                ],
                as: "admin_info"
              }
            },
            {
              $lookup: {
                from: "engineer_screenings",
                localField: "engineer_id",
                foreignField: "engineer_id",
                as: "screeningData",
              }
            },
            // {
            //   $lookup: {
            //     from:"screenings",
            //     localField:"engineer_id",
            //     foreignField:"addedTo",
            //     as:"screeningData",
            //   }
            // },
            {
              $project: {
                "admin_info._id": 1, "admin_info.email": 1, "admin_info.phone": 1, "admin_info.created_at": 1, "admin_info.firstName": 1, "admin_info.lastName": 1,
                "admin_info.isDelete": 1,
                "profileImage": 1, "monthlyExpectations": 1,
                "resume": 1, "exp_month": 1, "exp_year": 1, "skills": 1,
                "basic_info_completed": 1, "basic_test_completed": 1,
                "work_detail_completed_status": 1, "createdAt": 1, "updatedAt": 1, "qualified_on": "$updatedAt",
                "screeningData": 1
              }
            }
          ]);

          engineers = JSON.parse(JSON.stringify(engineers));
          // let engineer_new_key_arr = [];
          for (let i = 0; i < engineers.length; i++) {
            let temp_arr = {};
            temp_arr['_id'] = engineers[i]._id;//
            temp_arr['name'] = engineers[i].admin_info[0].firstName.concat(' ', engineers[i].admin_info[0].lastName);//
            temp_arr['price'] = engineers[i].monthlyExpectations;
            temp_arr['resumeDocUrl'] = engineers[i].resume;//
            temp_arr['profileImage'] = engineers[i].profileImage;
            temp_arr['experiance'] = engineers[i].exp_year;
            temp_arr['emp_months'] = engineers[i].exp_month;//
            temp_arr['emp_years'] = engineers[i].exp_year;//
            temp_arr['isDelete'] = engineers[i].admin_info[0].isDelete;//
            temp_arr['isHired'] = false;//
            temp_arr['isPullBack'] = false;//
            temp_arr['price'] = engineers[i].monthlyExpectations;//
            temp_arr['techStack'] = engineers[i].skills;//
            temp_arr['updatedAt'] = engineers[i].updatedAt;//
            temp_arr['createdAt'] = engineers[i].createdAt;//
            temp_arr['qualified_by'] = "628218b24aa3c30f346eab6c";//
            temp_arr['qualified_on'] = engineers[i].qualified_on;//
            temp_arr['attentiveness'] = null;//
            temp_arr['available_date'] = null;//
            temp_arr['available_time'] = null;//
            temp_arr['comm_skill_points'] = null//;
            temp_arr['comm_tech_points'] = null;//
            temp_arr['comment'] = null;//
            temp_arr['presentability'] = null;//
            temp_arr['screeningData'] = [];//
            temp_arr['vendorId'] = { "name": "Engineers-vendor", "_id": "628dcda8752d1925706a692a", "ebPOC": { "name": "ayushi paliwal", "_id": "628218b24aa3c30f346eab6c" } };//

            if (engineers[i].basic_info_completed == true && engineers[i].basic_test_completed == true) {
              temp_arr['status'] = "Pending";//
            } else {
              temp_arr['status'] = "Draft";//
            }

            let skills_arr = [];
            for (let j = 0; j < engineers[i].skills.length; j++) {
              let skill_info = await Skillset_list.findOne({ _id: engineers[i].skills[j] }).select("skill");
              if (skill_info) {
                let temp_arr = {};
                temp_arr['_id'] = skill_info._id;
                temp_arr['skill'] = skill_info.skill;
                skills_arr.push(temp_arr);
              }
            }
            engineers[i].skill_info = skills_arr;
            temp_arr['skill_info'] = skills_arr;//
            temp_arr["is_engineer"] = true;

            engineer_new_key_arr[i] = temp_arr;
          }
        }

        else if (req.query.status == "Draft") {
          let engineers1 = await Admin.aggregate([
            { $match: { "role": "engineer" } },
            {
              $lookup: {
                "from": "workdetails",
                "localField": "_id",
                "foreignField": "engineer_id",
                "as": "work_info"
              }
            },
            {
              $project: {
                "_id": 1, "work_info.basic_info_completed": 1, "work_info.basic_test_completed": 1,
                "email": 1, "phone": 1, "createdAt": 1, "firstName": 1, "lastName": 1,
                "isDelete": 1,
                "work_info.profileImage": 1, "work_info.monthlyExpectations": 1,
                "work_info.resume": 1, "work_info.exp_month": 1, "work_info.exp_year": 1, "work_info.skills": 1,
                "work_info.work_detail_completed_status": 1
              }
            }
          ]);

          engineers1 = JSON.parse(JSON.stringify(engineers1));
          let x = 0;
          if (engineers1) {
            for (let i = 0; i < engineers1.length; i++) {
              if (engineers1[i].work_info.length == 0 || (engineers1[i].work_info.length > 0 && (engineers1[i].work_info[0].basic_info_completed == false || engineers1[i].work_info[0].basic_test_completed == false))) {

                let temp_arr = {};
                temp_arr['_id'] = engineers1[i]._id;//
                temp_arr['name'] = engineers1[i].firstName.concat(' ', engineers1[i].lastName);//
                temp_arr['createdAt'] = engineers1[i].createdAt;//
                temp_arr['isDelete'] = engineers1[i].isDelete;//

                temp_arr['vendorId'] = { "name": "Engineers-vendor", "_id": "628dcda8752d1925706a692a", "ebPOC": { "name": "ayushi paliwal", "_id": "628218b24aa3c30f346eab6c" } };//
                temp_arr['qualified_by'] = "628218b24aa3c30f346eab6c";//
                temp_arr['attentiveness'] = null;//
                temp_arr['available_date'] = null;//
                temp_arr['available_time'] = null;//
                temp_arr['comm_skill_points'] = null//;
                temp_arr['comm_tech_points'] = null;//
                temp_arr['comment'] = null;//
                temp_arr['presentability'] = null;//
                temp_arr['screeningData'] = [];//
                temp_arr['isHired'] = false;//
                temp_arr['isPullBack'] = false;//
                temp_arr['status'] = "Draft";//
                temp_arr["is_engineer"] = true;

                if (engineers1[i].work_info.length > 0) {
                  temp_arr['price'] = engineers1[i].work_info[0].monthlyExpectations;//
                  temp_arr['resumeDocUrl'] = engineers1[i].work_info[0].resume;//
                  temp_arr['profileImage'] = engineers1[i].work_info[0].profileImage;//
                  temp_arr['experiance'] = engineers1[i].work_info[0].exp_year;//
                  temp_arr['emp_months'] = engineers1[i].work_info[0].exp_month;//
                  temp_arr['emp_years'] = engineers1[i].work_info[0].exp_year;//
                  temp_arr['price'] = engineers1[i].work_info[0].monthlyExpectations;//
                  temp_arr['techStack'] = engineers1[i].work_info[0].skills;//
                  temp_arr['updatedAt'] = engineers1[i].work_info[0].updatedAt;//
                  temp_arr['qualified_on'] = engineers1[i].work_info[0].qualified_on;//
                } else {
                  temp_arr['price'] = null;//
                  temp_arr['resumeDocUrl'] = null;//
                  temp_arr['profileImage'] = null;//
                  temp_arr['experiance'] = null;//
                  temp_arr['emp_months'] = null;//
                  temp_arr['emp_years'] = null;//
                  temp_arr['price'] = null;//
                  temp_arr['techStack'] = null;//
                  temp_arr['updatedAt'] = null;//
                  temp_arr['qualified_on'] = null;//
                }

                engineer_new_key_arr[x] = temp_arr;
                x++;
              }
            }
          }

        }

        let engineerCount = await Admin.countDocuments({ role: 'engineer' });
        let engineerPendingCount = await engineer_work_detail.countDocuments({ "basic_info_completed": true, "basic_test_completed": true });

        DraftData1 = await Admin.aggregate([
          { $match: { role: 'engineer' } },
          {
            $lookup: {
              from: "workdetails",
              localField: "_id",
              foreignField: "engineer_id",
              as: "engineer_work_info"
            }
          },
          {
            $project: {
              "_id": 1, "engineer_work_info.basic_info_completed": 1, "engineer_work_info.basic_test_completed": 1
            }
          }
        ]);
        let enggIncompleteProfileCount = 0;
        for (let x = 0; x < DraftData1.length; x++) {
          if (!DraftData1[x].engineer_work_info[0]) {
            enggIncompleteProfileCount++;
          } else if (DraftData1[x].engineer_work_info[0].basic_info_completed == false || DraftData1[x].engineer_work_info[0].basic_test_completed == false) {
            enggIncompleteProfileCount++;
          }
        }

        engineerDraftCount = enggIncompleteProfileCount;

        let engineer_response = {};
        engineer_response['total_resource'] = engineerCount;
        engineer_response['pending_resource'] = engineerPendingCount;
        engineer_response['hired_resource'] = engineerDraftCount;
        engineer_response['pullBack_resource'] = 0;
        engineer_response['qualified_resource'] = 0;
        engineer_response['rejected_resource'] = 0;

        return res.status(200).send({
          message: "Data Found",
          status: true,
          "resources": engineer_new_key_arr,
          filter_info: engineer_response,
        });
      } else {
        //-----individual engineer code end-------//

        for (let i = 0; i < resourceData.length; i++) {
          let skill_arr = [];
          for (let j = 0; j < resourceData[i].techStack.length; j++) {
            let temp_arr = {};
            if (ObjectId.isValid(resourceData[i].techStack[j]) == true) {
              let skillSetListData = await Skillset_list.findOne({ _id: resourceData[i].techStack[j] }).select("_id skill");
              if (skillSetListData) {
                temp_arr['_id'] = skillSetListData._id;
                temp_arr['skill'] = skillSetListData.skill;
                skill_arr.push(temp_arr);
              }
            }
          }
          if (skill_arr) {
            resourceData[i].skill_info = skill_arr;
          }
        }

        return res.status(200).send({
          message: "Data Found",
          status: true,
          resources: resourceData,
          filter_info: response,
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "User not authorized!", status: false });
    }
  } catch (error) {
    console.log(error.stack);
    return res
      .status(404)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const imageUploadTesting = async (req, res) => {
  let file = req.file;
  let resume_path = "";
  data = req.body;
  // console.log(res.userId);
  // if (!data.resumeDocUrl) {
  //   return res.status(404).json({ message: "Please upload resume." });
  // }
  if (!data.name) {
    return res.status(404).json({ message: "Please fill resource name." });
  } else if (data.name.length <= 0 || data.name.length >= 30) {
    return res.status(404).json({ message: "Name should be 30 characters." });
  }

  if (!data.technology) {
    return res.status(404).json({ message: "Please fill technology." });
  }

  if (!data.experiance) {
    return res.status(404).json({ message: "Please fill experiance." });
  } else if (isNaN(data.experiance)) {
    return res
      .status(404)
      .json({ message: "Error! You have passed invalid experiance." });
  }

  if (!data.price) {
    return res.status(404).json({ message: "Please fill price." });
  } else if (isNaN(data.price)) {
    return res
      .status(404)
      .json({ message: "Error! You have passed invalid price." });
  }

  if (!data.mobile) {
    return res.status(404).json({ message: "Please fill contact number." });
  } else if (data.mobile.length != 10) {
    return res.status(404).json({ message: "Invalid contact number" });
  }

  if (!data.email) {
    return res.status(404).json({ message: "Please fill your email id." });
  }
  if (!emailRegexp.test(data.email)) {
    return res.status(404).json({ message: "Please enter a valid email id." });
  }

  if (!data.noticePeriod) {
    return res.status(404).json({ message: "Please fill your notice period." });
  } else if (isNaN(data.noticePeriod)) {
    return res
      .status(404)
      .json({ message: "Error! You have passed invalid notice peroid." });
  }

  //format supported date : 01/01/1990, time: 23:59
  if (data.isAvailable == "true") {
    if (!data.available_date) {
      return res.status(404).json({
        message: "Please fill your from availabile date.",
        status: false,
      });
    } else if (!dateRegex.test(data.available_date)) {
      return res.status(404).json({
        message: "Please fill correct available date.",
        status: false,
      });
    }

    if (!data.available_time) {
      return res.status(404).json({
        message: "Please fill your to availabile time.",
        status: false,
      });
    } else if (!timeRegex.test(data.available_time)) {
      return res.status(404).json({
        message: "Please fill correct availabile time.",
        status: false,
      });
    }
  } else {
    data.isAvailable = false;
    data.available_date = "";
    data.available_time = "";
  }
  if (!file) {
    res.status(400).send({ status: false, message: "No file selected" });
  }
  try {
    const resource = {
      vendorId: res.userId, //get this from token
      name: data.name,
      techStack: data.technology,
      experiance: data.experiance,
      price: data.price,
      mobile: data.mobile,
      email: data.email,
      noticePeriod: data.noticePeriod,
      resumeDocUrl: data.resumeDocUrl,
      // resumeDocUrl:'https://139.59.45.231/uploads/documents/' + file.filename,//resumeDocUrl
      status: "Pending",

      comm_skill_points: "",
      comm_tech_points: "",
      comment: "",

      isAvailable: data.isAvailable,
      available_date: data.available_date,
      available_time: data.available_time,
    };
    // data.resume_path = 'http://159.89.172.140/' + file.filename;
    // resumeDocUrl
    // res.send(data);
    res.send(res.userRole);
    // if (res.userRole == "vendor") {
    //   let Resource_res = await new Resources(resource).save();

    //   let updateVendorDetails = function (data) {
    //     console.log("inside updateVendorDetails ");
    //     var ctr = 0;
    //     return new Promise((resolve, reject) => {
    //       Match.findOneAndUpdate(
    //         {
    //           _id: resource.vendorId,
    //         },
    //         {
    //           lastSourceAdded: resource.createdAt,
    //         },
    //         {
    //           upsert: false,
    //           new: true,
    //           useFindAndModify: false,
    //         },
    //         function (err, updated) {
    //           ctr++;
    //           if (err) {
    //             let msg = "some error occurred";
    //             reject(msg);
    //           } else {
    //             resolve(updated);
    //           }
    //         }
    //       );
    //     });
    //   };

    //   if (Resource_res) {
    //     return res.status(200).json({"message":"resource inserted succesfully",status:true});
    //     // return globalCalls.okResponse(res,"resource inserted succesfully","");
    //   } else {
    //     return res.status(200).json({message: "Something went wrong while inserting",status: false,});
    //     // return globalCalls.badRequestError("Something went wrong while inserting");
    //   }
    // } else {
    //   return res.status(200).json({ message: "Invalid User!", status: false });
    // }
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Something went wrong", error: error, status: false });
  }
};


const resourcePullBack = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Id not found", status: false });
  } else {
    let id = base64decode(req.params.id);
    data = req.body;
    Resources.findOne({ _id: id }, function (err, resourceData) {
      if (err) {
        return res
          .status(400)
          .send({ message: "Resource not found", status: false });
      } else {
        if (resourceData.isHired == true) {
          return res.status(400).send({ message: "You can't pull back because resource already hired", status: false });
        }
        //resource found
        Resources.updateOne(
          { _id: id },
          {
            $set: {
              isPullBack: data.isPullBack,
            },
          },
          function (err, resp) {
            if (err) {
              return res
                .status(400)
                .send({ message: "please enter valid PullBack option", status: false });
            } else if (data.isPullBack == null) {
              res.status(404).json({ message: "Please enter valid PullBack option", status: false })
            } else {

              //--------------to add logged in user info in log start-------------------//
              let log_data = {"user_id":res.userId, 
                              "message":"Moved",
                              "action_for_id": id
                            };
              Premium_logs.add_global_log(log_data);
              //--------------to add logged in user info in log end-------------------//

              return res.status(200).send({
                message: "Status Changed successfully",
                status: true,
              });
            }
          }
        );
      }
    });
  }
};



// *******************************screening api*************************************


const addScreening = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      data = req.body;
      if (res.userRole == "vendor") {
        return res
          .status(400)
          .send({ message: "User not authorized", status: false });
      }
      if (!data.comm_skill_points) {
        return res.status(400).send({
          message: "Please fill communication skills.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication skills.");
      } else if (isNaN(data.comm_skill_points)) {
        return res.status(400).send({
          message: "Error! You have passed invalid skill points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid skill points.");
      } else if (data.comm_skill_points < 1 || data.comm_skill_points > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid skill points.",
          status: false,
        });
      }

      if (!data.comm_tech_points) {
        return res.status(400).send({
          message: "Please fill communication technology.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication technology.");
      } else if (isNaN(data.comm_tech_points)) {
        return res.status(400).send({
          message: "Error! You have passed invalid technology points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid technology points.");
      } else if (data.comm_tech_points < 1 || data.comm_tech_points > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid skill points.",
          status: false,
        });
      }

      // Added Presentability field for screening

      if (!data.presentability) {
        return res.status(400).send({
          message: "Please fill presentability.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication technology.");
      } else if (isNaN(data.presentability)) {
        return res.status(400).send({
          message: "Error! You have passed invalid presentability points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid technology points.");
      } else if (data.presentability < 1 || data.presentability > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid presentability points.",
          status: false,
        });
      }

      // Added Attentiveness field for screening

      if (!data.attentiveness) {
        return res.status(400).send({
          message: "Please fill attentiveness.",
          status: false,
        });
        // throw globalCalls.badRequestError("Please fill communication technology.");
      } else if (isNaN(data.attentiveness)) {
        return res.status(400).send({
          message: "Error! You have passed invalid attentiveness points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Error! You have passed invalid technology points.");
      } else if (data.attentiveness < 1 || data.attentiveness > 5) {
        return res.status(400).send({
          message: "Error! You have passed invalid attentiveness points.",
          status: false,
        });
        // throw globalCalls.badRequestError("Comment should not exceed 100 characters");
      }
      if (!req.file) {
        return res.status(400).send({ message: "Please enter the resource screenshot", status: false });
      }
      const screeningData = {
        comm_skill_points: data.comm_skill_points,
        comm_tech_points: data.comm_tech_points,
        presentability: data.presentability,
        attentiveness: data.attentiveness,
        comment: data.comment,
        status: data.status,
        addedTo: id,
        addedBy: res.userId,
        // qualifying_screenshot : data.qualifying_screenshot
      }
      if (req.file) {
        if (req.file.fieldname == "qualifying_screenshot") {
          screeningData.qualifying_screenshot = req.file.location;
        }
      }
      let addScreening_res = await new screening(screeningData).save();

      if (addScreening_res) {
        return res
          .status(200)
          .send({ message: "Status added successfully", status: true });
      } else {
        return res
          .status(400)
          .send({ message: "Bad Request", status: false });

      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "something went wrong", status: false, error: error.message });
    // throw globalCalls.badRequestError("something went wrong");
  }
};


const getScreening = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let find_response = await screening.find({ addedTo: id }).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }
      }
      let total_count = await screening.find({ addedTo: id }).countDocuments();
      if (find_response.length <= 0) {
        return res.status(200).send({ message: "screening data not found", status: false });
      } else {
        return res.status(200).send({ message: "screening data Found", status: true, total_count: total_count, response: find_response });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }

  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

// *******************************attendance api*************************************

const addAttendance = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      data = req.body;

      // if (!data.comment) {
      //   return res.status(400).send({
      //     message: "Please fill comment",
      //     status: false,
      //   });
      // }
      if (!data.status) {
        return res.status(400).send({
          message: "Please fill status.",
          status: false,
        });
      }

      const attendanceData = {
        comment: data.comment,
        status: data.status,
        date: data.date ? data.date : new Date(),
        addedTo: id,
        addedBy: res.userId,
      }
      let addAttendance_res = await new attendance(attendanceData).save();

      if (addAttendance_res) {
        return res
          .status(200)
          .send({ message: "Attendance added successfully", status: true });
      } else {
        return res
          .status(400)
          .send({ message: "Bad Request", status: false });

      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "something went wrong", status: false });
  }
};

const getAttendance = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let find_response = await attendance.find({ addedTo: id }).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }
      }
      let total_count = await attendance.find({ addedTo: id }).countDocuments();
      if (find_response.length <= 0) {
        return res.status(200).send({ message: "Attendance data not found", status: false });
      } else {
        return res.status(200).send({ message: "Attendance data Found", status: true, total_count: total_count, response: find_response });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const generateAttendanceCSV = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let startDate = req.params.startDate;
      let endDate = req.params.endDate;
      // if (!startDate) {
      //   return res.status(400).send({
      //     message: "Please fill startDate",
      //     status: false,
      //   });
      // }
      // if (!endDate) {
      //   return res.status(400).send({
      //     message: "Please fill endDate",
      //     status: false,
      //   });
      // }
      // , date : {$gte: startDate, $lte :endDate}

      let find_response = await attendance.find({ addedTo: id }).sort({ date: -1 }).lean();
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo.name;
        }
      }
      if (find_response.length <= 0) {
        return res.status(200).send({ message: "Attendance data not found", status: false });
      } else {
        //For unique file name
        const dateTime = new Date().toISOString().slice(-24).replace(/\D/g, '').slice(0, 14);
        const filePath = path.join(__dirname, "../../", "apis", "resourceResume", "csv-" + dateTime + ".csv");
        let csv;
        const student = find_response;
        const fields = ['date', 'status', 'comment', 'addedBy'];
        try {
          csv = json2csv(student, { fields });
        } catch (err) {
          return res.status(500).json({ err });
        }
        fs.writeFile(filePath, csv, function (err) {
          if (err) {
            return res.json(err).status(500);
          }
          else {
            setTimeout(function () {
              fs.unlink(filePath, function (err) { // delete this file after 30 seconds
                if (err) {
                  console.error(err);
                }
                console.log('File has been Deleted');
              });

            }, 30000);
            // res.download(filePath);
            return res.status(200).send({ message: "Attendance data Found", status: true, fileName: "csv-" + dateTime + ".csv" });
          }
        })
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}
// *******************************feedback api*************************************

const addFeedback = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      data = req.body;

      // if (!data.comment) {
      //   return res.status(400).send({
      //     message: "Please fill comment",
      //     status: false,
      //   });
      // }
      if (!data.status) {
        return res.status(400).send({
          message: "Please fill status.",
          status: false,
        });
      }

      const feedbackData = {
        comment: data.comment,
        status: data.status,
        addedTo: id,
        addedBy: res.userId,
      }
      let addFeedback_res = await new feedback(feedbackData).save();

      if (addFeedback_res) {
        return res
          .status(200)
          .send({ message: "Feedback added successfully", status: true });
      } else {
        return res
          .status(400)
          .send({ message: "Bad Request", status: false });

      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "something went wrong", status: false });
  }
};

const vendorAndResourceCount = async (req, res) => {

  try {
    let response = {};
    total_resource_count = await Resources.find({ isDelete: false }).countDocuments().lean();
    total_qualified_count = await Resources.find({ isDelete: false, status: "Qualified", isPullBack: false }).countDocuments().lean();// isPullBack: { $ne: true }
    total_hired_count = await Resources.find({ isDelete: false, isHired: true, status: "Qualified", isPullBack: false }).countDocuments().lean();// isPullBack: { $ne: true }
    total_vendor_count = await Admin.find({ isDelete: false, role: "vendor" }).countDocuments().lean();
    total_available_count = await Resources.find({ isDelete: false, status: "Qualified", isHired: false, isPullBack: false }).countDocuments().lean();//isPullBack: { $ne: true } ,isHired: { $ne: true }
    total_pending_count = await Resources.find({ isDelete: false, status: "Pending", isPullBack: false }).countDocuments().lean();// isPullBack: { $ne: true }
    total_rejected_count = await Resources.find({ isDelete: false, status: "Rejected", isPullBack: false }).countDocuments().lean();// isPullBack: { $ne: true }
    total_pullBack_count = await Resources.find({ isDelete: false, isPullBack: true }).countDocuments().lean();

    response["Total_Resources"] = total_resource_count;
    response["Qualified_Resources"] = total_qualified_count;
    response["Hired_Resources"] = total_hired_count;
    response["PullBack_Resources"] = total_pullBack_count;
    response["Available_Resource"] = total_available_count;
    response["Pending_Resource"] = total_pending_count;
    response["Rejected_Resource"] = total_rejected_count;
    response["Total_Vendors"] = total_vendor_count;


    return res
      .status(200)
      .send({ message: "Data Found Successfully", status: true, response: response })
  }
  catch (err) {
    return res
      .status(404)
      .send({ message: "Data Not Found", status: false, error: err.message })
  }
}

const resourceCountAccordingToFeedback = async (req, res) => {

  try {
    let response = {};
    let condition = {};
    condition["isDelete"] = false;
    condition["isHired"] = true;
    let hired_resource = await Resources.find({ isDelete: false, isHired: true, status: "Qualified", isPullBack: { $ne: true } }).lean();
    let find_client_response = await interviewScheduleModel.distinct("clientName");
    for (let i = 0; i < hired_resource.length; i++) {
      let feedback_response = await feedback.find({ addedTo: hired_resource[i]._id }).sort({ _id: -1 }).limit(1);
      if (feedback_response.length > 0) {
        hired_resource[i].feedback = feedback_response[0].status;
      }
    }
    response["Super_happy"] = 0;
    response["Happy"] = 0;
    response["Moderate"] = 0;
    response["Replacement"] = 0;
    response["Too_early"] = 0;
    response["Notice_Period"] = 0;
    response["Need_improvement"] = 0;
    response["Abscond"] = 0;
    response["Released"] = 0;
    response["Terminated"] = 0;
    response["Total_client"] = 0;
    response["Total_hiredResource"] = 0;
    hired_resource.forEach(element => {
      if (element.feedback == "Super-happy") {
        response["Super_happy"] += 1;
      }
      if (element.feedback == "Happy") {
        response["Happy"] += 1;
      }
      if (element.feedback == "Moderate") {
        response["Moderate"] += 1;
      }
      if (element.feedback == "Replacement") {
        response["Replacement"] += 1;
      }
      if (element.feedback == "Too-early") {
        response["Too_early"] += 1;
      }
      if (element.feedback == "Notice-period") {
        response["Notice_period"] += 1;
      }
      if (element.feedback == "Need-improvement") {
        response["Need_improvement"] += 1;
      }
      if (element.feedback == "Abscond") {
        response["Abscond"] += 1;
      }
      if (element.feedback == "Released") {
        response["Released"] += 1;
      }
      if (element.feedback == "Terminated") {
        response["Terminated"] += 1;
      }
    });

    response["Total_hiredResource"] = hired_resource.length;
    response["Total_client"] = find_client_response.length;


    return res
      .status(200)
      .send({ message: "Data Found Successfully", status: true, response: response })
  }
  catch (err) {
    return res
      .status(404)
      .send({ message: "Data Not Found", status: false })
  }
}


const noticePeriodResource = async (req, res) => {
  try {
    var date = new Date(); // Now
    date.setDate(date.getDate() + 50); // Set now + 50 days as the new date
    let condition = {};
    condition["isDelete"] = false;
    condition["isPullBack"] = false;
    condition["isHired"] = true;
    condition["project_startDate"] = { $lte: new Date(date) }
    let resourceData = await Resources.find(condition);
    // console.log(resourceData);
    // console.log(resourceData.length);
    for (i = 0; i < resourceData.length; i++) {
      Resources.findByIdAndUpdate(
        { _id: resourceData[i]._id },
        {
          $set: {
            onNoticePeriod: true,
          }
        },
        async function (err, resp) {
          if (err) {
            res.status(400);
          }
          else {
            res.status(200);
          }
        }
      )
    }
    return res.status(200).send({ message: "Resource updated", status: true });
  }
  catch (err) {
    return res
      .status(404)
      .send({ message: "Data not Found", status: false });
  }
}


const contractStartEndDate = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let data = req.body;
    let isoDate = new Date();
    let response_data = await Resources.find({ _id: id, isDelete: false, isHired: true, isPullBack : false }).lean();
    // console.log(response_data);
    if (response_data.length <= 0) {
      return res.status(404).send({ message: "Resource not found", status: false });
    } else {
      if (!data.project_startDate) {
        return res.status(400).send({ message: "Please enter the start date for project", status: false });
      }
      if (!data.project_endDate) {
        return res.status(400).send({ message: "Please enter the end date for project", status: false });
      }
      Resources.updateOne(
        { _id: id },
        {
          $set: {
            project_startDate: data.project_startDate,
            project_endDate: data.project_endDate
          }
        },
        async function (err, resp) {
          if (err) {
            console.log(err)
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {
            adminLog_response = await resourceLog({
              updatedBy: res.userId,
              updatedAt: isoDate,
              role: res.userRole,
              task: "resource-details-update",
              data: data,
            }).save();

            //--------------to add logged in user info in log start-------------------//
            let log_data = {
              "user_id": res.userId,
              "message": "addedOnboardingDate",
              "action_for_id": id,
               };
               Premium_logs.add_global_log(log_data);
            //--------------to add logged in user info in log end-------------------//

            return res
              .status(200)
              .send({ message: "Resource updated successfully", status: true });
          }
        }
      )
    }
  }
  catch (err) {
    return res.status(404).send({ message: "Something went wrong", status: false, error: err.message });
  }

}


const updateClientPrice = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not Found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let data = req.body;
    let isoDate = new Date();
    let resource_response = await interviewScheduleModel.findOne({ addedTo: id, interviewStatus: "Hired" }).sort({ createdAt: -1 }).lean();
    if (resource_response.clientPrice == null || !(resource_response.clientPrice)) {
      if (!data.clientPrice) {
        return res.status(404).send({ message: "Please enter the client price", status: false });
      }
      interviewScheduleModel.updateOne(
        // {addedTo : id},
        { _id: resource_response._id },
        {
          $set: {
            clientPrice: data.clientPrice
          }
        },
        async function (err, resp) {
          if (err) {
            console.log(err)
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {
            //--------------to add logged in user info in log start-------------------//
            let log_data = {
              "user_id": res.userId,
              "message": "updated",
              "action_for_id": resource_response._id,
               };
               Premium_logs.add_global_log(log_data);
            //--------------to add logged in user info in log end-------------------//
            return res
              .status(200)
              .send({ message: "Client price added successfully", status: true });
          }
        }
      )
    }
    else {
      return res.status(400).send({ message: "Client price already added", status: false });
    }
  }
  catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: err.message });
  }
}

const markResourceStatus = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Resource id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let isodate = new Date();
    let data = req.body;
    let find_resource = await Resources.findOne({ _id: id, isDelete: false, isPullBack: false }).lean();
    // console.log(find_resource);
    if (find_resource.length <= 0) {
      return res.status(404).send({ message: "Resource does not exist", status: false });
    } else {
      if (!data.status) {
        return res.status(400).send({ message: "Please enter the status", status: false });
      }

      Resources.updateOne(
        { _id: id },
        {
          $set: {
            status: data.status,
            updatedAt: isodate,
            qualified_on: isodate,
            qualified_by: res.userId,
          },
        },
        async function (err, resp) {
          if (err) {
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {

            //--------------to add logged in user info in log start-------------------//
            let log_data = {"user_id":res.userId, 
              "message":"Moved",
              "action_for_id": id,
              "message_two": data.status
            };
            Premium_logs.add_global_log(log_data);
            //--------------to add logged in user info in log end-------------------//

            return res.status(200).send({ message: "Resource updated successfully", status: true });
          }
        }
      );
      let screening_response = await screening.findOne({ addedTo: id }).sort({ _id: -1 }).lean();
      // console.log(screening_response);
      await screening.updateOne(
        { _id: screening_response._id },
        {
          $set: {
            status: data.status,
            comment: data.comment,
            updatedAt: isodate,
            updatedBy: res.userId,
          }
        },
        async function (err, resp) {
          if (err) {
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {
            return res.status(200);
          }
        }
      );
      // return res.status(200).send({message : "Resource status updated successfully", status: false});
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Somehting went wrong", status: false, error: error.message });
  }
}

/***
 * Created By: Shubham Kumar
 * Created Date: 21-04-2022
 * Desc: Account manager can add one review every month to client
 * Api: add-resource-review/:id
 * Function : addResourceReview
 */
const addResourceReview = async (req, res) => {
  try {
    let data = req.body;
    if (res.userRole == "admin" && res.userRole == "client-admin" && res.userRole == "account-manager") {
      return res.status(400).send({ message: "You are not authorized to perform this action", status: false });
    }
    if (!req.params.id) {
      return res.status(404).send({ message: "Id not Found", status: false });
    }
    let resource_id = base64decode(req.params.id);
    if (!data.status) {
      return res.status(400).send({ message: "Error! Please give feedback", status: false });
    }

    data.addedTo = resource_id;
    data.addedBy = res.userId;
    let resource_review = await new feedback(data).save();
    if (!resource_review) {
      return res.status(400).send({ message: "Error while adding review", status: true });
    } else {
      return res.status(400).send({ message: "Review added successfully", status: true });
    }
  } catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: err.message });
  }
}

/***
 * Created By: Sakshi Uikey
 * Created Date: 30-05-2022
 * Desc: Account Manager can add the review for the resource of its client
 * Api: add-account-manager-reviews/:id
 * Function : addAccountManagerReview
 */

const addAccountManagerReview = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Please enter the resource id", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let data = req.body;

    let find_res = await Resources.findOne({ _id: id, isDelete: false, isPullBack: false, isHired: true });
    if (!find_res) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {

      if (!data.client_id) {
        return res.status(400).send({ message: "Please enter the client id", status: false });
      }

      if (!data.feedback) {
        return res.status(400).send({ message: "Please enter the feedback for the resource", status: false });
      }

      if (!data.comment) {
        return res.status(400).send({ message: "Please enter the comment for resource performance", status: false });
      }
      if (!data.review_date) {
        return res.status(400).send({ message: "Please enter the date of adding the review", status: false });
      }
      data.resource_id = id;

      let feedback_data = await new feedback(data).save();
      if (!feedback_data) {
        return res.status(400).send({ message: "Error,while saving the review", status: false })
      }
      else {
        return res.status(200).send({ message: "Review added successfully for the resource", status: false })
      }
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message })
  }
}

/***
 * Created By: Sakshi Uikey
 * Created Date: 30-05-2022
 * Desc: get all the review added by the account manager
 * Api: add-account-manager-reviews/:id
 * Function : addAccountManagerReview
 */

const getAccountManagerReviews = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Please enter the resource id", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let find_res = await Resources.findOne({ _id: id, isDelete: false, isPullBack: false, isHired: true });
    if (!find_res) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {
      let find_feedback = await feedback.findOne({ resource_id: id }).sort({ createdAt: -1 }).select("comment , feedback , client_id");
      let feedback_res = await feedbackStatus.findOne({ _id: find_feedback.feedback }).select(" status ");
      let client = await Admin.findOne({ _id: find_feedback.client_id, isDelete: false }).select("name");
      let response = {
        find_feedback,
        feedback_res,
        client
      }
      return res.status(200).send({ message: "Feddback found successfully", status: true, response });
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

/***
 * Created By: Sakshi Uikey
 * Created Date: 22-04-2022
 * Desc: Client can add reviews and feedback for the resource
 * Api: add-client-reviews/:id
 * Function : addClientReviews
 */

const addClientReviews = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Resource Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let data = req.body;
    let resource_data = await Resources.findOne({ _id: id, isHired: true, isDelete: false, isPullBack: false }).lean();
    if (!resource_data) {
      return res.status(404).send({ message: "Resource not found", status: true });
    }
    else {
      if (!data.client_id) {
        return res.status(404).send({ message: "Please enter the client id", status: false });
      }
      if (!data.active_communication) {
        return res.status(404).send({ message: "Please enter points for active communication", status: false });
      }
      if (!data.task_completion) {
        return res.status(404).send({ message: "Please enter points for task completion", status: false });
      }
      if (!data.code_quality) {
        return res.status(404).send({ message: "Please enter points for the code quality", status: false });
      }
      if (!data.daily_updates) {
        return res.status(404).send({ message: "Please enter points for daily updates", status: false });
      }
      if (!data.feedback) {
        return res.status(404).send({ message: "Please enter the feedback", status: false });
      }
      if (!data.review_date) {
        return res.status(404).send({ message: "Please enter the review date", status: false });
      }

      let client = await Admin.findOne({ _id: data.client_id, isDelete: false });
      let client_name = client.name;

      let review_data = {
        resource_id: id,
        client_id: data.client_id,
        client_name: client_name,
        active_communication: data.active_communication,
        task_completion: data.task_completion,
        code_quality: data.code_quality,
        daily_updates: data.daily_updates,
        feedback: data.feedback,
        comment: data.comment,
        review_date: data.review_date
      }
      let client_reviews = await clientReview(review_data).save();
      if (!client_reviews) {
        return res.status(400).send({ message: "Bad Request", status: false });
      }
      else {
        return res.status(200).send({ message: "Client Review added successfully", status: true })
      }
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}


/***
 * Created By: Sakshi Uikey
 * Created Date: 22-04-2022
 * Desc: Client can get all the  reviews and feedback for the resource month wise
 * Api: get-client-reviews/:id
 * Function : getClientReviews
 */


const getClientReviews = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Resource Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let client_reviews = await clientReview.find({ resource_id: id }).sort({ createdAt: -1 });
    let reviews_count = await clientReview.findOne({ resource_id: id }).countDocuments();
    return res.status(200).send({ messge: "Client reviews found", status: true, reviews_count: reviews_count, response: client_reviews });
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

const addKey = async (req, res) => {
  try {
    let resp = await Resources.updateMany({ "isPullBack": { "$exists": false } }, { $set: { "isPullBack": false } });
    res.send(resp);
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 16-05-2022
 * Desc: To uplaod resource aadhar front,back and pan card image
 * API: upload-resource-docs/:id   (id is resource _id)
 * Function: uploadResourceDocs 
 * @param {*} req 
 * @param {*} res 
 */
const uploadResourceDocs = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Resource Id not found", status: false });
  }
  try {
    let resource_id = base64decode(req.params.id);
    if (isNaN(parseInt(resource_id))) {
      return res.status(400).send({ message: "Error! You have passed invalid-id.", status: false });
    }

    let data = req.body;
    let check_resource = await Resources.findOne({ _id: resource_id });
    if (!check_resource) {
      return res.status(400).send({ message: "Error! resource not exist", status: false });
    }

    if (!req.files) {
      return res.status(400).send({ message: "No data selected", status: false });
    }
    if (req.files) {
      if (req.files.aadhar_front && req.files.aadhar_front[0].fieldname == "aadhar_front") {
        data.aadhar_front = req.files.aadhar_front[0].location;
      }
      if (req.files.aadhar_back && req.files.aadhar_back[0].fieldname == "aadhar_back") {
        data.aadhar_back = req.files.aadhar_back[0].location;
      }
      if (req.files.pancard && req.files.pancard[0].fieldname == "pancard") {
        data.pancard = req.files.pancard[0].location;
      }
    }

    delete req.files;
    let resource_doc = await Resources.updateOne({ _id: resource_id }, data, { upsert: false });
    if (resource_doc) {
      return res.status(200).send({ message: "resource documents uploaded successfully", status: true });
    } else {
      return res.status(400).send({ message: "Error occured while uploading resource documents", status: false });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 18-05-2022
 * Desc: To see hired resources tech stacks (ritwik demand)
 * API: resource-stacks
 * Function:  resourceStacks
 * @param {*} req 
 * @param {*} res 
 */
const resourceStacks = async (req, res) => {
  try {
    let resource_info = await Resources.find({ status: "Qualified", isHired: true, isPullBack: false }).select("_id name techStack");
    let responseData = {
      resource_info
    }
    return res.status(200).send({ responseData, messge: "data found successfully", status: true });
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}


/*  exports.addHiredKey = async (req,res) =>{
  try{ 
    // let resp = await Resources.updateMany({status : "Qualified"},{$set:{"isHired":false}});
    res.send("resp");
  }catch(error){
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
} */


const addHiredKey = async (req, res) => {
  try {
    let resp = await Resources.updateMany({ $and: [{ "isHired": { "$exists": false }, status: "Qualified" }] }, { $set: { "isHired": false } });
    res.send(resp);
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}


const updateResourcePrice = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Please enter the resource id", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let data = req.body;
    let isoDate = new Date();
    let find_resource = await Resources.findOne({ _id: id, isDelete: false, isPullBack: false, isHired: false, status: "Qualified" });
    if (!find_resource) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {
      if (!data.price) {
        return res.status(400).send({ message: "Please enter the price for resource", status: false });
      }
      else {
        Resources.updateOne(
          { _id: id },
          {
            $set: {
              price: data.price,
              updatedAt: isoDate
            }
          },
          async function (err, resp) {
            if (err) {
              return res.status(400).send({ message: "Error, while updating the resource price", status: false });
            }
            else {
              return res.status(200).send({ message: "Resource price updated successfully", status: true });
            }
          }
        )
      }
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}


const mydownloadQualifiedResources = async (req, res) => {
  try {
    var token = req.headers.authorization.split(" ")[1];
    let workbook = new ExcelJs.Workbook();
    let worksheet = workbook.addWorksheet("Qualified Resources");
    worksheet.columns = [
      { header: "s_no", key: "s_no", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Technology", key: "techStack", width: 20 },
      { header: "Talent Partner", key: "vendorId", width: 20 },
      { header: "Exp", key: "experiance", width: 35 },
      { header: "Price", key: "price", width: 25 },
      { header: "Available From", key: "available_date", width: 25 },
      { header: "Interview Date", key: "interviewDate", width: 25 },
      { header: "Interview Status", key: "interviewStatus", width: 25 },
      { header: "Client Name", key: "clientName", width: 20 },
    ];
    // let qual_data = await Resources.find({ isDelete: false, isPullBack: false, status: "Qualified" });
    let tutorials = [];
    let condition = {};
    condition["isDelete"] = false;
    condition["status"] = "Qualified";

    if (res.userRole == "vendor-associate") {
      let venderFromPOC = await Admin.find({ ebPOC: res.userId }).select("_id");
      const vendor_ids = new Array();
      venderFromPOC.forEach(element => {  vendor_ids.push(element.id)  });
      condition["vendorId"] = { $in: vendor_ids }
    }

    if (req.query.search) {
      condition["name"] = { $regex: ".*" + req.query.search.toString().toLowerCase() + ".*" };
    }

    if (req.query.ebPOC) {
      let ebPOCId = base64decode(req.query.ebPOC);
      let venderContactPerson = await Admin.find({ ebPOC: ebPOCId }, { _id: 1 });
      const vendor_ids = new Array();
      venderContactPerson.forEach(contact_person => {  vendor_ids.push(ObjectId(contact_person.id)) });
      condition["vendorId"] = { $in: vendor_ids };
    }
    
    if (req.query.techStack) {
      let tech_arr = [];
      let techs = req.query.techStack.split(',');
      let object_teckStack = techs.map(function (tech) { return ObjectId(`${tech}`); });
      condition["techStack"] = { $in: object_teckStack };
    }
    if (req.query.experience) {
      condition['experiance'] = { $regex: ".*" + req.query.experience + ".*" };
    }

    //---------------------Filter by logged in and logged out Hired resources start ------------------//
    if (req.query.log_status) {
      if(req.query.log_status != "logged-in" && req.query.log_status != "logged-out"){
        return res.status(400).send({ message: "Invalid log status", status: false });
      }
      let resources_log = await resource_login_logs.aggregate([
        {$group: 
          {_id: '$resource_id',
          dateTime:{$max: "$createdAt"},
          description:{$max: "$description"},
          }
        },
      ]);
      let logged_ids = [];//resource ids
      if(resources_log.length > 0){
        for(let z=0; z<resources_log.length; z++){
          if(req.query.log_status == "logged-in" && resources_log[z].description == "logged-in"){
            logged_ids.push(resources_log[z]._id);
          }
          else if(req.query.log_status == "logged-out" && resources_log[z].description == "logged-out"){
            logged_ids.push(resources_log[z]._id);
          }
        }
          condition['_id'] = {$in : logged_ids};
      }
    }
    //---------------------Filter by logged in and logged out Hired resources end ------------------//

    if (req.query.status) {
      condition['isDelete'] = false;
      if (req.query.status == "hired") {
        condition['isHired'] = true;
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
      }
      if (req.query.status == "available") {
        condition['isPullBack'] = { $ne: true };
        condition['status'] = "Qualified";
        condition['isHired'] = false;
      }
      if (req.query.status == "pullback") {
        condition['isPullBack'] = true;
      }
      if (req.query.status.toLowerCase() == "released") {
        let distinct_released_resources = await interviewScheduleModel.distinct("addedTo",{interviewStatus:"Released"});
        let distinct_released_resource_id = [];
        distinct_released_resources.forEach(element => {distinct_released_resource_id.push(element) });
        condition['_id'] = {$in : distinct_released_resource_id};
      }
    }
    if (req.query.startDate || req.query.endDate) {
      let dateCondition;
      if (req.query.startDate) {
        dateCondition = { $gte: new Date(req.query.startDate) }
      }
      if (req.query.endDate) {
        dateCondition = { $lte: new Date(req.query.endDate) }
      }
      if (req.query.startDate && req.query.endDate) {
        dateCondition = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) }
      }
      condition['qualified_on'] = dateCondition;
    }

    if(req.query.status == "not-scheduled"){
      condition['isPullBack'] = { $ne: true };
      condition['status'] = "Qualified";
      condition['isHired'] = false;

      let distinct_interviewed_resources = await interviewScheduleModel.distinct("addedTo");
      let distinct_resource_id = [];
      distinct_interviewed_resources.forEach(element => {distinct_resource_id.push(element) });
      condition['_id'] = {$nin : distinct_resource_id};
    }

    if(req.query.status == "scheduled"){
      condition['isPullBack'] = { $ne: true };
      condition['status'] = "Qualified";
      condition['isHired'] = false;

      let distinct_interviewed_resources = await interviewScheduleModel.distinct("addedTo");
      let distinct_resource_id = [];
      distinct_interviewed_resources.forEach(element => {distinct_resource_id.push(element) });
      condition['_id'] = {$in : distinct_resource_id};
    }
    
    let qualified_resources = await Resources.aggregate([
      { $match: condition },
      { $sort: { updatedBy: -1 } },
      // { $skip: offset },
      // { $limit: limit },

      // {$unwind: '$domain_info'},

      //to get the vendor_associate id and name that qualified the resource after screening
      {
        $lookup: {
          from: 'admins',
          localField: 'qualified_by',
          foreignField: '_id',
          as: 'qualified_by'
        }
      },

      //to get the name and id of the resource vendor from admins table
      {
        $lookup: {
          from: 'admins',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorId'
        }
      },

      //to get the vendor associate id and name associated with the resource vendor from admins table
      {
        $lookup: {
          from: 'admins',
          localField: 'vendorId.ebPOC',
          foreignField: '_id',
          as: 'ebPOC_info'
        }
      },      
      // {$unwind: '$screeningData'},
      //to get the interview status of the resource from interviewSchedule table
      {
        $lookup: {
          from: 'interviewschedules',
          let: { resource_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$addedTo", "$$resource_id"] },
                    // { $eq: ["$interviewStatus", "Hired"] }
                  ]
                }
              }
            },
            { $sort: { "createdAt": -1 } },
            { $limit: 1 }
          ],
          as: 'interview_info'
        }
      },
      {
        $lookup: {
          from: 'skill_set_lists',
          localField: 'techStack',
          foreignField: '_id',
          as: 'skill_info'
        }
      },
      {
        "$project": {

          "_id": 1, "name": 1, "isHired": 1, "isPullBack": 1, "techStack": 1,
          "isDelete": 1, "experiance": 1, "price": 1, "resumeDocUrl": 1,
          "status": 1, "comment": 1, "project_endDate": 1, "project_startDate": 1, "interview": 1,
          "exp_months": 1, "exp_years": 1, "experiance": 1, "available_date": 1, "available_time": 1, 
          "qualified_on": 1, "aadhar_front": 1, "aadhar_back": 1, "pancard": 1, "createdAt":1, "updatedAt":1,

          // "domain": "$domain_info._id", 
          "domain_info._id": 1, "domain_info.domain": 1,

          "vendorId._id": 1, "vendorId.name": 1, "vendorId.email": 1, "vendorId.phone": 1,
          "vendorId.ebPOC": 1, "ebPOC_info._id": 1, "ebPOC_info.name": 1, "ebPOC_info.email": 1, "ebPOC_info.phone": 1,

          // "comm_skill_points":"$screeningData.comm_skill_points", "comm_tech_points":"$screeningData.comm_tech_points",
          // "attentiveness": "$screeningData.attentiveness", "presentability": "$screeningData.presentability",

          "interview_info.clientName": 1, "interview_info.name": 1, "interview_info.interviewStatus": 1,
          "interview_info.interviewDate": 1,

          "skill_info._id": 1, "skill_info.skill": 1,
        }
      }
    ]);
    for (let i = 0; i < qualified_resources.length; i++) {
      // let interviewData = await interviewScheduleModel.findOne({ addedTo: qual_data[i]._id });
      // let vendorData = await Admin.findOne({ _id: qual_data[i].vendorId }).select("name");
      let a = [];
      for (let j = 0; j < qualified_resources[i].techStack.length; j++) {
        if (ObjectId.isValid(qualified_resources[i].techStack[j]) == true) {
          var skillSetListData = await Skillset_list.findOne({ _id: qualified_resources[i].techStack[j] }).select("_id skill");
          a.push(skillSetListData.skill.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '))
        }
      }
    //  return res.send(qualified_resources);

      tutorials.push({
        s_no: i + 1,
        name: qualified_resources[i].name.charAt(0).toUpperCase() + qualified_resources[i].name.slice(1),
        techStack: a.join(","),
        vendorId: qualified_resources[i].vendorId[0].name,
        experiance: qualified_resources[i].experiance,
        price: qualified_resources[i].price,
        available_date: qualified_resources[i].available_date !== null ? qualified_resources[i].available_date : " ",
        interviewDate: qualified_resources[i] && qualified_resources[i].interview_info[0] !== null ? qualified_resources[i].interview_info[0] !== undefined ? qualified_resources[i].interview_info[0].interviewDate : "" : "",

        interviewStatus: qualified_resources[i].interview_info[0] !== null ? qualified_resources[i].interview_info[0] !== undefined ? qualified_resources[i].interview_info[0].interviewStatus : "" : "",

        clientName: qualified_resources[i].interview_info[0] && qualified_resources[i].interview_info[0].clientName != null ? qualified_resources[i].interview_info[0].clientName.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ') : " "
      });
    }
    tutorials.map(res => { worksheet.addRow(res); })
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
  
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Authorization", "Bearer " + token);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "QualifiedResources.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

const downloadHiredResources = async (req, res) => {
  try {
    let workbook = new ExcelJs.Workbook();
    let worksheet = workbook.addWorksheet("Hired Resources");
    worksheet.columns = [
      { header: "s_no", key: "s_no", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Technology", key: "techStack", width: 20 },
      { header: "Exp", key: "experiance", width: 20 },
      { header: "Price", key: "price", width: 20 },
      { header: "Phone Number", key: "mobile", width: 20 },
      { header: "E-mail", key: "email", width: 20 },
      { header: "Client Name", key: "clientName", width: 25 },
      { header: "Account Manager", key: "accountManager", width: 25 },
      { header: "Start Date", key: "project_startDate", width: 25 },
      { header: "End Date", key: "project_endDate", width: 25 },
      { header: "Talent Partner", key: "vendorId", width: 20 },
      { header: "Talent Partner POC", key: "ebPOC", width: 20 },

    ];
    let hired_data = await Resources.find({ isDelete: false, isPullBack: false, status: "Qualified", isHired : true });
    let tutorials = [];
    for (i = 0; i < hired_data.length; i++) {
      let temp_var;
      let interviewData = await interviewScheduleModel.findOne({ addedTo: hired_data[i]._id, interviewStatus : "Hired"}).select("clientName");
 
      if(interviewData){
        client_data = await Admin.find({ name : interviewData.clientName}).select(" _id name accountManager")        

        let am_data = await interviewScheduleModel.aggregate([
          { $match : { addedTo : hired_data[i]._id}},
          {
            $lookup : {
              from: "admins",
              localField: "clientName",
              foreignField: "name",
              as: "client_info"
            }
          },
          {
            $lookup : {
              from: "admins",
              localField: "client_info.accountManager",
              foreignField: "_id",
              as: "am_info"
            }
          },
          {
            $project : {
              "account_manager_name":"$am_info.name"
            }
          }
        ])
      if(am_data[0].account_manager_name[0] != null){
        temp_var = am_data[0].account_manager_name[0];
      }
      }

      if(interviewData){
        clientName =  interviewData.clientName.charAt(0).toUpperCase() + interviewData.clientName.slice(1);
      }

      let vendorData = await Admin.findOne({ _id: hired_data[i].vendorId }).select("name ebPOC");
         
      let ebPOC_data = await Admin.findOne({ _id: vendorData.ebPOC }).select("name");

      let a = [];
      for (let j = 0; j < hired_data[i].techStack.length; j++) {
        if (ObjectId.isValid(hired_data[i].techStack[j]) == true) {
          var skillSetListData = await Skillset_list.findOne({ _id: hired_data[i].techStack[j] }).select("_id skill");
          a.push(skillSetListData.skill.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '))
        }
      }

      tutorials.push({
        s_no: i + 1,
        name: hired_data[i].name.charAt(0).toUpperCase() + hired_data[i].name.slice(1),
        techStack: a.join(","),
        experiance: hired_data[i].experiance,
        price: hired_data[i].price,
        mobile: hired_data[i].mobile !== null ? hired_data[i].mobile : "N/A",
        email: hired_data[i].email !== null ? hired_data[i].email : "N/A",
        clientName: clientName,
        accountManager: temp_var,
        project_startDate: hired_data[i].project_startDate !== null ? hired_data[i].project_startDate : "N/A",
        project_endDate: hired_data[i].project_endDate !== null ? hired_data[i].project_endDate : "N/A",
        vendorId: vendorData.name.charAt(0).toUpperCase() + vendorData.name.slice(1),
        ebPOC: ebPOC_data.name.charAt(0).toUpperCase() + ebPOC_data.name.slice(1)
      });
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
      "attachment; filename=" + "HiredResources.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });

    // let count = 1;
    // hired_data.forEach(hired_data => {
    //   hired_data.s_no = count;
    //   worksheet.addRow(hired_data);
    //   count = count + 1;
    // }); // Add data in worksheet
    // worksheet.getRow(1).eachCell((cell) => {
    //   cell.font = { bold: true };
    // });
    // const data = await workbook.xlsx.writeFile(`${file_path}`)
    //   .then(() => {
    //     res.send({
    //       status: "success",
    //       message: "file successfully downloaded",
    //       path: `${file_path}`,
    //     });
    //   });
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line" : error.stack });
  }

}


const downloadPullbackResources = async (req, res) => {
  try {
    let workbook = new ExcelJs.Workbook();
    let worksheet = workbook.addWorksheet("Pull Back Resources");
    const dateTime = new Date().toISOString().slice(-24).replace(/\D/g, '').slice(0, 14);
    const file_path = path.join(__dirname, "../../", "apis", "downloadedResource", "pullback-resources" + dateTime + ".xlsx");
    let pullback_data = await Resources.find({ isDelete: false, isPullBack: true });
    worksheet.columns = [
      { header: "s_no", key: "s_no", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Tech", key: "techStack", width: 20 },
      { header: "Exp", key: "experiance", width: 20 },
      { header: "Price", key: "price", width: 35 }
    ];


    let tutorials = [];
    for (let i = 0; i < pullback_data.length; i++) {

      let a = [];
      for (let j = 0; j < pullback_data[i].techStack.length; j++) {
        if (ObjectId.isValid(pullback_data[i].techStack[j]) == true) {
          var skillSetListData = await skill_set_list.findOne({ _id: pullback_data[i].techStack[j] }).select("_id skill");
          a.push(skillSetListData.skill.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '))
        }
      }
      tutorials.push({
        s_no: i + 1,
        name: pullback_data[i].name.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        techStack: a.join(","),
        experiance: pullback_data[i].experiance,
        price: pullback_data[i].price
      });


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
      "attachment; filename=" + "PullbackResources.xlsx"
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
 * Created By: Shubham Kumar
 * Created Date: 25-05-2022
 * Desc: To change skill name (*To be applied only once)  
 * API: skill-name-change
 * Function : skillNameChange
 * @param {*} req 
 * @param {*} res
 */
const skillNameChange = async (req, res) => {
  try {
    let resource_wrong_skill = await Resources.find({ techStack: { $in: ['QA - Automations', 'QA - Manual', 'Android - Kotlin', 'DevOps- Azure', 'C# /.NET', 'Python (Django)', 'Machine Learning / Data Science'] } }).select("techStack").limit(20);
    for (let i = 0; i < resource_wrong_skill.length; i++) {
      if (resource_wrong_skill[i].techStack.length > 0) {
        for (let j = 0; j < resource_wrong_skill[i].techStack.length; j++) {
          if (resource_wrong_skill[i].techStack[j] == 'QA - Automations') {
            // console.log("index is "+ j);
            let filter = { [`techStack.${j}`]: 'QA - Automations' };
            let update = { [`techStack.${j}`]: 'qa-automations' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);

          }
          else if (resource_wrong_skill[i].techStack[j] == 'QA - Manual') {
            let filter = { [`techStack.${j}`]: 'QA - Manual' };
            let update = { [`techStack.${j}`]: 'qa-manual' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);
            // console.log("qa manual");
          }
          else if (resource_wrong_skill[i].techStack[j] == 'Android - Kotlin') {
            let filter = { [`techStack.${j}`]: 'Android - Kotlin' };
            let update = { [`techStack.${j}`]: 'android-kotlin' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);
            // console.log("kotlin");
          }
          else if (resource_wrong_skill[i].techStack[j] == 'DevOps- Azure') {
            let filter = { [`techStack.${j}`]: 'DevOps- Azure' };
            let update = { [`techStack.${j}`]: 'devops-azure' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);
          }
          else if (resource_wrong_skill[i].techStack[j] == 'C# /.NET') {
            let filter = { [`techStack.${j}`]: 'C# /.NET' };
            let update = { [`techStack.${j}`]: 'c#/.net' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);
          }
          else if (resource_wrong_skill[i].techStack[j] == 'Python (Django)') {
            let filter = { [`techStack.${j}`]: 'Python (Django)' };
            let update = { [`techStack.${j}`]: 'python (django)' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);
          }
          else if (resource_wrong_skill[i].techStack[j] == 'Machine Learning / Data Science') {
            let filter = { [`techStack.${j}`]: 'Machine Learning / Data Science' };
            let update = { [`techStack.${j}`]: 'machine learning/ data science' };
            let options = { multi: false };
            let updateSkillName = await Resources.updateOne(filter, { $set: update }, options);
          }
        }
      }
    }
    // console.log(updateSkillName);
    let responseData = {
      resource_wrong_skill
    };
    return res.status(200).json({ responseData, message: "data found", status: true });
  }
  catch (error) {
    return res.status(400).send({ error: error.message, message: "Something went wrong", status: false });
  }
}


const addExpKey = async (req, res) => {
  try {
    let resource = await Resources.find({ isDelete: false }).select("experiance");
    if (!resource) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {
      let z = 0;
      for (i = 0; i < resource.length; i++) {
        if (resource[i].experiance && resource[i].experiance.length == 3) {
          let exp_years = resource[i].experiance[0];
          let exp_months = "6";
          let domain = null;
          if (!resource[i].exp_years && !resource[i].exp_months && !resource[i].domain && resource[i].experiance) {
            let res_data = await Resources.updateMany(
              { _id: resource[i]._id },
              {
                $set: {
                  exp_years: exp_years,
                  exp_months: exp_months,
                  domain: domain
                }
              }
            );
            if (res_data.nModified == 1) {
              z++;
            }
          }
        }
      }
      // console.log("modified " + z);
      return res.status(200).send({ message: "Resources updated successfully", status: true });
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 30-05-2022
 * Desc: To change resource status from Rejected,and if else case change id_pullback = false 
 * API: modify-resource-status/:id  => id = resource id
 * Function: modifyResourceStatus
 */ //q and pull ->
const modifyResourceStatus = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: "Id not found", status: false });
    } else {
      let resource_id = base64decode(req.params.id);
      let resource = await Resources.findOne({ "_id": resource_id }).select("status isPullBack");
      if (resource) {
        let change = {};

        if (resource.status == "Rejected") {
          change.status = "Pending";
        }
        change.isPullBack = false;
        let status_res = await Resources.updateOne({ "_id": resource_id }, { $set: change });
        if (status_res) {
          return res.status(200).send({ message: "Status updated successfully", status: true });
        } else {
          return res.status(400).send({ message: "Error in status updating", status: false });
        }
      } else {
        return res.status(400).send({ message: "Resources not found", status: false });
      }
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}



/**
 * Function - saveMultiResource
 * Api  - save-multi-resource
 * Description - To add vendor resource
 * Developer - Shubham Kumar
 * Created on - 03-06-2022
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const saveMultiResource = async (req, res) => {
  data = req.body;
  let resume = "resume";
  let profileImage = "profileImage";
  let date = new Date();
  current_date_time = moment(date).format("YYYYMMDDHHmmss");

  try {
    let vendor_id = base64decode(req.params.id);
    return res.send(vendor_id);
    let checkResource = [];
    const resource = {
      vendorId: vendor_id, //get this from token
      name: "resource" + current_date_time.toLowerCase(),
      techStack: "627e55d4f6b28f02182589f0",
      experiance: 1,
      exp_years: 1,
      exp_months: 1,
      domain: "628e02b4767fac2e42371be4",
      price: 50000,
      mobile: 9039888075,
      email: "resource" + current_date_time + "@gmail.com",
      noticePeriod: 45,
      resumeDocUrl: "resumeDocUrl",
      profileImage: "imageUrl",
      status: "Pending",
      comm_skill_points: "",
      comm_tech_points: "",
      comment: "Auto Filled",
      isAvailable: false,
      available_date: "",
      available_time: "",
      mobile_number: "9039888075"
    };

    let Resource_res = await new Resources(resource).save();
    if (data.mobile_number) {
      let phone_arr = [];
      phone_arr["user_id"] = Resource_res._id;
      phone_arr["number"] = "9039888075";
      phone_arr["internationalNumber"] = "9039888075";
      phone_arr["nationalNumber"] = "9039888075";
      phone_arr["e164Number"] = "9039888075";
      phone_arr["countryCode"] = "9039888075";
      phone_arr["dialCode"] = "9039888075";
      let phone = await new phoneModel(phone_arr).save();
    }
    return res.status(200).json({ message: "Data saved successfully" });

  } catch (error) {
    return res
      .status(404)
      .json({ message: "Something went wrong", error: error.message });
  }
};

/**Created BY : Shubham Kumar
 * Created Date: 06-03-2022
 * Desc : global call testing
 */
const throwCheck = async (req, res) => {
  try {
    // let date = new Date();
    // console.log(moment(d).format("YYYYMMDDHHmmss"));
    let responseData = {
      "key": "value"
    }
    return res.send("hehe");
    // return globalCalls.okResponse(res,responseData, "data found successfully");

  }
  catch (error) {
    throw globalCalls.badRequestError("Something went wrong");
  }
}

/**Created BY : Shubham Kumar
 * Created Date: 06-03-2022
 * Desc : hackerEarthInviteCandidate testing
 */
const hackerEarthInviteCandidate = async (req, res) => {
  try {
    let api_key = "";

    let client_id = "2a4bab5a1610e8b08cde639077d3df53f36fa47ab5b5.api.hackerearth.com";
    let client_secret = "4df7c89129fe3f8b86f79f1976e18011f533f7ee";
    let email_ids = ["shubham.k@engineerbabu.in"]; //ex:- ["gappu@gmail.com","tappu@gmail.com"]
    /* curl --data '{
     "client_id": client_id,
     "client_secret": client_secret,
     "test_id": 57,
     "emails": email_ids,
     "send_email": false,
     "auto_expiry_days": 7,
     "extra_parameters": {
         "candidate_names": {
             "shubham.k@engineerbabu.in" : "Shubham Kumar" //, "alice@bob.com": "Alice Bob"
             },
         "report_callback_urls": {
             "foo@bar.com": "http://15.206.252.59:8080/callback_api"
             }
         }
     }' https://api.hackerearth.com/partner/hackerearth/invite/ */
    return res.send("hello world");
  } catch (error) {
    throw globalCalls.badRequestError("Something went wrong");
  }
}

/**Created BY : Shubham Kumar
* Created Date: 06-03-2022
* Desc : global call testing
*/
const liveCollectionTesting = async (req, res) => {
  try {
    // let testArr = await testArrayData
  } catch (error) {
    throw globalCalls.badRequestError("Something went wrong");
  }
}
const updateResourceMobileNumber = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Please enter the resource id", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let find_resource = await Resources.findOne({ _id: id, isDelete: false }).select("mobile");
    // console.log(find_resource)
    if (!find_resource) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {
      if (find_resource.mobile) {
        let update_resource = await Resources.updateOne(
          { _id: id },
          {
            $set: {
              "internationalNumber": "+91 " + find_resource.mobile,
              "nationalNumber": "0" + find_resource.mobile,
              "e164Number": find_resource.mobile,
              "countryCode": "IN",
              "dialCode": "+91"
            }
          }
        );
        return res.status(400).send({ message: "Mobile Number updated successfully", status: true, update_resource })
      }
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date : 08-06-2022
 * @param {*} req 
 * @param {*} res 
 */
const HiredResourceExcel = async (req, res) => {
  try {
    let HiredResources = await Resources.find({ isHired: true, status: "Qualified", isDelete: false }).select("_id name");
    let workbook = new ExcelJs.Workbook();
    let worksheet = workbook.addWorksheet("Qualified Resources");
    worksheet.columns = [
      { header: "id", key: "id", width: 10 },
      { header: "_id", key: "_id", width: 20 },
      { header: "Name", key: "name", width: 20 }
    ];
    let tutorials = [];
    for (let i = 0; i < HiredResources.length; i++) {
      tutorials.push({
        id: i + 1,
        _id: HiredResources[i]._id,
        name: HiredResources[i].name
      });
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
      "attachment; filename=" + "QualifiedResources.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
    // let responseData = {
    //   HiredResources
    // }
    // return res.status(200).send({message : "Data found successfully", status: true, tutorials});
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

const updateVendorAssociateId = async (req, res) => {
  try {
    let screening_data = await screening.find({ status: "Qualified" }).select("addedTo addedBy");

    for (i = 0; i < screening_data.length; i++) {
      let interviewschedule_data = await interviewScheduleModel.find({ addedTo: screening_data[i].addedTo, interviewStatus: "Hired" });

      for (j = 0; j < interviewschedule_data.length; j++) {

        let update_data = await interviewScheduleModel.updateMany(
          { addedTo: interviewschedule_data[j].addedTo },
          {
            $set: {
              vendor_associate_id: screening_data[j].addedBy
            }
          }
        )
        // console.log(update_data);
      }
    }
    return res.status(200).send({ message: "Vendor Associate Id updated successfully", status: true });
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}


/**
 * Created By: Shubham Kumar
 * Created Date: 15-06-2022
 * Desc: To give login access to hired resource if client and account manager is assigned and email exist
 * API: register-resource (POST)
 * Function: registerResource
 */
const registerResource = async (req, res) => {
  try {
    let data = req.body;
    if (!data.resource_id) {
      return res.status(400).send({ message: "Please pass resource-id", status: false });
    }
    if (!data.email) {
      return res.status(400).send({ message: "Please pass email-id", status: false });
    }
    let resource_id = data.resource_id;
    let check_resource = await interviewScheduleModel.findOne({ 'addedTo': resource_id, 'interviewStatus': 'Hired' });
    if (check_resource) {
      let resource_info = await Resources.findOne({ _id: resource_id }).select("email");
      let credentails_giving_person = await Admin.findOne({ _id: res.userId }).select("_id role name email");
      if (!resource_info) {
        return res.status(400).send({ message: "Resource not exist", status: false });
      } else {
        let check_if_already_have_credentials = await Admin.findOne({$or :[{email: data.email},{resource_id: resource_id }] });//role:'resource',
        if (check_if_already_have_credentials) {
          return res.status(400).send({ message: "Email already exist.", status: false });
        } else {
          let data1 = {};
          let pwd = globalCalls.generateToken(10);//generate random alphanumeric
          data1.email = data.email;
          data1.active = true;
          data1.isDelete = false;
          data1.role = "resource";
          data1.password = pwd;
          data1.resource_id = resource_id;
          let resource_signup = await Admin(data1).save();
          if (!resource_signup) {
            return res.status(400).send({ message: "Error in giving resource credentials", status: false });
          } else {
            let log_data_res = {
              'updatedBy': credentails_giving_person._id,
              'updatedAt': new Date(),
              'role': credentails_giving_person.role,
              'task': 'credentials-given',
              'data': data
            };
            let resource_log = await resourceLog(log_data_res).save();
            let pugfilename = "resource_credentail.pug";
            func.mailSend(data.email, "Supersourcing Premium", { 'name': resource_info.name, 'email': data.email, 'password': pwd, 'credentials_given_by': credentails_giving_person.name }, pugfilename);//resource_info.email
            //--------------to add logged in user info in log start-------------------//
            let log_data = {
              "user_id": res.userId,
              "message": "credentialsGiven",
              "action_for_id": data.resource_id,
               };
               Premium_logs.add_global_log(log_data);
            //--------------to add logged in user info in log end-------------------//
            return res.status(200).send({ message: "Credentials send to resource successfully", status: true });
          }
        }
      }
    } else {
      return res.status(400).send({ message: "Resource is not hired", status: false });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**Created By: Sakshi Uikey
* Created Date: 21-06-2022
* Desc: To add resource daily tasks
* API: /resource-daily-task/:id
* Function: addResourceDailyTask
*/
const addResourceDailyTask = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Resource Id not found", status: false });
  }
  try {
    let data = req.body;
    let resource_id = base64decode(req.params.id);
    let today = new Date();
    let onlyDate = moment(today).format("YYYY-MM-DD");
    if (!data.description) {
      return res.status(400).send({ message: "Enter Daily task", status: false });
    }
    if (!data.date_of_submission) {
      return res.status(400).send({ message: "Enter date of submission", status: false });
    }
    let resource = await Resources.findOne({ _id: resource_id, isDelete: false, isPullBack: false, isHired: true, status: "Qualified" });
    if (!resource) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {
      let client_info = await interviewScheduleModel.findOne({ addedTo: resource_id, interviewStatus: "Hired" }).select("client_id");
      let response = {
        resource_id: resource_id,
        description: data.description,
        date_of_submission: new Date(moment(data.date_of_submission).format("YYYY-MM-DD")),
        job_title: data.job_title,
        client_id: client_info.client_id
      }

      let startDate = moment(data.date_of_submission).add(1, "days").format();
      let endDate = moment(data.date_of_submission).subtract(1, "days").format();
      let is_task_added = await dailyTask.findOne({
        resource_id: resource_id,
        date_of_submission: { $gt: new Date(endDate), $lt: new Date(startDate) }
      });
      if (is_task_added !== null) {
        return res.status(400).send({ message: "Can not add daily task twice a day", status: false })
      } else {
        let task_added = await dailyTask(response).save();//console.log(task_added);
        if (!task_added) {
          return res.status(400).send({ message: "Error, while saving the task", status: false });
        }
        else {
          return res.status(200).send({ message: "Resource daily task saved successfully", status: true });
        }
      }

    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**Created By: Sakshi Uikey
 * Created Date: 21-06-2022
 * Desc: To get single resource task
 * API: /get-single-resource-task/:id
 * Function: getSingleResourceTask
 */

const getSingleResourceTask = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Task Id of the resource not found", status: false });
  }
  try {
    let task_id = base64decode(req.params.id);

    let resource_task = await dailyTask.find({ _id: task_id });
    if (!resource_task) {
      return res.status(400).send({ message: "Resource daily task not found", status: false });
    }
    else {
      return res.status(200).send({ message: "Resource task found successfully", status: true, resource_task });
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**Created By: Sakshi Uikey
 * Created Date: 21-06-2022
 * Desc: To get all resource task
 * API: /get-all-resource-task/:id
 * Function: getAllResourceTask
 */

const getAllResourceTask = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Resource Id not found", status: false });
  }
  try {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    let resource_id = base64decode(req.params.id);
    let default_month = new Date().getMonth() + 1;
    let default_year = new Date().getFullYear();
    if (req.query.month && req.query.year) {
      default_month = parseInt(req.query.month);
      default_year = parseInt(req.query.year);
    }
    let resource_task = await dailyTask.find({ resource_id: resource_id }).sort({ createdAt: -1 }).skip(offset).limit(limit);
    if (!resource_task) {
      return res.status(400).send({ message: "Resource daily task not found", status: false });
    }
    else {
      // let resource_daily_task1 = await dailyTask.find({resource_id: resource_id}).select("_id resource_id description job_title client_id date_of_submission").sort({date_of_submission:-1});
      let resource_daily_task1 = await dailyTask.aggregate([
        { $project: { _id: 1, resource_id: 1, description: 1, job_title: 1, date_of_submission: 1, client_id: 1, month: { $month: '$date_of_submission' }, year: { $year: '$date_of_submission' } } },
        { $match: { month: default_month, year: default_year, resource_id: ObjectId(resource_id) } },
        { $sort: { date_of_submission: -1 } }
      ]);



      resource_daily_task1 = JSON.parse(JSON.stringify(resource_daily_task1));
      for (i = 0; i < resource_daily_task1.length; i++) {
        //  console.log("resource_daily_task1 =",resource_daily_task1)
        let client_name = await interviewScheduleModel.findOne({ addedTo: resource_id, interviewStatus: "Hired" });
        if (client_name) {
          if (client_name.client_id) {
            let client_info = await Admin.findOne({ _id: client_name.client_id, isDelete: false }).select("_id name");
            if (client_info) {
              // console.log("client_info");
              // console.log(client_info);
              resource_daily_task1[i]['client'] = client_info;
              // console.log("resource_daily_task1");
              // console.log(resource_daily_task1);
            }
          }
        }
        let login_time = await resource_login_logs.findOne({ resource_id: resource_id, description: 'logged-in' }).sort({ createdAt: 1 });
        let logout_time = await resource_login_logs.findOne({ resource_id: resource_id, description: 'logged-out' }).sort({ createdAt: -1 });

        if (login_time) {
          resource_daily_task1[i].login_time = login_time.date;
        }
        if (logout_time) {
          resource_daily_task1[i].logout_time = logout_time.date;
        }
      }
      return res.status(200).send({ message: "Resource task found successfully", status: true, "task_count": resource_daily_task1.length, resource_daily_task: resource_daily_task1 });
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**Created By: Sakshi Uikey
 * Created Date: 21-06-2022
 * Desc: To edit resource daily task
 * API: /modify-resource-task/:id
 * Function: modifyResourceTask
 */

const modifyResourceTask = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Task id not found", status: false });
  }
  try {
    let task_id = base64decode(req.params.id);
    let data = req.body;//console.log(data);
    let resource_task = await dailyTask.findOne({ _id: task_id });
    if (!resource_task) {
      return res.status(400).send({ message: "Resource task not found", status: false });
    }
    else {
      let form_data = {}; 
/*       if(data.job_title){
        form_data.job_title = data.job_title;
      }
      if(data.description){
        form_data.description = data.description;
      }
      if(data.date_of_submission){
        form_data.date_of_submission = data.date_of_submission;
      }console.log(form_data); */
      // console.log(data)
      let modify_task = await dailyTask.updateOne(
        { _id: task_id },
        { $set: data }
      );
      if (!modify_task) {
        return res.status(400).send({ message: "Error, while updating the task", status: false });
      }
      else {
        return res.status(200).send({ message: "Resource task updated successfully", status: true, modify_task });
      }
    }
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**Created By: Sakshi Uikey
 * Created Date: 23-06-2022
 * Desc: To edit resource email and phone number
 * API: /modify-resource-info/:id
 * Function: modifyResourceInfo
 */
const modifyResourceInfo = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Please enter the resource Id", status: false });
  }
  try {
    let resource_id = base64decode(req.params.id);
    let data = req.body;
    let find_resource = await Resources.findOne({ _id: resource_id, isDelete: false, isPullBack: false, status: "Qualified" });
    //  console.log(find_resource);
    if (!find_resource) {
      return res.status(400).send({ message: "Resource not found", status: false });
    }
    else {
      let mob_no = {};
      if (data.mobile_number) {
        mob_no = JSON.parse(JSON.stringify(data.mobile_number));
      }

      if (mob_no.number) {
        mob_no["number"] = mob_no.number;
      }
      if (mob_no.internationalNumber) {
        mob_no["internationalNumber"] = mob_no.internationalNumber;
      }
      if (mob_no.nationalNumber) {
        mob_no["nationalNumber"] = mob_no.nationalNumber
      }
      if (mob_no.e164Number) {
        mob_no["e164Number"] = mob_no.e164Number
      }
      if (mob_no.countryCode) {
        mob_no["countryCode"] = mob_no.countryCode
      }
      if (mob_no.dialCode) {
        mob_no["dialCode"] = mob_no.dialCode
      }
      mob_no = JSON.parse(JSON.stringify(mob_no));

      if ((!find_resource.email || find_resource.email === null) && (!find_resource.mobile || find_resource.mobile === null)) {
        // console.log("hiiii")
        let update = await Resources.updateOne(
          { _id: resource_id },
          {
            $set: {
              email: data.email,
              mobile: mob_no.number,
              internationalNumberOther: mob_no.internationalNumber,
              nationalNumberOther: mob_no.nationalNumber,
              e164NumberOther: mob_no.e164Number,
              countryCodeOther: mob_no.countryCode,
              dialCodeOther: mob_no.dialCode
            }
          }
        );
      }
      else if ((!find_resource.email || find_resource.email == null) && find_resource.mobile) {
        // console.log("hldhals");
        let update = await Resources.updateOne(
          { _id: resource_id },
          { $set: data }
        );
      }
      else if ((!find_resource.mobile || find_resource.mobile == null) && find_resource.email) {
        // console.log("hello")
        let update = await Resources.updateOne(
          { _id: resource_id },
          {
            $set: {
              mobile: mob_no.number,
              internationalNumberOther: mob_no.internationalNumber,
              nationalNumberOther: mob_no.nationalNumber,
              e164NumberOther: mob_no.e164Number,
              countryCodeOther: mob_no.countryCode,
              dialCodeOther: mob_no.dialCode
            }
          }
        );
      }
    }
    return res.status(200).send({ message: "Resource info updated successfully", status: true });
  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

const addResourceTimesheetStatus = async (req, res) => {
 try{
  let data = req.body;
  let res_data = {
    month : data.month,
    year : data.year,
    status : "waiting-for-approval",
    resource_id : data.resource_id
  }
  if(!req.params.id){
    let save_timesheet  = await resourceTimesheetStatus(res_data).save();
    if(!save_timesheet){
      return res.status(400).send({message : "Error, while saving the timesheet", status :false});
      }
      else{
        return res.status(200).send({message : "Timesheet saved successfully", status : true});
      }
    }
  else{
   let id = base64decode(req.params.id);
    let update_timesheet = await resourceTimesheetStatus.updateOne(
      {_id : id},
      {
        $set : {
          status : data.status 
        }
      }
    );
    if(!update_timesheet){
      return res.status(400).send({message : "Error, while updating the timesheet", status :false});
    }
    else{
      return res.status(200).send({message : "Timesheet updated successfully", status : true});
    }
  }
}
  catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 05-07-2022
 * Desc: To Approve/Decline resource task by account manager 
 * API: certify-task
 * Function: certify_task
 * @param {*} req 
 * @param {*} res 
 */
const certify_task = async (req, res) => {
  try{
    let data = req.body;
    if(!data.status){
      return res.status(400).send({message : "Please pass status", status : false});
    }
    else if(data.status.toLowerCase() != "approve" && data.status.toLowerCase() != "decline"){
      return res.status(400).send({message : "Please pass correct status", status : false});
    }
    if(!data.task_id){
      return res.status(400).send({message : "Please pass task id", status : false});
    }
    else if(typeof(data.task_id) != 'object' || data.task_id == null){
      return res.status(400).send({message : "Task ids should be in object", status : false});
    }
    for(let i=0; i<data.task_id.length; i++){
         let where = {_id: data.task_id[i] };
         let task = await dailyTask.findOne(where).select("description updated_desc");
        //  let update = {updated_desc:null};//decline
         let update = {desc_status: 'task-rejected'};
         if(data.status == "approve"){
          update = {description: task.updated_desc, desc_status: 'task-approved'};//updated_desc:null
         }
         if(task && task.updated_desc != null){
            let updateDesc = await dailyTask.updateOne(where,{$set:update});
         }
    }
    if(data.status == "approve"){
      return res.status(200).send({message : "Task approved successfully", status : true});
    }else{
      return res.status(200).send({message : "Task declined successfully", status : true});
    }
    // return res.send(data.task_id);
  }catch(error){
    return res.status(400).send({ message: "Something went wrong", 
                                  status: false, 
                                  error: error.message, 
                                  line: error.stack });
  }
}


/**Created By: Sakshi Uikey
 * Created Date: 04-07-2022
 * Desc: To edit the resource task description
 * API: /update-resource-description/:id
 * Function: updateResourceDescription
 */

const updateResourceDescription = async(req,res)=>{
if(!req.params.id){
  return res.status(400).send({message : "Please enter the resource id", status : false});
}
 try{
  let task_id = base64decode(req.params.id);
  let data = req.body;  
  
    if(!data.updated_desc){
      return res.status(400).send({message : "Please enter the task description", status : false});
    }
    let resource_task = await dailyTask.find({_id : task_id});
    if(!resource_task){
      return res.status(400).send({message : "Resource task not found", status : false});
    }
    else{
      if(resource_task[0].description != data.updated_desc){
        let updated_res = await dailyTask.updateOne(
          {_id : task_id},
          {$set : 
           { updated_desc : data.updated_desc, desc_status:'task-updated' }
          }
        )
        if(!updated_res){
          return res.status(400).send({message : "Error, while updating the task description", status : false});
        }
        else{
          return res.status(200).send({message : "Resource description updated successfully", status : true, updated_res});
        }
      }
      else{
        return res.status(200).send({message : "Both the description is same", status : true});
      }
    }
}
catch(error){
  return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

/**Created By: Sakshi Uikey
 * Created Date: 08-07-2022
 * Desc: To move a resource from hired to release
 * API: /update-resource-description/:id
 * Function: updateResourceDescription
 */

const moveResourceToRelease = async(req,res)=>{
  if(!req.params.id){
    return res.status(400).send({message : "Please enter the resource id", status : false});
  }
 try{
    let resource_id = base64decode(req.params.id);
    let data = req.body;
    let find_resource = await Resources.findOne({_id : resource_id, isDelete: false, isPullBack : false, status : "Qualified" , isHired : true});
    if(!find_resource){
      return res.status(400).send({message : "Resource not found", status : false});
    }
    else{
      let interview_status = await interviewScheduleModel.findOne({addedTo : resource_id, interviewStatus: "Hired"}).sort({createdAt : -1});

      if(data.release_date){
        data.release_date = data.release_date;
      }
      else{
        data.release_date = new Date();
      }

      let update_status = await interviewScheduleModel.updateOne(
        {_id : interview_status._id},
        { $set :  {interviewStatus : "Released", release_date : data.release_date  }}
      );

      if(!update_status){
      return res.status(400).send({message : "Error, while moving resource to release", status : false});
      }
      else{
        resourceLog_response = await resourceLog({
          updatedBy: res.userId,
          updatedAt: isodate,
          role: res.userRole,
          task: "released-resource",
          data: {
            interviewStatus : "Released",
            release_date : data.release_date,
            resource_id : ObjectId(resource_id)
          }
        }).save();

        let adminData = await Admin.findOne({resource_id : resource_id});
        if(!adminData){
          return res.status(400).send({message : "Resource not found in admin",status : false});
        }
        else{
          let log_data = {"user_id":adminData._id, "message":"moved to release"};
          Premium_logs.add_global_log(log_data);
        }

        return res.status(200).send({message : "Resource moved to release successfully", status : true, update_status});
      }
    }
 }
 catch(error){
  return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
 }
}
/**
 * Created By: Shubham Kumar
 * Created Date: 08-07-2022
 * Desc: To move released resource to qualified or pull back
 * API Type: PUT
 * API: move-released-resource
 * @param {*} req 
 * @param {*} res 
 */
const modifyReleasedResource = async(req,res)=>{
  try{
    let data = req.body;
    if(!data.id){
      return res.status(400).send({ message: "Please pass id", status: false});// id is interview schedule _id
    }
    let resource_interview_info = await interviewScheduleModel.findOne({_id:ObjectId(data.id) });
    if(!resource_interview_info){
      return res.status(400).send({ message: "Invalid Id", status: false});
    }
    else if(resource_interview_info.interviewStatus != "Released"){
      return res.status(400).send({ message: "Resource is not released", status: false});
    }
    let filter = {_id: resource_interview_info.addedTo};
    let updateData = {};
    let msg;
    if(data.status == "qualify"){
      msg = "qualified";
      updateData = {isHired: false,status:'Qualified', updatedAt: new Date()};
    }
    else if(data.status == "pullback"){
      msg = "pullback";
      updateData = {isPullBack: true, updatedAt: new Date()};
    }
    let modify_res = await Resources.updateOne(filter, {$set: updateData});
    if(modify_res){
      return res.status(200).send({ message: `Resource ${msg} sucessfully`, status: true});
    }

  }catch(error){
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, "line": error.stack });
  }
}

module.exports = {
  uploadResume,
  saveResourceNew,
  saveResource,
  removeResource,
  viewResources,
  modifyResourceSkills,
  showResource,
  modifyResourceBasicInfo,
  qualifiedResources,
  downloadQualifiedResources,
  hiredResources,
  addAccountManager,
  canTakeInterview,
  modifyQualifiedResourceStatus,
  updateResourceAllInfo,
  viewVendorResources,
  imageUploadTesting,
  resourcePullBack,
  addScreening,
  getScreening,
  addAttendance,
  getAttendance,
  generateAttendanceCSV,
  addFeedback,
  vendorAndResourceCount,
  resourceCountAccordingToFeedback,
  noticePeriodResource,
  contractStartEndDate,
  updateClientPrice,
  markResourceStatus,
  addResourceReview,
  addAccountManagerReview,
  getAccountManagerReviews,
  addClientReviews,
  getClientReviews,
  addKey,
  uploadResourceDocs,
  resourceStacks,
  addHiredKey,
  updateResourcePrice,
  mydownloadQualifiedResources,
  downloadHiredResources,
  downloadPullbackResources,
  skillNameChange,
  addExpKey,
  modifyResourceStatus,
  saveMultiResource,
  throwCheck,
  hackerEarthInviteCandidate,
  liveCollectionTesting,
  updateResourceMobileNumber,
  HiredResourceExcel,
  updateVendorAssociateId,
  registerResource,
  addResourceDailyTask,
  getSingleResourceTask,
  getAllResourceTask,
  modifyResourceTask,
  modifyResourceInfo,
  qualifiedResourcesNew,
  addResourceTimesheetStatus,
  certify_task,
  updateResourceDescription,
  moveResourceToRelease,
  modifyReleasedResource,
}
// 'use strict';
const { base64encode, base64decode } = require('nodejs-base64');
let Admin = require("../models/admin").Admin;
const adminLog = require("../models/adminLog").adminLog;
const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let func = require("../common/commonfunction");
const Resource = require("../models/resource").Resources;
const interviewScheduleModel = require('../models/interviewSchedule').interviewSchedule;
const clientPoc = require('../models/clientPocs').clientPocs;
const sales_manager_list = require("../models/sales_manager_list").sales_manager_list;
const screening = require("../models/screening").screening;
const icp_pointers = require("../models/icp_pointers").icp_pointers;
const client_icp = require("../models/client_icp").client_icp;
const client_reviews = require("../models/client_reviews").client_reviews;
const client_feedbacks = require("../models/client_reviews").client_feedbacks;
const feedback_status = require("../models/feedback_status").feedbackstatus;
const ObjectId = require("mongodb").ObjectID;
const Premium_logs = require("../common/logs_message");

const addTeamMember = async (req, res) => {

  const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
  const tokenInfo = func.decodeToken(usertoken);
  const admin = new Admin();
  const data = req.body;
  let randomText = "guest" + Math.floor(100000 + Math.random() * 900000);
  admin.password = randomText;
  admin.addedBy = tokenInfo.sub;
  if (data.role == "vendor") {
    return res.status(400).json({ "message": "Can not create vendor from here" });
  }
  if (res.userRole == "vendor-associate" || res.userRole == "account-manager") {
    return res.status(400).json({ "message": "You are not a authorized user to create any user type" });
  }
  if (res.userRole == "admin" && data.role == "vendor") {
    return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
  }
  if ((res.userRole == "tech-partner-admin") && (data.role == "admin" || data.role == "account-manager-admin" || data.role == "account-manager" || data.role == "vendor" || data.role == "sales-manager")) {//|| data.role == "tech-partner-admin"
    return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
  }
  if ((res.userRole == "account-manager-admin") && (data.role == "admin" || data.role == "tech-partner-admin" || data.role == "account-manager-admin" || data.role == "vendor-associate" || data.role == "sales-manager" || data.role == "vendor")) {
    return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
  }
  if ((res.userRole == "sales-manager") && (data.role == "admin" || data.role == "tech-partner-admin" || data.role == "account-manager-admin" || data.role == "vendor-associate" || data.role == "account-manager" || data.role == "vendor")) {
    return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
  }

  if (!data.firstName) {
    res.status(400).json({ "message": "Please enter member firstName." });
  }
  if (!data.email) {
    return res.status(400).json({ "message": "Please enter email." });
  } else if (!emailRegexp.test(data.email)) {
    res.status(400).json({ "message": "Please enter a valid email id." });
  }
  if (!data.role) {
    return res.status(400).json({ "message": "Please enter role" });
  }
  if (!data.phone) {
    return res.status(400).json({ "message": "Please enter phone." });
  }
  if (data.phone) {
    if (data.phone.toString().length != 10) {
      return res.status(404).json({ message: "Invalid phone number" });
    }
  }


  try {
    admin.name = data.firstName.toLowerCase();
    admin.firstName = data.firstName.toLowerCase();
    if (data.lastName) {
      admin.lastName = data.lastName.toLowerCase();
      admin.name = data.firstName.toLowerCase() + " " + data.lastName.toLowerCase();
    }
    admin.email = data.email;
    admin.phone = data.phone;
    admin.role = data.role;
    admin.isTeamMember = true;

    let findResponse = await Admin.findOne({ $or: [{ email: data.email }, { name: admin.name }, { phone: data.phone }] });
    if (findResponse) {
      if(findResponse.name === admin.name)
        {
        return res.status(400).send({ message: "Username already exits ..!", status: false });
        }
        if(findResponse.email === admin.email)
        {
        return res.status(400).send({ message: "Email already exits ..!", status: false });
        }
        if(findResponse.phone === admin.phone)
        {
        return res.status(400).send({ message: "Phone already exits ..!", status: false });
        }
         
      // return res.status(400).send({ message: "Username or Email or Phone already exist", status: false });
    } else {
      let addResponse = await new Admin(admin).save();
      if (!addResponse) {
        return res.status(400).send({ message: "Error in adding team member", status: false });
      } else {



      //--------------to add logged in user info in log start-------------------//
      let log_data = {"user_id":admin.addedBy, 
                      "message":"Added",
                      "action_for_id": addResponse._id,
                   
      };
      Premium_logs.add_global_log(log_data);
      //--------------to add logged in user info in log end-------------------//

        let msg = "Login credentials sent on " + req.body.email;
        // console.log("password", randomText);
        let pugfilename = "accountVerify.pug";
        func.mailSend(admin.email,"Supersourcing Premium",{ 'name': admin.name, 'email': admin.email, 'password': randomText},pugfilename);
        // func.sendAccountVerificationMail(admin, randomText);

        return res.status(200).send({ message: "Team member successfully created", status: true });
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const getTeamMember = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    condition["isTeamMember"] = true;
    condition["isDelete"] = false;
    if (res.userRole == "account-manager-admin") {
      condition["role"] = "account-manager";
    }
    if (res.userRole == "tech-partner-admin") {
      condition["role"] = "vendor-associate";
    }
    if (res.userRole == "sales-manager") {
      condition["role"] = "sales-manager";
    }
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }
    if (req.query.email && req.query.email.length != 0) {
      condition["email"] = { $regex: req.query.email };
    }
    if (req.query.role && req.query.role.length != 0) {
      condition["role"] = { $regex: req.query.role };
    }
    let field_Name = { lastSourceAdded: 0, lastSourceVerified: 0, isTeamMember: 0, token: 0 }
    let find_response = await Admin.find(condition, field_Name).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    let total_team_member = await Admin.find(condition).countDocuments();
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "Team member not found", status: false });
    } else {
      return res.status(200).send({ message: "Team member Found", status: true, total_team_member: total_team_member, response: find_response });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const getAmAssociate = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    let role_count = {};
    condition["role"] = "account-manager";
    condition["isDelete"] = false;
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }

    let field_Name = { lastSourceAdded: 0, lastSourceVerified: 0, isTeamMember: 0, token: 0 }
    let find_response = await Admin.find(condition, field_Name).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();

    role_count["total_vendor_associate"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager-admin";
    role_count["total_am_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "tech-partner-admin";
    role_count["total_vm_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "sales-manager";
    role_count["total_sales_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager";
    role_count["total_account_manager"] = await Admin.find(condition).countDocuments();
    // condition["role"]= "account-manager";
    // role_count["total_account_manager"] = await Admin.find(condition).countDocuments();
    // console.log('find_response', find_response)

    if (find_response.length <= 0) {
      return res.status(200).send({ message: "AM associate not found", status: false });
    } else {
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }

        // let managingClient = await Admin.find({ role : "client", isDelete : false , accountManager : find_response[i]._id });
        // console.log("Account Manager " + find_response[i].name);
        let managingClient = await Admin.aggregate([
            { $match : 
                { role : "client", isDelete : false , accountManager : find_response[i]._id }
            },
            {
              $lookup : {
                from : 'interviewschedules',
                localField : '_id',
                foreignField : 'client_id',
                as : 'hired_resource_count'
              }
            },
            {
              $project : {
                "_id":1, "name":1,
                "hired_resources":{$size:"$hired_resource_count"}
              }
            }
        ]);

        find_response[i].managingClient = managingClient.length;
        find_response[i].managingEngineer = 0;
        if(managingClient){
          for(let z=0; z<managingClient.length; z++){
            // console.log("client " + managingClient[z].name);

            if(managingClient[z].hired_resources){
            find_response[i].managingEngineer += managingClient[z].hired_resources;
            }
          }
        }
        // console.log("Hired Resources " + find_response[i].managingEngineer);
      }
      return res.status(200).send({
        message: "AM associate Found", status: true,
        response: find_response,
        role_count: role_count
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

const getVmAssociate = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    let role_count = {};
    condition["role"] = "vendor-associate";
    condition["isDelete"] = false;
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }

    let field_Name = { lastSourceAdded: 0, lastSourceVerified: 0, isTeamMember: 0, token: 0 }
    let find_response = await Admin.find(condition, field_Name).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    role_count["total_vendor_associate"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager-admin";
    role_count["total_am_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "tech-partner-admin";
    role_count["total_vm_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "sales-manager";
    role_count["total_sales_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager";
    role_count["total_account_manager"] = await Admin.find(condition).countDocuments();
    // console.log('find_response', find_response)
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "VM associate not found", status: false });
    } else {
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }
        let vendorAssigned = await Admin.findOne({ isDelete: false, ebPOC: find_response[i]._id, role: "vendor" }).countDocuments();
        find_response[i].vendorAssigned = vendorAssigned;

        let interview_done = await screening.findOne({addedBy : find_response[i]._id}).select("_id name").countDocuments();
        if(interview_done){
          find_response[i].interview = interview_done;
        }

        let shortlisted_candidate = await screening.findOne({addedBy : find_response[i]._id, status : "Qualified"}).select("_id name addedTo").countDocuments();
        if(shortlisted_candidate){
          find_response[i].shortlist = shortlisted_candidate;
          // console.log(find_response[i].shortlist);
        }

        let hired_candidate = await screening.find({addedBy : find_response[i]._id , status : "Qualified"}).select("_id name addedTo").countDocuments();
        if(hired_candidate){
          let hired_res = await interviewScheduleModel.find({addedTo : hired_candidate.addedTo , interviewStatus : "Hired"}).countDocuments();
          find_response[i].hired = hired_res;
        }
      }
      return res.status(200).send({
        message: "VM associate Found", status: true,
        response: find_response,
        role_count: role_count
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

const getSalesManager = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    let role_count = {};
    condition["role"] = "sales-manager";
    condition["isDelete"] = false;
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }

    let field_Name = { lastSourceAdded: 0, lastSourceVerified: 0, isTeamMember: 0, token: 0 }
    let find_response = await Admin.find(condition, field_Name).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    role_count["total_sales_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager-admin";
    role_count["total_am_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "tech-partner-admin";
    role_count["total_vm_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager";
    role_count["total_account_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "vendor-associate";
    role_count["total_vendor_associate"] = await Admin.find(condition).countDocuments();
    // console.log('find_response', find_response)
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "Sales manager not found", status: false });
    } else {
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }
        let interviewScheduled = await interviewScheduleModel.find({ addedBy: find_response[i]._id }).countDocuments();
        find_response[i].interviewScheduled = interviewScheduled;
          
        let hired_resource = await interviewScheduleModel.find({addedBy : find_response[i]._id , interviewStatus : "Hired"}).countDocuments();
        if(hired_resource){
          find_response[i].hired = hired_resource;
        }
      }
      return res.status(200).send({
        message: "Sales manager Found", status: true,
        response: find_response,
        role_count: role_count
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

const getAmAdmin = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    let role_count = {};
    condition["role"] = "account-manager-admin";
    condition["isDelete"] = false;
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }

    let field_Name = { lastSourceAdded: 0, lastSourceVerified: 0, isTeamMember: 0, token: 0 }
    let find_response = await Admin.find(condition, field_Name).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    role_count["total_am_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "tech-partner-admin";
    role_count["total_vm_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager";
    role_count["total_account_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "sales-manager";
    role_count["total_sales_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "vendor-associate";
    role_count["total_vendor_associate"] = await Admin.find(condition).countDocuments();
    // console.log('find_response', find_response)
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "Account Manager Admin not found", status: false });
    } else {
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }
        let managing_account_manager = await Admin.find({ addedBy: find_response[i]._id }, { _id: 1, name: 1 });
        find_response[i].accountMangerAssignedCount = managing_account_manager.length;
        find_response[i].accountMangerAssigned = managing_account_manager;
        let interviewScheduled = await interviewScheduleModel.find({ addedBy: find_response[i]._id }).countDocuments();
        find_response[i].interviewScheduled = interviewScheduled;

        let managingClient = await Admin.aggregate([
          { $match : 
              { role : "client", isDelete : false , accountManager : find_response[i]._id }
          },
          {
            $lookup : {
              from : 'interviewschedules',
              localField : '_id',
              foreignField : 'client_id',
              as : 'hired_resource_count'
            }
          },
          {
            $project : {
              "_id":1, "name":1,
              "hired_resources":{$size:"$hired_resource_count"}
            }
          }
        ]);
        find_response[i].managingClient = managingClient.length;

      }
      return res.status(200).send({
        message: "Account Manager Admin Found", status: true,
        response: find_response,
        role_count: role_count
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const getVmAdmin = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    let role_count = {};
    condition["role"] = "tech-partner-admin";
    condition["isDelete"] = false;
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
    }

    let field_Name = { lastSourceAdded: 0, lastSourceVerified: 0, isTeamMember: 0, token: 0 }
    let find_response = await Admin.find(condition, field_Name).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    role_count["total_vm_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager-admin";
    role_count["total_am_admin"] = await Admin.find(condition).countDocuments();
    condition["role"] = "account-manager";
    role_count["total_account_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "sales-manager";
    role_count["total_sales_manager"] = await Admin.find(condition).countDocuments();
    condition["role"] = "vendor-associate";
    role_count["total_vendor_associate"] = await Admin.find(condition).countDocuments();
    // console.log('find_response', find_response)
    if (find_response.length <= 0) {
      return res.status(200).send({ message: "Tech-Partner Admin not found", status: false });
    } else {
      for (let i = 0; i < find_response.length; i++) {
        let adminInfo = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
        if (adminInfo) {
          find_response[i].addedBy = adminInfo;
        }
        let vm_associate_assigned = await Admin.find({ addedBy: find_response[i]._id }, { _id: 1, name: 1 });
        find_response[i].vmAssociateAssignedCount = vm_associate_assigned.length;
        find_response[i].vmAssociateAssigned = vm_associate_assigned;
        let interviewScheduled = await interviewScheduleModel.find({ addedBy: find_response[i]._id }).countDocuments();
        find_response[i].interviewScheduled = interviewScheduled;
        
      }
      return res.status(200).send({
        message: "Tech-Partner Admin Found", status: true,
        response: find_response,
        role_count: role_count
      });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const updateTeamMember = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      data = req.body;
      const isodate = new Date().toISOString();
      if (data.role == "vendor") {
        return res.status(400).json({ "message": "You can not update this user type" });
      }
      if (res.userRole == "vendor-associate" || res.userRole == "account-manager") {
        return res.status(400).json({ "message": "You are not a authorized user to create any user type" });
      }
      if ((res.userRole == "tech-partner-admin") && (data.role == "admin" || data.role == "tech-partner-admin" || data.role == "account-manager-admin" || data.role == "account-manager" || data.role == "sales-manager")) {
        return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
      }
      if ((res.userRole == "account-manager-admin") && (data.role == "admin" || data.role == "tech-partner-admin" || data.role == "account-manager-admin" || data.role == "vendor-associate" || data.role == "sales-manager")) {
        return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
      }
      if ((res.userRole == "sales-manager") && (data.role == "admin" || data.role == "tech-partner-admin" || data.role == "account-manager-admin" || data.role == "vendor-associate" || data.role == "account-manager")) {
        return res.status(400).json({ "message": "You are not a authorized user to create this user type" });
      }

      if (!data.firstName) {
        return res.status(400).json({ "message": "Please enter member firstName." });
      }
      if (!data.email) {
        return res.status(400).json({ "message": "Please enter email." });
      } else if (!emailRegexp.test(data.email)) {
        return res.status(400).json({ "message": "Please enter a valid email id." });
      }
      if (!data.role) {
        return res.status(400).json({ "message": "Please enter role" });
      }
      if (!data.phone) {
        return res.status(400).json({ "message": "Please enter phone." });
      }
      if (data.phone) {
        if (data.phone.toString().length != 10) {
          return res.status(404).json({ message: "Invalid phone number" });
        }
      }
      data.name = data.firstName.toLowerCase();
      if (data.lastName) {
        data.name = data.firstName.toLowerCase() + " " + data.lastName.toLowerCase();
      }
      let findResponse = await Admin.find({ _id: { $ne: id }, $or: [{ email: data.email }, { name: data.name }, { phone: data.phone }] });
      if (findResponse.length > 0) {
        if(findResponse.name === data.name)
        {
        return res.status(400).send({ message: "Username already exits ..!", status: false });
        }
        if(findResponse.email === data.email)
        {
        return res.status(400).send({ message: "Email already exits ..!", status: false });
        }
        if(findResponse.phone === data.phone)
        {
        return res.status(400).send({ message: "Phone already exits ..!", status: false });
        }
        // return res.status(400).send({ message: "Name or Email or Phone already exist", status: false });
      }
      let updateData = {
        name: data.name.toLowerCase(),
        firstName: data.firstName.toLowerCase(),
        email: data.email,
        phone: data.phone,
        role: data.role,
        updatedAt: isodate,
      }
      if (data.lastName) {
        updateData.lastName = data.lastName.toLowerCase();
      }
      Admin.updateOne(
        { _id: id },
        {
          $set: updateData,
        },
        async function (err, resp) {
          if (err) {
            console.log(err)
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {
            adminLog_response = await adminLog({
              updatedBy: res.userId,
              updatedAt: isodate,
              role: res.userRole,
              task: "team-member-update",
              data: data,
            }).save();


          //--------------to add logged in user info in log start-------------------//
          let log_data = {"user_id":res.userId, 
          "message":"Modified",
          "action_for_id": id,
      
          };
          Premium_logs.add_global_log(log_data);
    //--------------to add logged in user info in log end-------------------//

            return res
              .status(200)
              .send({ message: "Status Changed succesfully", status: true });
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
  }
};

const getSingleTeamMember = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let find_response = await Admin.find({ _id: id });
      if (find_response.length <= 0) {
        return res.status(200).send({ message: "Team member not found", status: false });
      } else {
        return res.status(200).send({ message: "Team member Found", status: true, response: find_response });
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

const deleteTeamMember = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      const isodate = new Date().toISOString();
      // let id = (req.params.id);
      let findResponse = await Admin.find({ _id: id });
      if (findResponse.length != 0) {
        let delete_teamMember = await Admin.updateOne({ _id: id }, { isDelete: true });
        if (delete_teamMember) {
          dminLog_response = await adminLog({
            updatedBy: res.userId,
            updatedAt: isodate,
            role: res.userRole,
            data: findResponse[0],
            task: "team-member-delete",
          }).save();

          //--------------to add logged in user info in log start-------------------//
          let log_data = {"user_id":res.userId, 
          "message":"Removed",
          "action_for_id": id,
      
          };
          Premium_logs.add_global_log(log_data);
    //--------------to add logged in user info in log end-------------------//

          return res
            .status(200)
            .send({ message: "Team member removed successfully", status: true });
        }
      } else {
        return res
          .status(400)
          .send({ message: "Team member not found", status: false });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    res.status(404).json({ message: "Something went wrong", error: error });
  }
};

//incorrect
const addClientOld = async (req, res) => {
  const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
  const tokenInfo = func.decodeToken(usertoken);
  const admin = new Admin();
  // let randomText = "guest" + Math.floor(100000 + Math.random() * 900000);
  // admin.password = randomText;
  if (res.userRole == "admin" || res.userRole == "account-manager-admin" || res.userRole == "account-manager" || res.userRole == "sales-manager") {
    let data = req.body;
    if (!data.name) {
      return res.status(400).send({ message: "Please enter the Client Name" });
    }
    if (!data.email) {
      return res.status(400).send({ message: "Please enter the Email for Client" });
    }
    if (!data.clientPOC) {
      return res.status(400).send({ message: "Please enter the clientPOC for Client" });
    }
    /* if (!data.accountManager){
      return res.status(400).send({ message: "Please enter the account manager for Client" });
    } */
    admin.role = "client";
    admin.email = req.body.email;
    admin.name = req.body.name.toLowerCase();
    admin.clientPOC = req.body.clientPOC;
    admin.addedBy = tokenInfo.sub;
    // admin.accountManager = req.body.accountManager;
    admin.phone = req.body.phone;
    admin.otherPhone = req.body.otherPhone;
    let adminData = await Admin.find({ $or: [{ email: admin.email }, { name: admin.name }] });
    if (adminData.length > 0 || adminData.isDelete == false) {
      return res.status(400).send({ message: "Client already exist", status: false });
    } else {
      try {
        admin.save().then((data, err) => {
          if (err) {
            console.log("Some error occurred");
          } else {
            return res.status(200).send({ message: "Client created successfully", status: true, data });
          }
        });
      } catch (err) {
        return res.status(400).send({ message: "Something went wrong", status: false });
      }
    }
  } else {
    return res.status(400).send({ message: "Bad request. Not authorized to create this role", status: false });
  }
}

/**
 * Updated By: Shubham Kumar
 * Updated Date: 27-04-2022
 * Desc : To add multi POC and add department
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const addClient = async (req, res) => {
  let data = req.body;
  const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
  const tokenInfo = func.decodeToken(usertoken);
  const admin = new Admin();
  // let randomText = "guest" + Math.floor(100000 + Math.random() * 900000);
  // admin.password = randomText;
  //console.log("haha")
  if (res.userRole == "admin" || res.userRole == "account-manager-admin" || res.userRole == "account-manager" || res.userRole == "sales-manager") {
    let data = req.body;
    if (!data.name) {
      return res.status(400).send({ message: "Error! Please enter the Client Name" });
    }
    if (!data.clientPOC) {
      return res.status(400).send({ message: "Error! Please enter the client poc" });
    }
    if (data.clientPOC.length == 0) {
      return res.status(400).send({ message: "Error! Client POC is empty" });
    }
    for (let i = 0; i < data.clientPOC.length; i++) {
      if (!data.clientPOC[i].POCName) {
        return res.status(400).send({ message: "Error! Please enter POC name" });
      }
      if (!data.clientPOC[i].phoneNumber) {
        return res.status(400).send({ message: "Error! Please enter phone no" });
      }
      if (!data.clientPOC[i].email) {
        return res.status(400).send({ message: "Error! Please enter email id" });
      }
    }

    admin.role = "client";
    admin.email = data.clientPOC[0].email;
    admin.name = data.name.toLowerCase();
    // admin.client_poc = data.client_poc.split(',');
    admin.addedBy = tokenInfo.sub;
    admin.clientPOC = data.clientPOC;
    // admin.phone = req.body.phone;
    // admin.otherPhone = req.body.otherPhone;

    try {
      let adminData = await Admin.find({ $or: [{ email: admin.email }, { name: admin.name }] });
      if (adminData.length > 0 || adminData.isDelete == false) {
        return res.status(400).send({ message: "Client already exist", status: false });
      } else {
        let adminData = await admin.save(admin);//console.log(adminData);
        return res.status(200).send({ message: "Client added successfully", status: true });
        // res.send(data)
        /* admin.save().then((data, err) => {
          if (err) {
            console.log("Some error occurred");
          } else {
            return res.status(200).send({ message: "Client created successfully", status: true, data });
          }
        }); */
      }
    } catch (err) {
      return res.status(400).send({ message: "Something went wrong", status: false, "error": err.message });
    }
  } else {
    return res.status(400).send({ message: "Bad request. Not authorized to create this role", status: false });
  }
}



const deleteClient = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found" });
  }
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      const isodate = new Date().toISOString();
      let find_client = await Admin.find({ _id: id, role: "client" });
      if (find_client.length != 0) {
        let delete_client = await Admin.updateOne({ _id: id }, { isDelete: true });
        if (delete_client) {
          adminLog_response = await adminLog({
            updatedBy: res.userId,
            updatedAt: isodate,
            role: res.userRole,
            data: find_client[0],
            task: "client-delete",
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
            .send({ message: "Client removed successfully", status: true });
        } else {
          return res.status(400).send({ message: "Something went wrong", status: false });
        }
      } else {
        return res.status(404).send({ message: "Client not found", status: false });
      }
    }
  } catch (err) {
    return res.status(400).send({ message: "Bad Request", status: false });
  }

}


const updateClient = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let isoDate = new Date().toString();
    let data = req.body;
    // if (!data.phone) {
    //   return res.status(400).send({ message: "Please enter the phone", status: false });
    // }
    // if (!data.clientPOC) {
    //   return res.status(400).send({ message: " Please enter the clientPOC", status: false });
    // }
    let find_client = await Admin.find({ _id: id, isDelete: false, role: "client" });
    let am_data = await Admin.find({ role: "account-manager", isDelete: false, isTeamMember: true }, { _id: 1, name: 1 });
    if (find_client.length <= 0) {
      return res.status(404).send({ message: "Client not found", status: false });
    } else {
      Admin.updateOne(
        { _id: id },
        {
          $set: {
            phone: data.phone,
            clientPOC: data.clientPOC,
            accountManager: data.accountManager,
            updatedOn: isoDate
          }
        },
        async function (err, resp) {
          if (err) {
            console.log(err)
            return res
              .status(400)
              .send({ message: "Bad Request", status: false });
          } else {
            adminLog_response = await adminLog({
              updatedBy: res.userId,
              updatedAt: isoDate,
              role: res.userRole,
              task: "client-details-update",
              data: data,
            }).save();
            return res
              .status(200)
              .send({ message: "Client Changed successfully", status: true, am_data: am_data });
          }
        }

      )
    }
  } catch (err) {
    return res.status(400).send({ message: "Bad Request", status: false });
  }
}


// exports.getClient = async (req, res) => {
//   const per_page = 10;
//   let page = req.query.page ? req.query.page : 1;
//   let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
//   let offset = req.query.offset ? req.query.offset : limit * (page - 1);
//   offset = parseInt(offset);
//   try {
//     let condition = {};
//     condition["isDelete"] = false;
//     condition["role"] = "client";
//     if (req.query.search && req.query.search.length != 0) {
//       condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
//     }
//     let client_info = await Admin.find(condition).sort({ createdAt: -1 }).limit(limit).skip(offset).lean();
//     // if (client_info.length <= 0) {
//     //   return res.status(404).send({ message: "Client not found", status: false });
//     // } else {
//       let client_total = await Admin.find(condition).countDocuments();
//       return res.status(200).send({ message: "Client found successfully", status: true, total_count: client_total, response: client_info });
//     // }
//   }
//   catch (err) {
//     return res.status(400).send({ message: "Something went wrong", status: false, err: err });
//   }
// }

// to get a single client and its account manager and hired resources 
// give client id

const getSingleClient = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let find_client_response = await Admin.find({ _id: id, role: "client" }).limit(1);
    for (let i = 0; i < find_client_response.length; i++) {
      let adminInfo = await Admin.findOne({ _id: find_client_response[i].addedBy }, { _id: 1, name: 1 }).limit(1);
      if (adminInfo) {
        find_client_response[i].addedBy = adminInfo;
      }
    }
    let find_resources = await interviewScheduleModel.find({ clientName: find_client_response[0].name });
    let resource_count = find_resources.length;
    for (i = 0; i < find_resources.length; i++) {
      let resources = await Resource.findOne({ _id: find_resources[i].addedTo });
      find_resources[i] = resources;
      // temp.push(resources)
      // resource[i] = resources;
      //  console.log(find_resources[i].resources);
    }
    return res.status(200).send({ message: "Response found", status: true, resource_count: resource_count, 'response': find_client_response, 'resources': find_resources });
  }
  catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, err });
  }
}

const changeStatus = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);
    let status;
    let admin_data = await Admin.findOne({ _id: id });
    if (admin_data.active && admin_data.active == true) {
      status = false;
    } else {
      status = true;
    }
    const filter = { _id: id };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        'active': status
      },
    };
    let changed_res = await Admin.updateOne(filter, updateDoc, options);
    if (changed_res.n > 0) {
          //--------------to add logged in user info in log start-------------------//
          let log_data = {"user_id":res.userId, 
                          "message": status === true ? "active" : "inactive",
                          "action_for_id": id
          };
          Premium_logs.add_global_log(log_data);
          //--------------to add logged in user info in log end-------------------//
      return res.status(200).send({ message: "Status updated successfully", status: true });
    } else {
      return res.status(400).send({ message: "Error while status updating", status: false });
    }
  }
  catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, err: err });
  }
}

/***
 * Created By: Shubham Kumar
 * Created At: 18-04-2022
 * Desc : To search client by client name
 * Api: search-client
 * Function : searchClient 
 */
const searchClient = async (req, res) => {
  try {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);
    let search = "";
    let condition = {};
    condition["role"] = "client";
    condition["isDelete"] = false;
    if (req.query.search && req.query.search != "") {
      condition["name"] = {
        $regex: ".*" + req.query.search.toLowerCase() + ".*",
      };
    }
    let client_info = await Admin.find(condition, { _id: 1, name: 1 }).skip(offset).limit(limit);//isDelete: {$eq: false}

    let responseData = {
      client_info
    }
    return res.status(200).send({ message: "Client found successfully", status: true, "responseData": responseData });
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }

}


/**
 * Updated By: Shubham Kumar
 * Updated Date: 28-04-2022
 * Desc : To add multi POC and add department
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const addClientNew = async (req, res) => {
  let data = req.body;
  const admin = new Admin();
  let client_poc_data = [];
  let icp_pointers = {};

  // let randomText = "guest" + Math.floor(100000 + Math.random() * 900000);
  // admin.password = randomText;
  if (!data.name) {
    return res.status(400).send({ message: "Error! Please enter the Client Name" });
  }
  if(!data.role){
    return res.status(400).send({ message: "Error! Please enter the role" });
  }
  if (!data.clientPOC) {
    return res.status(400).send({ message: "Error! Please enter the client poc" });
  }
  if (data.clientPOC.length == 0) {
    return res.status(400).send({ message: "Error! Client POC is empty" });
  }
  for (let i = 0; i < data.clientPOC.length; i++) {
    if (!data.clientPOC[i].POCName) {
      return res.status(400).send({ message: "Error! Please enter POC name" });
    }
    if (!data.clientPOC[i].department) {
      data.clientPOC[i].department = null;
    }
    // if (!data.clientPOC[i].comment) {
    //   return res.status(400).send({ message: "Error! Please enter the comment" });
    // } not needed when adding
    if (!data.clientPOC[i].phoneNumber) {
      return res.status(400).send({ message: "Error! Please enter phone no" });
    }
    if (!data.clientPOC[i].email) {
      return res.status(400).send({ message: "Error! Please enter email id" });
    }

    let tempData1 = {}
    tempData1['POCName'] = data.clientPOC[i].POCName;
    tempData1['department'] = data.clientPOC[i].department;
    tempData1['comment'] = data.clientPOC[i].comment;
    tempData1['email'] = data.clientPOC[i].email;
    // client_poc_data.push(tempData1);

    if (!data.clientPOC[i].phoneNumber.number) {
      data.clientPOC[i].phoneNumber.number = null;
    }
    if (!data.clientPOC[i].phoneNumber.internationalNumber) {
      data.clientPOC[i].phoneNumber.internationalNumber = null;
    }
    if (!data.clientPOC[i].phoneNumber.nationalNumber) {
      data.clientPOC[i].phoneNumber.nationalNumber = null;
    }
    if (!data.clientPOC[i].phoneNumber.e164Number) {
      data.clientPOC[i].phoneNumber.e164Number = null;
    }
    if (!data.clientPOC[i].phoneNumber.countryCode) {
      data.clientPOC[i].phoneNumber.countryCode = null;
    }
    if (!data.clientPOC[i].phoneNumber.dialCode) {
      data.clientPOC[i].phoneNumber.dialCode = null;
    }

    let tempData2 = {}
    tempData2['POCName'] = data.clientPOC[i].POCName;
    tempData2['number'] = data.clientPOC[i].phoneNumber.number;
    tempData2['internationalNumber'] = data.clientPOC[i].phoneNumber.internationalNumber;
    tempData2['nationalNumber'] = data.clientPOC[i].phoneNumber.nationalNumber;
    tempData2['e164Number'] = data.clientPOC[i].phoneNumber.e164Number;
    tempData2['countryCode'] = data.clientPOC[i].phoneNumber.countryCode;
    tempData2['dialCode'] = data.clientPOC[i].phoneNumber.dialCode;//console.log(tempData2)

    tempData1['phoneNumber'] = tempData2;
    client_poc_data.push(tempData1);
  }
  let sales_manager_data = [];
 if(!data.sales_manager){
   return res.status(400).send({message : "Please enter the sales manager",status: false});
 }
if(data.sales_manager.length == 0){
  return res.status(400).send({message : "Sales manager cant be empty",status : false});
}
 for(let i=0; i<data.sales_manager.length;i++){
    if(data.sales_manager[i].sales_manager_id){
      data.sales_manager.sales_manager_id = data.sales_manager[i].sales_manager_id;
    }
    if(data.sales_manager[i].sales_manager_name){
      data.sales_manager.sales_manager_name = data.sales_manager[i].sales_manager_name;
    }
    let temp_sales = {};
   temp_sales["sales_manager_id"] = data.sales_manager[i].sales_manager_id;
   temp_sales["sales_manager_name"] = data.sales_manager[i].sales_manager_name;
   sales_manager_data.push(temp_sales);
 }

  if(data.company_status){
    icp_pointers["company_status"] = data.company_status;
  }
  // if(data.brand){
  //   icp_pointers["brand"] = data.brand;
  // }
  if(data.expected_revenue){
    icp_pointers["expected_revenue"] = data.expected_revenue;
  }
  if(data.no_of_interviews){
    icp_pointers["no_of_interviews"] = data.no_of_interviews;
  }
  if(data.payment_cycle){
    icp_pointers["payment_cycle"] = data.payment_cycle;
  }
  if(data.turn_around_time){
    icp_pointers["turn_around_time"] = data.turn_around_time;
  }
   
  if(data.role == "client"){
    admin.role = data.role;
  }
  else if(data.role == "pre-client"){
    admin.role = data.role;
  }
  else{
    return res.status(400).send({message : "Please enter valid role for the client"});
  }

  admin.email = data.clientPOC[0].email;
  admin.name = data.name.toLowerCase();
  admin.addedBy = res.userId;
  // admin.clientPOC = data.clientPOC;
  if(Object.keys(icp_pointers).length > 4 ){
    admin.icp_status = true;
   }
   else{
    admin.icp_status = false;
   }  
  try {
    let adminData = await Admin.find({ $or: [{ email: admin.email }, { name: admin.name }] });
    if (adminData.length > 0 || adminData.isDelete == false) {
      return res.status(400).send({ message: "Client already exist", status: false });
    } else {//clientPoc
      let adminData = await admin.save(admin);//console.log(adminData);
      icp_pointers["client_id"] = adminData._id;
      icp_pointers["icp_done_by"] = res.userId;
      for (let i = 0; i < client_poc_data.length; i++) {
        client_poc_data[i].client_id = adminData._id;
      }
      for(let i=0; i<sales_manager_data.length; i++){
         sales_manager_data[i].client_id = adminData._id;
         sales_manager_data[i].client_name = adminData.name;
      }
      // console.log(client_poc_data);
      let salesManagerAdded = await sales_manager_list.insertMany(sales_manager_data);
      let clientPocAdded = await clientPoc.insertMany(client_poc_data);   
      if(Object.keys(icp_pointers).length > 1 ){
        let icpAdded = await client_icp(icp_pointers).save();
        //--------------to add logged in user info in log start-------------------//
        let log_data = {"user_id":res.userId, 
                        "message":"Added",
                        "action_for_id": adminData._id
                      };
        Premium_logs.add_global_log(log_data);
      //--------------to add logged in user info in log end-------------------//
      }
      return res.status(200).send({ message: "Client added successfully", status: true });
    }
  } catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": err.message });
  }
}

/**
 * Updated By: Shubham Kumar
 * Updated Date: 29-04-2022
 * Updated Desc: new flow of client
 * 
 */
const getClientNew = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  try {
    let condition = {};
    condition["isDelete"] = false;  
    condition["role"] = {$in : ["client", "pre-client"]};
    if (req.query.search && req.query.search.length != 0) {
      condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };// ".*" + req.query.search.toLowerCase() + ".*"
    }
    let client_info = await Admin
      .aggregate([
        { $match: condition },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup:
          {
            from: "client_pocs",
            localField: "_id",
            foreignField: "client_id",
            as: "clientPocInfo"
          }
        },
        {
          $lookup:
          {
            from: "sales_manager_lists",
            localField: "_id",
            foreignField: "client_id",
            as: "sales_manager"
          }
        },
        {
          $lookup:
          {
            from: 'client_feedbacks',
            let: { client_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$client_id", "$$client_id"] },
                }
              },
              { $sort: { "createdAt": -1 } },
              { $limit : 1},
            ],
            as: 'client_reviews'
          }
        }, {
          $unwind: {
            path: "$client_reviews",
            preserveNullAndEmptyArrays: true
          }
        },
        
        {
          $lookup:
          {
            from: "feedback_statuses",
            localField: "client_reviews.review",
            foreignField: "_id",
            as: "client_reviews.review"
          }
        },
        {
          $lookup:
          {
            from: "interviewschedules",
            localField: "_id",
            foreignField: "client_id",
            as: "hiredEngineersCount"
          }
        },
        
        {
          "$project": {
            "_id": 1,
            "isDelete": 1,
            "email": 1,
            "name": 1,
            "accountManager": 1,
            "role" : 1,

            "hiredCount": { $size: "$hiredEngineersCount" },
            "talentPresentCount": { $size: "$hiredEngineersCount" },
            "talentLeaveCount": '0',

            "clientPocInfo._id": 1,
            "clientPocInfo.POCName": 1,
            "clientPocInfo.department": 1,
            "clientPocInfo.comment": 1,
            "clientPocInfo.email": 1,
            "clientPocInfo.phoneNumber": 1,

            "sales_manager.sales_manager_id" : 1,
            "sales_manager.sales_manager_name" : 1,

            "client_reviews._id":1,"client_reviews.comment":1,"client_reviews.client_id":1,"client_reviews.client_name":1,
            "client_reviews.review_date":1,"client_reviews.review._id":1,"client_reviews.review.status":1,

            // "clientICP.company_status" : 1,
            // "clientICP.brand" : 1,
            // "clientICP.expected_revenue" : 1,
            // "clientICP.no_of_interviews" : 1,
            // "clientICP.payment_cycle" : 1,
            // "clientICP.turn_around_time" : 1,

            // "hiredEngineersCount._id" : 1//neha
            // "latest_feedback_given_by_client1" : {"$slice":["$latest_feedback_given_by_client",1]}
            /* "client_all_icps":1, "client_brand":1, "client_company_status":1, 
            "client_no_of_interviews":1, "client_payment_cycle":1, "client_expected_revenue":1 */
          }
        }
      ])
    // .limit(limit)
    // .skip(offset)
    // .lean();

      let icp_response = {};
      let icp_response_data = [];
      for(let j = 0 ; j<client_info.length; j++){
        let icp_data = await client_icp.find({client_id : client_info[j]._id});
        // console.log(icp_data.length);
        if(icp_data.length){
          for(let i=0 ; i<icp_data.length;i++){
            let company_status = await icp_pointers.findOne({_id : icp_data[i].company_status}).select("_id type");
            let expected_revenue = await icp_pointers.findOne({_id : icp_data[i].expected_revenue}).select("_id type");
            let no_of_interviews = await icp_pointers.findOne({_id : icp_data[i].no_of_interviews}).select("_id type");
            let payment_cycle = await icp_pointers.findOne({_id : icp_data[i].payment_cycle}).select("_id type");
            let turn_around_time = await icp_pointers.findOne({_id : icp_data[i].turn_around_time}).select("_id type");
            icp_response = {
              company_status,
              expected_revenue,
              no_of_interviews,
              payment_cycle,
              turn_around_time
            }
            // Object.keys(icp_response);
            // icp_response = toString(icp_response)
            // icp_response_data.push(icp_response);
        }
        }
        client_info[j].client_icps = icp_response;
      }
      // console.log(icp_response_data);
   
    for (let i = 0; i < client_info.length; i++) {
      if (client_info[i].accountManager && client_info[i].accountManager != null) {
        let accountManagerInfo = await Admin.findOne({ _id: ObjectId(client_info[i].accountManager) });
        if (accountManagerInfo) {
          client_info[i].accountManagerId = accountManagerInfo._id;
          client_info[i].accountManagerName = accountManagerInfo.name;
        } else {
          client_info[i].accountManagerId = null;
          client_info[i].accountManagerName = null;
        }

      } else {
        client_info[i].accountManagerId = null;
        client_info[i].accountManagerName = null;
      }
    }

    let client_total = await Admin.find(condition).countDocuments();
    return res.status(200).send({ message: "Client found successfully", status: true, total_count: client_total, response: client_info });
  }
  catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: err.message, line:err.stack });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 02-05-2022
 * Desc: to get client info 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getSingleClientNew = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found", status: false });
  }
  try {
    let id = base64decode(req.params.id);

    let clientInfo = await Admin.aggregate([
      { $match: { _id: ObjectId(id)} },
      {
        $lookup:
        {
          from: "client_pocs",
          localField: "_id",
          foreignField: "client_id",
          as: "clientPOC"
        }
      },
      {
        $lookup:
        {
          from: "sales_manager_lists",
          localField: "_id",
          foreignField: "client_id",
          as: "sales_manager"
        }
      },
      {
        $lookup:
        {
          from: 'client_feedbacks',
          localField: '_id',
          foreignField: 'client_id',
          as: 'client_reviews'
        }
      },
      {
        $unwind: {
          path: "$client_reviews",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup:
        {
          from: "feedback_statuses",
          localField: "client_reviews.review",
          foreignField: "_id",
          as: "client_reviews.feedback"
        }
      },
      {
        $group: {
          _id: "$_id",
          email: { $first: "$email" }, name: { $first: "$name" }, addedBy: { $first: "$addedBy" },
          createdAt: { $first: "$createdAt" }, accountManager: { $first: "$accountManager" }, 
          clientPOC: { $first: "$clientPOC" },
          sales_manager: { $first: "$sales_manager" },
          client_reviews: { $push: "$client_reviews" }

        }
      },
      {
        "$project": {
          "_id": 1, "email": 1, "name": 1, "sales_manager._id" : 1, "sales_manager.sales_manager_name" : 1, "addedBy": 1, "createdAt": 1,
          "client_reviews._id":1, "client_reviews.comment":1, "client_reviews.client_id":1, 
          "accountManager": 1, "clientPOC": 1,
          "client_reviews.client_name":1,  "client_reviews.review_date":1, 
          "client_reviews.feedback._id":1, "client_reviews.feedback.status":1, 
        }
      }
    ]);


    // let client_reviews_res = await client_reviews.find({client_id : id}).select("comment review client_name client_id review_date");
    // for(i=0; i<client_reviews_res.length ; i++){
    //   let reviews = await feedback_status.find({_id : client_reviews_res.review}).select("feedback");
    //   if(reviews){
    //    clientInfo[i].client_reviews = client_reviews_res;
    //   }
    // }
      let icp_data = await client_icp.find({client_id : id});
      let icp_response = {};
      let icp_response_data = [];
      for(let i=0 ; i<icp_data.length;i++){
          let company_status = await icp_pointers.findOne({_id : icp_data[i].company_status}).select("_id type");
          let expected_revenue = await icp_pointers.findOne({_id : icp_data[i].expected_revenue}).select("_id type");
          let no_of_interviews = await icp_pointers.findOne({_id : icp_data[i].no_of_interviews}).select("_id type");
          let payment_cycle = await icp_pointers.findOne({_id : icp_data[i].payment_cycle}).select("_id type");
          let turn_around_time = await icp_pointers.findOne({_id : icp_data[i].turn_around_time}).select("_id type");
          icp_response = {
            company_status,
            expected_revenue,
            no_of_interviews,
            payment_cycle,
            turn_around_time
          }
          // Object.keys(icp_response);
          // icp_response = toString(icp_response);

          // console.log(Object.keys(icp_response));
          icp_response_data.push(icp_response);
      }
    //  console.log(clientInfo1)   
    if (!clientInfo) {
      return res.status(404).send({ message: "Error! Client not exist.", status: false });
    }

    clientInfo = JSON.parse(JSON.stringify(clientInfo));
    let clientAddedBy = await Admin.findOne({ _id: clientInfo[0].addedBy }).select("_id name");
    clientInfo[0].addedBy = { "_id": clientAddedBy._id, "name": clientAddedBy.name };

    let accountManagerInfo = await Admin.findOne({ _id: ObjectId(clientInfo[0].accountManager) }).select("_id name");
    if (!accountManagerInfo) {
      clientInfo[0].accountManager = { "_id": null, "name": null };
    } else {
      clientInfo[0].accountManager = { "_id": accountManagerInfo._id, "name": accountManagerInfo.name };
    }

    let find_resources = await interviewScheduleModel.find({ clientName: clientInfo.name });
    let resource_count = find_resources.length;
    for (i = 0; i < find_resources.length; i++) {
      let resources = await Resource.findOne({ _id: find_resources[i].addedTo });
      find_resources[i] = resources;
    }


    let client_id = base64decode(req.params.id);
    let client_hired_resources = await interviewScheduleModel.aggregate([
      { $match: { interviewStatus: "Hired", "client_id": ObjectId(client_id) } },
      {
        "$project": {
          "clientName": 1, "client_id": 1, "addedTo": 1,//addedTo is resource
        }
      }
    ])
    for (let i = 0; i < client_hired_resources.length; i++) {
      // let hiredResources = await Resource.findOne({ _id: ObjectId(client_hired_resources[i].addedTo) }).select("_id name techStack experiance vendorId price domain");
     let find_resource = await Resource.findOne({_id : client_hired_resources[i].addedTo, isDelete : false, isPullBack : false});
     if(find_resource){
      let hiredResources = await Resource.aggregate([
        {$match: {_id: ObjectId(client_hired_resources[i].addedTo) }},
        {$limit: 1},
        {
          $lookup:{
            "from":"domain_lists",
            "localField":"domain",
            "foreignField":"_id",
            "as":"domain_info"
          }
        },
        {
          $project: {
            "_id":1, "name":1, "techStack":1, "experiance":1, "vendorId":1, "price":1, "domain_info":1
          }
        }
      ]);

      client_hired_resources[i].resourceId = hiredResources[0]._id;
      client_hired_resources[i].clientName = hiredResources[0].name;
      client_hired_resources[i].clientExperiance = hiredResources[0].experiance;
      client_hired_resources[i].clientPrice = hiredResources[0].price;
      client_hired_resources[i].clientVendrorId = hiredResources[0].vendorId;
      client_hired_resources[i].resourceTech = hiredResources[0].techStack;
      client_hired_resources[i].domain_info= hiredResources[0].domain_info;
     }
    }
      
    return res.status(200).send({ message: "Response found", status: true, resource_count: 'resource_count', 'response': clientInfo, 'resources': find_resources, "client_hired_resources": client_hired_resources , 
    "company_status":icp_response.company_status,
      "expected_revenue":icp_response.expected_revenue,
      "no_of_interviews":icp_response.no_of_interviews,
      "payment_cycle":icp_response.payment_cycle,
      "turn_around_time":icp_response.turn_around_time
  });
  }
  catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": err.message , "line": err.stack});
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 02-05-2022
 * Desc: To edit client info
 */
const modifyClient = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).send({ message: "Id not found", status: false });
  }
  let id = base64decode(req.params.id);
  if (isNaN(parseInt(id))) {
    return res.status(404).send({ message: "Error! You have passed invalid-id.", status: false });
  }
  let data = req.body;
  const admin = new Admin();
  let client_poc_data = [];
  if (!data.name) {
    return res.status(400).send({ message: "Error! Please enter the Client Name" });
  }
  if (!data.clientPOC) {
    return res.status(400).send({ message: "Error! Please enter the client poc" });
  }
  if (data.clientPOC.length == 0) {
    return res.status(400).send({ message: "Error! Client POC is empty" });
  }
  
  admin.email = data.clientPOC[0].email;
  admin.name = data.name.toLowerCase();

  try {
    let client_info = await Admin.findOne({ _id: ObjectId(id) });
    if (!client_info) {
      return res.status(400).send({ message: "Client not exist", status: false });
    }

    let update_client = await Admin.updateOne({ role: 'client', _id: id }, { 'name': data.name.toLowerCase(), email: data.clientPOC[0].email });

    let idArr = [];
    for (let i = 0; i < data.clientPOC.length; i++) {
      let client_pocs = await clientPoc.findOne({ client_id: client_info._id, _id: data.clientPOC[i]._id });
      if (client_pocs) {
        let temp_data = {};
        temp_data.POCName = data.clientPOC[i].POCName;
        temp_data.department = data.clientPOC[i].department;
        temp_data.comment = data.clientPOC[i].comment;
        temp_data.email = data.clientPOC[i].email;

        let phoneNumber = {};
        phoneNumber['POCName'] = data.clientPOC[i].POCName;//data.clientPOC[i].phoneNumber.POCName         
        phoneNumber['number'] = data.clientPOC[i].phoneNumber.number;
        phoneNumber['internationalNumber'] = data.clientPOC[i].phoneNumber.internationalNumber;
        phoneNumber['nationalNumber'] = data.clientPOC[i].phoneNumber.nationalNumber;
        phoneNumber['e164Number'] = data.clientPOC[i].phoneNumber.e164Number;
        phoneNumber['countryCode'] = data.clientPOC[i].phoneNumber.countryCode;
        phoneNumber['dialCode'] = data.clientPOC[i].phoneNumber.dialCode;
        temp_data['phoneNumber'] = phoneNumber;
        let resp = await clientPoc.updateOne({ _id: data.clientPOC[i]._id }, temp_data);

        for (i = 0; i < data.clientPOC.length; i++) {
          if (data.clientPOC[i]._id == "") {
            delete data.clientPOC[i]._id;
            // data.clientPOC = JSON.parse(JSON.stringify(data.clientPOC));
            data.clientPOC[i].client_id = id;
            let client_res = await new clientPoc(data.clientPOC[i]).save();
            idArr.push(client_res._id);
          } else {
            data.clientPOC = JSON.parse(JSON.stringify(data.clientPOC));
            let conditional_id = { _id: data.clientPOC[i]._id };
            idArr.push(data.clientPOC[i]._id);
            let client_res = await clientPoc.updateOne(conditional_id, { $set: data.clientPOC[i] }, { upsert: false });
          }
        }
        let poc_id = await clientPoc.find({ "client_id": id,_id: { $nin: idArr } });
        if (poc_id.length > 0) {
          let deleting_ids = [];
          for (let j = 0; j < poc_id.length; j++) {
            deleting_ids.push(poc_id[j]._id);
            let remove_poc = await clientPoc.deleteOne({ "client_id": id, _id: { $in: deleting_ids } });
          }
        }
      }
    }
/*     let sales_ids = [];
    let sales_data = await sales_manager_list.find({client_id : id}).select("_id");
    if(sales_data.length > 0){
      for(let i=0; i<sales_data.length; i++){
        sales_ids.push(sales_data[i]._id);
      }
    }
    console.log(sales_ids); */
    if(data.sales_manager.length > 0){
      let delete_sales_manager = await sales_manager_list.deleteMany({client_id : id});
      for(let i=0; i<data.sales_manager.length; i++){
        data.sales_manager[i].client_id = id;
        data.sales_manager[i].client_name = client_info.name;
        let saved_sales_manager = await sales_manager_list(data.sales_manager[i]).save();
        // console.log(saved_sales_manager);
      }
    }

    let icp_update = await client_icp.updateOne({client_id : id}, {$set : data});
    // let sales_ids = [];
    // for(i=0;i<data.sales_manager.length;i++){
    //   let sales_data = await sales_manager_list.find({client_id : id}).select("_id");console.log(sales_data)
    //   sales_ids.push(sales_data[i]._id);
    //   // if(sales_data.length > 0){
    //   //     // let delete_sales_manager = await sales_manager_list.deleteOne({sales_manager_id : sales_data._id});
    //   //     // let saved_sales_manager = await sales_manager_list(sales_manager).save();
    //   // }
    // }

    //--------------to add logged in user info in log start-------------------//
    let log_data = {"user_id":res.userId, 
      "message":"Modified",
      "action_for_id": id
    };
    Premium_logs.add_global_log(log_data);
    //--------------to add logged in user info in log end-------------------//

    return res.status(200).send({ message: "Data updated successfully", status: true });
    // res.send(update_client);

    // return res.status(200).send({ message: "Client added successfully", status: true });
  } catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": err.message, line: err.stack });
  }
}


/**
 * Updated By: Shubham Kumar
 * Updated Date: 02-05-2022
 * Desc : To add multi client with multi POC and add department
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */ //under development
const addMultiClient = async (req, res) => {
  let data = req.body;

  try {
    for (let j = 0; j < data.length; j++) {
      let client_poc_data = [];
      if (!data[0].name) {
        data[0].name = null;
      }
      if (!data[0].clientPOC) {
        data.clientPOC = null;
      }
      if (data[0].clientPOC.length == 0) {
        return res.status(400).send({ message: "Error! Client POC is empty" });
      }

      for (let i = 0; i < data[j].clientPOC.length; i++) {
        if (!data[j].clientPOC[i].POCName) {
          data[j].clientPOC[i].POCName = null;
        }
        if (!data[j].clientPOC[i].department) {
          data[j].clientPOC[i].department = null;
        }
        if (!data[j].clientPOC[i].comment) {
          data[j].clientPOC[i].comment = null;
        }
        if (!data[j].clientPOC[i].phoneNumber) {
          data[j].clientPOC[i].phoneNumber = null;
        }
        if (!data[j].clientPOC[i].email) {
          data[j].clientPOC[i].email = null;
        }

        let tempData1 = {}
        tempData1['POCName'] = data[j].clientPOC[i].POCName;
        tempData1['department'] = data[j].clientPOC[i].department;
        tempData1['comment'] = data[j].clientPOC[i].comment;
        tempData1['email'] = data[j].clientPOC[i].email;
        // client_poc_data.push(tempData1);

        if (!data[j].clientPOC[i].phoneNumber.number) {
          data[j].clientPOC[i].phoneNumber.number = null;
        }
        if (!data[j].clientPOC[i].phoneNumber.internationalNumber) {
          data[j].clientPOC[i].phoneNumber.internationalNumber = null;
        }
        if (!data[j].clientPOC[i].phoneNumber.nationalNumber) {
          data[j].clientPOC[i].phoneNumber.nationalNumber = null;
        }
        if (!data[j].clientPOC[i].phoneNumber.e164Number) {
          data[j].clientPOC[i].phoneNumber.e164Number = null;
        }
        if (!data[j].clientPOC[i].phoneNumber.countryCode) {
          data[j].clientPOC[i].phoneNumber.countryCode = null;
        }
        if (!data[j].clientPOC[i].phoneNumber.dialCode) {
          data[j].clientPOC[i].phoneNumber.dialCode = null;
        }

        let tempData2 = {}
        tempData2['POCName'] = data[j].clientPOC[i].POCName;
        tempData2['number'] = data[j].clientPOC[i].phoneNumber.number;
        tempData2['internationalNumber'] = data[j].clientPOC[i].phoneNumber.internationalNumber;
        tempData2['nationalNumber'] = data[j].clientPOC[i].phoneNumber.nationalNumber;
        tempData2['e164Number'] = data[j].clientPOC[i].phoneNumber.e164Number;
        tempData2['countryCode'] = data[j].clientPOC[i].phoneNumber.countryCode;
        tempData2['dialCode'] = data[j].clientPOC[i].phoneNumber.dialCode;//console.log(tempData2)

        tempData1['phoneNumber'] = tempData2;
        client_poc_data.push(tempData1);
      }

      let clientData = [];
      clientData.role = "client";
      clientData.email = data[j].clientPOC[0].email;
      clientData.name = data[j].name.toLowerCase();
      clientData.addedBy = res.userId;
      clientData.lastSourceAdded = null;
      clientData.lastSourceVerified = null;
      const admin = new Admin(clientData);
      // console.log(data[j].clientPOC[0].email)
      let adminData = await Admin.findOne({ email: data[j].clientPOC[0].email }).countDocuments();//$or: [{ email: admin.email }, { name: admin.name }]
      if (adminData == 1) {//console.log("continue")
        continue;
      }
      else {//console.log("else");
        let adminData = await admin.save();
        // console.log(adminData);
        for (let i = 0; i < client_poc_data.length; i++) {
          client_poc_data[i].client_id = adminData._id;
        }
        let clientPocAdded = await clientPoc.insertMany(client_poc_data);
      }
      // console.log(admin);
    }
    return res.status(200).send({ message: "All clients added successfully", status: true });
    // return res.send("haha");
  } catch (err) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": err.message });
  }
}
//under development
const getClientFromInterviewschedules = async (req, res) => {
  try {
    let getClientName = await interviewScheduleModel.find({ interviewStatus: 'Hired' });

    let data = [];

    let row = {
      "name": getClientName.clientName,
      "clientPOC":
        [{
          "POCName": "Richie Sater",
          "phoneNumber": {
            "number": "",
            "internationalNumber": "",
            "nationalNumber": "",
            "e164Number": "",
            "countryCode": "",
            "dialCode": ""
          },
          "email": "richie.sater@4thoughtglobal.com",
          "department": "CEO",
          "comment": ""
        }]
    }
    data.push(row);


    let getClientData = await Admin.aggregate([
      { $match: { role: 'client' } },
      // {$offset:0},
      { $limit: 10 },
      /*{
          $lookup:
            {from:"client_pocs",
            localField:"_id",
            foreignField:"client_id",
            as: "clientPOC"}
        },
        {
          "$project":{
            "_id":1,"email":1,"name":1,"addedBy":1,"createdAt":1,
            "clientPOC":1,
          }
        }*/
      {
        $project:
        {
          'admins._id': 1,
          'admins.name': 1,
          // "clientInfo._id":1
        }
      }
    ]);

    let responseData = {
      getClientData
    }
    return res.status(200).send({ responseData, message: "Get Clients", status: true });
  } catch (error) {
    return res.status(400).send({
      message: "Something went wrong",
      status: false,
      "error": error.message
    });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 05-05-2022
 * Desc: to download code in excel
 */
const download_pdf = async (req, res) => {
  /*   try{
      const User = [
        { 
          fname: "Amir", 
          lname: "Mustafa", 
          email: "amir@gmail.com", 
          gender: "Male" 
        },
        {
          fname: "Ashwani",
          lname: "Kumar",
          email: "ashwani@gmail.com",
          gender: "Male"
        }
      ];
  
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
      const path = "./files";  // Path to download excel
      // Column for data in excel. key must match data key
      worksheet.columns = [
        { header: "S no.", key: "s_no", width: 10 }, 
        { header: "First Name", key: "fname", width: 10 },
        { header: "Last Name", key: "lname", width: 10 },
        { header: "Email Id", key: "email", width: 10 },
        { header: "Gender", key: "gender", width: 10 },
    ];
    // Looping through User data
    let counter = 1;
    User.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user); // Add data in worksheet
      counter++;
    });
    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    const data = await workbook.xlsx.writeFile(`${path}/users.xlsx`)
     .then(() => {
       res.send({
         status: "success",
         message: "file successfully downloaded",
         path: `${path}/users.xlsx`,
        });
     });
  
    }catch(error){
      return res.status(400).send({ 
        message: "Something went wrong",
        status: false,
        "error":error.message });
    } */
}

const giveClientId = async (req, res) => {
  /* try{

  }catch(error){
    return res.status(400).send({ 
      message: "Something went wrong",
      status: false,
      "error":error.message });
  } */
}


const addClientPocByClientId = async (req, res) => {
  try {
    let client = await Admin.find({ role: "client" });
    // console.log(client.length)
    for (let i = 0; i < client.length; i++) {
      // if(client._id == )
    }
    res.send(client);

  } catch (error) {
    return res.status(400).send({
      message: "Something went wrong",
      status: false,
      "error": error.message
    });
  }
}

/**Created By: Sakshi Uikey
 * Created Date: 12-07-2022
 * Desc: To add client reviews
 * API: /add-client-reviews/:id
 * Function: addClientReviews
 */

const addReviewsForClient  = async(req,res)=>{
 if(!req.params.id){
  return res.status(400).send({message : "Please enter the client id",status : false});
 }
 try{
  let client_id = base64decode(req.params.id);
  let data = req.body;
  let check_client = await Admin.findOne({_id : client_id, isDelete : false, role : "client"});
  if(!check_client){
    return res.status(400).send({message : "Client not found", status : false});
  }
  else{
    if(!data.review){
      return res.status(400).send({message : "Please enter the review",status : false});
    }
    if(!data.comment){
      return res.status(400).send({message : "Please enter the comment",status: false});
    }
    let review_data = {
      client_id : check_client._id,
      client_name : check_client.name,
      review : data.review,
      comment : data.comment,
      review_date : new Date()
    }
    let response = await client_feedbacks(review_data).save();
    if(!response){
    return res.status(400).send({message : "Error, while saving the client reviews", status : false});
    }
    else{
      return res.status(200).send({message : "Client review added successfully", status : true, response});
    }
  }
 }
catch(error){
  return res.status(400).send({message: "Something went wrong",status: false,"error": error.message, "line": error.stack});
 }
}

/* module.exports = {
  getSingleClientNew,
} */

module.exports = {
  addTeamMember,
  getTeamMember,
  getAmAssociate,
  getVmAssociate,
  getSalesManager,
  getAmAdmin,
  getVmAdmin,
  updateTeamMember,
  getSingleTeamMember,
  deleteTeamMember,
  addClientOld,
  addClient,
  deleteClient,
  updateClient,
  getSingleClient,
  changeStatus,
  searchClient,
  addClientNew,
  getClientNew,
  getSingleClientNew,
  modifyClient,
  addMultiClient,
  getClientFromInterviewschedules,
  download_pdf,
  giveClientId,
  addClientPocByClientId,
  addReviewsForClient
}
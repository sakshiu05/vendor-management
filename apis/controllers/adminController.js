// 'use strict';
var randomize = require("randomatic");
var bcrypt = require("bcryptjs");
let func = require("../common/commonfunction");
var ip = require("ip");
let moment = require("moment");
const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const { base64encode, base64decode } = require("nodejs-base64");
const ObjectId = require("mongodb").ObjectID;
const Premium_logs = require("../common/logs_message");

let Admin = require("../models/admin").Admin;
const adminLog = require("../models/adminLog").adminLog;
let Otp = require("../models/adminOtp").otp;
let userAuth = require("../models/userAuth").userAuth;
let engineer_work_info = require("../models/engineer_work_details").workDetails;
const resource_login_logs = require("../models/resource_login_logs").resource_login_logs;
const user_attendence = require("../models/resourceAttendence").resourceAttendence;
const Attendence_status = require("../models/attendenceStatus").attendenceStatus;
const interviewSchedule = require("../models/interviewSchedule").interviewSchedule;
const Resources = require("../models/resource").Resources;
let global_logs = require("../models/admin").all_roles_log;
/*
 * --------------------------------------------------------------------------
 * Admin login API start
 * ---------------------------------------------------------------------------
 */
const login = async (req, res) =>{
  let data = req.body;
  let email = req.body.email;
  let password = req.body.password;
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let datewithout_time = new Date(year + "-" + month + "-" + day).toString();
  let onlyDate = moment(today).format("YYYY-MM-DD");
  // let onlyDate = moment(today).toDate();
  if(!data.email){
    return res.status(400).send({ message: "Please enter email-id", status: false });
  }
  if(!data.password){
    return res.status(400).send({ message: "Please enter password", status: false });
  }
  
  let check_engg = await Admin.findOne({email: email, isDelete: false, active: true,role:'engineer'}).select("_id");
  let check_engg_profile = "";
  if(check_engg){
    check_engg_profile = await engineer_work_info.findOne({engineer_id:check_engg._id}).select("profileImage");
  }

  //--------------------resource login code start---------------------------//
  let AdminDataNew = await Admin.findOne({email:data.email});
  if(!AdminDataNew){
    return res.status(400).send({ message: "User not exist.", status: false });
  }else{
    if(AdminDataNew.role.toLowerCase() == "resource"){

      //If resources user already login in another browser or try to login ..
     let checkAllreadyLogin = await userAuth.findOne({adminId:AdminDataNew._id,isActive:true}).sort({created:-1});
     if(checkAllreadyLogin)
     {
       let updateLoginData = await userAuth.updateMany({adminId:AdminDataNew._id},{$set:{isActive:false}});
       let resource_log = {
        "date": new Date(),
        "resource_id": AdminDataNew.resource_id,
        "description":"logged-out"
      }
      let log = await resource_login_logs(resource_log).save();
     }




      let res_login_time = new Date();
      let res_hr = res_login_time.getHours();
      let res_min = res_login_time.getMinutes();
      //-----------------To now allow resource login for 2 min 11:58 PM to 12:00 AM ----------------//
      if(res_hr >= 23 && res_min >= 58){
        return res.status(400).send({ message: "Please login after 12:00 AM", status: false });
      }

      let is_attendence_marked = await user_attendence.findOne({resource_id: AdminDataNew.resource_id }).sort({createdAt:-1});
      let resource_client = await interviewSchedule.findOne({interviewStatus:'Hired', addedTo: ObjectId(AdminDataNew.resource_id)});
      let present_status = await Attendence_status.findOne({status: "P: Present"}).select("_id");
      
      let resource_log;
      if(AdminDataNew && AdminDataNew.resource_id){
        resource_log = {
          "date": new Date(onlyDate),
          "resource_id": AdminDataNew.resource_id,
          "description":"logged-in"
        }
        if(resource_client && resource_client.client_id){
          resource_log['client_id'] = ObjectId(resource_client.client_id);
        }
      }
      let attendence_arr;
      if(resource_client){
        attendence_arr = {
          "resource_id"          : ObjectId(AdminDataNew.resource_id),
          "client_id"            : ObjectId(resource_client.client_id),
          "date"                 : new Date(onlyDate),
          "status"               : ObjectId(present_status._id),
          "attendence_marked_by" : ObjectId(AdminDataNew.resource_id),
          "comment"              : "logged-in"
        }
      }

      if(is_attendence_marked){
        let todays_date = new Date(onlyDate);
        if(is_attendence_marked.date.toString() === todays_date.toString()){
        }else{
          if(attendence_arr){
            let mark_attendence = await user_attendence(attendence_arr).save();
          }
        }
      }else{
        if(attendence_arr){
          let mark_attendence = await user_attendence(attendence_arr).save();
        }
      }
      if(resource_log){
        let log = await resource_login_logs(resource_log).save();
      }
    }
  }
  

  //---If resource login get resource name ------//
  let resource_info;
  let find_admin = await Admin.findOne({email: email, isDelete: false, role:'resource'});
  if(find_admin){
    resource_info = await Resources.findOne({_id:find_admin.resource_id}).select("_id name");
  }

  Admin.findOne(
    {
      email: email, isDelete: false
    },
    "+password",
    function (err, foundUser) {
      if (err) {
        return res.status(400).send({ message: "Bad Request", status: false });
      } else {

        if (foundUser == null) {
          // logger.info('Please enter valid User id')

          return res
            .status(400)
            .send({ message: "Please enter valid User id", status: false });
        }
        //-----------------Account Disabled  Start------------------------//
        if(foundUser && foundUser.active == false){
          return res.status(400).send({ message: "Your account as been disabled. Please contact to the Admin", status: false });
        }
        //-----------------Account Disabled  End------------------------//
        foundUser.comparePassword(password, function (err, isMatch) {
          if (err) {
            // logger.info('Incorrect Credentials');

            return res
              .status(400)
              .send({ message: "Incorrect Credentials", status: false });
          } else {
            if (!isMatch) {
              // logger.info('Please enter valid Password');

              return res.status(400).send({
                message: "Please enter valid Password",
                status: false,
              });
            } else {
              bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                  password = hash;
                  //-----------  add resource name in token start ----------------//
                  if(foundUser.role == "resource"){
                    foundUser.name = resource_info.name;
                  }
                  //----------- add resource name in token end ----------------//
                  // console.log(foundUser);
                  var token = func.createToken(foundUser);
                  // console.log(token);
                  var ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                  var data = {};
                  data._id = foundUser._id;
                  data.email = foundUser.email;
                  data.password = password;
                  foundUser.token = token;

                  let userAuthData = new userAuth();
                  userAuthData.token = token;
                  userAuthData.adminId = foundUser._id;
                  userAuthData.isActive = true;
                  userAuthData.systemIp = ipAddress;
                  // console.log(ipAddress , ip.address());
                  
                  //to show engg profile pic in header start
                  if(check_engg_profile && check_engg_profile != "" && check_engg_profile.profileImage){
                    foundUser.profilePic = check_engg_profile.profileImage;
                  }
                  //to show engg profile pic in header end

                  //----if resource login send resource name ---------//
                  if(resource_info && resource_info.name){
                    foundUser.name = resource_info.name;
                  }

                  userAuthData.save().then(function (data, err) {
                    if (err) {
                      // logger.info('issue in saving token');
                      return res
                        .status(400)
                        .send({ message: "Token issue", status: false });
                    }
                    
                    //--------------to add logged in user info in log start-------------------//
                    let log_data = {"user_id":foundUser._id, "message":"loggedIn"};
                    Premium_logs.add_global_log(log_data);
                    //--------------to add logged in user info in log end-------------------//

                    return res.status(200).send({
                      message: "Data Found",
                      status: true,
                      token,
                      data: foundUser,
                    });
                  });
                });
              });
            }
          }
        });
      }
    }
  );
};

const updateProfile = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let profilePic
      let profilePicUrl;
      const isodate = new Date().toISOString();
      data = req.body;
      let orCondition = [];
      if (req.file) {
        data.profilePic = req.file.location;
      }
      if (!data.name) {
        res.status(400).json({ "message": "Please enter name." });
      }
      if (!data.email) {
        res.status(400).json({ "message": "Please enter email." });
      }
      
      if (data.phone) {
        data.phone = data.phone.trim();
        if (data.phone.length != 10) {
          return res.status(404).json({ message: "Invalid phone number" });
        }
        orCondition.push({ phone: data.phone })
      }
      if(data.email){
        data.email = data.email.trim();
        orCondition.push({ email: data.email })
      }
      if(data.name){
        data.name = data.name.trim();
        orCondition.push({ name: data.name })
      }
      
      //------individual engineer code start--------//
      let engineer = await Admin.findOne({_id:id}).select("role");
      if(engineer.role == "engineer"){
        let engineerData = {
          "profileImage": data.profilePic
        }
        // console.log(engineerData);
        let updateEngineer = await engineer_work_info.findOneAndUpdate({"engineer_id":id},{$set:engineerData});
        let updatedEngineerInfo = await engineer_work_info.findOne({"engineer_id":id});
        // console.log(updateEngineer);
        let returnData = {
          "email":updatedEngineerInfo.email,
          "name":updatedEngineerInfo.first_name + " " + updatedEngineerInfo.last_name,
          "phone":updatedEngineerInfo.mobile_number,
          "profilePic":updatedEngineerInfo.profileImage,
          "role":"engineer",
          "_id":updatedEngineerInfo._id
        };
        return res.status(200).send({ message: "Engineer Profile updated successfully", status: true, data: returnData });
      }else{
      //------individual engineer code end--------//

      let findResponse = await Admin.find({ _id: { $ne: id }, $or: orCondition });
      if (findResponse.length > 0) {
        return res.status(400).send({ message: "Name or Email or phone already exist", status: false });
      }
      
        let dataForUpdate = {
          name        : data.name,
          email       : data.email,
          phone       : data.phone,
          updatedAt   : isodate
        }
        
        if (req.file) {
          dataForUpdate.profilePic = req.file.location;
        }
        Admin.updateOne(
          { _id: id },
          {
            $set: dataForUpdate,
          },
          async function (err, resp) {
            if (err) {
              return res
                .status(400)
                .send({ message: "Bad Request", status: false });
            } else {
              adminLog_response = await adminLog({
                updatedBy   : res.userId,
                updatedAt   : isodate,
                role        : res.userRole,
                task        : "user-profile-update",
                data        : data
              }).save();
              let updatedUserData = await Admin.findOne({ _id: id }, { name: 1, _id: 1, email:1, phone:1, profilePic:1, role:1});
              return res
                .status(200)
                .send({ message: "Profile updated successfully", status: true, data: updatedUserData });
            }
          }
        );
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "something went wrong", status: false,error:error.message });
  }
};

/**
 * Function - logout
 * Description - To logout admin and vendor
 * callingRoute - logout (id is not optional but base64encoded service_id)
 * Developer - Shubham Kumar
 * Created on - 20 December 2021
 * Updates - NA
 * Updated by - NA
 * Updated on - NA
 * @param {*} req Request object contains query param for id and json body with new status
 * @param {*} res Response object used to send response
 * @returns Response data object along with json data
 */
const logout = async (req, res) => {
  try {
    const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
    let adminData = await Admin.findOne({ _id: res.userId });
    if (!adminData) {
      return res.status(404).send({ message: "Data not found", status: false });
    } else {

      let resource_name;
      if(adminData.role.toLowerCase() == "resource"){
        let last_login_id = await resource_login_logs.findOne({'resource_id': ObjectId(adminData.resource_id) }).select("_id createdAt client_id name");
        resource_name = last_login_id.name;
        let current_date_time = moment().format();
        current_date_time = new Date(current_date_time);
        let diffInHr = Math.floor( ((current_date_time - last_login_id.createdAt) % 86400000) / 3600000);
        let diffInMin = Math.round( (Math.floor( (current_date_time - last_login_id.createdAt) % 86400000) % 3600000) / 60000 );
        
        let resource_log = {
          "date": new Date(),
          "resource_id": ObjectId(adminData.resource_id),
          "client_id": ObjectId(last_login_id.client_id),
          "description":"logged-out",
          "last_login_id": ObjectId(last_login_id._id),
          "time_track":  parseFloat(diffInHr + '.' + diffInMin)
        }
        let log = await resource_login_logs(resource_log).save();
      }

      userAuth.updateOne(
        { token: usertoken },
        {
          $set: {
            isActive: false,
          },
        },
        function (err, resp) {
          if (err) {
            return res
              .status(404)
              .send({ message: "Error Occurred", status: false });
          } else {
            //--------------to add logged in user info in log start-------------------//
              let log_data = {"user_id":adminData._id, "message":"loggedOut"};
              Premium_logs.add_global_log(log_data);
            //--------------to add logged in user info in log end-------------------//;
            return res
              .status(200)
              .send({ message: "Log out successfully", status: true });
          }
        }
      );
    }
  } catch (error) {
    return res
      .status(400)
      .status({ message: "Some error occurred", status: false });
  }
};


const generateOtp = async (req, res) => {
  try {
    let email = req.body.email;
    if (!email) {
      return res
        .status(400)
        .send({ message: "Please enter email", status: false });
    }
    let find_response = await Admin.find({ email: email });
    if (find_response.length <= 0) {
      return res.status(400).send({ message: "Email not exist in db.", status: false });
    } else {
      const otp = Math.floor(1000 + Math.random() * 9000);
      const otpModel = new Otp();
      otpModel.userId = find_response[0]._id;
      otpModel.otp = otp;
      otpModel.email = find_response[0].email;
      // console.log(otpModel)
      let addResponse = await otpModel.save()
      if (!addResponse) {
        return res.status(400).send({ message: "Error in otp generation", status: false });
      } else {
        let pugfilename = "otp.pug";
        func.mailSend(find_response[0].email,"Supersourcing Premium",{ 'name': find_response[0].name, 'otp': otp },pugfilename);
        return res.status(200).send({ message: "Otp generated successfully", status: true });
      }
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}


const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;
    const password = req.body.password;

    if (!email) {
      return res
        .status(400)
        .send({ message: "Please enter email", status: false });
    }
    if (!otp) {
      return res
        .status(400)
        .send({ message: "Please enter otp", status: false });
    }
    if (!password) {
      return res
        .status(400)
        .send({ message: "Please enter password", status: false });
    }

    let find_response = await Otp.find({ email: email, otp: otp });
    if (find_response.length <= 0) {
      return res.status(400).send({ message: "Invalid otp or email", status: false });
    } else {
      let startDate = moment(find_response[0].createdAt);
      let endDate = moment(new Date());

      var duration = moment.duration(endDate.diff(startDate));
      const minutes = duration.asMinutes();
      if (minutes > 15) {
        return res
          .status(400)
          .send({ message: "Otp expired", status: false });
      } else {
        let hashPass = await bcrypt.hash(password, 10);
        let updated_res = await Admin.updateOne(
          { _id: find_response[0].userId },
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
            .send({ message: "Password changed successfully", status: true });
        }
      }
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

/** (remove this extra data lator)
 * Created By: Shubham Kumar
 * Created Date: 06-07-2022
 * Desc: To show all users daily logs
 * Function: daily_global_log
 * API: daily-global-log
 * API Type: GET 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const daily_global_log = async (req, res) => {
  try{
    
    let today2 = new Date();
    let from = new Date(moment(today2).format("YYYY-MM-01"));
    let to = new Date(today2.getFullYear(), today2.getMonth() + 1, 0);
    to = moment(to).format("YYYY-MM-DD");
    to   = new Date(to);

    if(req.query.month && req.query.year){
      from = new Date(req.query.year, (req.query.month -1), 01);
      from   = moment(from).format("YYYY-MM-01");
      from   = new Date(from);

      to   = new Date(req.query.year, (req.query.month), 0);
      to   = moment(to).format("YYYY-MM-DD");
      to   = new Date(to);
    }

    let monthly_logs = await global_logs.aggregate([
      {
        $match: {
          $and : [ 
                    { date: { $gte: new Date(from) } },
                    { date: { $lte: new Date(to) } }
          ]
        }
      },
      {
        "$group": {
          "_id": { "month": { "$month": "$date" }, "year": { "$year": "$date" }, "day": {$dayOfMonth: "$date"} },
          "data": { $push: {_id:"$_id", user_id: "$user_id", message: "$message", date: "$date", user_role: "$user_role", user_name: "$user_name", createdAt: "$createdAt", month:{ "$month": "$date" }, year:{ "$year": "$date" }, action_for_id: "$action_for_id", action_for_user_name: "$action_for_user_name", action_for_user_role: "$action_for_user_role", action_to_id: "$action_to_id", action_to_user_name: "$action_to_user_name", action_to_user_role: "$action_to_user_role", message_two: "$message_two" } },
          "total": { $sum: 1 }
        }
      },
      { "$sort": { "month": -1, "year": -1 } },
    ]);

    let total_logs = await global_logs.find().countDocuments();

    let responseData = {
      "total_logs" : total_logs,
      "monthly_logs": monthly_logs,
    }
    return res.status(200).send({responseData, message: "User log added successfully", status: true });
  }catch(error){
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message, line: error.stack });
  }
}

 module.exports = {
  login,
  updateProfile,
  logout,
  generateOtp,
  verifyOtp,
  daily_global_log
 }
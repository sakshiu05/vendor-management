// 'use strict';
const interviewScheduleModel = require('../models/interviewSchedule').interviewSchedule;
const resultModel = require('../models/interviewResult').interviewResult;
// const Resource = require("../resource/resource.model").Resources;
const Resource = require("../models/resource").Resources;
const resourceAttendence = require("../models/resourceAttendence").resourceAttendence;
const attendenceStatus = require("../models/attendenceStatus").attendenceStatus;
const FeedbackStatus = require("../models/feedback_status").feedbackstatus;
const Resource_logs = require("../models/resource_login_logs").resource_login_logs;
const Resource_log_timesheet_status = require("../models/resourceTimesheetStatus").resourceTimesheetStatus;
const Premium_logs = require("../common/logs_message");

let func = require("../common/commonfunction");
const { base64encode, base64decode } = require("nodejs-base64");
let Admin = require("../models/admin").Admin;
const moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

const addInterviewSchedule = async (req, res) => {

  const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
  const tokenInfo = func.decodeToken(usertoken);
  const interviewSchedule = new interviewScheduleModel();
  const data = req.body;

  if (!data.userId) {
    res.status(400).json({ "message": "Please enter userId." });
  }
  if (!data.clientName) {
    res.status(400).json({ "message": "Please enter clientName." });
  }
  if (!data.interviewDate) {
    res.status(400).json({ "message": "Please enter interviewDate." });
  }


  try {
    var client_res = await Admin.findOne({ name: data.clientName, isDelete: false }, { _id: 1 });
    if (!client_res) {
      res.status(400).json({ "message": "Client Not exist" });
    }
    let resourceInfoData = await Resource.find({ _id: data.userId });
    //console.log("",ObjectId(resourceInfoData[0].techStack[0]));

    interviewSchedule.clientName = data.clientName.toLowerCase();
    interviewSchedule.client_id = client_res._id;
    interviewSchedule.interviewDate = data.interviewDate;
    interviewSchedule.addedBy = tokenInfo.sub;
    interviewSchedule.addedTo = data.userId;
    interviewSchedule.meetingLink = data.meetingLink;
    interviewSchedule.techStack = ObjectId(resourceInfoData[0].techStack[0]);

    let formdata = {
      clientName: data.clientName.toLowerCase(),
      client_id: client_res._id,
      interviewDate: data.interviewDate,
      addedBy: tokenInfo.sub,
      addedTo: data.userId,
      meetingLink: data.meetingLink,
      techStack: ObjectId(resourceInfoData[0].techStack[0])
    };
    // return res.send(formdata);
    let findResponse = await interviewScheduleModel.find({ addedTo: interviewSchedule.addedTo, clientName: interviewSchedule.clientName, interviewDate: interviewSchedule.interviewDate });
    if (findResponse.length > 0) {
      return res.status(400).send({ message: "Interview schedule already added for this user.", status: false });
    } else {
      let addResponse = await interviewScheduleModel(formdata).save();

      //--------------to add logged in user info in log start-------------------//
      let log_data = {
        "user_id": res.userId,
        "message": "scheduledInterview",
        "action_for_id": data.userId,
        "action_to_id": client_res._id
      };
      Premium_logs.add_global_log(log_data);
      //--------------to add logged in user info in log end-------------------//

      if (!addResponse) {
        return res.status(400).send({ message: "Error in adding interview Schedule", status: false });
      } else {
        return res.status(200).send({ message: "Interview Schedule successfully added", status: true });
      }
    }

  } catch (error) {
    console.log(error)
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message, line: error.stack });
  }
}


const editInterviewSchedule = async (req, res) => {

  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
      const tokenInfo = func.decodeToken(usertoken);
      const interviewSchedule = new interviewScheduleModel();
      const data = req.body;
      const isodate = new Date().toISOString();

      if (!data.userId) {
        res.status(400).json({ "message": "Please enter userId." });
      }
      if (!data.clientName) {
        res.status(400).json({ "message": "Please enter clientName." });
      }
      if (!data.interviewDate) {
        res.status(400).json({ "message": "Please enter interviewDate." });
      }

      let find_client = await Admin.findOne({name : data.clientName});
      let find_response = await interviewScheduleModel.findOne({ _id: id }).sort({ createdAt: -1 });
      // console.log(find_response);
      if (find_response.length != 0) {
        interviewScheduleModel.updateOne(
          { _id: id },
          {
            $set: {
              clientName: data.clientName.toLowerCase(),
              interviewDate: data.interviewDate,
              meetingLink: data.meetingLink,
              addedBy: tokenInfo.sub,
              addedTo: data.userId,
              updatedAt: isodate

            },
          },
          function (err, resp) {
            if (err) {
              console.log(err)
              return res
                .status(400)
                .send({ message: "Bad Request", status: false });
            } else {

              //--------------to add logged in user info in log start-------------------//
              let log_data = {
                "user_id": res.userId,
                "message": "Modified",
                "action_for_id": data.userId,
                "action_to_id": find_client._id
              };
              Premium_logs.add_global_log(log_data);
              //--------------to add logged in user info in log end-------------------//

              return res
                .status(200)
                .send({ message: "Interview Re-Schedule successfully", status: true });
            }
          }
        );
      } else {
        return res.status(400).send({ message: "interview schedule not found", status: false });
      }

    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: "something went wrong", status: false });
  }
}

const getInterViewSchedule = async (req, res) => {
  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let find_response = await interviewScheduleModel.find({ addedTo: id }).sort({ createdAt: -1 }).lean();
      find_response = JSON.parse(JSON.stringify(find_response));
      if (find_response.length <= 0) {
        return res.status(200).send({ message: "Interview Schedule not Found", status: true, response: [] });
      } else {
        for (i = 0; i < find_response.length; i++) {
          let addedBy = await Admin.findOne({ _id: find_response[i].addedBy }, { _id: 1, name: 1 });
          // console.log(addedBy)
          if (addedBy != null) {
            find_response[i].added_by = addedBy;
          }
        }
        return res.status(200).send({ message: "Interview Schedule Found", status: true, response: find_response });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message, line: error.stack });
  }
}

const addInterviewResult = async (req, res) => {

  const data = req.body;

  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let formData = {};
      let interview_status ;
      if (!data.interviewStatus) {
        res.status(400).json({ "message": "Please enter interviewStatus." });
      } else {
        formData.interviewStatus = data.interviewStatus;
      }
      if (!data.resourceId) {
        res.status(400).json({ "message": "Please enter resourceId" });
      } else {
        formData.resourceId = data.resourceId;
      }
      if (!req.file) {
        return res.status(400).send({ message: "Please enter the resource screenshot", status: false });
      } else {
        if (req.file.fieldname == "qualifying_screenshot") {
          data.qualifying_screenshot = req.file.location;
          formData.qualifying_screenshot = req.file.location;
        }
      }
      if (data.comment) {
        formData.comment = data.comment;
      }
      if (data.clientPrice) {
        formData.clientPrice = data.clientPrice;
      }

      let find_response = await interviewScheduleModel.findOne({ _id: id });

      // {
      //   // data
      //    interviewStatus : data.interviewStatus,
      //   comment : data.comment,
      //   clientPrice : data.clientPrice,
      //   qualifying_screenshot : data.qualifying_screenshot
      //   // rating  : data.rating,    
      // }
      let client_data = await interviewScheduleModel.findOne({ _id: id }).select("clientName");
      let client_ki_id = await Admin.findOne({ name: client_data.clientName }).select("_id");
      formData.client_id = client_ki_id._id;
      if (find_response) {
        let int_res = await interviewScheduleModel.updateOne({ _id: id }, { $set: formData }); //console.log(formData)
        if (int_res) {
          if (data.interviewStatus == "Hired") {
            let updateIsHired = await Resource.updateOne({ _id: data.resourceId }, { $set: { isHired: true } })
          }
          else {
            let updateIsHired = await Resource.updateOne({ _id: data.resourceId }, { $set: { isHired: false } })
          }
          
          //--------------to add logged in user info in log start-------------------//
          let log_data = {
            "user_id": res.userId,
            "message": "Hired",
            "action_for_id": data.resourceId,
            "action_to_id": client_ki_id._id
          };
          Premium_logs.add_global_log(log_data);
          //--------------to add logged in user info in log end-------------------//

          return res.status(200).send({ message: "Status Changed successfully", status: true });
        } else {
          return res.status(400).send({ message: "Error in updating", status: false });
        }
        // interviewScheduleModel.updateOne(
        //   { _id: id },
        //   {
        //     $set: formData,
        //   },
        //    async function (err, resp) {
        //     if (err) {
        //       console.log(err)
        //       return res
        //         .status(400)
        //         .send({ message: "Bad Request", status: false });
        //     } else {
        //       return res.status(200).send({
        //         message: "Status Changed successfully",
        //         status: true,
        //       });
        //     }
        //   }
        // );
      } else {
        return res.status(400).send({ message: "interview schedule not found", status: false });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }

  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

const cancelInterview = async (req, res) => {

  const data = req.body;

  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let find_response = await interviewScheduleModel.findOne({ _id: id })
      if (find_response.length != 0) {
        interviewScheduleModel.updateOne(
          { _id: id },
          {
            $set: {
              interviewStatus: 'Cancelled',
            },
          },
          function (err, resp) {
            if (err) {
              console.log(err)
              return res
                .status(400)
                .send({ message: "Bad Request", status: false });
            } else {

              //--------------to add logged in user info in log start-------------------//
              let log_data = {
                "user_id": res.userId,
                "message": "cancelInterview",
                "action_for_id": find_response.addedTo,
                "action_to_id": find_response._id
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
      } else {
        return res.status(400).send({ message: "interview schedule not found", status: false });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }

  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}

const getClientName = async (req, res) => {
  try {
    let find_response = await interviewScheduleModel.distinct("clientName");
    if (find_response.length <= 0) {
      return res.status(400).send({ message: "Client name not found", status: false });
    } else {
      return res.status(200).send({ message: "Client name Found", status: true, response: find_response });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error });
  }
}


/**
 * Created By: Shubham Kumar
 * Created At : 19-04-2022
 * Desc : To show shedule interview info
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getSheduledInterviewInfo = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: "Id not found", status: false });
    }
    let interview_id = base64decode(req.params.id);

    let resource_interview_info = await interviewScheduleModel.findOne({ _id: interview_id });
    if (!resource_interview_info) {
      return res.status(400).send({ message: "Error! No interview Found", status: false });
    }
    let addedByData = await Admin.findOne({ _id: resource_interview_info.addedBy }, { name: 1 });
    resource_interview_info = JSON.parse(JSON.stringify(resource_interview_info));
    resource_interview_info.added_by_person = addedByData.name;
    let responseData = {
      resource_interview_info
    }
    return res.status(200).send({ message: "Client name Found", status: true, "responseData": responseData });
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}


/***
 * Created By : Shubham Kumar
 * Desc : To change intervierw status to reject
 * Created Date : 19-04-2022
 * Function : rejectResource
 */

const rejectResource = async (req, res) => {

  const data = req.body;

  try {
    if (req.params.id) {
      let id = base64decode(req.params.id);
      let data = req.body;
      let find_response = await interviewScheduleModel.findOne({ _id: id }).sort({ createdAt: -1 });
      let find_client = await Admin.findOne({_id : find_response.client_id}).select("_id name");
      if (find_response.length != 0) {
        interviewScheduleModel.updateOne(

          { _id: id },

          {
            $set: {
              interviewStatus: 'Rejected',
              comment: data.comment
            },
          },
          function (err, resp) {
            if (err) {
              return res
                .status(400)
                .send({ message: "Bad Request", status: false });
            } else {

              //--------------to add logged in user info in log start-------------------//
              let log_data = {
            "user_id": res.userId,
            "message": "Rejected",
            "action_for_id": find_response.addedTo,
            "action_to_id": find_client._id
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
      } else {
        return res.status(400).send({ message: "interview schedule not found", status: false });
      }
    } else {
      return res.status(400).send({ message: "Id not found", status: false });
    }

  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}



/***
 * Created By: Shubham Kumar
 * Created At: 20-04-2022
 * Desc: 
 * Function: clientResourceTimeSheet 
 * Api: client-resource-timesheet
 */
const clientResourceTimeSheet = async (req, res) => {
  const per_page = 10;
  let page = req.query.page ? req.query.page : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
  let offset = req.query.offset ? req.query.offset : limit * (page - 1);
  offset = parseInt(offset);
  let today = new Date();
  let current_month = today.getMonth() + 1;
  let current_year = today.getFullYear;
  try {
    if (!req.params.id) {
      return res.status(400).send({ message: "Error! Please provide id", status: false });
    }
    let resource_id = base64decode(req.params.id);

    let mainArr = []; let final_arr = [];

    //---------------------- Start --------------------------------------------------//  
    //Get resource Month and Year wise
    let resource_info = await resourceAttendence.aggregate([
      { $match: { 'resource_id': ObjectId(resource_id) } },
      {
        "$group": {
          "_id": { "month": { "$month": "$date" }, "year": { "$year": "$date" } },
          "data": { "$push": "$$ROOT" },
          "count": { $sum: 1 }
        }
      },
      { "$sort": { "month": -1, "year": -1 } },
    ]);

    let last_arr = [];
    //Monthly wise resource and its attendence info
    for (let p = 0; p < resource_info.length; p++) {
      let temp_arr = {};
      temp_arr.resource_id = resource_id;
      temp_arr.month = resource_info[p]._id.month;
      temp_arr.year = resource_info[p]._id.year;
      temp_arr.data = [];

      //get distinct client month wise
      const client_count = {};
      resource_info[p].data.forEach(element => {
        client_count[element.client_id] = (client_count[element.client_id] || 0) + 1;
      });

      let unique_client_count = Object.keys(client_count).length;
      //To get client wise attandence 
      for (let c = 0; c < unique_client_count; c++) {
        let client_arr = {};
        client_arr.client_id = Object.keys(client_count)[c];
        let resource_logged_info = await Resource_logs.aggregate([
          {
            $match: {
              "resource_id": ObjectId(resource_id),

              "client_id": ObjectId(Object.keys(client_count)[c])
            }
          },
          {
            $lookup: { from: "admins", localField: "client_id", foreignField: "_id", as: "client_info" }
          },
          {
            $project: {
              "_id": 1, "description": 1, "date": 1, "status": 1, "createdAt": 1, "time_track": 1,
              "client_info._id": 1, "client_info.name": 1
            }
          }
        ]);
        //------------------calculate hrs start----------------------//

        let hr_spent = 0; let login_time; let logout_time;
        let only_logged_in = false; let only_logged_out = false;
        let total_time_track = 0;
        let current_date_time = new Date();
        // current_date_time.setHours(current_date_time.getHours() + 5);
        // current_date_time.setMinutes(current_date_time.getMinutes() + 30);

        //Get single logged-in/logged-out data client wise
        let flag = 1;
        for (let k = 0; k < resource_logged_info.length; k++) {
          if (resource_logged_info[k].description == "logged-out") {
            total_time_track += resource_logged_info[k].time_track;
          }
        }
        if (resource_logged_info[resource_logged_info.length - 1] && resource_logged_info[resource_logged_info.length - 1].description == "logged-in") {

          // if(resource_logged_info[0] && resource_logged_info[0].client_info && resource_logged_info[0].client_info.length !== 0){
          if (flag == 1) {
            client_arr.client_name = resource_logged_info[0].client_info[0].name;
            flag = 0;
          }
          // }

          let diffInHr = Math.floor(((current_date_time - resource_logged_info[resource_logged_info.length - 1].createdAt) % 86400000) / 3600000);
          let diffInMin = Math.round((Math.floor((current_date_time - resource_logged_info[resource_logged_info.length - 1].createdAt) % 86400000) % 3600000) / 60000);
          total_time_track = Number(total_time_track.toFixed(2));
          console.log(resource_logged_info[0]);
          total_time_track += parseInt(diffInHr);
          diffInMin = Number(diffInMin.toFixed(2));
          if (diffInMin / 60 > 0) {
            total_time_track += parseInt(diffInMin / 60);
            diffInMin = diffInMin % 60;
            total_time_track += Number('0.' + diffInMin);
          } else {
            total_time_track += Number('0.' + diffInMin);
          }
        }
        // if(resource_logged_info[0] && resource_logged_info[0].client_info && resource_logged_info[0].client_info.length !== 0){
        //   client_arr.client_name = resource_logged_info[0].client_info[0].name;
        // }
        //------------------calculate hrs end----------------------//
        total_time_track = total_time_track.toFixed(2);
        hours = parseInt(total_time_track.split(".")[0]);
        let min = total_time_track.split(".")[1];
        if (parseInt(min / 60) > 0) {
          hours += parseInt(min / 60);
        }
        minutes = total_time_track.split(".")[1] % 60;

        temp_arr.data = {
          "logged_hours": parseInt(hours),
          "logged_minutes": parseInt(minutes),
          "client_info": client_arr
        };
      }

      //--------time_sheet_status calculating Start-----------//
      let sheet_submitted = await Resource_log_timesheet_status.findOne({ 'resource_id': ObjectId(resource_id), month: temp_arr.month, year: temp_arr.year });
      if (sheet_submitted) {
        temp_arr.timesheet_submission_status = sheet_submitted.status;
      } else {
        if (temp_arr.year <= current_year) {
          if (temp_arr.month < current_month) {
            temp_arr.timesheet_submission_status = "-";
          } else {
            temp_arr.timesheet_submission_status = "submission-pending";
          }
        } else {
          temp_arr.timesheet_submission_status = "submission-pending";
        }
      }
      //--------time_sheet_status calculating End------------//
      final_arr.push(temp_arr);
    }
    // console.log(final_arr);
    //--------------------------------- End ------------------------------//
    let responseData = {
      "timesheet": final_arr
    }
    return res.status(200).send({ responseData, message: "Timesheet data found successfully", status: true });
  } catch (error) {
    console.log(error.stack);
    return res.status(400).send({ message: "Error! Something went wrong.", status: false, "error": error.message, "line": error.stack });
  }
}

/***
 * Created By:   Shubham Kumar
 * Created Date: 22-04-2022
 * Desc: To add feedback staus
 * API: add-feedback-status
 * Function : addFeedbackStatus
 */
const addFeedbackStatus = async (req, res) => {
  try {
    let data = req.body;
    if (!data.status) {
      return res.status(400).send({ message: "Please pass feedback status", status: false });
    }
    const feedbackStatus = new FeedbackStatus();
    feedbackStatus.status = data.status;
    feedbackStatus.alias_name = data.status;

    let is_exist = await FeedbackStatus.find({ "status": data.status }).countDocuments();
    if (is_exist > 0) {
      return res.status(400).send({ message: "Error! Status already exist", status: false });
    }
    let status_response = await new FeedbackStatus(feedbackStatus).save();
    if (!status_response) {
      return res.status(400).send({ message: "Error in adding status", status: false });
    } else {
      return res.status(200).send({ message: "Status added successfully!", status: true });
    }
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

/***
* Created By:   Shubham Kumar
* Created Date: 20-04-2022
* Desc: To see feedback status
* API: get-feedback-status
* Function : getFeedbackStatus
*/
const getFeedbackStatus = async (req, res) => {
  try {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);
    let feedbackStatus = await FeedbackStatus.find().select("_id status createdAt");
    let feedbackStatusCount = await FeedbackStatus.countDocuments();
    let responseData = {
      feedbackStatus,
      "total": feedbackStatusCount
    }
    return res.status(200).send({ message: "Status found successfully!", responseData, status: true });
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 27-04-2022
 * Updated By: Shubham Kumar
 * Created Date: 15-06-2022
 * Desc: To assign account manager via this hired resource to all resources of this resoucre client
 * Api: assign-account-manager
 * Function: assignAccountManager
 * @param {*} req 
 * @param {*} res 
 */
const assignAccountManager = async (req, res) => {
  try {
    let data = req.body;

    if (!data.resource_id)
      return res.status(400).send({ message: "Please enter resource-id", status: false });

    if (!data.account_manager_id)
      return res.status(400).send({ message: "Please select account manager.", status: false });

    let account_manger_admin = await Admin.findOne({ _id: data.account_manager_id, "role": { $in: ['account-manager', 'account-manager-admin'] } });
    if (account_manger_admin) {
      let client_info = await interviewScheduleModel.aggregate([
        { $match: { addedTo: ObjectId(data.resource_id), interviewStatus: "Hired" } },
        { $limit: 1 },
        {
          $lookup:
          {
            from: "admins",
            localField: "clientName",
            foreignField: "name",
            as: "client_data"
          }
        },
        {
          "$project": {
            "clientName": 1,
            //  "client_data":1,
            "client_data._id": 1,
            "client_data.email": 1,
            "client_data.name": 1
          }
        }
      ]);
      // console.log(client_info);
      let updates_resources_res = await Resource.updateOne({ _id: data.resource_id }, { $set: { account_manager: data.account_manager_id } });
      let assign_account_manager = await Admin.updateOne({ role: "client", _id: client_info[0].client_data[0]._id }, { $set: { accountManager: data.account_manager_id } });
      if (assign_account_manager.n > 0) {
          //--------------to add logged in user info in log start-------------------//
              let log_data = {
            "user_id": res.userId,
            "message": "assignedAM",
            "action_for_id": data.account_manager_id,
            "action_to_id": client_info[0].client_data[0]._id
             };
             Premium_logs.add_global_log(log_data);
          //--------------to add logged in user info in log end-------------------//

        return res.status(200).send({ message: "Account manager assigned successfully.", status: true });
      } else {
        return res.status(400).send({ message: "Error while assigning account manager.", status: false });
      }
    } else {
      return res.status(400).send({ message: "Invalid account manager id.", status: false });
    }

  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message, 'line': error.stack });
  }
}

// /**
//  * Created By: Shubham Kumar
//  * Created Date: 27-04-2022
//  * Desc: To get all clients and save in db
//  * Api: 
//  * Function: 
//  * @param {*} req 
//  * @param {*} res 
//  */
//  exports.assignAccountManager = async (req, res) => {
//   try{

//   }catch(error){
//     return res.status(400).send({ "error": error.message, message: "Something went wrong", status: false });
//   }
// }

/**
 * Created By: Shubham Kumar
 * Created Date: 27-04-2022
 * Desc: Role Testing
 * Api: role_testing
 * Function: role_testing
 * @param {*} req 
 * @param {*} res 
 */
const role_testing = async (req, res) => {
  try {
    res.send("run");
  } catch (error) {
    return res.status(400).send({ "error": error.message, message: "Something went wrong", status: false });
  }
}
const forzohotesting = async (req, res) => {
  try {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);
    let feedbackStatus = await FeedbackStatus.find().select("_id status createdAt");
    let feedbackStatusCount = await FeedbackStatus.countDocuments();
    let responseData = {
      feedbackStatus,
      "total": feedbackStatusCount
    }
    return res.status(200).send({ message: "Status found successfully!", responseData, status: true });
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 06-05-2022
 * API: client-hired-resouces
 * Function : clientHiredResouces/:id where id= client id
 * Desc: To display client hired resources
 */
const clientHiredResouces = async (req, res) => {
  if (!req.params.client_id) {
    return res.status(400).send({ message: "Resource Id not found", status: false });
  }
  try {
    let client_id = base64decode(req.params.client_id);
    let client_hired_resources = await interviewScheduleModel.aggregate([
      { $match: { interviewStatus: "Hired", "client_id": ObjectId(client_id) } },

      //commented bcz not working
      // {$lookup:
      //   {
      //     from:"resources",
      //     localField:"addedTo",
      //     foreignField:"_id.str",//to match id and string ex: _id.str
      //     as: "resourceInfo"
      //   }
      // },

      //   {$lookup:
      //     {from:"feedbacks",
      //     localField:"addedTo",
      //     foreignField:"_id",
      //     as: "resourceInfo"}
      // },

      {
        "$project": {
          "clientName": 1, "client_id": 1, "addedTo": 1,//addedTo is resource
          // "resourceInfo._id":1, "resourceInfo.name":1, "resourceInfo.techStack":1, "resourceInfo.experiance":1, "resourceInfo.vendorId":1, "resourceInfo.price":1, 
        }
      }
    ])

    for (let i = 0; i < client_hired_resources.length; i++) {
      let hiredResources = await Resource.findOne({ _id: ObjectId(client_hired_resources[i].addedTo) }).select("_id name techStack experiance vendorId price");
      client_hired_resources[i].resourceId = hiredResources._id;
      client_hired_resources[i].clientName = hiredResources.name;
      client_hired_resources[i].clientExperiance = hiredResources.experiance;
      client_hired_resources[i].clientPrice = hiredResources.price;
      client_hired_resources[i].clientVendrorId = hiredResources.vendorId;
      client_hired_resources[i].resourceTech = hiredResources.techStack;
    }
    let responseData = {
      client_hired_resources
    }
    return res.status(200).send({ responseData, message: "Status found successfully!", status: true });
  } catch (error) {
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}



/**
 * Created By: Shubham Kumar
 * Created Date: 09-05-2022
 * API: 
 * Function : addClientIdInInterviewSchedulesColl 
 * Desc: to add client id object by checking from admin coll by client name
 *///incomplete
const addClientIdInInterviewSchedulesColl = async (req, res) => {
  try {
    let interviewShecheduleClient = await interviewScheduleModel.aggregate([
      { $limit: 10 },
      {
        $lookup:
        {
          from: "admins",
          localField: "client_id",
          foreignField: "_id",
          as: "clientInfo"
        },
      },
      {
        "$project": {
          "interviewschedules": 1,
          "clientInfo": 1
        }
      }
    ])
    let responseData = {
      interviewShecheduleClient
    }
    return res.status(200).send({ message: "data found successfully", responseData, status: true });
  } catch (error) {
    return res.status(400).send({ message: "Error aa gai", status: false, error: error.message });
  }
}



/**
 * Created By: Shubham Kumar
 * Created Date: 09-05-2022
 * API: 
 * Function : ClientTeam 
 * Desc: 
 *///incomplete
const ClientTeam = async (req, res) => {
  try {

  } catch (error) {

  }
}


module.exports = {
  addInterviewSchedule,
  editInterviewSchedule,
  getInterViewSchedule,
  addFeedbackStatus,
  getFeedbackStatus,
  assignAccountManager,
  role_testing,
  forzohotesting,
  addInterviewResult,
  cancelInterview,
  getSheduledInterviewInfo,
  rejectResource,
  addClientIdInInterviewSchedulesColl,
  clientHiredResouces,
  clientResourceTimeSheet,
  getClientName,
  ClientTeam
}
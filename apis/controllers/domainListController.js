// 'use strict';
const { base64decode } = require("nodejs-base64");
let domain_list = require("../models/domain_list").domainListAuth;
const Resources = require("../models/resource").Resources;
let InterviewSchedule = require("../models/interviewSchedule").interviewSchedule;
let Common = require("../common/commonfunction");

/***
 * Created By: Shubhankar Kesharwani
 * Created At: 25-05-2022
 * Desc: To add domain list
 * Function : AddDomain_list
 * Api: /add-domain-list
 * Updated by - NA
 * Updated on - NA
 */

 const AddDomainList = async (req, res) => {
    try {
      let data = req.body; 
      if (!data.domain) {
        return res.status(400).send({ message: "Please enter domain..! ", status: false });
      }
      if(req.file.location){
        data.domain_image = req.file.location; 
      }
      
      let domainLIstData = await domain_list(data).save();
  
      if (domainLIstData) {
        return res.status(200).send({ message: "Domain added successfully..!", status: true });
      }
      else {
        return res.status(400).send({ message: "Error in domain data, not added", status: false });
      }
  
  
    }
    catch (error) {
      return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
  }



/***
 * Created By: Shubhankar Kesharwani
 * Created At: 25-05-2022
 * Desc: To get domain list
 * Function : GetDomain_list
 * Api: /get-domain-list
 * Updated by - NA
 * Updated on - NA
 */

 const GetDomainList = async (req, res) => {
    try {
      let domainLIstData = await domain_list.find();
      let responseData = {
        domainLIstData
    }
  
      if (domainLIstData) {
        return res.status(200).send({responseData, message: "DomainList get successfully..!", status: true });
      }
      else {
        return res.status(400).send({ message: "Error in domain data, not fetched", status: false });
      }
  
  
    }
    catch (error) {
      return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
  }

/**
 * Created By: Shubham Kumar
 * Created Date: 25-05-2022
 * Desc: To test socket
 * API: socket-testing
 * Function: socketTesting 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const socketTesting = async (req, res) => {
  try{
    // req.io.emit("new-message", { content: req.body.content });
    return res.send({ success: true });
  }
  catch(error){
    return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
  }
}

/**
 * Created By: Shubham Kumar
 * Created Date: 02-06-2022
 * Desc: Sendgrid mail testing
 * API: sendgrid-testing
 * Function: sendgridTesting 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const sendgridTesting = async (req, res) => {
  try{
    let data = req.body;
    if(!data.email){
      return res.status(400).send({ message: "Please pass email id", status: false});
    }
    if(!data.name){
      return res.status(400).send({ message: "Please pass name", status: false});
    }
    let pugfilename = "demo.pug";

    Common.mailSend(
      data.email,//To
      "Confirm Your Email",//Subject
      { name: data.name },//Data
      pugfilename//template name
    );
    return res.status(200).send({ message: "Email send successfully", status: true});
  }
  catch(error){
    console.log(error.stack)
    return res.status(400).json({ message: "Something went wrong", status: false, error: error.message });
  }
}

const routeTesting = async (req, res) => {
  let resources = await Resources.aggregate([
    {$limit : 10},
    {
      $lookup : {
        from : 'admins',
        let : {resource_ki_id : '$_id'},
        pipeline : [{
          $match : { 
            $expr: { $eq: ["$resource_id", "$$resource_ki_id"],
            },
          }
        }],
        as : 'resource_data'
      }
    },
    {$unwind: {path: '$resource_data',
               preserveNullAndEmptyArrays: false
    },
  },
    {
      $project: {
        'name':1, 'resource_ki_id' : '$resource_data._id', 'resource_login_email': '$resource_data.email'
      }
    }
  ]);

  // let interview_scheduled_resources = await InterviewSchedule.aggregate([
  //   {$limit:10},

    
  // ]);
  res.json(resources);
}
const routeTesting1 = async (req, res) => {
  res.send("hehe");
}

const cronFunction = async (req, res) => {
  try{
    let pugfilename = "otp.pug";
    Common.multiMailSend('shubham.k@engineerbabu.in',"Supersourcing Premium",{ 'name': 'Shubham Kumar', 'otp': "Your account is hacked. He hahahaha" },pugfilename,['ramu.v@supersourcing.com','shubhankar.k@engineerbabu.in']);
    // console.log("cron function testing");
  }catch(error){
    console.log(error.message)
  }
}
const aws_with_folder = async(req,res)=> {
  try{
    if(req.file.location){
      // data.domain_image = req.file.location; 
      console.log(req.file.location);
    }
    return res.send("file uplaod with folder name");
  }catch(error){
    console.log(error.message);
    return res.send("error");
  }
}

/***
 * Created By: Shubhankar Kesharwani
 * Created At: 19-05-2022
 * Desc: To update teckskill in resources table , on relation with skill_set_lists
 * Function : AddclientTeckStackId
 * Api: AddclientTeckStackId
 * Updated by - NA
 * Updated on - NA
 */
const ObjectId = require("mongodb").ObjectID;
 
 const skill_set_list = require("../models/skill_set_list").skill_set_list;

 const AddclientTeckStackId = async (req, res) => {            
  try {
     var resourceInfoData = await Resources.find({_id:ObjectId("62ba95e6830d78c713852cd1")}).select("_id techStack");
     for (let j = 0; j < resourceInfoData.length; j++) { 
       for (let i = 0; i < resourceInfoData[j].techStack.length; i++) {
          var skillSetListData = await skill_set_list.findOne({ skill: resourceInfoData[j].techStack[i].toLowerCase() }).select("_id skill");
          console.log(skillSetListData)
          if (skillSetListData !== null) {
            let abc = await Resources.updateOne(
              { _id: resourceInfoData[j]._id },
              { $set: { [`techStack.${i}`]: ObjectId(skillSetListData._id) } });
          } 
        }
      }
 
     let responseData = {
       resourceInfoData, message: "User Detail get successfully", status: true
     }
 
       if (!resourceInfoData) {
         return res.status(400).send({ message: "Error in user id..!", status: false });
       } else {
        
         return res.status(200).send(responseData );
       } 
   }
   catch (error) {
     return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
   }
  }

module.exports = {
  AddDomainList,
  GetDomainList,
  socketTesting,
  sendgridTesting,
  cronFunction,
  routeTesting,routeTesting1,
  aws_with_folder,
  AddclientTeckStackId,
}
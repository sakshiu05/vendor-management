// 'use strict';
const moment = require("moment");
const { base64encode, base64decode } = require('nodejs-base64');
let resourceAttendence = require("../models/resourceAttendence").resourceAttendence;
let AttendenceStatus = require("../models/attendenceStatus").attendenceStatus;
// let Resource = require("../resource/resource.model").Resources;
const Resources = require("../models/resource").Resources;
let func = require("../common/commonfunction");

/***
 * Created By:   Shubham Kumar
 * Created Date: 20-04-2022
 * Desc: To add attendence staus
 * API: add-attendence-status
 * Function : addAttendenceStatus
 */
const addAttendenceStatus = async (req, res) => {
    try{
        let data = req.body;
        if(!data.status){
            return res.status(400).send({ message: "Please pass attendence type", status: false});    
        }
        const attendenceStatus = new AttendenceStatus();
        attendenceStatus.status = data.status;
        attendenceStatus.alias_name = data.status;
        let status_response = await new AttendenceStatus(attendenceStatus).save();
        if (!status_response) {
            return res.status(400).send({ message: "Error in adding status", status: false });
          } else {
            return res.status(200).send({ message: "Status added successfully!", status: true });
          }
    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });        
    }
}

/***
 * Created By:   Shubham Kumar
 * Created Date: 20-04-2022
 * Desc: To see attendence status
 * API: get-attendence-status
 * Function : getAttendenceStatus
 */
const getAttendenceStatus = async (req, res) => {
    try{
        const per_page = 10;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);
        let attendenceStatus = await AttendenceStatus.find().select("_id status alias_name createdAt");
        let attendenceStatusCount = await AttendenceStatus.countDocuments();
        let responseData = {
            attendenceStatus,
            "total" : attendenceStatusCount
        }
        return res.status(200).send({ message: "Status found successfully!",responseData, status: true });
    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });        
    }
}

/***
 * Created By:   Shubham Kumar
 * Created Date: 20-04-2022
 * Desc: To add resource attendence
 * API: add-resource-attendance
 * Function : addAttendence
 */
const addAttendence = async (req, res) => {
    try{
        const usertoken = JSON.parse(JSON.stringify(req.headers.authorization)).split(' ')[1];
        const tokenInfo = func.decodeToken(usertoken);

        let data = req.body;//required: client_id,resource_id,date,status,attendence_marked_by,comment
        let attencenceData = await resourceAttendence.find({"resource_id":data.resource_id, "client_id":data.client_id,"date":data.date });
        let attendence_status_info = await AttendenceStatus.find({ status: { $in: ['PL: Planned leave','ML: Maternity leave' ] } }).select("_id status");

        if(data.to_date && (data.status == attendence_status_info[0]._id || data.status == attendence_status_info[1]._id) ){
            let from_date = moment(data.date).format("YYYY-MM-DD")
            let to_date = moment(data.to_date).format("YYYY-MM-DD")
            attencenceData = await resourceAttendence.find({"resource_id":data.resource_id, "client_id":data.client_id, date: {$gte:from_date, $lt:to_date}  })
        }
        if(attencenceData.length > 0){
            return res.status(400).send({ message: "Error! Attendence already exist.", status: false });    
        }else{
            let attendenceResponse;
            data.attendence_marked_by = tokenInfo.sub;//admin's id
            if(data.to_date && (data.status == attendence_status_info[0]._id || data.status == attendence_status_info[1]._id) ){
                let temp = {}; let mainArr = [];
                let start_date = moment(data.date).format("YYYY-MM-DD")
                let end_date = moment(data.to_date).format("YYYY-MM-DD")
                let new_start_date = new Date(data.date);
                let new_end_date = new Date(data.to_date);
                while(new_start_date.getTime() <= new_end_date.getTime()){
                    let temp = {};
                    temp.resource_id = data.resource_id;
                    temp.client_id = data.client_id;
                    temp.date = moment(new_start_date).format("YYYY-MM-DD");
                    temp.status = data.status;
                    temp.marked_by = data.marked_by;
                    if(data.comment){
                        temp.marked_by = data.marked_by;
                    }

                    mainArr.push(temp); 
                    new_start_date.setDate(new_start_date.getDate() + 1);
                    attendenceResponse = await new resourceAttendence(data).save();
                }
                // let attendenceResponse = await new resourceAttendence(data).save();//not working so added save above
            }else{
                attendenceResponse = await new resourceAttendence(data).save();
            }

            if (!attendenceResponse) {
                return res.status(400).send({ message: "Error in adding attencence", status: false });
            } else {
                return res.status(200).send({ message: "Attendence added successfully!", status: true });
            }
        }
    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
    }
} 

const updateAttendance = async(req,res)=>{
if(!req.params.id){
    return res.status(404).send({message : "Please enter the resource id", status : false});
}
 try{
     let id = base64decode(req.params.id);
     let client_data = await resourceAttendence.find({resource_id : id}).sort({createdAt : -1});
    //  console.log(client_data);
     return res.status(200).send({message : "Resource attendance found", status : true});
 }
 catch(error){
     return res.status(400).send({message: "Something went wrong", status : false, error : error.message})
 }

}


/***
 * Created By:   Shubham Kumar
 * Created Date: 20-04-2022
 * Desc: To see resource attendence by resource id
 * API: show-resource-attendance/:id
 * Function : showResourceAttendence
 */
const showResourceAttendence = async (req, res) => {
    try{
        const per_page = 10;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);

        if(!req.params.id){
            return res.status(400).send({ message: "Please pass id", status: false});    
        }
        let resource_id = base64decode(req.params.id);
        let attencenceData = await resourceAttendence.find({"resource_id":resource_id})
            .sort({createdAt: -1})
            .skip(offset)
            .limit(limit);
        
        let attencenceCount = await resourceAttendence.countDocument({"resource_id":resource_id});
        let responseData = {
            attencenceData,
            "total": attencenceCount
        }
        return res.status(200).send({ message: "Data found successfully!",responseData, status: true });

    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
    }

}

/***
 * Created By:   Shubham Kumar
 * Created Date: 21-04-2022
 * Desc: To see resource attendence by resource id and client id
 * API: client-resource-attendance/:id
 * Function : clientResourceAttendence 
 */
 const clientResourceAttendence = async (req, res) => {
    try{
        const per_page = 10;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);
        
        let today = new Date();
        let currentMonth = moment(today).format("MM");
        let startDate = moment(today).startOf('month').format("YYYY-MM-DD HH:mm:ss");
        let endDate = moment(today).endOf('month').format("YYYY-MM-DD HH:mm:ss");

        if(!req.params.id){
            return res.status(400).send({ message: "Please pass id", status: false});    
        }

        if(req.query.start_date && req.query.start_date!= null && req.query.end_date && req.query.end_date != null){
            startDate = req.query.start_date;
            endDate = req.query.end_date;
        }
        let resource_id = base64decode(req.params.id);
        let attencenceData = await resourceAttendence.find({"resource_id":resource_id, date:{$gte:startDate, $lte:endDate} })
        /* let testingData = await resourceAttendence.aggregate([
                    {
                        $lookup:
                        {
                            from: 'attendencestatuses',
                            localField: 'status',
                            foreignField: '_id',
                            as: 'S'
                        }
                    }, 
                    {$unwind: "$S"}
                ])           
        console.log(testingData); */
        // .populate({path : 'resource_attendence_status',model:'attendenceStatus'}) //,"client_id":client_id
        attencenceData = JSON.parse(JSON.stringify(attencenceData));
        for(let i=0; i<attencenceData.length; i++){
            let resourceName = await Resource.findOne({_id:attencenceData[i].resource_id}).select("name");
            let attendenceStatusName = await AttendenceStatus.findOne({_id:attencenceData[i].status}).select("status");

            attencenceData[i].resource_name = resourceName.name;
            attencenceData[i].attendence_status = attendenceStatusName.status; 
            if(attendenceStatusName.status == "PH: Public holiday" || attendenceStatusName.status == "CH: Company holiday" || attendenceStatusName.status == "LWD: Last working day" || attendenceStatusName.status == "P: Present" || attendenceStatusName.status == "NH: National holiday"){
                attencenceData[i].display_status = "Present";
            }
            else if(attendenceStatusName.status == "EOC: End of contract" || attendenceStatusName.status == "UL: Unplanned leave" || attendenceStatusName.status == "PL: Planned leave" || attendenceStatusName.status == "ML: Maternity leave"){
                attencenceData[i].display_status = "Absent";
            }
            else if(attendenceStatusName.status == "HD(UL): Half-day unplanned leave"){
                attencenceData[i].display_status = "Absent";
                attencenceData[i].half_day_status = "Half-day-unplanned-leave";
            }
            else if(attendenceStatusName.status == "HD(PL):Half-day planned leave"){
                attencenceData[i].display_status = "Absent";
                attencenceData[i].half_day_status = "Half-day-planned-leave";
            }
        }

        let attencenceCount = await resourceAttendence.countDocuments({"resource_id":resource_id, date:{$gte:startDate, $lte:endDate}});
        let responseData = {
            attencenceData,
            "total": attencenceCount
        }
        return res.status(200).send({ message: "Data found successfully!",responseData, status: true });

    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, "error": error.message });
    }

}


module.exports = {
    addAttendenceStatus,
    getAttendenceStatus,
    addAttendence,
    updateAttendance,
    showResourceAttendence,
    clientResourceAttendence
}
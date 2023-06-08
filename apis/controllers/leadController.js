// 'use strict';
const { base64encode, base64decode } = require('nodejs-base64');

const leads = require("../models/lead").leads;
const leadStatus = require("../models/leadStatus").leadStatus;
const icp_pointers = require("../models/icp_pointers").icp_pointers;
let Admin = require("../models/admin").Admin;
const leadLog = require("../models/lead_logs").leadLog;
const AdminLogs  = require("../models/adminLog").adminLog;
const skill_set_lists = require("../models/skill_set_list").skill_set_list;
const ObjectId = require("mongodb").ObjectID;
// const Resources = require("../resource/resource.model").Resources;
const Resources = require("../models/resource").Resources;

/**Created By: Sakshi Uikey
 * Created Date: 15-06-2022
 * Desc: To add new leads
 * API: /create-leads
 * Function: createLead
 */

const createLead = async (req, res) => {
    try {
        let data = req.body;
        let leads_arr = [];

        if (!data.leads) {
            return res.status(400).send({ message: "Please enter the leads", status: false });
        }
        if (data.leads.length == 0) {
            return res.status(400).send({ message: "Leads is empty", status: false });
        }
        for (i = 0; i < data.leads.length; i++) {
            if (!data.leads[i].client_name) {
                return res.status(400).send({ message: "Please enter the client name", status: false });
            }
            if (!data.leads[i].lead_title) {
                return res.status(400).send({ message: "Please enter the lead title", status: false });
            }
            if (!data.leads[i].job_description) {
                return res.status(400).send({ message: "Please enter the job description", status: false });
            }
            if (!data.leads[i].amount) {
                return res.status(400).send({ message: "Please enter the amount", status: false });
            }
            if (!data.leads[i].developer_required) {
                return res.status(400).send({ message: "Please enter the number of developer required", status: false });
            }
            if (!data.leads[i].techStack) {
                return res.status(400).send({ message: "Please enter the techstack", status: false });
            }
            if (!data.leads[i].experiance) {
                return res.status(400).send({ message: "Please enter the experiance", status: false });
            }
            if (!data.leads[i].assign_to) {
                return res.status(400).send({ message: "Please enter the assigned sales manager", status: false });
            }

            let client = await Admin.findOne({ name: data.leads[i].client_name });
            let leads_data = {};
            leads_data["client_name"] = data.leads[i].client_name.toLowerCase(),
                leads_data["lead_title"] = data.leads[i].lead_title.toLowerCase(),
                leads_data["job_description"] = data.leads[i].job_description.toLowerCase(),
                leads_data["amount"] = data.leads[i].amount,
                leads_data["developer_required"] = data.leads[i].developer_required,
                leads_data["techStack"] = data.leads[i].techStack,
                leads_data["experiance"] = data.leads[i].experiance,
                leads_data["assign_to"] = data.leads[i].assign_to,
                leads_data["client_id"] = client._id

            // let qualified_lead = await leadStatus.findOne({status : "ICP Qualified"}).select("_id");
            // let new_lead = await leadStatus.findOne({status : "New Leads"}).select("_id");
            if (client.icp_status == true) {
                leads_data["lead_status"] = "62a9dcd8c59fc401900ee486";
            }
            else {
                leads_data["lead_status"] = "62a9c2994832a81a59e2f6b5";
            }

            leads_arr.push(leads_data);
        }
        let leads_response = await leads.insertMany(leads_arr);
        if (leads_response) {
            return res.status(200).send({ message: "Lead created successfully", status: true });
        }
        else {
            return res.status(400).send({ message: "Error, while saving the leads", status: false });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}



/**Created By: Sakshi Uikey
 * Created Date: 15-06-2022
 * Desc: To add icp pointers 
 * API: /add-icp
 * Function: icpPointers
 */

const icpPointers = async (req, res) => {
    try {
        let data = req.body;
        if (!data.status) {
            return res.status(400).send({ message: "Please enter the  ICP status", status: false });
        }
        if (!data.type) {
            return res.status(400).send({ message: "Please enter the type of ICP", status: false });
        }
        let icp = {
            status: data.status,
            type: data.type
        }
        let response = await icp_pointers(icp).save();
        if (!response) {
            return res.status(400).send({ message: "Error,while saving the icp", status: false });
        }
        else {
            return res.status(200).send({ message: "ICP saved successfully", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/**Created By: Sakshi Uikey
 * Created Date: 15-06-2022
 * Desc: To get all icp pointers 
 * API: /get-icp
 * Function: geticpPointers
 */

const geticpPointers = async (req, res) => {
    try {
        const per_page = 10;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);

        let company_status = await icp_pointers.find({ status: "company_status" }).select("_id type");
        // let brand = await icp_pointers.find({status : "brand"}).select("_id type");
        let expected_revenue = await icp_pointers.find({ status: "expected_revenue" }).select("_id type");
        let no_of_interviews = await icp_pointers.find({ status: "no_of_interviews" }).select("_id type");
        let payment_cycle = await icp_pointers.find({ status: "payment_cycle" }).select("_id type");
        let turn_around_time = await icp_pointers.find({ status: "turn_around_time" }).select("_id type");

        let response = {
            company_status,
            // brand,
            expected_revenue,
            no_of_interviews,
            payment_cycle,
            turn_around_time
        }
        return res.status(200).send({ message: "ICP pointers found", status: false, response });

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**Created By: Sakshi Uikey
 * Created Date: 16-06-2022
 * Desc: To get list of all leads 
 * API: /get-leads
 * Function: getleads
 */

const getleads = async (req, res) => {
    try {
        const per_page = 10;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);

        let lead_data = await leads.find({ isDelete: false }).sort({ createdAt: -1 }).skip(offset).limit(limit);
        if (lead_data.length == 0 ) {
            return res.status(400).send({ message: "leads not found", status: false });
        }
        else {
            let response = {
                "lead_count": lead_data.length,
                lead_data,
            };
            return res.status(200).send({ message: "Leads found successfully", status: true, response });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**Created By: Sakshi Uikey
 * Created Date: 16-06-2022
 * Desc: To update leads 
 * API: /update-leads/:id
 * Function: updateLeads
 */

const updateLeads = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the icp id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let isoDate = new Date();
        let find_lead = await leads.findOne({ _id: id, isDelete: false });
        if (!find_lead) {
            return res.status(400).send({ message: "Lead not found", status: false });
        }
        else {
            let update_lead = await leads.updateOne(
                { _id: id },
                {
                    $set: data
                    //   lead_title : data.lead_title,
                    //   job_description : data.job_description,
                    //   amount : data.amount,
                    //   developer_required : data.developer_required,
                    //   techStack : data.techStack,
                    //   experiance : data.experiance,
                    //   assign_to : data.assign_to
                    //  }
                });

            if (!update_lead) {
                return res.status(400).send({ message: "Error, while updating leads", status: false });
            }
            else {
                leadLog_response = await leadLog({
                    lead_id : id,
                    updatedBy: res.userId,
                    updatedAt: isoDate,
                    role: res.userRole,
                    task: "lead-update",
                    data: data,
                }).save();
                return res.status(200).send({ message: "Leads updated successfully", status: true, update_lead });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**Created By: Sakshi Uikey
 * Created Date: 16-06-2022
 * Desc: To delete leads 
 * API: /delete-lead/:id
 * Function: deleteLeads
 */
const deleteLeads = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the lead id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let isoDate = new Date();
        let find_lead = await leads.findOne({ _id: id, isDelete: false });
        if (!find_lead) {
            return res.status(400).send({ message: "Lead not found", status: false });
        }
        else {
            let delete_lead = await leads.updateOne({ _id: id }, { isDelete: true });
            if (delete_lead) {
                leadLog_response = await leadLog({
                    lead_id : id,
                    updatedBy: res.userId,
                    updatedAt: isoDate,
                    role: res.userRole,
                    task: "lead-delete"
                }).save();
                return res.status(400).send({ message: "Lead deleted successfully", status: false, delete_lead });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


const addLeadStatus = async (req, res) => {

    try {
        let data = req.body;
        data.status = data.status.trim();
        let lead_status = await leadStatus.findOne({status:data.status});
        if(lead_status){
            return res.status(400).send({ message: "Status Already exist", status: false});
        }else{
            let countLeadStatus = await leadStatus.find().countDocuments();
            data.sequence_number = countLeadStatus + 1;
            let response = await leadStatus(data).save();
            if (response) { 
                return res.status(200).send({ message: "Lead Status saved successfully", status: true });
            }
            else {
                return res.status(400).send({ message: "Error, while saving the leads status", status: false });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

const getLeadStatus = async (req, res) => {

    try {
        let response = await leadStatus.find({isDeleteStatus:false}).select("_id status sequence_number").sort({sequence_number:1});
        if (response) {
            return res.status(200).send({ message: "Data found successfully", status: true ,response});
        }
        else {
            return res.status(400).send({ message: "Error, while saving the leads status", status: false });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**Created By: Shubham Kumar
 * Created Date: 15-06-2022
 * Desc:
 * API:
 * Function: 
 */
 const modifyClientLeadStatus = async (req, res) => {
    let data = req.body;
    try{
        if (!req.params.id) {
            return res.status(400).send({ message: "Please enter lead id", status: false });
        }
        if(!data.lead_status){
            return res.status(400).send({ message: "Please pass lead status", status: false });
        }
        
        let lead_status_id = await leadStatus.findOne({_id: data.lead_status, isDeleteStatus:false}).select("_id");
        if(!lead_status_id){
            return res.status(400).send({ message: "Invalid lead status send.", status: false });   
        }
        let lead_id = base64decode(req.params.id);
        let where = { _id: ObjectId(lead_id) };
        let update = {'lead_status':data.lead_status};
        let lead_info = await leads.aggregate([
            {$match: {_id:ObjectId(lead_id), isDelete:false} },
            {$limit: 1},
            {
                $lookup:
                    {
                        from: 'leadstatuses',
                        localField: 'lead_status',
                        foreignField: '_id',
                        as: 'lead_status_info'
                    }
            },
            {
                $lookup:
                    {
                        from: 'admins',
                        localField: 'client_id',
                        foreignField: '_id',
                        as: 'client_info'
                    }
            },
            {
                "$project":{
                    "_id":1, "lead_title":1,
                    "lead_status_info._id":1, 
                    "client_info.role":1
                }
            }
        ]);
        if(!lead_info){
            return res.status(400).send({ message: "Lead not exist.", status: false });
        }else{
            if(lead_info[0].lead_status_info[0]._id == "62a9ddb7e2ecf131b4bc463f" || lead_info[0].lead_status_info[0]._id == "62a9ddc0e2ecf131b4bc4643"){
                return res.status(400).send({ message: "Can't change lead status.", status: false });
            }else{
                let update_status = await leads.updateOne({ _id: lead_id },{$set: update });
                let leadLog_data = await leadLog({
                    lead_id : lead_id,
                    updatedBy: res.userId,
                    updatedAt: new Date(),
                    role: res.userRole,
                    task: "lead-update",
                    data: data,
                }).save();

                if(update_status){
                    if(lead_info[0].client_info[0].role == "pre-client" && data.lead_status == "62a9ddb7e2ecf131b4bc463f"){
                        let log_data = {
                            "updatedBy" : res.userId,
                            "updatedAt" : new Date(),
                            "role"      : res.userRole,
                            "task"      : "pre-client-update",
                            "data"      : {
                                            "role_changed_from" : "pre-client",
                                            "role_changed_to" : "client",
                                            "client_id"    : lead_info[0].client_info[0]._id,
                                            "data"         : new Date()
                                        }
                        }
                        let modifyClientRole = await Admin.updateOne({_id: lead_info[0].client_info[0]._id},{$set: {role:'client'} });
                        let client_logs_info = await AdminLogs(log_data).save();
                        
                    }
                }
                return res.status(200).send({ message: "Lead moved successfully", status: true});
            }
        }
    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, line: error.stack });      
    }
 }


/**Created By: Shubham Kumar
 * Created Date: 15-06-2022
 * Desc:
 * API:
 * Function: 
 */
 const statusWiseLead = async (req, res) => {
    try{
        const per_page = 20;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);

        let first_status = await leadStatus.findOne().select("_id status");
        let filter_status = first_status._id;
        if(req.query.status){
            first_status = await leadStatus.findOne({status: req.query.status}).select("_id status");
            filter_status = first_status._id;
        }

        condition = {};
        condition.isDelete = false;
        condition.lead_status = ObjectId(filter_status);
        if (req.query.search && req.query.search.length > 0) {
            condition.lead_title = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
        }        

        if (req.query.assign_to) {
            let sales_person = await Admin.findOne({_id:req.query.assign_to});
            if(sales_person){
                condition.assign_to = req.query.assign_to;
            }
        }

        if (req.query.technology) {
            let skill = await skill_set_lists.findOne({_id:req.query.technology});
            if(skill){
                condition.techStack = req.query.technology;
                
            }
        }
        // console.log(condition);
        let lead_info = await leads.aggregate([
            {$match: condition },
            // {$in: ['techStack', req.query.technology ]},
            {$limit : limit},
            {$skip : offset },
            {$sort: {createdAt: -1} },
            {
                $lookup: {
                    from: 'leadstatuses',
                    localField: 'lead_status',
                    foreignField: '_id',
                    as: 'status_info'
                }
            },
            {
                $lookup: {
                    from: 'skill_set_lists',
                    localField: 'techStack',
                    foreignField: '_id',
                    as: 'tech_info'
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
                "$project":{
                    "_id":1, "lead_title":1, "job_description":1, "amount":1, "developer_required":1, "experiance":1,
                    "createdAt":1,
                    "status_info._id":1, "status_info.status":1,
                    "tech_info._id":1, "tech_info.skill":1,
                    "client_info._id":1, "client_info.email":1, "client_info.name":1, "client_info.role":1
                }
            }
        ]);

        let new_leads = await leads.find({lead_status:"62a9c2994832a81a59e2f6b5"}).countDocuments();
        let icp_qualified_leads = await leads.find({lead_status:"62a9dcd8c59fc401900ee486"}).countDocuments();
        let interview_leads = await leads.find({lead_status:"62a9dda7e2ecf131b4bc463b"}).countDocuments();
        let won_leads = await leads.find({lead_status:"62a9ddb7e2ecf131b4bc463f"}).countDocuments();
        let lost_leads = await leads.find({lead_status:"62a9ddc0e2ecf131b4bc4643"}).countDocuments();
        let header_count = {
            "new":new_leads,
            "qualified":icp_qualified_leads,
            "interview":interview_leads,
            "won":won_leads,
            "lost":lost_leads
        };
        let responseData = {
            lead_info,
            header_count
        }
        return res.status(200).send({responseData, message: "Data found successfully", status: true});
        
    }catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message, line: error.stack });   
    }
 }

/**Created By: Sakshi Uikey
 * Created Date: 17-06-2022
 * Desc: To get all available resources according to lead requirement 
 * API: /get-available-lead-resource/:id
 * Function: getAvailableLeadResources
 */

const getAvailableLeadResources = async(req,res)=>{
 if(!req.params.id){
    return res.status(400).send({message : "Please enter the lead id", status : false});
 }
 try{
    let id = base64decode(req.params.id);
    let leads_res = await leads.findOne({_id : id, isDelete : false});
    if(!leads_res){
        return res.status(400).send({message : "Lead not found", status : false});
    }
    else{
        let resources = await Resources.find({isDelete : false, isHired: false, isPullBack : false, status : "Qualified", techStack : leads_res.techStack});
        let response = {
            "resource_count" : resources.length,
            resources
        }
        return res.status(200).send({message : "Available resources found sucessfully", response});
    }

 }
 catch(error){
    return res.status(400).send({message : "Something went wrong", status : false, error: error.message});
 }
}

/**Created By: Sakshi Uikey
 * Created Date: 17-06-2022
 * Desc: To get all lead logs according to months and years
 * API: /get-lead-logs
 * Function: getLeadLogs
 */

const getLeadLogs = async(req,res)=>{
   try{
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    let lead_logs = await leadLog.find().sort({createdAt : -1}).skip(offset).limit(limit);
    // let response = {
    //     "logs_count" : lead_logs.length,
    //     lead_logs
    // }
    let logs_data = await leadLog.aggregate([
        {"$group":{
          "_id":{"month":{"$month":"$createdAt"},"year":{"$year":"$createdAt"}},
          "lead_logs":{"$push":"$$ROOT"}
        }},
        {"$sort":{"month":-1,"year":-1}}
      ]);
    return res.status(200).send({message : "Logs found successfully", logs_data});
   }
   catch(error){
    return res.status(400).send({message : "Something went wrong", status : false, error: error.message});
   }
}

module.exports = {
    createLead,
    icpPointers,
    geticpPointers,
    getleads,
    updateLeads,
    deleteLeads,
    addLeadStatus,
    modifyClientLeadStatus,
    statusWiseLead,
    getLeadStatus,
    getAvailableLeadResources,
    getLeadLogs
}

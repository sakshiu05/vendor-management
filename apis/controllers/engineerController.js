// "use strict";

const { base64encode, base64decode } = require('nodejs-base64');
let func = require("../common/commonfunction");
let userAuth = require("../models/userAuth").userAuth;
var bcrypt = require("bcryptjs");
// const ExcelJs = require("exceljs");
const path = require("path");
var ObjectId = require('mongodb').ObjectID;

let Admin = require("../models/admin").Admin;
// const Resources = require("../resource/resource.model").Resources;
const Resources = require("../models/resource").Resources;
const engineerModel = require('../models/engineer_edu_info').engineer_edu_info;
const workDetailsModel = require('../models/engineer_work_details').workDetails
const projectDetailsModel = require('../models/project_details').projectDetails
const selfIntro = require("../models/enggSelfIntro").selfIntro
const basicQues = require("../models/basicQues").basicQues
const basicTestAns = require("../models/basicTestAnswer").basicTestAns
const skill_set_list = require("../models/skill_set_list").skill_set_list
const engineer_screening = require("../models/engineer_screening").engineer_screening

/***
 * Created By: Shubham Kumar
 * Created At: 22-04-2022
 * Desc: Signup engineer (indepedent resource)
 * Function : registerEngineer
 * Api: register-engineer 
 */
const registerEngineer = async (req, res) => {
    try {
        let data = req.body;
        let randomText = "engineer" + Math.floor(100000 + Math.random() * 900000);

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
        if (data.mobile_number) {
            if (!data.mobile_number.number) {
                return res.status(400).send({ message: "Please enter mobile number", status: false });
            }
            if (!data.mobile_number.internationalNumber) {
                return res.status(400).send({ message: "Please enter international number", status: false });
            }
            if (!data.mobile_number.nationalNumber) {
                return res.status(400).send({ message: "Please enter national number", status: false });
            }
            if (!data.mobile_number.e164Number) {
                return res.status(400).send({ message: "Please enter e16 number", status: false });
            }
            if (!data.mobile_number.countryCode) {
                return res.status(400).send({ message: "Please enter country number", status: false });
            }
            if (!data.mobile_number.dialCode) {
                return res.status(400).send({ message: "Please enter dialcode number", status: false });
            }
        }
        if (!data.password) {
            return res.status(400).send({ message: "Please enter password", status: false });
        } else if (data.password.length < 8 || data.password.length > 10) {
            return res.status(400).send({ message: "Password must be of 8 to 10 chacacters", status: false });
        }

        data.firstName = data.first_name.toLowerCase();
        data.lastName = data.last_name.toLowerCase();
        data.role = "engineer";
        data.phone = data.mobile_number.number;
        data.name = data.email;//data.firstName+ ' ' + data.lastName
        data.individualEnggPhoneNumber = data.mobile_number;

        delete data.first_name;
        delete data.last_name;
        delete data.mobile_number;
        // delete data.name;
        let adminData = await Admin.findOne({ $or: [{ email: data.email, role: "engineer" }, { phone: data.phone, role: "engineer" }] });
        // console.log(adminData);
        if (adminData) {
            return res.status(400).send({ message: "Error! Email Id or Mobile number already exist.", status: false });
        } else {
            let engineerData = await Admin(data).save();
            if (!engineerData) {
                return res.status(400).send({ message: "Error while registering engineer", status: false });
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
                                            message: "Data Found. Engineer registered successfully",
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

/***
 * Created By: Sakshi Uikey
 * Created At: 28-04-2022
 * Desc: To add engineer personal details (indepedent resource)
 * Function : addEnggDetails
 * Api: add-engineer-details 
 */

const addEnggDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the Engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let resume = req.body.resume;
        // let profileImage = req.body.profileImage;
        let engg_data = await Admin.findOne({ _id: id, isDelete: false }, { firstName: 1, lastName: 1, email: 1, phone: 1 });

        if (engg_data.length <= 0) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            if (!data.country) {
                return res.status(400).send({ message: "Please enter the country", status: false });
            }
            if (!data.location) {
                return res.status(400).send({ message: "Please enter the location", status: false });
            }
            if(!req.files.resume){
                res.status(404).json({message: "resume not uploaded", status: false});
            }
            if(req.files){
                if(req.files.resume && req.files.resume[0].fieldname == "resume"){
                    var resumeDocUrl = req.files.resume[0].location;
                }
                if(req.files.profileImage && req.files.profileImage[0].fieldname == "profileImage"){
                    var imageUrl = req.files.profileImage[0].location;
                }
            }
            /* if (resume) {
                var resumeDocUrl = "resourceResume/" + resume.replace('/\\/g', '/');
            }
            else if (!resume) {
                res.status(404).json({
                    message: "resume not uploaded",
                });
            }
            if (profileImage) {
                var imageUrl = "resourceImage/" + profileImage.replace('/\\/g', '/');
            } */
            let engg_details = {
                first_name: engg_data.firstName,
                last_name: engg_data.lastName,
                engineer_id: id,
                email: engg_data.email,
                mobile_number: engg_data.phone,
                // country: data.country,
                // location: data.location,
                resume: resumeDocUrl,
                profileImage: imageUrl,
                linkdinUrl: data.linkdinUrl
            }

            let engg_res = await workDetailsModel(engg_details).save();
            if (!engg_res) {
                return res.status(400).send({ message: "Engineer data not added", status: false });
            }
            else {
                return res.status(200).send({ message: "Engineer details added successfully", status: true });
            }
        }

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Updated By: shubham Kumar
 * Updated Date: 11-05-2022
 * Desc: To get all engineer list (indepedent resource)
 * Function : engineersList
 * Api: engineers-list
 */

const engineersList = async (req, res) => {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    try {
        let condition = {};
        condition["role"] = "engineer";
        if (req.query.search && req.query.search.length != 0) {
            // concat(client_details.first_name, ' ', client_details.last_name)
            condition["firstName"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
        }

        if(req.query.type == "draft"){
            // condition["firstName"] = 
        }
        else if(req.query.type == "Pending"){

        }
        else if(req.query.type == "Rejected"){

        }
        else if(req.query.type == "Qualified"){

        }
        else if(req.query.type == "Hired"){

        }
        else if(req.query.type == "Released"){

        }
        else if(req.query.type == "Pullback"){

        }else{

        }

            let engineer_data = await Admin.aggregate([
            { $match: condition },
            { $limit: limit },
            { $skip: offset },
            {
                $lookup: {
                    from: "workdetails",
                    localField: "_id",
                    foreignField: "engineer_id",
                    as: "work_info"
                }
            },
            {
                $project: {
                    _id: 1, firstName: 1, lastName: 1, createdAt: 1,
                    "work_info.experiance": 1, "work_info.year": 1, "work_info.month": 1, "price": "not mentioned on desing", "work_info.resume": 1, "work_info.pofileImage": 1, "work_info.skills": 1
                }
            }
        ]);

        let engineerCount = await Admin.find({ role: "engineer" }).countDocuments();
        let responseData = {
            engineer_data,
            "total": engineerCount
        }
        return res.status(200).send({ responseData, message: "Engineers found successfully", status: true });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To add engineer educational details (indepedent resource)
 * Function : engineerEduDetails
 * Api: engineer-edu-details 
 */

const engineerEduDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineerData = await Admin.find({ _id: id, isDelete: false });
        // console.log(engineerData);
        if (engineerData.length <= 0) {
            return res.status(404).send({ message: "Engineer not found", status: false });
        }
        else {
            if (!data.college_name) {
                return res.status(400).send({ message: "Please enter the college name", status: false })
            }
            if (!data.degree) {
                return res.status(400).send({ message: "Please enter the degree name", status: false })
            }
            if (!data.study_field) {
                return res.status(400).send({ message: "Please enter the field of study", status: false })
            }
            data.engineer_id = id;
            let engineer_res = await new engineerModel(data).save();
            if (!engineer_res) {
                return res.status(400).send({ message: "Engineer educational details not added", status: false });
            }
            else {
                return res.status(200).send({ message: "Engineer educational details added successfully", status: true });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To get engineer educational details (indepedent resource)
 * Function : getEngineerEduDetails
 * Api: get-engineer-edu-details 
 */

const getEngineerEduDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the engineers Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let engineer_data = await engineerModel.find({ engineer_id: id }).sort({ createdAt: -1 });
        let details_count = await engineerModel.find({ engineer_id: id }).countDocuments();
        // console.log(engineer_data);
        let response = {
            "edu_details_count": details_count,
            engineer_data
        }
        return res.status(200).send({ message: "Engineer educational details found", status: true, response });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To update engineer educational details (indepedent resource)
 * Function : updateEngineerEduDetails
 * Api: update-engineer-edu-details 
 */


const updateEngineerEduDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineer_data = await engineerModel.findOne({ _id: id });
        if (engineer_data.length <= 0) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            engineerModel.updateOne(
                { _id: id },
                {
                    $set: {
                        college_name: data.college_name,
                        degree: data.degree,
                        study_field: data.study_field,
                        start_date: data.start_date,
                        end_date: data.end_date
                    }
                },
                async function (err, resp) {
                    if (err) {
                        return res.status(400).send({ message: "Bad Request", status: false });
                    }
                    else {
                        return res.status(200).send({ message: "Engineer details updated successfully", status: true, data })
                    }
                }
            )
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To add engineer work details (indepedent resource)
 * Function : engineerWorkDetails
 * Api: add-engineer-work-details 
 */

const addEngineerWorkDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineerData = await Admin.find({ _id: id, isDelete: false });
        // console.log(engineerData);
        if (engineerData.length <= 0) {
            return res.status(404).send({ message: "Engineer not found", status: false });
        }
        else {
            if (!data.designation) {
                return res.status(400).send({ message: "Please enter your designation", status: false })
            }
            if (!data.experiance) {
                return res.status(400).send({ message: "Please enter your experiance", status: false })
            }
            if (!data.skills) {
                return res.status(400).send({ message: "Please enter your skills", status: false })
            }
            data.engineer_id = id;
            let engineer_res = await new workDetailsModel(data).save();
            if (!engineer_res) {
                return res.status(400).send({ message: "Engineer work details not added", status: false });
            }
            else {
                return res.status(200).send({ message: "Engineer work details added successfully", status: true });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To get engineer work details (indepedent resource)
 * Function : getEngineerWorkDetails
 * Api: get-engineer-work-details 
 */

const getEngineerWorkDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the engineers Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let engineer_data = await workDetailsModel.find({ engineer_id: id }).sort({ createdAt: -1 });
        let details_count = await workDetailsModel.find({ engineer_id: id }).countDocuments();
        // console.log(engineer_data);
        let response = {
            "work_details_count": details_count,
            engineer_data
        }
        return res.status(200).send({ message: "Engineer work details found", status: true, response });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To update engineer work details (indepedent resource)
 * Function : updateEngineerWorkDetails
 * Api: update-engineer-work-details 
 */


const updateEngineerWorkDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineer_data = await workDetailsModel.findOne({ _id: id });
        if (engineer_data.length <= 0) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            workDetailsModel.updateOne(
                { _id: id },
                {
                    $set: {
                        designation: data.designation,
                        experiance: data.experiance,
                        skills: data.skills
                    }
                },
                async function (err, resp) {
                    if (err) {
                        return res.status(400).send({ message: "Bad Request", status: false });
                    }
                    else {
                        return res.status(200).send({ message: "Engineer work details updated successfully", status: true, data })
                    }
                }
            )
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

const addEngineerProjectDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineerData = await Admin.find({ _id: id, isDelete: false });
        // console.log(engineerData);
        if (engineerData.length <= 0) {
            return res.status(404).send({ message: "Engineer not found", status: false });
        }
        else {
            if (!data.project_name) {
                return res.status(400).send({ message: "Please enter your project name", status: false })
            }
            //  if(!data.start_date){
            //     return res.status(400).send({message : "Please enter project start date",status : false})
            //  }
            //  if(!data.end_date){
            //     return res.status(400).send({message : "Please enter project end date",status : false})
            //  }
            if (!data.skills_used) {
                return res.status(400).send({ message: "Please enter the skills used in your project", status: false })
            }
            if (!data.about_project) {
                return res.status(400).send({ message: "Please describe about your project here", status: false })
            }
            data.engineer_id = id;
            let engineer_res = await new projectDetailsModel(data).save();
            if (!engineer_res) {
                return res.status(400).send({ message: "Engineer project details not added", status: false });
            }
            else {
                return res.status(200).send({ message: "Engineer project details added successfully", status: true });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To get engineer project details (indepedent resource)
 * Function : getEngineerProjectDetails
 * Api: get-engineer-project-details 
 */

const getEngineerProjectDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the engineers Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let engineer_data = await projectDetailsModel.find({ engineer_id: id }).sort({ createdAt: -1 });
        let details_count = await projectDetailsModel.find({ engineer_id: id }).countDocuments();
        // console.log(engineer_data);
        let response = {
            engineer_data
        }
        return res.status(200).send({ message: "Engineer work details found", status: true, response });
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 27-04-2022
 * Desc: To update engineer work details (indepedent resource)
 * Function : updateEngineerWorkDetails
 * Api: update-engineer-work-details 
 */


const updateEngineerProjectDetails = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the project Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineer_data = await projectDetailsModel.findOne({ _id: id });
        if (engineer_data.length <= 0) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            projectDetailsModel.updateOne(
                { _id: id },
                {
                    $set: {
                        project_name: data.project_name,
                        start_date: data.start_date,
                        end_date: data.end_date,
                        skills_used: data.skills_used,
                        about_project: data.about_project
                    }
                },
                async function (err, resp) {
                    if (err) {
                        return res.status(400).send({ message: "Bad Request", status: false });
                    }
                    else {
                        return res.status(200).send({ message: "Engineer project details updated successfully", status: true, data })
                    }
                }
            )
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/***
 * Created By: Sakshi Uikey
 * Created At: 02-05-2022
 * Desc: To add engineer's self introduction (indepedent resource)
 * Function : addSelfIntro
 * Api: engg-self-intro
 */

const addSelfIntro = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        // let video = req.body.selfIntroVideo;
        if (req.file) {
            if (req.file.fieldname == "selfIntroVideo") {
                var selfIntroVideo = req.file.location;
            }
        }
        let engg_data = await Admin.findOne({ _id: id, isDelete: false });
        
        if (engg_data.length <= 0) {
            return res.status(404).send({ message: "engineer not found", status: false });
        }
        else {
            let engg_res = {
                language: data.language,
                profiency: data.profiency,
                engineer_id: id,
                selfIntroVideo: selfIntroVideo
            }
            const saved_res = await selfIntro(engg_res).save();
            if (!saved_res) {
                return res.status(400).send({ message: "Error while saving introduction video.", status: false });
            }
            else {
                return res.status(200).send({ message: "Self intro info added", status: true });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 12-05-2022
 * Desc: To update the self intro of the individual engineer
 * Function : updateSelfIntro
 * Api: update-self-intro
 */

const updateSelfIntro = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Engineer Id not found", status: true });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        if (req.file) {
            if (req.file.fieldname == "selfIntroVideo") {
                data.selfIntroVideo = req.file.location;
            }
        }
        let find_res = await selfIntro.findOne({ engineer_id: id }).sort({ createdAt: -1 });
        
        if (find_res.length <= 0) {
            return res.status(400).send({ message: "Engineer introduction info not found", status: false });
        }
        else {
            selfIntro.updateOne(
                { _id: find_res._id },
                {
                    $set: {
                        selfIntroVideo: data.selfIntroVideo,
                        language: data.language,
                        profiency: data.profiency
                    }
                },
                async function (err, resp) {
                    if (err) {
                        return res.status(400).send({ message: "Bad Request", status: false });
                    }
                    else {
                        return res.status(200).send({ message: "Data updated successfully", status: true });
                    }
                }
            )
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 02-05-2022
 * Desc: To add engineer's basic test question (indepedent resource)
 * Function : addBasicTestQues
 * Api: add-basic-test-ques
 */

const addBasicTestQues = async (req, res) => {
    try {
        let data = req.body;
        if (!data.question) {
            return res.status(400).send({ message: "Please enter the question", status: false });
        }
        const basic_ques = {
            question: data.question,
            category: "basic-test",
            isDelete: false
        }

        let response = await basicQues(basic_ques).save();
        if (!response) {
            return res.status(400).send({ message: "Bad Request", status: false, error: error.message });
        }
        else {
            return res.status(200).send({ message: "Question added successfully ", status: true, response })
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong ", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 02-05-2022
 * Desc: To get engineer's basic test question (indepedent resource)
 * Function : getBasicTestQues
 * Api: get-basic-test-ques
 */

const getBasicTestQues = async (req, res) => {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    try {
        let basic_ques = await basicQues.find({ category: "basic-test", isDelete: false });
        // console.log(basic_ques);
        if (basic_ques.length <= 0) {
            return res.status(404).send({ message: "Data not found", status: false });
        }
        else {
            let response = {
                "total_ques_count": basic_ques.length,
                basic_ques
            }
            return res.status(200).send({ message: "Data found", status: true, response })
        }

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 04-05-2022
 * Desc: To add answers for engineer's basic test question (indepedent resource)
 * Function : basicTestAns 
 * Api: add-basic-test-ans/:id => id = engineer id
 */


const addBasicTestAns = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the question id", status: false })
    }
    try {
        let engineer_id = base64decode(req.params.id);
        let data = req.body;
        if (!data.answer) {
            return res.status(404).send({ message: "Please enter the answer", status: false })
        }
        if (!data.question_id) {
            return res.status(404).send({ message: "Please pass question id", status: false })
        }

        let ques_res = await basicQues.findOne({ _id: data.question_id, isDelete: false, category: "basic-test" });

        let ans_data = {
            question: ques_res._id,
            answer: data.answer,
            category: ques_res.category,
            engineer_id: engineer_id
        }
        let is_ans_given = await basicTestAns.findOne({ "engineer_id": engineer_id, "question": ques_res._id });
        if (is_ans_given) {
            return res.status(200).send({ message: "Answer already given for this question", status: true });
        } else {
            let ans_res = await basicTestAns(ans_data).save();
            let basic_ques_count = await basicQues.find({ category: "basic-test", isDelete: false }).countDocuments();
            let total_ans_given = await basicTestAns.find({ "engineer_id": ObjectId(engineer_id) }).countDocuments();
            let engineer_vendor = await Admin.find({ "role": "vendor", "email": "engineervendor@gmail.com" }).select("_id");
            let should_ans = 20;
            let all_answered = "no";
            if (should_ans <= basic_ques_count) {
                if (total_ans_given >= should_ans) {
                    let engineer_work_res = await workDetailsModel
                        .updateOne({ engineer_id: ObjectId(engineer_id) },
                            { $set: { "work_detail_completed_status": "complete", "assigned_vendor_id": engineer_vendor._id } });
                    all_answered = "yes";
                }
            } else if (total_ans_given >= basic_ques_count) {
                let engineer_work_res = await workDetailsModel
                    .updateOne({ engineer_id: ObjectId(engineer_id) },
                        { $set: { "work_detail_completed_status": "complete", "assigned_vendor_id": engineer_vendor._id } });
                all_answered = "yes";
            } else {
                return res.status(400).send({ message: "Some error occured", status: false });
            }

            if (!ans_res) {
                return res.status(400).send({ message: "Error in storing answer", status: false });
            }
            else {
                let responseData = {
                    "all_answered": all_answered
                }
                return res.status(200).send({ message: "Answer added successfully", status: true });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 04-05-2022
 * Desc: To get answers for engineer's basic test question (indepedent resource)
 * Function : getBasicTestResult
 * Api: get-basic-test-result
 */

const getBasicTestResult = async (req, res) => {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    try {
        if (!req.params.id) {
            return res.status(404).send({ message: "Please enter the engineer id", status: false });
        }
        let id = base64decode(req.params.id);
        // console.log(id)
        let basic_test_result = await basicTestAns.find({ engineer_id: id });
        // console.log(basic_test_result);
        if (basic_test_result.length <= 0) {
            return res.status(404).send({ message: "Data not found", status: false });
        }
        else {
            let response = {
                "total_result_count": basic_test_result.length,
                basic_test_result
            }
            return res.status(200).send({ message: "Data found", status: true, response })
        }

    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

const downloadIndEngg = async (req, res) => {

    /*     let workbook = new ExcelJs.Workbook();
        let worksheet = workbook.addWorksheet("Individual Engineer");
        let engg_data = await Admin.find({ isDelete: false, role: "engineer" })
        const dateTime = new Date().toISOString().slice(-24).replace(/\D/g, '').slice(0, 14);
        const file_path = path.join(__dirname, "../../", "apis", "resourceResume", "individual-engineer-xlsx-" + dateTime + ".xlsx");
        worksheet.columns = [
            { header: "s_no", key: "s_no", width: 10 },
            { header: "_id", key: "_id", width: 20 },
            { header: "clientPOC", key: "clientPOC", width: 20 },
            { header: "department", key: "department", width: 20 },
            { header: "individualEnggPhoneNumber", key: "individualEnggPhoneNumber", width: 35 },
            { header: "email", key: "email", width: 25 },
            { header: "firstName", key: "firstName", width: 25 },
            { header: "lastName", key: "lastName", width: 25 },
            { header: "role", key: "role", width: 25 },
            { header: "phone", key: "phone", width: 20 },
        ];
    
        let count = 1;
        engg_data.forEach(engg_data => {
            engg_data.s_no = count;
            worksheet.addRow(engg_data);
            count = count + 1;
        }) // Add data in worksheet
    
    
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        try {
            const data = await workbook.xlsx.writeFile(`${file_path}`)
                .then(() => {
                    res.send({
                        status: "success",
                        message: "file successfully downloaded",
                        path: `${file_path}`,
                    });
                });
        }
        catch (error) {
            return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
        } */
}


/***
 * Created By: Sakshi Uikey
 * Created At: 12-05-2022
 * Desc: To add the skills of the individual engineer
 * Function : addSkillSet
 * Api: add-skill-set
 */

const addSkillSet = async (req, res) => {
    try {
        let data = req.body;
        if (!data.skill) {
            return res.status(400).send({ message: "Please enter the skill", status: false });
        }
        let skill_data = {
            skill: data.skill.trim()
        }
        let skill_res = await skill_set_list(skill_data).save();
        if (!skill_res) {
            return res.status(400).send({ message: "Error, while adding the skills", status: false })
        }
        else {
            return res.status(200).send({ message: "Skill added sucessfully", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ error: error.message, message: "Something went wrong", status: false });
    }
}



/***
 * Created By: Shubham Kumar
 * Created At: 10-05-2022
 * Desc: To add engineer all info (indepedent resource)
 * Function : addEngineerInfo
 * Api: add-engineer-info
 */
const addEngineerInfo = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the Engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        if (isNaN(parseInt(id))) {
            return res.status(404).send({ message: "Error! You have passed invalid-id.", status: false });
        }
        let data = req.body;

        //educational info
        if (data.educational_detail && JSON.parse(data.educational_detail).length > 0) {
            data.educational_detail = JSON.parse(data.educational_detail);
            for (let i = 0; i < data.educational_detail.length; i++) {
                data.educational_detail[i].engineer_id = ObjectId(id);
            }
        }

        //engineer project details
        if (!data.product_detail) {
            return res.status(400).send({ message: "Please enter your project detail", status: false })
        }
        if (data.product_detail && JSON.parse(data.product_detail).length > 0) {
            data.product_detail = JSON.parse(data.product_detail);
            for (let i = 0; i < data.product_detail.length; i++) {
                if (!data.product_detail[i].project_name) {
                    return res.status(400).send({ message: "Please enter your project name", status: false })
                }
                if (!data.product_detail[i].skills_used) {
                    return res.status(400).send({ message: "Please enter the skills used in your project", status: false })
                }
                if (!data.product_detail[i].project_duration) {
                    return res.status(400).send({ message: "Please enter the project duration", status: false });
                }
                else if (data.product_detail[i].skills_used.length == 0) {
                    return res.status(400).send({ message: "Please enter the skills.", status: false })
                }
                if (!data.product_detail[i].about_project) {
                    return res.status(400).send({ message: "Please describe about your project here", status: false })
                }
                if (data.product_detail[i].currentlyWorking != true && data.product_detail[i].currentlyWorking != false) {
                    return res.status(400).send({ message: "Please check currently working status", status: false })
                }
                data.product_detail[i].engineer_id = ObjectId(id);
            }
        }

        data.work_detail = JSON.parse(data.work_detail);

        if (!data.work_detail[0].exp_month) {
            return res.status(400).send({ message: "Please enter experiance in month", status: false })
        }
        if (!data.work_detail[0].exp_year) {
            return res.status(400).send({ message: "Please enter experiance in year", status: false })
        }
        if (!data.work_detail[0].skills) {
            return res.status(400).send({ message: "Please enter your skills", status: false })
        }

        // let resume = req.body.resume;
        // let profileImage = req.body.profileImage;
        let engg_data = await Admin.findOne({ _id: id, isDelete: false }, { firstName: 1, lastName: 1, email: 1, phone: 1 });

        if (!engg_data) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }

        let engg_details = {
            first_name: engg_data.firstName,
            last_name: engg_data.lastName,
            engineer_id: ObjectId(id),
            email: engg_data.email,
            mobile_number: engg_data.phone,
            // resume: resumeDocUrl,
            // profileImage: profileUrl,
            skills: data.work_detail[0].skills,
            exp_month: data.work_detail[0].exp_month,//experiance month count
            exp_year: data.work_detail[0].exp_year,//experiance year count
        }
        if(req.files){
            if(!req.files.resume){
                return res.status(404).json({ message: "resume not uploaded" }); 
            }
            if(!req.files.profileImage){
                return res.status(404).json({ message: "Profile image not uploaded" }); 
            }
            if(req.files.resume && req.files.resume[0].fieldname == "resume"){
                var resumeDocUrl = req.files.resume[0].location;
                engg_details.resume = resumeDocUrl;
            }
            if(req.files.profileImage && req.files.profileImage[0].fieldname == "profileImage"){
                let profileImage = req.files.profileImage[0].location;
                engg_details.profileImage = profileUrl;
            }
        }

        /* if (req.body.resume) {
            let resume = req.body.resume;
            if (!resume) {
                return res.status(404).json({ message: "resume not uploaded" });
            }
            else if (resume) {
                var resumeDocUrl = "resourceResume/" + resume.replace('/\\/g', '/');
                engg_details.resume = resumeDocUrl;
            }
        }
        if (req.body.profileImage) {
            let profileImage = req.body.profileImage;
            if (!profileImage) {
                return res.status(404).json({ message: "Profile image not uploaded" });
            }
            else if (profileImage) {
                var profileUrl = "resourceImage/" + profileImage.replace('/\\/g', '/');
                engg_details.profileImage = profileUrl;
            }
        } */

        if (data.work_detail[0].monthlyExpectations) {
            engg_details.monthlyExpectations = data.work_detail[0].monthlyExpectations;
        }

        data.personal_detail = JSON.parse(data.personal_detail);
        if (data.personal_detail && data.personal_detail.linkdinUrl) {
            engg_details.linkdinUrl = data.personal_detail.linkdinUrl;
        }
        if (data.work_detail[0].domain) {
            engg_details.domain = data.work_detail[0].domain;
        }

        let ed = [];
        if (data.educational_detail && data.educational_detail.length > 0) {
            for (let i = 0; i < data.educational_detail.length; i++) {//console.log(data.educational_detail[i]._id);
                let ed1 = {}
                //------for update start------//
                if (data.educational_detail[i]._id) {//data.educational_detail[i]._id !=""
                    ed1._id = data.educational_detail[i]._id;
                }
                //------for update end------//
                if (data.educational_detail[i].college_name) {
                    ed1.college_name = data.educational_detail[i].college_name;
                }
                if (data.educational_detail[i].degree) {
                    ed1.degree = data.educational_detail[i].degree;
                }
                if (data.educational_detail[i].study_field) {
                    ed1.study_field = data.educational_detail[i].study_field;
                }
                ed1.engineer_id = ObjectId(id);//console.log(ed1);
                ed.push(ed1)
            }
        }
        let check_personal_and_work = await workDetailsModel.find({ "engineer_id": id }).countDocuments();
        if (check_personal_and_work > 0) {
            //temporary solution correct later
            // If word details already exist update by id
            ed = JSON.parse(JSON.stringify(ed));//console.log(ed)
            let get_all_educational_ids = [];
            let engineer_work_res = await workDetailsModel.updateOne({ engineer_id: id }, { $set: engg_details });
            for (let i = 0; i < ed.length; i++) {
                if (ed[i]._id == ""  || !ed[i]._id) {//|| ed[i]._id
                    delete ed[i]._id;//console.log("engineer_res")
                    let engineer_res = await new engineerModel(ed[i]).save();
                    get_all_educational_ids.push(engineer_res._id);
                } else {
                    if (ed[i]._id) {
                        get_all_educational_ids.push(ed[i]._id);
                        let engineer_res = await engineerModel.updateOne({ _id: ed[i]._id }, { $set: ed[i] }, { upsert: true });//console.log(engineer_res)
                    }
                }
            }
            //----remove engineer education start---//
            let engg_educational_ids = await engineerModel.find({ "engineer_id": id, _id: { $nin: get_all_educational_ids } }).select("_id");
            if (engg_educational_ids.length > 0) {
                let delete_educational_ids = [];
                for (let i = 0; i < engg_educational_ids.length; i++) {
                    delete_educational_ids.push(engg_educational_ids[i]._id);
                }
                let remove_educational_info = await engineerModel.deleteOne({ "engineer_id": id, _id: { $in: delete_educational_ids } });//console.log(remove_educational_info)
            }
            //----remove engineer education end---//

            let get_all_ids = [];
            for (let i = 0; i < data.product_detail.length; i++) {
                if (data.product_detail[i]._id == "") {
                    delete data.product_detail[i]._id;
                    data.product_detail = JSON.parse(JSON.stringify(data.product_detail));
                    let engineer_product_res = await new projectDetailsModel(data.product_detail[i]).save();
                    get_all_ids.push(engineer_product_res._id);
                } else {
                    data.product_detail = JSON.parse(JSON.stringify(data.product_detail));
                    let conditional_id = { _id: data.product_detail[i]._id };
                    get_all_ids.push(data.product_detail[i]._id);
                    let engineer_product_res = await projectDetailsModel.updateOne(conditional_id, { $set: data.product_detail[i] }, { upsert: false });
                }
            }
            //----remove engineer projects start---//
            let engg_project_ids = await projectDetailsModel.find({ "engineer_id": id, _id: { $nin: get_all_ids } }).select("_id");
            if (engg_project_ids.length > 0) {
                let delete_product_ids = [];
                for (let i = 0; i < engg_project_ids.length; i++) {
                    delete_product_ids.push(engg_project_ids[i]._id);
                }
                let remove_project = await projectDetailsModel.deleteOne({ "engineer_id": id, _id: { $in: delete_product_ids } });
            }
            //----remove engineer projects end---//
            return res.status(200).send({ message: "Engineer info updated successfully", status: true });
        } else {

            ed = JSON.parse(JSON.stringify(ed));
            data.product_detail = JSON.parse(JSON.stringify(data.product_detail));
            //-----Remove project details _id start-----//
                if(data.product_detail.length >0){
                    for(let i=0;i<data.product_detail.length; i++){
                        delete data.product_detail[i]._id;
                    }
                }
            //-----Remove project details _id start-----//
            engg_details.basic_info_completed = true;
            let engineer_work_res = await new workDetailsModel(engg_details).save();
            let engineer_res = await engineerModel.insertMany(ed);
            let engineer_product_res = await projectDetailsModel.insertMany(data.product_detail);
            return res.status(200).send({ message: "Engineer info added successfully ", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ error: error.message, message: "Something went wrong", status: false });
    }
}


/***
* Created By: Shubham Kumar
* Created At: 11-05-2022
* Desc: To update engineer all info (indepedent resource)
* Function : modifyEngineerInfo
* Api: modify-engineer-info/:id
*///in progress
const modifyEngineerInfo = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the Engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        if (isNaN(parseInt(id))) {
            return res.status(404).send({ message: "Error! You have passed invalid-id.", status: false });
        }
        let data = req.body;
        let engg_details = {};
        if (data.personal_detail.linkdinUrl) {
            engg_details['linkdinUrl'] = data.personal_detail.linkdinUrl;
        }
        let resume = req.body.resume;
        let profile_image = req.body.profileImage;
        if (profile_image) {
            var profileUrl = "resourceImage/" + profile_image.replace('/\\/g', '/');
            engg_details["profileImage"] = profileUrl;
        }
        if (resume) {
            var resumeDocUrl = "resourceResume/" + resume.replace('/\\/g', '/');
            engg_details["resume"] = resumeDocUrl;
        }
        if (data.work_detail) {
            if (data.work_detail.designation) {
                engg_details["designation"] = data.work_detail.designation;
            }
            if (data.work_detail.experiance) {
                engg_details["experiance"] = data.work_detail.experiance;
            }
            if (data.work_detail.month) {
                engg_details["month"] = data.work_detail.month;
            }
            if (data.work_detail.year) {
                engg_details["year"] = data.work_detail.year;
            }
            if (data.work_detail.skills && data.work_detail.skills.length > 0) {
                engg_details["skills"] = data.work_detail.skills;
            }
            if (data.work_detail.amount) {
                engg_details["amount"] = data.work_detail.amount;
            }
        }


        // engg_details = {
        //     first_name:         engg_data.firstName,
        //     last_name:          engg_data.lastName,
        //     engineer_id:        ObjectId(id),
        //     email:              engg_data.email,
        //     mobile_number:      engg_data.phone,
        // }

        data.educational_detail = JSON.parse(JSON.stringify(data.educational_detail));
        data.product_detail = JSON.parse(JSON.stringify(data.product_detail));

        let engineer_work_res = await workDetailsModel.updateOne(
            { engineer_id: id }, { $set: engg_details });


        for (let i = 0; i < data.educational_detail.length; i++) {
            let temp_id = data.educational_detail[i]._id;
            delete data.educational_detail[i]._id;

            let engineer_res = await engineerModel.updateOne(
                { _id: ObjectId(temp_id) }, { $set: data.educational_detail[i] });
        }

        for (let i = 0; i < data.product_detail.length; i++) {
            let temp_id = data.product_detail[i]._id;
            delete data.product_detail[i]._id;

            let engineer_res = await projectDetailsModel.updateOne(
                { _id: ObjectId(temp_id) }, { $set: data.product_detail[i] });
        }
        return res.status(200).send({ message: "Engineer info updated successfully ", status: true });
    }
    catch (error) {
        return res.status(400).send({ error: error.message, message: "Something went wrong", status: false });
    }
}

/***
* Created By: Shubham Kumar
* Created At: 11-05-2022
* Desc: To show engineer all info (indepedent resource)
* Function : engineerInfo
* Api: engineer-info
*/
const engineerInfo = async (req, res) => {
    if (!req.params.id) {
        return res.status(404).send({ message: "Please enter the Engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        if (isNaN(parseInt(id))) {
            return res.status(404).send({ message: "Error! You have passed invalid-id.", status: false });
        }

        let engineer = await Admin.aggregate([
            { $match: { _id: ObjectId(id) } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "workdetails", // foreign table name
                    localField: "_id",//local table column name
                    foreignField: "engineer_id",//foreign table column name
                    as: "work_detail"// response variable name
                }
            },
            {
                $lookup: {
                    from: "engineer_edu_infos", // foreign table name
                    localField: "_id",//local table column name
                    foreignField: "engineer_id",//foreign table column name
                    as: "educational_detail"// response variable name
                }
            },
            {
                $lookup: {
                    from: "projectdetails", // foreign table name
                    localField: "_id",//local table column name
                    foreignField: "engineer_id",//foreign table column name
                    as: "product_detail"// response variable name
                },
            },
            {
                $lookup: {
                    from: "selfintros", // foreign table name
                    localField: "_id",//local table column name
                    foreignField: "engineer_id",//foreign table column name
                    as: "communication_detail"// response variable name
                },
            },
            {
                $lookup: {
                    from: "basictestans", // foreign table name
                    localField: "_id",//local table column name
                    foreignField: "engineer_id",//foreign table column name
                    as: "basic_test_detail"// response variable name
                },
            },
            {
                $lookup: {
                    from: "admins", // foreign table name
                    localField: "work_detail.assigned_vendor_id",//local table column name
                    foreignField: "_id",//foreign table column name
                    as: "assigned_vendor"// response variable name
                },
            },
            {
                $lookup: {
                    from: "skill_set_lists", // foreign table name
                    localField: "work_detail.skills_used",//local table column name
                    foreignField: "_id",//foreign table column name
                    as: "skill_name"// response variable name
                },
            },
            // {
            //     $lookup: {
            //         from: "basicques", // foreign table name
            //         localField: "basic_test_detail.question",//local table column name
            //         foreignField: "_id",//foreign table column name
            //         as: "question_info"// response variable name
            //     },
            // },
            {
                $project: {
                    "_id": 1, "email": 1, "individualEnggPhoneNumber": 1, "role": 1, "firstName": 1, "lastName": 1, "phone": 1, "name": 1,"created_at": 1, 
                    "work_detail._id":1, "work_detail.designation": 1, "work_detail.exp_month": 1, "work_detail.exp_year" : 1, "work_detail.work_detail_completed_status" :1,
                    "work_detail.skills" : 1, "work_detail.monthlyExpectations": 1, "work_detail.linkdinUrl":1 ,"work_detail.basic_info_completed":1 ,"work_detail.basic_test_completed":1 ,
                    "work_detail.resume" : 1, "work_detail.profileImage" :1,"work_detail.assigned_vendor_id" :1,"work_detail.domain":1,
                    "educational_detail._id": 1, "educational_detail.start_date": 1, "educational_detail.end_date": 1, "educational_detail.createdAt": 1, "educational_detail.college_name": 1, 
                    "educational_detail.degree": 1, "educational_detail.study_field": 1,
                    "product_detail._id": 1, "product_detail.start_date": 1, "product_detail.end_date": 1, "product_detail.skills_used": 1, "product_detail.project_name": 1, 
                    "product_detail.about_project": 1, "product_detail.skills_used": 1 , "product_detail.currentlyWorking" :1, "product_detail.project_duration" :1,
                    "product_detail.role_in_project":1,
                    "communication_detail._id": 1, "communication_detail.language": 1, "communication_detail.profiency": 1, "communication_detail.selfIntroVideo": 1,
                    "basic_test_detail._id": 1, "basic_test_detail.answer": 1, "basic_test_detail.category": 1,
                    "basic_test_detail.question" : 1,
                    // "work_detail.assigned_vendor._id":1,"work_detail.assigned_vendor.email":1,"work_detail.assigned_vendor.name":1,"work_detail.assigned_vendor.phone":1,
                    "assigned_vendor._id":1, "assigned_vendor.email":1, "assigned_vendor.name":1, "assigned_vendor.phone":1,
                    "skill_name":1
                }
            }
        ]);
        //temporary solution start for skill name
        if(engineer[0].work_detail[0] && engineer[0].work_detail.length >0 && engineer[0].work_detail[0].skills && engineer[0].work_detail[0].skills.length > 0 ){
            let skills_arr = [];
            for(let i=0; i<engineer[0].work_detail[0].skills.length; i++){
                if(ObjectId.isValid(engineer[0].work_detail[0].skills[i]) == true){
                    let skill_names = await skill_set_list.findOne({_id: engineer[0].work_detail[0].skills[i]});
                    if(skill_names){
                        let skill_arr = {};
                        skill_arr["skill_id"] = skill_names._id;
                        skill_arr["skill_name"] = skill_names.skill;
                        skills_arr.push(skill_arr);
                    }
                }
            }
            engineer[0].work_detail[0].skill_info = skills_arr;
        }
        //temporary solution end for skill name

        //temporary solution start for skill name in project
        if(engineer[0].product_detail && engineer[0].product_detail.length >0 ){//&& engineer[0].product_detail[0].skills_used && engineer[0].product_detail[0].skills_used.length > 0
            let skills_arr = [];
            for(let j=0; j<engineer[0].product_detail.length; j++){
                for(let i=0; i<engineer[0].product_detail[j].skills_used.length; i++){
                    if(ObjectId.isValid(engineer[0].product_detail[j].skills_used[i]) == true){
                        let skill_names = await skill_set_list.findOne({_id: engineer[0].product_detail[j].skills_used[i]});
                        if(skill_names){
                            let skill_arr = {};
                            skill_arr["skill_id"] = skill_names._id;
                            skill_arr["skill_name"] = skill_names.skill;
                            skills_arr.push(skill_arr);
                        }
                    }
                }
                engineer[0].product_detail[j].skill_info = skills_arr;
            }
            // engineer[0].product_detail[0].skill_info = skills_arr;
            // console.log("ja simran ja ji le apni zindagi");
        }
        //temporary solution end for skill name in project

        if (!engineer) {
            return res.status(400).send({ message: "Engineer not exist", status: false });
        } else {
            engineer = JSON.parse(JSON.stringify(engineer[0]));
            // if(engineer.work_detail && engineer.educational_detail && engineer.project_detail && engineer.communication_detail && engineer.basic_test_detail){
            //     engineer.status = "complete";
            // }else{
            //     engineer.status = "incomplete";
            // }
            let responseData = {
                POC_data: {
                    name: "Ayushi Paliwal",
                    email: "ayushi.p@engineerbabu.in",
                    phone: 9893220164
                },
                engineer
            }
            return res.status(200).send({ "responseData": responseData, message: "Engineer found successfully", status: true });
        }
    } catch (error) {
        return res.status(400).send({ error: error.message, message: "Something went wrong", status: false });
    }
}


/***
 * Created By: Shubhankar Kesharwani
 * Created At: 16-05-2022
 * Desc: To upload doc & docx file with base 64 encode
 * Function : resumeParser
 * Api: resume-parser
 */

var https = require('http');
const fs = require('fs').promises;
 const resumeParser = async (req, res) => {
    let resume = req.file;
    // const contents = "";
    // let profileImage = req.body.profileImage;
    // var resumeDocUrl = "resourceResume/" + resume.replace('/\\/g', '/');
    // res.send(data) 
    let encoded_file;
    
     try{
        if(resume){ 
        var resumeDocUrl = "/home/ebabu/review-backend/apis/resourceResume/" + resume.filename ;            
        const  contents = await fs.readFile(resumeDocUrl, {encoding: 'base64'});
        encoded_file = contents;
        }
       
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://rest.rchilli.com/RChilliParser/Rchilli/parseResumeBinary',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "filedata": encoded_file,
                "filename": "SampleResume - Copy.docx",
                "userkey": "XI8LXZ9S",
                "version": "8.0.0",
                "subuserid": "Jack Maa"
            })

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            return res.status(200).send({ "response": JSON.parse(response.body), message: "All Good", status: true });
        });
    } catch (error) {
        return res.status(400).send({ error: error.message, message: "Something went wrong", status: false });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created At: 12-05-2022
 * Desc: To get the skills of the individual engineer
 * Function : showAllSkills
 * Api: get-all-skill-set
 */

const showAllSkills = async (req, res) => {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    try {
        let condition = {};
        if (req.query.skill) {
            condition["skill"] = { $regex: ".*" + req.query.skill.toLowerCase() + ".*" };
        }
        let res_data = await skill_set_list.find(condition).sort({skill:1}).lean();
        
        if (res_data <= 0) {
            return res.status(404).send({ message: "Data not found", status: false });
        }
        else {
            let response = {
                "Total_skills": res_data.length,
                res_data
            }
            return res.status(200).send({ message: "Data Found", status: true, response });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/**
 * Created At: Sakshi
 * Created Date:
 * Updated By: Shubham Kumar
 * Updated Date: 19-05-2022
 * Desc: When engineer had given basic question answers his profile will get completed
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const addAnswer = async (req, res) => {

    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the Engineer Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let engineer_data = await Admin.find({ _id: id, isDelete: false });
        if (engineer_data.length <= 0) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            let data = req.body;
            let arr1 = []
            Object.keys(data).forEach(key => {
                arr1.push({ "question": key, "answer": data[key], "engineer_id": id })
                // console.log(key, data[key]);
            });
            arr1 = JSON.parse(JSON.stringify(arr1));
            let result = await basicTestAns.insertMany(arr1);
            if (!result) {
                return res.status(400).send({ message: "Error while giving basic test.", status: false });
            }
            else {
                let basic_test = await workDetailsModel.updateOne({"engineer_id": id},{$set:{"basic_test_completed":true} });
                let engineer_vendor = await Admin.findOne({ "role": "vendor", "email": "engineervendor@gmail.com" }).select("_id");//console.log(engineer_vendor)
                let engineer_work_res = await workDetailsModel.updateOne({ engineer_id: ObjectId(id) },{ $set: { "work_detail_completed_status": "complete", "assigned_vendor_id": engineer_vendor._id } });
                // console.log(engineer_work_res);
                return res.status(200).send({ message: "Basic test completed successfully", status: true });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


const addEngineerScreening = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the engineer id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let engineer_res = await Admin.findOne({ _id: id, isDelete: false });
        if (engineer_res) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            const engg_data = {
                engineer_id: id,
                addedBy: res.userId,
                role: res.userRole,
                status: data.status,
                comm_skills: data.comm_skills,
                tech_skills: data.tech_skills,
                presentability: data.presentability,
                attentiveness: data.attentiveness
            }
            let response_data = await new engineer_screening(engg_data).save();
            if (!response_data) {
                return res.status(400).send({ message: "Bad Request", status: false });
            }
            else {
                let response = {
                    response_data
                }
                return res.status(200).send({ message: "Engineer's screening added successfully", status: true, response })
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

const getEnggScreening = async (req, res) => {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the engineer id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let find_engg = await Admin.find({ _id: id, isDelete: false });
        if (!find_engg) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            let screening_data = await engineer_screening.find({ engineer_id: id }).sort({ createdAt: -1 });
            if (!screening_data) {
                return res.status(400).send({ message: "Screening data not found", status: false });
            }
            else {
                let response = {
                    "total_screening": screening_data.length,
                    screening_data
                }
                return res.status(200).send({ message: "Screening data found successfully", status: true, response });
            }
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message })
    }
}

const updateEnggScreening = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the screening id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;
        let screening_data = await engineer_screening({_id : id});
        let find_engg = await Admin.find({ _id: screening_data.engineer_id, isDelete: false });
        if (!find_engg) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            await engineer_screening.updateOne(
                { _id: id },
                {
                    $set: {
                        comm_skills: data.comm_skills,
                        tech_skills: data.tech_skills,
                        presentability: data.presentability,
                        attentiveness: data.attentiveness
                    }
                },
                async function (err, resp) {
                    if (err) {
                        return res.status(400).send({ message: "Error, while supdating the screening data", status: false });
                    }
                    else {
                        return res.status(200).send({ message: "Engineer screening data updated successfully", status: true });
                    }
                }
            )
        }
    }
    catch (error) {
        return res.status(400).send({ message: " Something went wrong", status: false, error: error.message });
    }
}

/**
 * Created At: Shubham Kumar
 * Created Date:19-05-2022
 * API: modify-enggineer-basic-test
 * Function:  modifyEnggineerBasicTest
 * Desc: Engineer basic question answers update by endineer id check and update by _id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
 const modifyEnggineerBasicTest = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the Engineer Id", status: false });
    }
    try {
        let data = req.body;
        let id = base64decode(req.params.id);
        let engineer_data = await Admin.findOne({ _id: id});
        if (!engineer_data) {
            return res.status(400).send({ message: "Engineer not found", status: false });
        }
        else {
            for(var ques in data){
                let update_ans = await basicTestAns.updateOne({"question":ques,engineer_id:id }, {$set:{"answer":data[ques]} });
            }
            return res.status(200).send({ message: "Engineer basic test updated successfully", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


module.exports = {
    registerEngineer,
    addEnggDetails,
    engineersList,
    engineerEduDetails,
    getEngineerEduDetails,
    updateEngineerEduDetails,
    addEngineerWorkDetails,
    getEngineerWorkDetails,
    updateEngineerWorkDetails,
    addEngineerProjectDetails,
    getEngineerProjectDetails,
    updateEngineerProjectDetails,
    addSelfIntro,
    updateSelfIntro,
    addBasicTestQues,
    getBasicTestQues,
    addBasicTestAns,
    getBasicTestResult,
    downloadIndEngg,
    addSkillSet,
    addEngineerInfo,
    modifyEngineerInfo,
    engineerInfo,
    resumeParser,
    showAllSkills,
    addAnswer,
    addEngineerScreening,
    getEnggScreening,
    updateEnggScreening,
    modifyEnggineerBasicTest
}
// 'use strict';
const { base64encode, base64decode } = require('nodejs-base64');
let resumeModel = require("../models/resume").resume;
let resume_experianceModel = require("../models/resume").resume_experiance;
let resume_projectModel = require("../models/resume").resume_project;
let func = require("../common/commonfunction");
const ObjectId = require("mongodb").ObjectID;

/***
 * Created By: Sakshi Uikey
 * Created Date: 27-06-2022
 * Desc: To add resume data for resource ..
 * API: add-resume
 * Function : addResume
 */

const addResume = async (req, res) => {
    try {
        let data = req.body;
        let firstDataSave = {
            name: data.name,
            designation: data.designation,
            summary: data.summary,
            skills: data.skills,
            database: data.database
        }
        const resumeData = await resumeModel(firstDataSave).save();

        if (resumeData) {
            // To save experince data if array will came..
            if (data.experiance.length > 0) {
                for (let i = 0; i < data.experiance.length; i++) {
                    let secondDataSave = {
                        resume_id: resumeData._id,
                        company_name: data.experiance[i].company_name,
                        title: data.experiance[i].title,
                        duration: data.experiance[i].duration,
                        technology: data.experiance[i].technology,
                        description: data.experiance[i].description,
                    }
                    const resumeExperianceData = await resume_experianceModel(secondDataSave).save();
                }
            }

            // To save project data if array will came..
            if (data.project.length > 0) {
                for (let i = 0; i < data.project.length; i++) {
                    let thirdDataSave = {
                        resume_id: resumeData._id,
                        title: data.project[i].title,
                        technology: data.project[i].technology,
                        duration: data.project[i].duration,
                        role: data.project[i].role,
                        responsibilities: data.project[i].responsibilities,
                        description: data.project[i].description,
                    }
                    const resumeProjectModelData = await resume_projectModel(thirdDataSave).save();
                }
            }

        }

        if (!resumeData) {
            return res.status(200).send({ message: "Error in adding resume", status: false });
        } else {
            return res.status(200).send({ message: "Resume added successfully!", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created Date: 27-06-2022
 * Desc: To update resume data for resource ..
 * API: update-resume
 * Function : updateResume
 */

const updateResume = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the resume Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let data = req.body;

        let firstDataSave = {
            name: data.name,
            designation: data.designation,
            summary: data.summary,
            skills: data.skills,
            database: data.database
        }

        let updateResumeData = await resumeModel.updateOne({ _id: ObjectId(id) }, { $set: firstDataSave });


        // To update experince data if array will came..
        if (data.experiance.length > 0) {
            for (let i = 0; i < data.experiance.length; i++) {
                let secondDataSave = {
                    company_name: data.experiance[i].company_name,
                    title: data.experiance[i].title,
                    duration: data.experiance[i].duration,
                    technology: data.experiance[i].technology,
                    description: data.experiance[i].description,
                }
                let updateResumeExperianceData = await resume_experianceModel.updateOne({ _id: ObjectId(data.experiance[i]._id), resume_id: ObjectId(id) }, { $set: secondDataSave });
            }
        }

        // To update project data if array will came..
        if (data.project.length > 0) {
            for (let i = 0; i < data.project.length; i++) {
                let thirdDataSave = {
                    title: data.project[i].title,
                    technology: data.project[i].technology,
                    duration: data.project[i].duration,
                    role: data.project[i].role,
                    responsibilities: data.project[i].responsibilities,
                    description: data.project[i].description,
                }
                let updateResumeProjectData = await resume_projectModel.updateOne({ _id: ObjectId(data.project[i]._id), resume_id: ObjectId(id) }, { $set: thirdDataSave });

            }
        }


        // if (!updateResumeData) {
        //     return res.status(400).send({ message: "Error in update resume", status: false });
        // } else {
        return res.status(200).send({ message: "Resume updated successfully!", status: true });
        //}
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Sakshi Uikey
 * Created Date: 27-06-2022
 * Desc: To get particular resume data for resource ..
 * API: get-resume
 * Function : getResumeById
 */

const getResumeById = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the resume Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);

        let getResumeDataById = await resumeModel.aggregate([
            { $match: { _id: ObjectId(id) } },
            {
                $lookup:
                {
                    from: "resume_experiances",
                    localField: "_id",
                    foreignField: "resume_id",
                    as: "experiance"
                }
            },
            {
                $lookup:
                {
                    from: "resume_projects",
                    localField: "_id",
                    foreignField: "resume_id",
                    as: "project"
                }
            }
        ]);


        if (!getResumeDataById) {
            return res.status(200).send({ message: "Error to find resume", status: false });
        } else {
            return res.status(200).send({ response: getResumeDataById, message: "Resume fetch successfully!", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/***
 * Created By: Sakshi Uikey
 * Created Date: 27-06-2022
 * Desc: To get all resume data for resource ..
 * API: resume
 * Function : getAllResume
 */

const getAllResume = async (req, res) => {
    const per_page = 10;
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
    let offset = req.query.offset ? req.query.offset : limit * (page - 1);
    offset = parseInt(offset);

    try {
        let condition = {};
        if (req.query.search && req.query.search.length != 0) {
            condition["name"] = { $regex: ".*" + req.query.search.toLowerCase() + ".*" };
        }
        let resumeData = await resumeModel.find(condition).sort().skip(offset).limit(limit).lean();

        let resumeCount = await resumeModel.find().countDocuments();

        let response = {
            resumeData,
            resumeCount
        }

        if (!resumeData) {
            return res.status(200).send({ response, message: "There is no resume", status: false });
        } else {
            return res.status(200).send({ response, message: "Resume fetch successfully!", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}


/***
 * Created By: Sakshi Uikey
 * Created Date: 27-06-2022
 * Desc: To delete resume data for resource ..
 * API: resume
 * Function : deleteResumeById
 */

const deleteResumeById = async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ message: "Please enter the resume Id", status: false });
    }
    try {
        let id = base64decode(req.params.id);
        let resumeData = await resumeModel.deleteOne({ _id: ObjectId(id) });
        let resumeExperianceData = await resume_experianceModel.deleteMany({ resume_id: ObjectId(id) });
        let resumeRrojectData = await resume_projectModel.deleteMany({ resume_id: ObjectId(id) });

        let response = {
            resumeData,
            resumeExperianceData,
            resumeRrojectData
        }

        if (!resumeData) {
            return res.status(200).send({ response, message: "There is error to delete data", status: false });
        } else {
            return res.status(200).send({ response, message: "Resume deleted successfully!", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

const Resources = require("../models/resource").Resources;
 const skill_set_list = require("../models/skill_set_list").skill_set_list;
 const AddclientTeckStackId = async (req, res) => {
  try {
     var resourceInfoData = await Resources.find().select("_id techStack name");
     for (let j = 0; j < resourceInfoData.length; j++) {
       for (let i = 0; i < resourceInfoData[j].techStack.length; i++) {
          var skillSetListData = await skill_set_list.findOne({ _id: ObjectId(resourceInfoData[j].techStack[i]) }).select("_id skill");
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
    addResume,
    updateResume,
    getResumeById,
    getAllResume,
    deleteResumeById,
    AddclientTeckStackId
}
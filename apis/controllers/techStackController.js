// 'use strict';
const { base64encode, base64decode } = require('nodejs-base64');
let TechStackModel = require("../models/techStack").techStack;
let func = require("../common/commonfunction");
// const techStack = require('../models/techStack').techStack;


/***
 * Created By:   Sakshi Uikey
 * Created Date: 21-04-2022
 * Desc: To add tech Stack 
 * API: add-tech-stack
 * Function : addTechStack
 */

const addTechStack = async (req, res) => {
    try {
        let data = req.body;
        // console.log(data);
        if (!data.techStack) {
            return res.status(400).send({ message: "Please enter the tech stack", status: false });
        }
        // console.log(data.techStack);
        const techStackData = new TechStackModel();
        techStackData.techStack = data.techStack;
        let techStack_response = await new TechStackModel(techStackData).save();
        if (!techStack_response) {
            return res.status(400).send({ message: "Error in adding tech stack", status: false });
        } else {
            return res.status(200).send({ message: "Tech Stack added successfully!", status: true });
        }
    }
    catch (error) {
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By:   Sakshi Uikey
 * Created Date: 21-04-2022
 * Desc: To get tech Stack 
 * API: get-tech-stack
 * Function : getTechStack
 */

const getTechStack = async(req,res)=>{
    try{
        const per_page = 10;
        let page = req.query.page ? req.query.page : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : per_page;
        let offset = req.query.offset ? req.query.offset : limit * (page - 1);
        offset = parseInt(offset);
        let techStack_response = await TechStackModel.find().select("_id status techStack createdAt").skip(offset).limit(limit);
        let techStack_count = await TechStackModel.countDocuments();
        let responseData = {
            techStack_response,
            "total" : techStack_count
        }
        return res.status(200).send({ message: "Tech Stack found successfully!",responseData, status: true });

    }
    catch(error){
        return res.status(400).send({message : "Something went wrong", status : false});
    }
}

module.exports = { addTechStack, getTechStack }
// 'use strict';
const { base64encode, base64decode } = require('nodejs-base64');
let func = require("../common/commonfunction");
let userAuth = require("../models/userAuth").userAuth;
var bcrypt = require("bcryptjs");
const path = require("path");
var ObjectId = require('mongodb').ObjectID;

//----model paths ------//
const RoleInProject = require('../models/role_in_project').role_in_project;

/***
 * Created By: Shubham Kumar
 * Created At: 25-05-2022
 * Desc: Add project role which are to be assigned to engineer 
 * Function : addProjectRole
 * Api: add-project-role
 */
 const addProjectRole = async (req, res) => {
    try {
        let data = req.body;
        if (!data.role) {
            return res.status(400).send({ message: "Please enter the role", status: false });
        }
        
        data.role = data.role.toLowerCase().trim();
        data.status = true;
        let role_res = await RoleInProject(data).save();  
        if(!role_res){
            return res.status(400).send({ message: "Error in adding project role", status: false });
        }else{
            return res.status(200).send({ message: "Project role added successfully", status: true });
        }
    }
    catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

/***
 * Created By: Shubham Kumar
 * Created At: 25-05-2022
 * Desc: To display project role 
 * Function : getProjectRole
 * Api: get-project-role
 */
 const getProjectRole = async (req, res) => {
    try {
        let project_role = await RoleInProject.find().sort({role:1}).select("_id role");
        let responseData = {
            project_role
        }
        return res.status(200).send({ responseData, message: "Roles found successfully", status: true});
    }
    catch(error){
        return res.status(400).send({ message: "Something went wrong", status: false, error: error.message });
    }
}

module.exports = {
    addProjectRole,
    getProjectRole
}
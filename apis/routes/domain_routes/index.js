const express = require('express');
const router = express.Router();
let authentication = require("../../common/commonfunction"); //to authentication
let roleAccess = require("../../middlewares/roleAccess");//to check applied role match with token role
const awsfileUpload = require("../../middlewares/aws-fileupload").awsfileUpload;
const folderUploadAws = require ('../../middlewares/aws-fileupload');

let domainListController = require("../../controllers/domainListController");
let roleInProject = require("../../controllers/roleInProjectController");

//********************************Domain List Routes ********************************/
router.post("/add-domain-list",[awsfileUpload('domain').single('domain_image'),authentication.checkUserAuthentication],domainListController.AddDomainList);

//****************************Porject Roles for engg ***************************/
router.post("/add-project-role", authentication.checkUserAuthentication, roleInProject.addProjectRole);
router.get("/get-project-role", authentication.checkUserAuthentication, roleInProject.getProjectRole);
router.get("/cronFunction", domainListController.cronFunction);
router.post("/aws_with_folder",[awsfileUpload('resource').single('resource_img') ],domainListController.aws_with_folder);//.single("upload_file") 

// const swaggerJSDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');
// const options = {
//     defination: {
//         openapi: '3.0.0',
//         info: {
//             title: 'Node JS API Project',
//             version: '1.0'
//         },
//         servers: {
//             api: 'http://localhost:8080/api'
//         }
//     },
//     apis: ['./mongodb.js']
// }
// const swaggerSpec = swaggerJSDoc(options);
// app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// router.get("/cronFunction", domainListController.cronFunction);

module.exports = router;
'use strict';
const CONFIG = require('../common/constants');
const globalCalls = require("../common/functions");
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
    secretAccessKey: CONFIG.aws_secret,
    accessKeyId: CONFIG.aws_key_id,
    region: CONFIG.aws_region
});

//If dirPath is given then auto folder will get created and folder filter will be there according to image,video,doc 
const awsfileUpload = (dirPath = "") =>{

  const fileFilter = (req, file, cb) => {
    let size = req.rawHeaders.slice(-1)[0];
    let ext = file.mimetype.split('/')[1].toLowerCase();
    let file_type = file.mimetype.split('/')[0];
  
    if(file_type == "image"){
        if(ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg' ){
          cb(null, true);
        }else { cb(new Error('Invalid image extension'), false); }
    }else if(file_type == "video"){
        if(ext === 'mp4' || ext === 'mp3' || ext === 'avi' || ext === 'wmv' || ext === 'flv' || ext === 'f4v' || ext === 'swf' || ext === 'mkv' || ext === 'webm' || ext === 'html5' || ext === 'mov'){
          cb(null, true);
        }else { cb(new Error('Invalid video extension'), false); }
    }
    else if(file_type == "application"){
        if(ext === 'docx' || ext === 'pdf' || ext === 'msword' || ext === 'vnd.openxmlformats-officedocument.wordprocessingml.template' || ext === 'application/vnd.ms-word.document.macroEnabled.12' || ext == 'vnd.openxmlformats-officedocument.wordprocessingml.document'){
          cb(null, true);
        }else { cb(new Error('Invalid application extension'), false); }
    }
    else{
      cb(new Error('Invalid File type'), false)
    }
  
  }
  
  const upload = multer({
    // limits: { fileSize: 6521, },
    fileFilter: fileFilter,
    storage: multerS3({
      s3: new AWS.S3(),
      bucket: 'supersourcing-premium',
      // ACL: 'public-read-write',
      cacheControl: 'max-age=31536000',
      contentType: function (req, file, cb) {
        cb(null, file.mimetype);
      },
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        });
      },
      key: function (request, file, ab_callback) {
        var newFileName = Date.now().toString() + '_' + file.originalname;
        let ext = file.mimetype.split("/")[0];//extension
        let file_type = file.mimetype.split('/')[0];
        let test = dirPath + newFileName;
        let first_path = "development/";
        if(process.env.PORT == 3000){
          first_path = "production/";
          if(dirPath === ""){

          }else{
            first_path = first_path + dirPath + '/';
          }
          if(file_type == "image"){
            var filePath = first_path + 'prod_images/' + newFileName;
          }else if(file_type == "video"){
            var filePath = first_path + 'prod_videos/' + newFileName;
          }
          else if(file_type == "application"){
            var filePath = first_path + 'prod_docs/' + newFileName;
          }
        }
        else{
          if(dirPath === ""){
          }else{
            first_path = first_path + dirPath + '/';
          }
          if(file_type == "image"){
            var filePath = first_path + 'dev_images/' + newFileName;
          }else if(file_type == "video"){
            var filePath = first_path + 'dev_videos/' + newFileName;
          }
          else if(file_type == "application"){
            var filePath = first_path + 'dev_docs/' + newFileName;
          } 
        }
        ab_callback(null, filePath);
      }
    })
  });

 return upload;
}

const awsFileDelete = (arrayFile) => {
  const s3 = new AWS.S3();
  for(let i =0 ; i < arrayFile.length; i++)
 { 
  let path = arrayFile[i].split('/')[3]+'/'+arrayFile[i].split('/')[4]+'/'+arrayFile[i].split('/')[5];
    s3.deleteObject({
    Bucket: "supersourcing-premium",
    Key: path
  },function (err,data){ // console.log("err = >",err,"data =",data , "path =",path)
   });
}
}

module.exports = {
  awsfileUpload,
  awsFileDelete
};
const multer = require('multer');


/***
 * Created By: Shubhankar Kesharwani
 * Created At: 20-05-2022
 * Desc: To upload any type of file with destination,size,upload_type from outside...
 * Function : fileUploadFun
 * Updated by - NA
 * Updated on - NA
 */

const fileUploadFun = (dir, mimetype, size) => {
    const mySize = size ? size : 6;
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, dir)
        },
        filename: (req, file, cb) => {
            const fileName = file.originalname.toLowerCase().split(' ').join('-')
            cb(null, Date.now() + '_' + fileName)
        }
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * mySize,
        },
        fileFilter: (req, file, cb) => {


              if (mimetype === "jpeg/png" ) {
                
                    if (file.mimetype ==="image/jpeg" || file.mimetype === 'image/jpg' || file.mimetype === "image/png" ) {
                        cb(null, true)
                    } else {
                        cb(null, false)
                        return cb(new Error("only jpeg and png"));
                    }                
              
             }

             if (mimetype === "jpeg" ) {
                
                if (file.mimetype ==="image/jpeg" ) {
                    cb(null, true)
                } else {
                    cb(null, false)
                    return cb(new Error("only jpeg file excepted..!"));
                }                
          
            }

            if (mimetype === "png" ) {
                
                if (file.mimetype === "image/png" ) {
                    cb(null, true)
                } else {
                    cb(null, false)
                    return cb(new Error("only png file excepted..!"));
                }                
          
            }

            if (mimetype === "pdf" ) {
                
                if (file.mimetype === "application/pdf") {
                    cb(null, true)
                } else {
                    cb(null, false)
                    return cb(new Error("only pdf file excepted..!"));
                }                
          
            }


            if (mimetype === "msword" ) {
                
                if (file.mimetype === "application/msword" ||  file.mimetype ===            
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    cb(null, true)
                } else {
                    cb(null, false)
                    return cb(new Error("only word .doc & .docx file excepted..!"));
                }                
          
            }


            if (mimetype === "msexcel" ) {
                
                if (file.mimetype === "application/vnd.ms-excel" ||  file.mimetype ===            
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    cb(null, true)
                } else {
                    cb(null, false)
                    return cb(new Error("only word .doc & .docx file excepted..!"));
                }                
          
            }

        }
    })
    return upload;
}

module.exports = {
    fileUploadFun
};



/*******************Extension MIME Type code**************** */

/*

.doc      application/msword
.dot      application/msword

.docx     application/vnd.openxmlformats-officedocument.wordprocessingml.document
.dotx     application/vnd.openxmlformats-officedocument.wordprocessingml.template
.docm     application/vnd.ms-word.document.macroEnabled.12
.dotm     application/vnd.ms-word.template.macroEnabled.12

.xls      application/vnd.ms-excel
.xlt      application/vnd.ms-excel
.xla      application/vnd.ms-excel

.xlsx     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
.xltx     application/vnd.openxmlformats-officedocument.spreadsheetml.template
.xlsm     application/vnd.ms-excel.sheet.macroEnabled.12
.xltm     application/vnd.ms-excel.template.macroEnabled.12
.xlam     application/vnd.ms-excel.addin.macroEnabled.12
.xlsb     application/vnd.ms-excel.sheet.binary.macroEnabled.12

.ppt      application/vnd.ms-powerpoint
.pot      application/vnd.ms-powerpoint
.pps      application/vnd.ms-powerpoint
.ppa      application/vnd.ms-powerpoint

.pptx     application/vnd.openxmlformats-officedocument.presentationml.presentation
.potx     application/vnd.openxmlformats-officedocument.presentationml.template
.ppsx     application/vnd.openxmlformats-officedocument.presentationml.slideshow
.ppam     application/vnd.ms-powerpoint.addin.macroEnabled.12
.pptm     application/vnd.ms-powerpoint.presentation.macroEnabled.12
.potm     application/vnd.ms-powerpoint.template.macroEnabled.12
.ppsm     application/vnd.ms-powerpoint.slideshow.macroEnabled.12

.mdb      application/vnd.ms-access

*/
var multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // cb(null, '../server/public/uploads/images');
      // cb(null, "/var/www/html/uploads/documents"); //need to change the path as per requirement
      // cb(null,"C:/Users/Public/Downloads");
      cb(null,"/home/ebabu/review-backend/apis/resourceResume"); // Ubuntu path for self
    },
    filename: (req, file, cb) => {
      var filetype = "";
      let ext=file.mimetype.split("/");
      if (file.mimetype === "/pdf") {
        filetype = "pdf";
      }
      if(ext[1]!="pdf"){
        cb("Invalid file format","")
      }else{
        cb(null, Date.now().toString() + '_' + file.originalname);
      }
    },
  });
  var upload = multer({ storage: storage });

module.exports = {
  upload
};

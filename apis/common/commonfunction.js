let Admin = require("../models/admin").Admin;
let moment = require("moment");
const jwt = require("jwt-simple");
let config = require("../../config");
var nodemailer = require("nodemailer");
const fs = require("fs");
const sgMail = require('@sendgrid/mail');
let userAuth = require("../models/userAuth").userAuth;

var pug = require('pug');
// const sg_key  = "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"; // shubham
const sg_key = "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"; //ss direct
sgMail.setApiKey(sg_key);

/*
 * --------------------------------------------------------------------------
 * Super Admin registration
 * ---------------------------------------------------------------------------
 */

const createDefaultAdmin = async (next) => {
  const admin = new Admin();

  admin.email = "noreply@supersourcing.com";
  admin.password = "password";
  admin.role = "admin";

  Admin.find({ role: "admin" }).exec((err, data) => {
    if (err) {
      console.log(err.message);
      let msg = "some error occurred";
      console.log(msg);
    } else if (data.length) {
      let msg = "Data is inserted already";
      // console.log(msg)
    } else if (!data.length) {
      if (admin) {
        admin.save().then((data, err) => {
          if (err) {
            console.log(err);
            let msg = "some error occurred";
            console.log(msg);
          } else {
            let msg = "data inserted";
            console.log("*****", msg);
          }
        });
      } else {
        let msg = "some error occurred";
        // console.log(msg)
      }
    }
  });
};


/*
 * --------------------------------------------------------------------------
 * Start of Tokanization
 * ---------------------------------------------------------------------------
 */

const createToken = function (player) {
  // console.log(player);
  let payload = {
    sub: player._id,
    iat: moment().unix(),
    email: player.email,
    role: player.role,
    name: player.name ? player.name : '',
    profilePic: player.profilePic ? player.profilePic : '',
    phone: player.phone ? player.phone : '',
  };
  
  payload.exp = moment().add(6, "days").unix();

  return jwt.encode(payload, config.TOKEN_SECRET);
};

const decodeToken = function (token) {
  return jwt.decode(token, config.TOKEN_SECRET);
};

const invalidateToken = function (users) {
  let payload = {
    sub: users._id,
    iat: moment().unix(),
    exp: moment().unix(),
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
};

/*
 * --------------------------------------------------------------------------
 * Start of Decoding token
 * ---------------------------------------------------------------------------
 */

const checkUserAuthentication = async function (req, res, next) {
  // console.log("**************************", req.headers);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized", status: false });
  }
  try {
    var token = req.headers.authorization.split(" ")[1];
    var userAuthData = await userAuth.findOne({ token: token,isActive:true });
     if(userAuthData === null)
     {
      return res.status(401).send({
        error: {
          message: "you are already logout with this token",
          code: "invalid_token",
          status: 401,
          inner: {},
        },
      });
     }
    var userData = await Admin.findOne({ _id: userAuthData.adminId });
    if (userData && userData.active ===true) {//userAuthData.isActive
      var payload = jwt.decode(token, config.TOKEN_SECRET);
      res.userId = userData._id;
      res.userRole = userData.role;
      payload = { ...payload, admin: userData };
      if (userData && payload.exp <= moment().unix()) {
        return res.status(440).send({
          message: "Login Time-out",
          status: false,
        });
      }
    } else {
      return res.status(401).send({
        error: {
          message: "you are already logout with this token",
          code: "invalid_token",
          status: 401,
          inner: {},
        },
      });
    }
  } catch (err) {
    if (err) {
      console.log(err.message);
      if(err.message == "Token expired"){
        return res.status(401).send({
          error: {
            message: "Token expired, Please login again.",
            code: "token_expired",
            status: 401
          },
        });
      }else{
          // sendResponse.invalidAccessTokenError(res);
          return res.status(401).send({
            error: {
              message: "Invalid access token",
              code: "invalid_token",
              status: 401,
              inner: {},
            },
          });
      }
    }
  }
  next();
  // next(payload);
};

/*
 * --------------------------------------------------------------------------
 * Email details to send every emails
 * ---------------------------------------------------------------------------
 */

//Send email transporter function

//host: 'smtp.gmail.com',
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_ID,
    pass: config.EMAIL_PWD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Mail Options to send email
var mailOptions = {
  from: "ruchika.p@engineerbabu.in", // sender address
};

const sendAccountVerificationMail = (userDetails, password) => {
  console.log("inside sendEmail");
  // var link = `${config.BASE_URL}/api/auth/activateAccount?email=${userDetails.email}&verificationToken=${userDetails.verificationToken}`;
  // console.log(userDetails);

  mailOptions.to = userDetails.email;
  mailOptions.subject = "EB-Vendor Management";
  mailOptions.html =
    '<div style="width: 680px;margin: 0 auto;">' +
    '<div style="background:#504482;height: 80px;">' +
    '<h3 style="color: #fff;font-size: 36px;font-weight: normal;padding: 18px 0 0 70px;margin: 0;"> Welcome! </h3>' +
    "</div>" +
    '<div style="background: #fff;padding:23px 70px 20px 70px;">' +
    '<h4 style="font-size: 24px; color: #504482; margin: 20px 0 30px;">Hello ' +
    userDetails.name +
    "</h4>" +
    '<div style="color: #8b8382; font-size: 15px;">' +
    `Congratulations!!! You have successfully registered with <strong> EB-Vendor Management  </strong>. Your username is <strong> ${userDetails.email} </strong>. Your password is <strong> ${password}</strong>. URL- <a href="http://3.109.200.142/auth/login">Click Here</a>` +
    "</div>" +
    "</div>" +
    '<div style="height: 52px;background:#dfdfdf;"></div>' +
    "</div>";

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      let msg = "some error occurred";
      console.log(err);
      // sendResponse.sendErrorMessage(msg, res);
    } else {
      return res.status(200).send({
        message: "Email sent",
        status: true,
      });
    }
  });
};

const sendMailForOtp = (userDetails, otp) => {
  console.log("inside sendEmail");
  // var link = `${config.BASE_URL}/api/auth/activateAccount?email=${userDetails.email}&verificationToken=${userDetails.verificationToken}`;
  // console.log(userDetails);

  mailOptions.to = userDetails.email;
  mailOptions.subject = "EB-Vendor Management";
  mailOptions.html =
    '<div style="width: 680px;margin: 0 auto;">' +
    '<div style="background:#504482;height: 80px;">' +
    '<h3 style="color: #fff;font-size: 36px;font-weight: normal;padding: 18px 0 0 70px;margin: 0;"> Welcome! </h3>' +
    "</div>" +
    '<div style="background: #fff;padding:23px 70px 20px 70px;">' +
    '<h4 style="font-size: 24px; color: #504482; margin: 20px 0 30px;">Hello ' +
    userDetails.name +
    "</h4>" +
    '<div style="color: #8b8382; font-size: 15px;">' +
    `Please do not share this OTP with anyone for security reasons. Your OTP is <strong> ${otp} </strong>.` +
    "</div>" +
    "</div>" +
    '<div style="height: 52px;background:#dfdfdf;"></div>' +
    "</div>";

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      let msg = "some error occurred";
      console.log(err);
      // sendResponse.sendErrorMessage(msg, res);
    } else {
      return res.status(200).send({
        message: "Email sent",
        status: true,
      });
    }
  });
};

const mailSend = async (to, subject, mailData, templateId) => {
  if(to && to!=null)
  {
    const msg = {
      to: to,
      from : "Supersourcing <hey@supersourcing.com>",
      subject: subject,
      html: pug.renderFile("apis/template/"+templateId, mailData)
    };
    sgMail
      .send(msg)
      .then(() => {
        return {message: 'success'};
      })
      .catch(error => {
        console.error(error.toString());
        const { message, code, response } = error;
        const { headers, body } = response;
        return {message: 'error'};
      });
  }
}

const multiMailSend = async (to, subject, mailData, templateId ,cc) => {
  if(to && to!=null)
  {
    const msg = {
      to: to,
      cc: cc,
      from : "Supersourcing <hey@supersourcing.com>",
      subject: subject,
      html: pug.renderFile("apis/template/"+templateId, mailData)
    };
    sgMail
      .send(msg)
      .then(() => {
        return {message: 'success'};
      })
      .catch(error => {
        console.error(error.toString());
        const { message, code, response } = error;
        const { headers, body } = response;
        return {message: 'error'};
      });
  }
}

//directory exist function
const directoryExist = (dir) => {
  // let dir = 'directory path'
  console.log("........done>>>......");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log("........done......");
  }
};

module.exports = {
  createDefaultAdmin,
  createToken,
  decodeToken,
  invalidateToken,
  checkUserAuthentication,
  sendAccountVerificationMail,
  sendMailForOtp,
  mailSend,
  multiMailSend,
  directoryExist
}
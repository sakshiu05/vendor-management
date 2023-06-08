let moment = require("moment");
const jwt = require("jwt-simple");
let config = require("../../config");
var nodemailer = require("nodemailer");


/***
 * Created By: Shubhankar Kesharwani
 * Created At: 20-05-2022
 * Desc: To create Token for testimonail client (Review-user) (used in checkUserAuthentication)...
 * Function : createTokenTestimonialReviewUser
 * Updated by - NA
 * Updated on - NA
 */

const createTokenTestimonialReviewUser = function (player) {
    let payload = {
      sub: player._id,
      iat: moment().unix(),
      email: player.email, 
      name: player.name ? player.name : '',
    };
    
    payload.exp = moment().add(1, "days").unix();
  
    return jwt.encode(payload, config.TESTIMONIAL_TOKEN_SECRET);
  };
  
  const decodeTokenTestimonialReviewUser = function (token) {
    return jwt.decode(token, config.TESTIMONIAL_TOKEN_SECRET);
  };
  
  const invalidateTokenTestimonialReviewUser = function (users) {
    let payload = {
      sub: users._id,
      iat: moment().unix(),
      exp: moment().unix(),
    };
    return jwt.encode(payload, config.TESTIMONIAL_TOKEN_SECRET);
  };
  

  /***
 * Created By: Shubhankar Kesharwani
 * Created At: 20-05-2022
 * Desc: Email details to send every emails (At the time of registration)..
 * Function : testimonialSendAccountVerificationMail
 * Updated by - NA
 * Updated on - NA
 */

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
  
  var mailOptions = {
    // from: "shubhankar.k@engineerbabu.in", // sender address
  };
  
  const testimonialSendAccountVerificationMail = (userDetails) => {
  //  console.log("inside sendEmail");
    // var link = `${config.BASE_URL}/api/auth/activateAccount?email=${userDetails.email}&verificationToken=${userDetails.verificationToken}`;
   // console.log(userDetails);
  
    mailOptions.to = userDetails.email;
    mailOptions.subject = "EB-Review Management";
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
      `Congratulations!!! You have successfully registered with <strong> EB-Review Management  </strong>. Your username is <strong> ${userDetails.email} </strong>. Your password is <strong> ${userDetails.password}</strong>. URL- <a href="http://3.109.200.142/auth/login">Click Here</a>` +
      "</div>" +
      "</div>" +
      '<div style="height: 52px;background:#dfdfdf;"></div>' +
      "</div>";
  
   return transporter.sendMail(mailOptions, function (err, info) {
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
  

   /***
 * Created By: Shubhankar Kesharwani
 * Created At: 20-05-2022
 * Desc: To reset password and send otp throught mail (used in otpVerify fun..)
 * Function : testimonialSendMailForOtp
 * Updated by - NA
 * Updated on - NA
 */


  const testimonialSendMailForOtp = (userDetails, otp) => {
    // console.log("inside sendEmail");
    // var link = `${config.BASE_URL}/api/auth/activateAccount?email=${userDetails.email}&verificationToken=${userDetails.verificationToken}`;
    // console.log(userDetails);
  
    mailOptions.to = userDetails.email;
    mailOptions.subject = "EB-Review Management";
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
  
  module.exports = {
    createTokenTestimonialReviewUser,
    decodeTokenTestimonialReviewUser,
    invalidateTokenTestimonialReviewUser,
    testimonialSendAccountVerificationMail,
    testimonialSendMailForOtp
  }
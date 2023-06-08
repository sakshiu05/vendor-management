const jwt = require('jwt-simple');
let config = require('../../config');
let testimonial_client = require("../models/testimonial_clientModel").testimonial_client;
let testimonialUserAuth = require("../models/testimonialUserAuth").testimonialUserAuth;
let moment = require("moment");


/***
 * Created By: Shubhankar Kesharwani
 * Created At: 20-05-2022
 * Desc: To check Token for testimonail client (Review) user...
 * Function : checkUserAuthentication
 * Updated by - NA
 * Updated on - NA
 */

const checkUserAuthentication = async function (req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized", status: false });
    }
    try {
      var token = req.headers.authorization.split(" ")[1];
      var userAuthData = await testimonialUserAuth.findOne({ token: token });
      var userData = await testimonial_client.findOne({ _id: userAuthData. userId });
      if (userData.active && userAuthData.isActive !== false) {
        var payload = jwt.decode(token, config.TESTIMONIAL_TOKEN_SECRET);
        res.userId = userData._id;
        payload = { ...payload, userDetail: userData };
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
        console.log(err);
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
    next();
    // next(payload);
  };
  
  module.exports = {
    checkUserAuthentication
  }
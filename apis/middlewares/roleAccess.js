const Admin = require("../models/admin").Admin;
let userAuth = require("../models/userAuth").userAuth;
let config = require("../../config");
const jwt = require("jwt-simple");

module.exports = {
    checkRole : (role_names) => {
        return async function (req, res, next) {
            var token = req.headers.authorization.split(" ")[1];
            var token = jwt.decode(token, config.TOKEN_SECRET);
            var token_role = token.role;//logged in user role
            var userData =await Admin.findOne({ role: token_role }).select("role");
            let user_role = userData.role;
            let is_matched = "no";
            for(let i=0; i<role_names.length; i++){
                if(role_names[i] == user_role){
                    // console.log("user role matched");
                    is_matched = "yes";
                    break;
                }
            }
            if(is_matched == "no"){
                return res.status(401).send({status: 'false',message: "You are not authorized to perform this action."});
            }
            return next();
        }
    },
    routeAccess : (roles) => {
        return function (req, res, next) {
            //Step 1 : get role from token
            //Step 2 : Match role from above array variable 
        
        //Step 1 start
            // var token = req.headers.authorization.split(" ")[1];
            // var userAuthData = await userAuth.findOne({ token: token });
            // var userData = await Admin.findOne({ _id: userAuthData. adminId });
            // var user_role = userData.role;
        
        //Step 2 start

            // console.log(typeof(role));
            // let find_response = await Admin.findOne();
            return next();
        }        
        /* return function(req,res,next){
            // throw globalCalls.forbiddenError("You are not authorized to perform this action.");
        } */
    },

    permissionAccess : (role_names) => {
        return function (req, res, next) {
            // roles = role_names.split(",");
            // console.log(typeof(role_names));
            // let find_response = await Admin.findOne();
            return next();
        }        
        /* return function(req,res,next){
            // throw globalCalls.forbiddenError("You are not authorized to perform this action.");
        } */
    }
}
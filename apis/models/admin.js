"use strict";

/*
 * --------------------------------------------------------------------------
 * Include required modules
 * ---------------------------------------------------------------------------
 */
let mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  // mongoosePaginate = require('mongoose-paginate'),
  bcrypt = require("bcryptjs");

/*
 * --------------------------------------------------------------------------
 * Define admin collection
 * ---------------------------------------------------------------------------
 */
var adminSchema = new Schema(
  {
    email: { type: String, required: false,default:null },//true, unique: true
    name: { type: String, required: false },//unique: true
    password: { type: String, required: false, select: false },
    profilePic:{ type: String, required: false},
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    token: { type: String },
    isSuperAdmin: { type: Boolean, required: false },
    role: { type: String, required: false }, // admin, vender, vendor-associate(team member), account-manager, sales-manager, tech-partner-admin, account-manager-admin, engineer, finance
    icp_status : {type : Boolean , required : false},

    lastSourceAdded: { type: Date, required: false, default: Date.now },
    lastSourceVerified: { type: Date, required: false, default: Date.now },
    isTeamMember: { type:Boolean, required: false},
    active: { type: Boolean, default: true},
    addedBy:{  type:mongoose.Schema.Types.ObjectId, required: false},
    accountManager: { type:mongoose.Schema.Types.ObjectId, required: false },
    vendorContactPerson: { type: String, required: false },
    // clientPOC : { type: String, required: false },
    ebPOC:{ type: mongoose.Schema.Types.ObjectId,  required: false },
    phone:{type: String, required: false},
    otherPhone:{type: String, required: false},
    isDelete:{type:Boolean, default: false},
    
    // added_by_admin_id: {type: Schema.Types.ObjectId,required:false,default:null}

    clientPOC :{type: Array, required: false,default: null},
    department:{type:String,required:false,default:null},

    individualEnggPhoneNumber:{type:Array,required:false,default:null},
    resource_id:{type:Schema.Types.ObjectId,required:false,default:null},
  },
  { timestamps: true }
);

/*
 * --------------------------------------------------------------------------
 * Encrypt and store the admin's password
 * ---------------------------------------------------------------------------
 */

 adminSchema.pre("save", function (next) {
  let admin = this;
  if (!admin.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(admin.password, salt, function (err, hash) {
      admin.password = hash;
      next();
    });
  });
});

/*
 * --------------------------------------------------------------------------
 * Confirm a admin's password against the stored password
 * ---------------------------------------------------------------------------
 */

 adminSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

/*
 * --------------------------------------------------------------------------
 * Export the Admin model
 * ---------------------------------------------------------------------------
 */

var all_roles_logSchema = new Schema(
  {
    //Action By
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_name: { type: String, required: true},
    user_role : {type:String, required:true},
    
    //Action For
    action_for_id: { type: mongoose.Schema.Types.ObjectId, required: false },
    action_for_user_name: { type: String, required: false},
    action_for_user_role : {type:String, required:false},

    //Action To
    action_to_id: { type: mongoose.Schema.Types.ObjectId, required: false },
    action_to_user_name: { type: String, required: false},
    action_to_user_role : {type:String, required:false},

    message: { type: String, required: true},
    message_two: { type: String, required: false},
    date: {type: Date, default: Date.now }
  },{timestamps:true}
);


let Admin = mongoose.model("Admin", adminSchema);
let all_roles_log = mongoose.model("all_roles_log", all_roles_logSchema);
module.exports = {
  Admin: Admin,
  all_roles_log: all_roles_log
};

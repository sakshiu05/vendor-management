const ObjectId = require("mongodb").ObjectID;
const global_logs = require("../models/admin").all_roles_log;
const Admin = require("../models/admin").Admin;
const Resource = require("../models/resource").Resources;

function Message(message){
    switch(message){
        case 'loggedIn': message = "Logged In"; break;
        case 'loggedOut': message = "Logged Out"; break;
        case 'addedResource': message = "added a resource"; break;
        case 'Added': message = "added"; break;
        case 'Removed': message = "removed"; break;
        case 'Modified': message = "modified"; break;
        case 'Moved': message = "moved"; break;
        case 'Hired': message = "marked hired"; break;
        case 'Rejected': message = "marked rejected"; break;
        case 'scheduledInterview': message = "scheduled interview"; break;
        case 'cancelInterview': message = "interview cancelled"; break;
        case 'assignedAM': message = "AM assigned"; break;
        case 'credentialsGiven': message = "credentials given to resource"; break;
        case 'addedOnboardingDate': message = "added onboarding date for resource"; break;
        case 'inactive' : message = 'in-Activated'; break;
        case 'active' : message = 'Activated'; break;
        default: message = message;
    }
    return message;
}

const add_global_log = async(data) => {
    try{
        data.date = new Date();
        data.message = Message(data.message);

        // user_id denotes logged in user id
        let admin_data = await Admin.findOne({_id: ObjectId(data.user_id) });
        data.user_role = admin_data.role;

        //  action taken for person data
        //  ex:- Monti Parahua added Anshita soni as TP Associate.
        //  ex:- action_for_id is for Anshita soni
        if(data.action_for_id){
            let action_for_data = await Admin.findOne({_id: ObjectId(data.action_for_id) });
            if(!action_for_data){
                resource_data = await Resource.findOne({_id: ObjectId(data.action_for_id) });
                if(resource_data){
                    data.action_for_user_name = resource_data.name;
                    data.action_for_user_role = 'resource';
                }
            }
            
            if(action_for_data){
                data.action_for_user_name = action_for_data.name;
                data.action_for_user_role = action_for_data.role;
            } 
        }
        // action_to_id denotes third role user
        // ex:- Joel Paul scheduled interview for Rishab at paytm
        // ex:- action_to_id denotes paytm
        if(data.action_to_id){
            let action_to_data = await Admin.findOne({_id: ObjectId(data.action_to_id) });   
            if(action_to_data){
                data.action_to_user_name = action_to_data.name;
                data.action_to_user_role = action_to_data.role;
            }
        }
        if(admin_data.role == 'resource'){
            resource_data = await Resource.findOne({_id: admin_data.resource_id });
            data.user_name = resource_data.name;
        }else{
            data.user_name = admin_data.name;
        }
        let save_log = await new global_logs(data).save();//console.log(save_log);
    }catch(error){
        console.log(error.message);
    }
  }
  
module.exports = {
    add_global_log
};
  
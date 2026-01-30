const { checkUserExists } = require('./utils');
const {checkSubGroupExists} = require('./group_utils');
const {checkUserExistsInSubGroup} = require('./group_utils');
const {addUserToSubGroup} = require('./group_utils');

async function modifyUserGroup(user_email, groupName, subGroupName){
    try {
      console.log('inside modify user group');
      console.log(user_email,groupName,subGroupName);
    //call authorizeadmin endpoint to get the user permissions, if the user is authorized then only he can create subgroups else return user is not authorized
    const userExists = await checkUserExists(user_email);
    if (!userExists) {
      console.log("User does not exist");
      return {success: false, message: `User ${user_email} does not exists`}
    }

    const subGroupExists = await checkSubGroupExists(groupName,subGroupName);
    if(!subGroupExists){
      return {success: false, message: `Sub group ${subGroupName} doesn't exist.`};
    }

    const userExistsInSubGroupResponse = await checkUserExistsInSubGroup(user_email,groupName,subGroupName);
    console.log('userExistsInSubGroupResponse:',userExistsInSubGroupResponse);
    if(userExistsInSubGroupResponse){
      return {success: false, message: `User ${user_email} already exists in subGroup ${subGroupName}`};
    }
    const addUserToSubGroupResponse = await addUserToSubGroup(user_email,groupName,subGroupName);
    console.log('addUserToSubGroupResponse:',addUserToSubGroupResponse);
    return {success: true, message: `User ${user_email} added to subGroup ${subGroupName}`};
  } catch (error) {
    console.error("Error in modifying user group", error);
    throw error;
  }
}

async function modifyUserGroupController(req,res) {
    try {
        console.log('req body',req.body);
        const user_email = req.body.user_email;
        const group_name = req.body.group_name;
        const sub_group_name = req.body.sub_group_name;
        // const user_permissions = req.body.user_permissions;
        const modifyUserGroupResp = await modifyUserGroup(user_email, group_name, sub_group_name);
        console.log("Modify user group response: ", modifyUserGroupResp)
        if (modifyUserGroup.success === false) {
            return res.status(200).json({success: false, data: modifyUserGroupResp.message})
        }
        return res.status(200).json({success: true, data: modifyUserGroupResp.message});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

module.exports = {
    modifyUserGroupController
}

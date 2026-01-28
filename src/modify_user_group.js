const {checkUserExists} = require('./user/user_check');
const {checkSubGroupExists} = require('./group/sub_group_check');
const {checkUserExistsInSubGroup} = require('./group/user_in_sub_group_check');
const {addUserToSubGroup} = require('./group/add_user_in_sub_group');

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
module.exports = {modifyUserGroup};

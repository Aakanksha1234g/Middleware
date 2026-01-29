const {checkUserExists} = require('../user/user_check');
const {checkSubGroupExists} = require('../group/sub_group_check');
const {checkUserExistsInSubGroup} = require('../group/user_in_sub_group_check');
const {deleteUserFromTheSubGroup} = require('../group/delete_user_from_sub_group');

async function deleteUserFromSubGroup(user_email, groupName, subGroupName){
    try {
        console.log('inside deleteUserFromSubGroup');
        console.log(user_email, groupName, subGroupName);
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
        if(!userExistsInSubGroupResponse){
        return {success: false, message: `User ${user_email} doesn't exist in subGroup ${subGroupName}`};
        }

        const deleteUserFromSubGroupResponse = await deleteUserFromTheSubGroup(user_email,groupName,subGroupName);
        console.log('deleteUserFromSubGroupResponse: ',deleteUserFromSubGroupResponse);
        return deleteUserFromSubGroupResponse;

    }catch(error){
        console.error('Error in deleteUserFromSubGroup',error);
        throw error;
    }
};


async function deleteUserSubGroup(req,res){
    try {
        //DELETE /admin/realms/{realm}/users/{user-id}/groups/{groupId}	
        console.log('req body',req.body);
        const user_email = req.body.user_email;
        const group_name = req.body.group_name;
        const sub_group_name = req.body.sub_group_name;
        const deleteUserSubGroupResp = await deleteUserFromSubGroup(user_email,group_name, sub_group_name);
        console.log('deleteUserGroupResponse: ',deleteUserSubGroupResp);
        if(deleteUserSubGroupResp === true){
            return res.status(200).json({success: true, data: deleteUserSubGroupResp.message})
        }
        return res.status(200).json({success: false, data: deleteUserSubGroupResp.messsage});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

module.exports = {
    deleteUserSubGroup
}
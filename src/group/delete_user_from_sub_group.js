const {getUserUUID} = require('../user/get_user_uuid');
const {getSubGroupUUID} = require('../group/get_sub_group_id');
const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');

async function deleteUserFromTheSubGroup(user_email,groupName,subGroupName){
    try {
        console.log('inside deleteUserFromSubGroup function...');
        const adminToken = await getAdminToken();
        const userUUID = await getUserUUID(user_email);
        const subGroupUUID = await getSubGroupUUID(groupName, subGroupName);  
                //DELETE /admin/realms/{realm}/users/{user-id}/groups/{groupId}	
        const deleteUserFromSubGroupResponse = await axios.delete(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/groups/${subGroupUUID}`,
            {headers : {Authorization : `Bearer ${adminToken}`}}
        )
        console.log('deleteUserFromSubGroupResponse',deleteUserFromSubGroupResponse); //has status 204, statusText : no content when user is deleted
        console.log('deleteUserFromSubGroupResponse data',deleteUserFromSubGroupResponse.data); // is empty 
        console.log(`deleteUserFromSubGroupResponse status: ${deleteUserFromSubGroupResponse.status}, statusText : ${deleteUserFromSubGroupResponse.statusText}`);
        if(deleteUserFromSubGroupResponse.status == 204){
            return { success: true, message : `User ${user_email} has been deleted from sub_group ${subGroupName} of group ${groupName}`};
        }
        return {success : false, message : `Error in deleting user ${user_email} from sub_group ${subGroupName} of group ${groupName}`};
    }catch(error){
        console.error('Error in deleteUserFromTheSubGroup:',error);
        return error;
    }
}
module.exports = {deleteUserFromTheSubGroup};
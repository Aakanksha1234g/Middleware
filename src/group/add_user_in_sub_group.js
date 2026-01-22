const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');
const {getUserUUID} = require('../user/get_user_uuid');
const {getSubGroupUUID} = require('../group/get_sub_group_id');

async function addUserToSubGroup(userEmail,groupName,subGroupName){
    try{
        console.log(`Adding user ${userEmail} to sub-group ${subGroupName}`);
        const adminToken = await getAdminToken();
        // PUT /admin/realms/{realm}/users/{user-id}/groups/{groupId}
        const userUUID = await getUserUUID(userEmail);
        const subGroupID = await getSubGroupUUID(groupName, subGroupName);
        // Add user to org group as admin, without content-type because keycloak rejects put request with content-type
        //if only headers also the user doesnt get added to group
        // so adding null which means no body which will add user to group
        //in place of null, {} can be used and we will get keycloak response as 204 No Content

        const addUserToSubGroupResponse = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/groups/${subGroupID}`,
            null,                                   
            {headers: {Authorization : `Bearer ${adminToken}`}}
        );
        //if user is added to the group then the response returns 204, No Content and response data is empty.
        // console.log('addUserToSubGroupResponse:',addUserToSubGroupResponse); 
        // console.log('addUserToSubGroupResponse data:',addUserToSubGroupResponse.data);   
        return addUserToSubGroupResponse.status;
    }catch(error){
        console.error(`Error in addUserToSubGroup status ${error.response.status}, statusText: ${error.response.statusText}`);
        console.error(`Error in addUserToSubGroup: ${error.response.data.error}`);
        return error.status;    
    }
}
module.exports = {addUserToSubGroup};
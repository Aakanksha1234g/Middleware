const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');
const {getGroupUUID} = require('../group/get_group_id');

async function getSubGroupUUID(groupName,subGroupName){
    //GET /admin/realms/{realm}/groups/{group-id}/children
    try {
        const adminToken = await getAdminToken();
        const groupID = await getGroupUUID(groupName);
        const subGroupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children`,
            {
                params : {search: subGroupName},
                headers : {Authorization : `Bearer ${adminToken}`}
            }
        );
        // console.log('subrGroupResponse:',subGroupResponse);  //gives all headers, admin token,sub-group info with id name, parent_id
        const subGroups = subGroupResponse.data; //has sub-group info
        // console.log('Searching subGroup:',subGroupName);
        for(const subGroup of subGroups){
            // console.log('subGroup:',subGroup);
            // console.log('subGroup name:',subGroup.name);
            if(subGroup.name !== subGroupName){
                continue;
            }
            console.log('subGroup name:',subGroup.name);
            return subGroup.id;
        }
        return true;
    } catch(error){
        console.error('Error in getSubGroupUUID:',error);
        return error.status;
    }
}

module.exports = {getSubGroupUUID};
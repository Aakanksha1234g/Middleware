const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');
const {getGroupID} = require('../group/get_group_id');

async function checkSubGroupExists(groupName,subGroupName){
    try {
        const adminToken = await getAdminToken();
        const groupID = await getGroupID(groupName);
        const subGroupExistResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children?search=${subGroupName}&exact=true&max=1`,
            {
                headers : {Authorization : `Bearer ${adminToken}`}
            }
        );
        // console.log('subGroupExistsResponse:',subGroupExistResponse); //consists headers, adminToken,url,data:[]
        const subGroup = subGroupExistResponse.data;  //this is an array which has searched group info
        // console.log("subGroup:",subGroup); 
        const subGroupExists = subGroup.some(group => group.name === subGroupName);  //has true/false value
        console.log(`Sub Group ${subGroupName} exists:`, subGroupExists);
        
        return subGroupExists;
    } catch(error){
        console.error('Error in checkSubGroupExists:',error);
        return error.status;
    }
}

module.exports = {checkSubGroupExists};
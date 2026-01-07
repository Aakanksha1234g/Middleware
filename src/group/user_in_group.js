const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');
const {getGroupID} = require('../group/get_group_id');


async function userExistsInGroup(organization,user_email){
    try {
        console.log(`Checking if the user ${user_email} exists in the group...`);
        console.log(`Inside the userExistsInGroup Function...`);
        const adminToken = await getAdminToken();
        const groupID = await getGroupID(organization);
        console.log(`Group id of ${organization} is ${groupID}`);

        const anyUserExistsInGroupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/members`,
            {headers: {Authorization : `Bearer ${adminToken}`}}
        );
        console.log(`anyUserExistsInGroupResponse`, anyUserExistsInGroupResponse);
        console.log('UserExistsInGroupResponse data:' , anyUserExistsInGroupResponse.data);  //if it is empty means user doens't exist in that group
        
        return {
           'userExistsInGroup' :anyUserExistsInGroupResponse.data,
           'groupID': groupID
        };
    }catch(error){
        console.error(`Error in userExistsInGroup function: ${error}`);
        return false;
    }
}

module.exports = {userExistsInGroup};



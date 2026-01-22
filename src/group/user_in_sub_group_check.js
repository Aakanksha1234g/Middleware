const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');
const {getSubGroupUUID} = require('../group/get_sub_group_id');

async function checkUserExistsInSubGroup(userEmail, groupName,subGroupName){
    try {
        // console.log(`Checking if the user ${userEmail} exists in the group...`);
        // console.log(`Inside the userExistsInGroup Function...`);
        const adminToken = await getAdminToken();
        const subGroupUUID = await getSubGroupUUID(groupName,subGroupName);
        console.log(`Sub group id of ${subGroupName} is ${subGroupUUID}`);

        const userExistsInSubGroupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${subGroupUUID}/members`,
            {headers: {Authorization : `Bearer ${adminToken}`}}
        );
        // console.log('userExistsInSubGrou[Response',userExistsInSubGroupResponse);   //has headers, token, data shows the user info if user is in the sub group 
        console.log('userExistsInSubGroupResponse data:' , userExistsInSubGroupResponse.data); //returns nothing if user doesn't exist, else returns all users in sub group
        const userExistsInSubGroup = userExistsInSubGroupResponse.data.some(user => user.email === userEmail);  //has true/false value
        return userExistsInSubGroup;
    }catch(error){
        console.error(`Error in checkUserExistsInSubGroup : ${error}`);
        return error.status;
    }
}

module.exports = {checkUserExistsInSubGroup};



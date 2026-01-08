const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');

async function checkUserAdminOfGroup(userID,organization){
    try {
        const adminToken = await getAdminToken();
        //Checking realm-management permissions of user to check if user is admin of group
        const assignRolesResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/role-mappings`);
        console.log('Assign realm roles response:',assignRolesResponse);
        console.log('Assigned realm roles to user:', assignRolesResponse.data);
    }catch(error){
        console.error(`Error in checkUserAdminOfGroup function: `,error);
        return false;
    }
}

module.exports = {checkUserAdminOfGroup};
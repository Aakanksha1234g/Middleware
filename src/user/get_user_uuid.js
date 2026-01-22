const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');

async function getUserUUID(user_email) {
    try {
        const adminToken = await getAdminToken();
        const userResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
            {
                headers: {'Authorization':`Bearer ${adminToken}`}, params : {email: user_email},
            }
        );
        console.log('User response:',userResponse.data[0].id);
        return userResponse.data[0].id;
    }catch(error){
        console.error('Error in getUserUUID:',error);
        return error.status;
    }
}

module.exports = {getUserUUID};
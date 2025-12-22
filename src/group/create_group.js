const config = require('../config');
const axios = require('axios');
const { getAdminToken } = require('../admin_token');

async function create_group(group_name) {
    try {
        console.log('Inside create_group function...');
        const adminToken = await getAdminToken();
        const response = axios.post (
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups`,
            {name: group_name},
            {headers : {'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'},
            }
            );
        const groupCreatedResponse = await axios.get(
        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups?search=${group_name}&exact=true&max=1`,
        {
            headers: {'Authorization' : `Bearer ${adminToken}`},
        }
        );
        console.log(`Group ${group_name} created successfully with response : ${groupCreatedResponse.status}`);
        return groupCreatedResponse.status;
    }catch(error){
        console.error('Group creation failed:',error.message);
        return false;
    }
}
module.exports = {create_group};
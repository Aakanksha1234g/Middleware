const config = require('../config');
const axios = require('axios');
const { getAdminToken } = require('../admin_token');

async function createGroup(group_name) {
    try {
        // console.log('Inside create_group function...'); // TODO: Remove debug log
        const adminToken = await getAdminToken();
        const groupCreatedResponse = await axios.post (
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups`,
            {name: group_name},
            {headers : {'Authorization': `Bearer ${adminToken}`,'Content-Type': 'application/json'},
            });
        
        console.log('Group created response:', groupCreatedResponse); // TODO: For debugging - remove later
        console.log(`Group '${group_name}' created successfully. Status: ${groupCreatedResponse.status}. StatusText: ${groupCreatedResponse.statusText}`);        
        return true; // FIXME: return the status code [after checking]
    }catch(error){
        console.error('Group creation failed:',error.message);
        return false; // FIXME: return the status code [after checking]
    }
}

module.exports = {createGroup};
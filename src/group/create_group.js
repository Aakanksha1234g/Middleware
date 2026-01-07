const config = require('../config');
const axios = require('axios');
const { getAdminToken } = require('../admin_token');

async function create_group(group_name) {
    try {
        console.log('Inside create_group function...');
        const adminToken = await getAdminToken();
        const groupCreatedResponse = await axios.post (
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups`,
            {name: group_name},
            {headers : {'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'},
            }
            );
            console.log('Group created response:', groupCreatedResponse);
        // console.log("create group response:",groupCreatedResponse); //consists of status: 201 and statusText:'Created' 
        console.log("create group response status:",groupCreatedResponse.status);
        console.log(`Group created response status: ${groupCreatedResponse.status}, statusText: ${groupCreatedResponse.statusText}`);
        return groupCreatedResponse.status;
    }catch(error){
        console.error('Group creation failed:',error.message);
        return false;
    }
}

module.exports = {create_group};
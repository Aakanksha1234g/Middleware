const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');

async function getGroupUUID(organization){
    try {
        // console.log(`Inside the getGroupUUId Function...`);
        const adminToken = await getAdminToken();
        const groupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups`,
            {
                params : {search: organization},
                headers : {Authorization : `Bearer ${adminToken}`}
            }
        );
        // console.log('GroupResponse:',groupResponse.data);
        const groupID = groupResponse.data[0].id;
        return groupID;
    }catch(error){
        console.error(`Error in fetching groupID: ${error}`);
        return error.status;
    }
}

module.exports = {getGroupUUID};
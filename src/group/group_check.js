const { getAdminToken } = require('../admin_token');
const config = require('../config');
const axios = require('axios');

async function checkGroupExists(organization) {
    try {
        console.log(`Checking if group ${organization} exists.`);
        console.log('Inside  checkgroupExists function...');
        const adminToken = await getAdminToken();
        const groupExistsResponse = await axios.get(
        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups?search=${organization}&exact=true&max=1`,
        {
            headers: {'Authorization' : `Bearer ${adminToken}`},
        }
        );
        const groups = groupExistsResponse.data;  //this is an array
        console.log("group check response data:",groups);
        const groupExists = groups.some(group => group.name === organization);
        console.log(`Group ${organization} exists:`, groupExists);
        return groupExists;
    } catch(error) {
        if(error.response?.status === 404) return false;
        console.error('Group check failed:',error.message);
        throw error;
    }
}
module.exports = {checkGroupExists};
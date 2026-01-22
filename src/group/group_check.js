const { getAdminToken } = require('../admin_token');
const config = require('../config');
const axios = require('axios');

async function checkGroupExists(organization) {
    try {
        const adminToken = await getAdminToken();
        const groupExistsResponse = await axios.get(
        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups?search=${organization}&exact=true&max=1`,
        {
            headers: {'Authorization' : `Bearer ${adminToken}`},
        }
        );
        // console.log('groupsExistsResponse:',groupExistsResponse); //consists headers, adminToken,url,data:[]
        const group = groupExistsResponse.data;  //this is an array which has searched group info
        // console.log("group check response data:",group); 
        const groupExists = group.some(group => group.name === organization);  //has true/false value
        // console.log(`Group ${organization} exists:`, groupExists);
        
        return groupExists;
    } catch(error) {
        // if(error.response?.status === 404) return false; //FIXME: Check this
        console.error('Group check failed:',error.message);
        return false;
    }
}
module.exports = {checkGroupExists};
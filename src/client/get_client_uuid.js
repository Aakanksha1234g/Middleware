const config = require('../config');
const {getAdminToken} =  require('../admin_token');
const axios = require('axios');

async function getClientUUId(clientId){
    //Get clientId
    try {
        console.log(`Searching clientId of client ${clientId}`);
        const adminToken = await getAdminToken();
        const getClientIdResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients`,
            {params : {'clientId':clientId}, // FIXME: Check this
            headers : {Authorization:`Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('Get ClientId response : ',getClientIdResponse.data);
        console.log('Get ClientId response : ',getClientIdResponse.data[0].id);
        return getClientIdResponse.data[0].id;
    }catch(error){
        console.error('Process to get client Id failed:',error.message);
        return false;
    }
}

module.exports = {getClientUUId};
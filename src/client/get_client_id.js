const config = require('../config');
const {getAdminToken} =  require('../admin_token');
const axios = require('axios');

async function getClientId(client_name){
    //Get clientId
    try {
        console.log(`Searching clientId of client ${client_name}`);
        console.log(`Inside getClientId function...`);
        const adminToken = await getAdminToken();
        const getClientIdResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients`,
            {params : {'clientId':client_name},
            headers : {Authorization:`Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('Get ClientId response : ',getClientIdResponse.data[0]).id;
        return getClientIdResponse.data[0].id;
    }catch(error){
        console.error('Process to get client Id failed:',error.message);
        return false;
    }
}

module.exports = {getClientId};
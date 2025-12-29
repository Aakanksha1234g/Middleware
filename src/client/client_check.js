const {getAdminToken} = require('../admin_token');
const config = require('../config');
const axios = require('axios');

async function checkClientExists(clientId) {
    try {
        console.log(`Checking if client ${clientId} exists.. `);
        const adminToken = await getAdminToken();
        const clientExistsResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientId}`,
            {
                headers : {'Authorization' : `Bearer ${adminToken}`}
            }
        );
        const clients = clientExistsResponse.data;  //this is an array
        console.log("client check response data:",clients);
        const clientExists = clients.some(client => client.id === clientId );
        console.log(`Client ${clientId} exists :`,clientExists);
        return clientExists;
    } catch(error){
        console.error('Client check failed:',error.message);
        return false;
    }
    
}

module.exports = {checkClientExists};
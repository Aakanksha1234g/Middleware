const {getAdminToken} = require('../admin_token');
const config = require('../config');
const axios = require('axios');

async function checkClientExists(clientId) {
    try {
        console.log(`Checking if client ${clientId} exists.. `);
        const adminToken = await getAdminToken();
        const clientExistsResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients`,
            {
                headers : {'Authorization' : `Bearer ${adminToken}`},  params: {clientId:clientId},
            }
        );
        // console.log('clientExistsResponse: ',clientExistsResponse);  //consists of client data array
        const clients = clientExistsResponse.data;  //this is a client data array
        console.log("client check response data:",clients);
        const clientExists = clients.some(client => client.clientId === clientId );
        console.log(`Client ${clientId} exists :`,clientExists);
        
        return clientExists;

    } catch(error){
        //if client doesn't exists, the error.message = Request failed with status code 404
        console.error('Client check failed:',error.message);    
        return false;
    }
    
}


module.exports = {checkClientExists};
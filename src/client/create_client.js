const {execSync} = require('child_process');  //used to run the shell commands
const config = require('../config');  
const {getAdminToken} = require('../admin_token');
const axios = require('axios');

async function create_client(client_id,organization) {
    //Create a client application
    try {
        console.log(`Creating client for group ${organization}`);
        console.log('Inside create_client function...');
        const adminToken = await getAdminToken();
        const payload = {
            'clientId' :client_id,
            'name':'LorvenAI application',
            'enabled':true,
            'publicClient':false,     //to get client secret, if true then no client secret generated
            'clientAuthenticatorType':'client-secret',
            'serviceAccountsEnabled':true,                // creates a service account for the client
            'redirectUris': [
                'http://localhost:3001/*',
                'http://127.0.0.1:3001/*',
                'https://*'
            ],
            'webOrigins':[ '+' ],                //allows all origins
            'protocol':'openid-connect',      
            'standardFlowEnabled':true,                 //for Single Sign ON
            'directAccessGrantsEnabled':false,                 //used to get token using username and password
            'implicitFlowEnabled':false                 // used to get token directly from browser
        }
        const clientCreatedResponse = axios.post ( 
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients`,
            payload,
            {headers : {'Authorization':`Bearer ${adminToken}`,
            'Content-Type':'application/json'},
        }
        );
        console.log('Client created response: ',(await clientCreatedResponse).status);
        return (await clientCreatedResponse).status;
    }catch(error){
        console.error('Client creation failed:',error.message);
        return false;
    }
}

module.exports = {create_client};






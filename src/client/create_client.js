const config = require('../config');  
const {getAdminToken} = require('../admin_token');
const axios = require('axios');

async function createClient(clientName,organization) {
    //Create a client application
    try {
        console.log(`Creating client for group ${organization}`);
        console.log('Inside create_client function...');
        const adminToken = await getAdminToken();
        const payload = {
            'clientId' :clientName,  // FIXME: ClientId and name are same?
            'name': clientName,  
            'enabled':true,
            'publicClient':false,     //to get client secret, if true then no client secret generated
            'clientAuthenticatorType':'client-secret',
            'serviceAccountsEnabled':true,                // creates a service account for the client
            'redirectUris': [   // FIXME: take the values from config or env
                'http://localhost:3001/*', 'http://127.0.0.1:3001/*',
                'http://localhost:8000/*', 'http://127.0.0.1:8000/*',
                'http://localhost:5173/*', 'http://127.0.0.1:5173/*'
            ],
            'webOrigins':[ 
                'http://localhost:3001/*', 'http://127.0.0.1:3001/*',
                'http://localhost:8000/*', 'http://127.0.0.1:8000/*',
                'http://localhost:5173/*', 'http://127.0.0.1:5173/*'
            ],                //allows all origins
            'protocol':'openid-connect',      
            'standardFlowEnabled':true,                 //for Single Sign ON // TODO: Check how to enable SSO
            'directAccessGrantsEnabled':false,                 //used to get token using username and password
            'implicitFlowEnabled':false                 // used to get token directly from browser
        }
        const clientCreatedResponse = await axios.post ( 
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients`,
            payload,
            {headers : {'Authorization':`Bearer ${adminToken}`,
            'Content-Type':'application/json'},
        }
        );
        console.log('Client created response: ', clientCreatedResponse.status);
        
        return true; // FIXME: Check return statement
    }catch(error){
        console.error('Client creation failed:',error.message);
        return false; // FIXME: Check return statement
    }
}

module.exports = {createClient};






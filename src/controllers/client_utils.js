const config = require('../config');  
const {getAdminToken} = require('./utils');
const axios = require('axios');
const fs = require('fs');   // this is used to read, write and update files
const path = require('path');       //this is used to get the file path
// FIXME: Hardcode file path, change it to dynamic path later (get from env or config)
const templateRolesFilePath = path.join('/home/ak/Projects/auth-middleware/Middleware/resources/client_roles_template.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));
const templateCompositeRolesFilePath = path.join('/home/ak/Projects/auth-middleware/Middleware/resources/client_composite_roles_template.json');
const compositeRoles = JSON.parse(fs.readFileSync(templateCompositeRolesFilePath,'utf-8'));


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

async function createClientRoles(clientUUID){
    try {
        let rolesCreatedStatus;
        console.log(`Creating roles for clientId ${clientUUID}`);
        const adminToken = await getAdminToken();
        for(const role of roles){
            //creating roles, child roles will be added to composite roles in create_composite_roles function
                console.log(`role ${role.name} is getting created...`);
                const rolesCreatedResponse = await axios.post(
                    `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles`,
                    {name:role.name, description:role.description||''},
                    {headers:{Authorization:`Bearer ${adminToken}`,'Content-Type':'application/json'}}
                );
                // console.log('rolesCreatedResponse:',rolesCreatedResponse);
                rolesCreatedStatus = rolesCreatedResponse.status;
                // console.log('rolesCreatedResponse:',rolesCreatedStatus);
                // console.log('rolesCreatedReseponse:',rolesCreatedResponse.data.errorMessage);
                // console.log(`Role created: ${role.name}`);
                }
        return true;

    }catch(error){
        console.error(`Error while creating roles `, error.status || error.response?.data?.errorMessage || error);
        return error.status;
    }
}


// const createdCompositeRolesList = [];
async function createCompositeRoles(clientUUID){
    try {
        //default composite roles in the template file are 
        //Cinescribe Writer
        //Cinescribe Reader
        //Cinesketch full access
        //Cineflow Editor
        //Pitchcraft Editor
        //Platform Admin
        // console.log(`Creating composite roles for client ${clientUUID}`);
        const adminToken = await getAdminToken();
        const clientName = `LorvenAI-application`;
        const defaultClientUUID = await getClientUUId(clientName);
        const compositePayload = [];       //composite roles

        for(const role of compositeRoles){
            for(const childRole of role.composites.client["LorvenAI-application"]){
                // console.log(`Creating composite role for parent role: ${role.name}, ${childRole}`);
                console.log("Child role: ", childRole)
                const clientRoleResponse = await axios.get(
                    `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${defaultClientUUID}/roles/${childRole}`,
                    {headers : {Authorization : `Bearer ${adminToken}`}}
                );
                // console.log('response:',clientRoleResponse);     //consists client name, redirect uris, in data role: cinesketch.screen36.delete and its details,
                compositePayload.push(clientRoleResponse.data);  
            
            const response = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles/${role.name}/composites`,
            compositePayload,
            {headers : {Authorization: `Bearer ${adminToken}`}}
            );

            console.log("response.data: ", response.data)
        } 
    }
    return true;

    }catch(error){
        console.error(`Error in creating the composite roles: ${error},${error.message}`,error.response?.data || '');
        return error.status;
    }
}

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

module.exports = {
    getClientUUId,
    createClient,
    createClientRoles,
    createCompositeRoles,
    checkClientExists
};





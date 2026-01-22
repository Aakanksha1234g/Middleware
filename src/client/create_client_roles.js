const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');
const fs = require('fs');   // this is used to read, write and update files
const path = require('path');       //this is used to get the file path

// FIXME: Hardcode file path, change it to dynamic path later (get from env or config)
const templateRolesFilePath = path.join('/home/ak/Projects/auth-middleware/Middleware/resources/client_roles_template.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));

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

module.exports = {createClientRoles};


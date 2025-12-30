const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');
const fs = require('fs');   // this is used to read, write and update files
const path = require('path');       //this is used to get the file path

const templateRolesFilePath = path.join('/home/ak/Downloads/client_roles_template.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));

async function createClientRoles(clientUUID){
    try {
        console.log(`Creating roles for clientId ${clientUUID}`);
        console.log(`Inside the createClientRoles function...`);
        const adminToken = await getAdminToken();
        for(const role of roles){
            try {
                console.log(`role ${role.name} is getting created...`);
                await axios.post(
                    `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles`,
                    {name:role.name, description:role.description||''},
                    {headers:{Authorization:`Bearer ${adminToken}`,'Content-Type':'application/json'}}
                );
                console.log(`Role created: ${role.name}`);
                }catch(error){
                    console.error(`Error while creating role: ${role.name}`, error);
                }
        }

    }catch(error){
        console.error('Error while creating role in createClientRoles func:',error.response.data);
        return false
    }
}

module.exports = {createClientRoles};
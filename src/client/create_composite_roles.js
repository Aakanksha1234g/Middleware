const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');
const fs = require('fs');   //this is used to read,write and update files
const path = require('path');  //this is used to get the file path
const templateRolesFilePath = path.join('/home/ak/Downloads/client_roles_template.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));

async function createCompositeRoles(clientUUID){
    try {
        console.log(`Creating composite roles for client ${clientUUID}`);
        console.log('Inside createComposite roles function...');
        const adminToken = await getAdminToken();
        const rolesCreatedResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles`,
            {headers : {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('rolesCreatedResponse:',rolesCreatedResponse.status);
        const map = {};
        for (const role of roles){
            map[role.name] = role;
        }
        console.log(`The roles in client ${clientUUID} are :`,map);
        // for(const role of roles){
        //     if(role.composite == true){
        //         for(const composite of role.composites){
        //             for(const client of composite.client){
        //                 for(const rolesTemplate of client.LorvenAI-app){
        //                     console.log(`composite role found in client ${clientUUID}: ${rolesTemplate}`);
        //                 }
        //             }
        //         }
        //     }
        // }
    }catch(error){
        console.error(`Error in fetching the composite roles: ${error}`);
        return false;
    }
}
module.exports = {createCompositeRoles};
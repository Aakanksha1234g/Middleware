const axios = require('axios');
const config = require('../config');
const {getClientUUId} = require('./get_client_uuid');
const {getAdminToken} = require('../admin_token');
const fs = require('fs');   //this is used to read,write and update files
const path = require('path');  //this is used to get the file path
const templateRolesFilePath = path.join('/home/ak/Projects/auth-middleware/Middleware/resources/client_composite_roles_template.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));

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
        const clientName = `LorvenAI-app`;
        const defaultClientUUID = await getClientUUId(clientName);
        const compositePayload = [];       //composite roles

        for(const role of roles){
            for(const childRole of role.composites.client["LorvenAI-app"]){
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
module.exports = {createCompositeRoles};
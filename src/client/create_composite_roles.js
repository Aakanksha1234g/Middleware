const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');
const fs = require('fs');   //this is used to read,write and update files
const path = require('path');  //this is used to get the file path
const templateRolesFilePath = path.join('/home/ak/Downloads/client_roles_template.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));

const createdCompositeRolesList = [];
async function createCompositeRoles(clientUUID){
    try {
        //default composite roles in the template file are 
        //Cinescribe Writer
        //Cinescribe Reader
        //Cinesketch full access
        //Cineflow Editor
        //Pitchcraft Editor
        //Platform Admin
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
        for(const role of roles){
            if(!role.composites)continue;        //if composite roles are not there then continue
            
            const parentRole = map[role.name];   //if a role has child roles in it then that role is called as parent role, otherwise it is just a role
            if(!parentRole){
                console.warn(`${role.name} is not a parent role`);
                continue;
            }

            const compositePayload = [];       //composite roles
            for(const childRoleName of role.composites.client["LorvenAI-app"]){
                //check the childrole value(e.g. cinescribe.screen1.read in map dictionary and save it in childrole)
                const childRole = map[childRoleName];
                compositePayload.push({   //store that childrole value in the composite payload
                    id:childRole.id,
                    name: childRole.name
                });     
            }
            //if no payload is in the compositepayload then continue
            if(compositePayload.length == 0) continue;
            
            console.log(`Parent role found: ${parentRole}`);
            //when the compositepayload has child role and name then call the compsoite endpoint and add it in that parent role
            await axios.post(
                `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles/${parentRole.name}/composites`,
                compositePayload,
                {headers : {Authorization: `Bearer ${adminToken}`}}
            );
            console.log(`Composite role created: ${parentRole.name}`);

            const compositeRolesCreatedResponse = await axios.get(
                `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles/${parentRole.name}/composites`,
                {headers: {Authorization: `Bearer ${adminToken}`}}
            );
            console.log(`Composite Roles Created Response: ${compositeRolesCreatedResponse.status}`);
            if(compositeRolesCreatedResponse.status == 200){
                createdCompositeRolesList.push(parentRole.name);
            }
        }
        return createdCompositeRolesList;
    }catch(error){
        console.error(`Error in creating the composite roles: ${error},${error.message}`);
        return false;
    }
}
module.exports = {createCompositeRoles};
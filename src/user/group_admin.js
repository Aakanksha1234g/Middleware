const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');
const fs = require('fs'); //this is used to read, write and update files
const path = require('path');    //this is used to get the file path

const templateRolesFilePath = path.join('/home/ak/Downloads/LorvenAI-Client-Roles.json');
const roles = JSON.parse(fs.readFileSync(templateRolesFilePath,'utf-8'));

async function createUserAdminOfGroup(userId, orgGroupId) {
    try {
        console.log('group id:',orgGroupId);
        console.log('user id:',userId);
        console.log(`Inside the createUserAdminOfGroup Function...`);
        const adminToken = await getAdminToken();
         
        // Add user to org group as admin, without content-type because keycloak rejects put request with content-type
        //with onlly headers also the user doesnt get added to group
        // so adding null which means no body which will add user to group
        //in place of null, {} can be used and we will get keycloak response as 204 No Content
        const addUserToGroup = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/groups/${orgGroupId}`,
            null,                  
            { headers: { Authorization: `Bearer ${adminToken}` }}
        );
        console.log(`addUserToGroup response : ${addUserToGroup.status}, ${addUserToGroup.statusText}`);     //if user added to group returns 204 No Content

        //To add LorvenAI roles to user get the LorvenAI client UUID
        const clients = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients?clientId=LorvenAI-application`,
            { headers: {Authorization: `Bearer ${adminToken}`}}
        );
        console.log('clients response:',clients.data);
        const LorvenAIAppClientId = clients.data[0].id;
        console.log('LorvenAI-application client ID:',LorvenAIAppClientId);

        //Assigning client roles to user
        for(const role of roles){
            // console.log(role.name);
            if(role.name.startsWith('usermgmt.')){
                console.log('Admin role is: ',role.name);
                const rolePayload = [{ id : role.id, name: role.name, clientRole: true, containerId : LorvenAIAppClientId}];
                try {
                    const rolesAssignedToAdmin = await axios.post(
                        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${LorvenAIAppClientId}`,
                        rolePayload,
                        {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
                    );
                    console.log(` User ${userId} is now admin of org group ${orgGroupId}`);
                    console.log('rolesAssignedToAdmin response:',rolesAssignedToAdmin.status);
                    console.log(`Assigned role ${role.name} to user ${userId}:`, rolesAssignedToAdmin.status);  
                    return rolesAssignedToAdmin.status;
                }catch(error){
                    //if roles are assigned then 204 no content is returned, else error is shown.
                    console.error(`Error asigning admin role ${role.name} to user: `,error, error.response?.data); 
            }
        }
        }
    }
    catch(error){
        console.error(`Error in createUserAdminOfGroup function: ${error}`);
        return false;
    }
}

module.exports = {createUserAdminOfGroup};
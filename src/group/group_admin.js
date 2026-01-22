const axios = require('axios');
const config = require('../config');
const {getGroupID} = require('../group/get_group_id');
const {getAdminToken} = require('../admin_token');
const {getClientUUId} = require('../client/get_client_id')
const fs = require('fs'); //this is used to read, write and update files
const path = require('path');    //this is used to get the file path


async function createUserAdminOfGroup(user_email,organization_name) {
    try {
        const groupID = await getGroupID(organization_name);
        console.log('groupID:',groupID);
        const adminToken = await getAdminToken();
        const searchUser = await axios.get(
          `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
          {
            headers: {'Authorization': `Bearer ${adminToken}`}, params : {email : user_email},
          }
      );
      console.log('search user response:',searchUser.data);
      const userID = searchUser.data[0].id;
      console.log('userID:',userID);
      
      // Add user to org group as admin, without content-type because keycloak rejects put request with content-type
        //with only headers also the user doesnt get added to group
        // so adding null which means no body which will add user to group
        //in place of null, {} can be used and we will get keycloak response as 204 No Content
      console.log('adding user to the group...');
      const addUserToGroup = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/groups/${groupID}`,
            null,                  
            { headers: { Authorization: `Bearer ${adminToken}` }}
        );
        console.log('addUserToGroup response : ',addUserToGroup);
        console.log(`addUserToGroup response : ${addUserToGroup.status}, ${addUserToGroup.statusText}`);     //if user added to group returns 204 No Content
        const clientName = `LorvenAI-app-${organization_name}`;
        const ClientUUID = await getClientUUId(clientName);

        console.log('assigning admin roles to the user...');
        const adminRole = 'Platform_Admin';
        //Assigning client roles to user
        const adminRolesResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${ClientUUID}/roles/${adminRole}`,
            {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('adminRolesResponse data:',await adminRolesResponse.data); //platform admin info like id, name,etc.
        const adminRolePayload = [adminRolesResponse.data];        //this must be an array
        const rolesAssignedToAdmin = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/role-mappings/clients/${ClientUUID}`,
            adminRolePayload,
            {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('rolesAssignedToAdmin response',rolesAssignedToAdmin);
        console.log(` User ${userID} is now admin of org group ${organization_name}`);
        console.log('rolesAssignedToAdmin response:',rolesAssignedToAdmin.status);
        console.log(`Assigned role ${adminRole} to user ${userID}:`, rolesAssignedToAdmin.status);   //returns 204 when role is assigned
       return rolesAssignedToAdmin.status;
        }
    catch(error){
        console.error(`Error in createUserAdminOfGroup function: ${error}`);
        return error.status;
    }
}

module.exports = {createUserAdminOfGroup};
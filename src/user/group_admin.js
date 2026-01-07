const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');


async function createUserAdminOfGroup(userId, orgGroupId) {
    try {
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


        //To add realm-management roles to user get the realm-management client UUID
        const clients = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients?clientId=realm-management`,
            { headers: {Authorization: `Bearer ${adminToken}`}}
        );
        console.log('clients response:',clients.data);
        const realmManagementClientId = clients.data[0].id;
        console.log('realm-management client ID:',realmManagementClientId);


        console.log('Checking roles avaialable in realm-management client...');
        const availableRoles = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${realmManagementClientId}/roles`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('availableRoles response:',availableRoles);
        const roleList = availableRoles.data;
        const map = {};
        roleList.forEach(role => {
            //role name and role id 
            const realmRoles = ['query-groups', 'query-users','manage-users', 'view-users'];
            for (const roleName of realmRoles){
                if(role.name === roleName){
                    map[role.name] = role.id;
                }
            }
        });
        console.log('Role map:',map);   //has role names with role ids
        
        // //assign role-id in map to user
        for(const roleName in map){
            try {
                const roleId = map[roleName];
                const rolePayload = [{
                    id : roleId, name: roleName, clientRole: true, containerId : realmManagementClientId
                }];

                const rolesAssignedToAdmin = await axios.post(
                    `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${realmManagementClientId}`,
                    rolePayload,
                    {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
                );
                console.log(`Assigned role ${roleName} to user ${userId}:`, rolesAssignedToAdmin.status);
            }catch(error){
                console.error('Error asigning admin role to user:',error);
            }
        }


        // const assignRolesResponse = await axios.get(
        //     `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings`);
        // console.log('Assign realm roles response:',assignRolesResponse);
        // console.log('Assigned realm roles to user:', assignRolesResponse.data);
        
        // console.log(` User ${userId} is now admin of org group ${orgGroupId}`);
    }catch(error){
        console.error(`Error in createUserAdminOfGroup function: ${error}`);
        return false;
    }
    
}

module.exports = {createUserAdminOfGroup};
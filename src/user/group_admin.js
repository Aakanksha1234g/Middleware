const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../admin_token');


async function createUserAdminOfGroup(userId, orgGroupId) {
    try {
        const adminToken = await getAdminToken();
    
    
        // Add user to org group as admin
        const addUserToGroup = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/groups/${orgGroupId}`,
            {}, 
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('addUserToGroup response',addUserToGroup);

        //  Assign realm-management permissions (composite role)
        const realmRoles = [
            'query-groups',
            'manage-groups', 
            'query-users',
            'manage-users'
        ];
        
        for (const roleName of realmRoles) {
            await axios.post(
                `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
                [{ name: roleName }],
                { headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } }
            );
        }
        const assignRolesResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('Assign realm roles response:',assignRolesResponse);
        console.log('Assigned realm roles to user:', assignRolesResponse.data);
        
        console.log(` User ${userId} is now admin of org group ${orgGroupId}`);
    }catch(error){
        console.error(`Error in createUserAdminOfGroup function: ${error}`);
        return false;
    }
    
}

module.exports = {createUserAdminOfGroup};
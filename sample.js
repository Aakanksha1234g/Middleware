async function createUserAdminOfGroup(userId, orgGroupId) {
    try {
        const adminToken = await getAdminToken();
         
        // ✅ Group membership (204 success)
        const addUserToGroup = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/groups/${orgGroupId}`,
            null,                  
            { headers: { Authorization: `Bearer ${adminToken}` }}
        );
        console.log(`addUserToGroup: ${addUserToGroup.status}`);

        // ✅ Get realm-management client
        const clients = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients?clientId=realm-management`
        );
        const realmManagementClientId = clients.data[0].id;

        // ✅ FIXED: Use ONLY available roles
        const realmRoles = ['query-groups', 'query-users', 'manage-users', 'view-users'];
        
        for (const roleName of realmRoles) {
            try {
                await axios.post(
                    `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${realmManagementClientId}`,
                    [{ name: roleName }],
                    { headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } }
                );
                console.log(`✅ ASSIGNED: ${roleName}`);
            } catch (roleError) {
                if (roleError.response?.status === 409) {
                    console.log(`⏭️ ${roleName} already assigned`);
                } else {
                    console.error(`❌ ${roleName}:`, roleError.response?.status);
                }
            }
        }

        // ✅ Verify
        const assignRolesResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/role-mappings`
        );
        console.log('✅ FINAL ROLES:', JSON.stringify(assignRolesResponse.data.clientMappings, null, 2));
        
        return true;
    } catch(error) {
        console.error('Error:', error.response?.status, error.response?.data);
        return false;
    }
}

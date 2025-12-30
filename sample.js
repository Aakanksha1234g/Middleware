const fs = require('fs');
const path = require('path');

const rolesFilePath = path.join(__dirname, 'roles.json');

const roles = JSON.parse(fs.readFileSync(rolesFilePath, 'utf-8'));


//create roles in the client
async function createClientRoles(clientUUID, roles) {
  const adminToken = await getAdminToken();

  for (const role of roles) {
    try {
      await axios.post(
        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles`,
        {
          name: role.name,
          description: role.description || ''
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Role created: ${role.name}`);
    } catch (err) {
      if (err.response?.status === 409) {
        console.log(`⚠️ Role already exists: ${role.name}`);
      } else {
        console.error(`❌ Failed to create role ${role.name}`, err.response?.data);
      }
    }
  }
}

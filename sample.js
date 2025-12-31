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


//this part will used to create the composite roles

// async function getClientRolesMap(clientUUID, adminToken) {
//   const res = await axios.get(
//     `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles`,
//     { headers: { Authorization: `Bearer ${adminToken}` } }
//   );

//   const map = {};
//   for (const role of res.data) {
//     map[role.name] = role;
//   }
//   return map;
// }


// async function createCompositeRoles(clientUUID) {
//   try {
//     console.log(`Creating composite roles for client ${clientUUID}`);
//     const adminToken = await getAdminToken();

//     const roleMap = await getClientRolesMap(clientUUID, adminToken);

//     for (const role of roles) {
//       if (!role.composites) continue;

//       const parentRole = roleMap[role.name];
//       if (!parentRole) {
//         console.warn(`Parent role not found: ${role.name}`);
//         continue;
//       }

//       const compositePayload = [];

//       for (const childRoleName of role.composites.client["LorvenAI-app"]) {
//         const childRole = roleMap[childRoleName];

//         if (!childRole) {
//           console.warn(`Child role not found: ${childRoleName}`);
//           continue;
//         }

//         compositePayload.push({
//           id: childRole.id,
//           name: childRole.name
//         });
//       }

//       if (compositePayload.length === 0) continue;

//       await axios.post(
//         `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles/${parentRole.name}/composites`,
//         compositePayload,
//         { headers: { Authorization: `Bearer ${adminToken}` } }
//       );

//       console.log(`✅ Composite role created: ${parentRole.name}`);
//     }
//   } catch (error) {
//     console.error(
//       'Composite role creation failed:',
//       error.response?.data || error.message
//     );
//   }
// }

// const { execSync } = require('child_process');
// const config = require('../config');
// const fs = require('fs');
// const path = require('path');

// // Set JAVA_HOME in this Node process
// process.env.JAVA_HOME = '/usr/lib/jvm/java-21-openjdk-amd64';
// console.log('JAVA_HOME set to:', process.env.JAVA_HOME);

// function configureKcadm() {
//   const cmd = `${config.KEYCLOAK_FILE_PATH} config credentials ` +
//     `--server ${config.KEYCLOAK_URL} ` +
//     `--realm master ` +  // Fixed: was _master
//     `--user ${config.KEYCLOAK_ADMIN_USER} ` +
//     `--password ${config.KEYCLOAK_ADMIN_PASSWORD}`;  // Fixed: was ADMIN_USER_PASSWORD
    
//   console.log('Configuring keycloak admin:', cmd);
//   execSync(cmd, { 
//     stdio: 'inherit',
//     cwd: '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',  // Fixed: studio → stdio, added cwd
//     env: { ...process.env, JAVA_HOME: '/usr/lib/jvm/java-21-openjdk-amd64' }  // Pass JAVA_HOME to child
//   });
// }

// async function setupClientAndRoles(clientId) {
//   try {
//     console.log('Configuring kcadmin...');
//     configureKcadm();
//     console.log(`Creating client ${clientId}..`);
    
//     const createCmd = `${config.KEYCLOAK_FILE_PATH} create clients ` +
//       `-r ${config.KEYCLOAK_REALM} ` +
//       `-s clientId=${clientId} ` +
//       `-s enabled=true ` +  // Fixed: missing -
//       `-s publicClient=false ` +
//       `-s protocol=openid-connect ` +
//       `-s 'redirectUris=["*"]' ` +
//       `-s 'webOrigins=["*"]' ` +
//       `-s serviceAccountsEnabled=true ` +
//       `-s authorizationServicesEnabled=true ` +
//       `-s directAccessGrantsEnabled=true ` +
//       `-s standardFlowEnabled=true`;

//     console.log('Creating client:', createCmd);
//     execSync(createCmd, { 
//       stdio: 'inherit',
//       cwd: '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',
//       env: { ...process.env, JAVA_HOME: '/usr/lib/jvm/java-21-openjdk-amd64' }
//     });

//     // Get client UUID - Fixed typos
//     const getClientCmd = `${config.KEYCLOAK_FILE_PATH} get clients ` +
//       `-r ${config.KEYCLOAK_REALM} ` +
//       `--fields id,clientId ` +  // Fixed: flelds → fields
//       `-q clientId=${clientId}`;

//     const clientJson = execSync(getClientCmd, { 
//       encoding: 'utf8',
//       cwd: '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',
//       env: { ...process.env, JAVA_HOME: '/usr/lib/jvm/java-21-openjdk-amd64' }
//     });
    
//     const clientData = JSON.parse(clientJson);
//     const clientUuid = clientData[0]?.id;
//     console.log(`Client UUID: ${clientUuid}`);

//     if (!clientUuid) throw new Error('Client not found after creation');

//     // Create roles from client_roles_template.json
//     const rolesJson = fs.readFileSync(path.join(__dirname, 'client_roles_template.json'), 'utf8');
//     const roles = JSON.parse(rolesJson);
    
//     for (const role of roles) {
//       const roleCmd = `${config.KEYCLOAK_FILE_PATH} create clients/${clientUuid}/roles ` +
//         `-r ${config.KEYCLOAK_REALM} ` +
//         `-b ${JSON.stringify(role)}`;

//       console.log('Creating role:', role.name);
//       execSync(roleCmd, { 
//         stdio: 'inherit',
//         cwd: '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',
//         env: { ...process.env, JAVA_HOME: '/usr/lib/jvm/java-21-openjdk-amd64' }
//       });
//     }

//     console.log(`✅ Client ${clientId} with roles created successfully`);
//     return clientUuid;
//   } catch (error) {
//     console.error('Client creation with roles failed:', error.message);
//     return null;
//   }
// }

// module.exports = { setupClientAndRoles };

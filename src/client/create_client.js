const {execSync} = require('child_process');  //used to run the shell commands
const config = require('../config');  
const {getAdminToken} = require('../admin_token');
const axios = require('axios');

async function create_client(client_id,organization) {
    //Create a client application
    try {
        console.log(`Creating client for group ${organization}`);
        console.log('Inside create_client function...');
        const adminToken = await getAdminToken();
        const payload = {
            'clientId' :client_id,
            'name':'LorvenAI application',
            'enabled':true,
            'publicClient':true,
            'redirectUris': [
                'http://localhost:3001/*',
                'https://*'
            ],
            'webOrigins':["+"],
            'protocol':'openid-connect',
            'standardFlowEnabled':true,
            'directAccessGrantsEnabled':true,
            'fullScopeAllowed':false
        }
        const clientCreatedResponse = axios.post ( 
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients`,
            payload,
            {headers : {'Authorization':`Bearer ${adminToken}`,
            'Content-Type':'application/json'},
        }
        );
        console.log('Client created response: ',(await clientCreatedResponse).status);
        return (await clientCreatedResponse).status;
    }catch(error){
        console.error('Client creation falied:',error.message);
        return false;
    }
}

module.exports = {create_client};





// const fs = require('fs');
// const path = require('path');
// const { create } = require('domain');







// //Set JAVA_HOME 
// console.log('JAVA_HOME set to : ',config.JAVA_HOME);

// function configureKcadm(){
//     const cmd = `${config.KEYCLOAK_FILE_PATH} config credentials ` +
//     `--server ${config.KEYCLOAK_URL} ` +
//     `--realm master ` +
//     `--user ${config.KEYCLOAK_ADMIN_USER} ` + //admin
//     `--password ${config.KEYCLOAK_ADMIN_USER_PASSWORD} `; //admin_pass
    
//     console.log('Configuring keycloak admin:',cmd);
//     execSync(cmd, {
//         stdio: 'inherit',
//         cwd : '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',
//         env : {... process.env, JAVA_HOME : '/usr/lib/jvm/java-21-openjdk-amd64'}
//     });
// }

// //Create client + roles function
// async function setupClientAndRoles(clientId){
//     try {
//         console.log('Configuring kcadmin...');
//         configureKcadm();
//         console.log(`Creating client ${clientId}..`);
//         const createCmd = `${config.KEYCLOAK_FILE_PATH} create clients `+
//         `-r ${config.KEYCLOAK_REALM} ` + 
//         `-s clientId=${clientId} `+
//         `s enabled=true `+
//         `-s publicClient=false `+
//         `-s protocol=openid-connect `+
//         `-s 'redirectUris=["*"]' `+
//         `-s 'webOrigins=["*"]' `+
//         `-s serviceAccountsEnabled=true `+
//         `-s authorizationServicesEnabled=true `+
//         `-s directAccessGrantsEnabled=true `+
//         `-s standardFlowEnabled=true`;

//         console.log('Creating client : ',createCmd);
//         execSync(createCmd, 
//             {stdio: 'inherit',
//             cwd : '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',
//             env : {... process.env, JAVA_HOME : config.JAVA_HOME}
//             });

//         //Get client UUID
//         const getClientCmd = `${config.KEYCLOAK_FILE_PATH} get clients` +
//         `-r ${config.KEYCLOAK_REALM} `+
//         `--fields id, clientId `+
//         `-q clientId=${clientId} `;

//         const clientJson = execSync(getClientCmd, {
//             encoding: 'utf8',
//             cwd : '/home/ak/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/bin',
//             env : {... process.env, JAVA_HOME : config.JAVA_HOME}
//         });
//         const clientUuid = JSON.parse(clientJson)[0].id;
//         console.log(`Client UUID : ${clientUuid}`);

//         //Create roles from client_roles_template.json
//         const rolesJson = fs.readFileSync(path.join(__dirname, 'client_roles_template.json'), 'utf8');
//         const roles = JSON.parse(rolesJson);
//         for (const role of roles) {
//             const roleCmd = `${config.KEYCLOAK_FILE_PATH} create clients/${clientUuid}/roles `+
//             `-r ${config.KEYCLOAK_REALM} `+
//             `-b ${JSON.stringify(role)} `;

//             console.log('Creating role: ',roleCmd);
//             execSync(roleCmd, {stdio: 'inherit'});
//         }

//         console.log(`Client ${clientId} with roles created successfully.`);
//         return clientUuid;
//     }catch(error){
//         console.error('Client creation with roles failed:',error.message);
//         return null;
//     }

// }
// module.exports = {setupClientAndRoles};


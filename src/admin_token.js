const axios = require('axios');
const config = require('./config');

async function getAdminToken() {
    console.log("inside getadmintoken func...")
    try { 
        const params = new URLSearchParams();
        params.append( 'client_id',config.ADMIN_CLIENT_ID);
        params.append('client_secret', config.ADMIN_CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');
        const response = await axios.post(
            `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            params,
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
        );
        console.log(`response data : ${response.status}`);
        return response.data.access_token;
    } catch(error) {
        console.error("Failed to fetch admin token:", error.message);
        console.error("Error response: ",error.response);
        console.error("Response data ",error.response.data);
        throw new Error('Admin token error:',error);
    }
}

module.exports = {getAdminToken};




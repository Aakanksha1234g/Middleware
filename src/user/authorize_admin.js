const axios = require('axios');
const config = require('../config');

async function authorizeAdmin(access_token){
    try {
    console.log('/authorizeAdmin called...');
    const adminToken = await getAdminToken();
    console.log('access token:',access_token);
    const payload = {
      'client_id': config.ADMIN_CLIENT_ID,
      'client_secret': config.ADMIN_CLIENT_SECRET,
      'token': access_token
    }
    const tokenIntrospectResponse = await axios.post(
      `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`,
       payload,
       {headers:{'Authorization':`Bearer ${adminToken}`, 'Content-Type':'application/x-www-form-urlencoded'},
    });
    // console.log('tokenIntrospectResponse :',tokenIntrospectResponse);
    console.log('tokenIntrospectResponse data :',tokenIntrospectResponse.data);  //this gives {active: false} if the token is inactive
    // const tokenExpiresIn = tokenIntrospectResponse.data.exp - tokenIntrospectResponse.data.iat;
    // console.log(`Token expires in : ${tokenExpiresIn}`);
    if (tokenIntrospectResponse.data.active === false) {
      return res.status(401).json({message: "Admin User Unauthorized"})
    }
      return res.status(200).json({message: "Admin User Authorized",data: tokenIntrospectResponse.data.resource_access}); //TODO: Check if data is required
  }catch(error){
    console.error(`Error in authorizeUser: ${error.response.status} ,${error.response.statusText}`);
    res.status(error.status).json({message: `authorizeUser unsuccessfull : ${error.response.status}, ${error.response.statusText}`});
  }
}

module.exports = {authorizeAdmin};
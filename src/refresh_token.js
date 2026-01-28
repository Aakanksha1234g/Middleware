// FIXME: DELETE THIS FILE
const axios = require('axios');
const config = require('./config');

async function refreshToken(refresh_token){
  try{
    console.log('/refreshAccessToken ...');
    console.log('refresh_token:',refresh_token);
    const params = new URLSearchParams();
    params.append('client_id',config.ADMIN_CLIENT_ID);
    params.append('client_secret',config.ADMIN_CLIENT_SECRET);
    params.append('grant_type','refresh_token');
    params.append('refresh_token',refresh_token);
    
    const refreshTokenResponse = await axios.post(
      `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      params, 
      {'Content-Type':'application/x-www-form-urlencoded'},
    );
    console.log('refreshTokenResponse :',refreshTokenResponse);
    console.log('refreshTokenResponse data:',refreshTokenResponse.data); 
    
    return res.status(200).json({message:`refreshAccessToken successfull`,access_token:refreshTokenResponse.data.access_token});
  }catch(error){
    console.error(`Error in refreshAccessToken : ${error}`);
    res.status(error.status).json({message: `refreshAccessToken unsuccessfull : ${error}`});
  }
}

module.exports = {refreshToken};
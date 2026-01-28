const axios = require('axios');
const config = require('../config');

async function refreshToken(req, res){
  try{ 
    console.log('/refreshAccessToken ...');
    const {refresh_token } = req.body;  //refresh tokens are read from the request body
    console.log('refresh token:',refresh_token);
    // console.log('refresh_token:',refresh_token);
    const params = new URLSearchParams();
    params.append('client_id',config.ADMIN_CLIENT_ID);
    params.append('client_secret',config.ADMIN_CLIENT_SECRET);
    params.append('grant_type','refresh_token');
    params.append('refresh_token',refresh_token);
    
    const refreshTokenResponse = await axios.post(
      `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      params, 
      {headers: {'Content-Type':'application/x-www-form-urlencoded'}},
    );
    console.log('refreshTokenResponse data:',refreshTokenResponse.data);  //has new access token, refresh token, access and refresh token expiry, id_token, token_type,sessions state
    
    return res.status(200).json({message:`refreshAccessToken successfull`, access_token:refreshTokenResponse.data});
  }catch(error){
    // console.error('Error in refreshAccessToken : ',error);
    console.error('error response data',error.response.data);
    return res.status(error.status).json({success: false ,data :`${error.response.data.error}, ${error.response.data.error_description}`});
  }
}

module.exports = {
    refreshToken
}
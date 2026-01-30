const axios = require('axios');
const config = require('../config');

async function login( req, res ){

    const { user_email, user_password } = req.body;
    try {
        console.log("/login api called...");
        console.log(`user_email ${user_email}, pass: ${user_password}`);
        const tokens = await axios.post(
            `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
                grant_type: 'password',
                client_id: config.ADMIN_CLIENT_ID,
                client_secret: config.ADMIN_CLIENT_SECRET,
                username: user_email,
                password: user_password,
                scope: 'openid email profile'
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            ); 
        console.log("token: ", tokens);
        console.log('token status',tokens.status); //200 if credentials are right, else 
        console.log('token status type',typeof tokens.status); //200 if credentials are right, else 
        if(tokens.status === 200){
            console.log(`Access token for User ${user_email} expires in ${tokens.data.expires_in}`);
            console.log(`Refresh token for User ${user_email} expires in ${tokens.data.refresh_expires_in}`); 
            return res.status(200).json({ success: true, data: {access_token: tokens.data.access_token, refresh_token: tokens.data.refresh_token}})
        }
    }catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({success: false, error:error.response.status})
  };
}

module.exports = {
    login
}
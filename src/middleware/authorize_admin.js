const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../controllers/utils');

async function authorizeAdmin(req, res, next){
  console.log('inside authorizeAdmin function..');
    const access_token = req.headers.authorization;
    console.log('access_token',access_token);
    
    const requiredRoles = [
      'usermgmt.view-users',
      'Platform_Admin',
      'usermgmt.assign-role',
      'usermgmt.delete-user',
      'usermgmt.update-user',
      'usermgmt.create-user'
    ];
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
    console.log('tokenIntrospectResponse :',tokenIntrospectResponse);
    console.log('tokenIntrospectResponse data :',tokenIntrospectResponse.data);  //this gives {active: false} if the token is inactive
    // const tokenExpiresIn = tokenIntrospectResponse.data.exp - tokenIntrospectResponse.data.iat;
    // console.log(`Token expires in : ${tokenExpiresIn}`);
    const userPerms = tokenIntrospectResponse.data.resource_access;
    console.log('token expiry check',tokenIntrospectResponse.data.active, typeof tokenIntrospectResponse.data.active);
    if (tokenIntrospectResponse.data.active === false) {
      console.log('herer')
      return res.status(401).json({message: "Token expired"});
    }
    // req.body.user_permissions = userPerms;

    console.log("user perms -----", userPerms)

    const applicationRoles = userPerms['LorvenAI-application'].roles;
    // console.log('application roles:',applicationRoles);
    const isAdmin =  requiredRoles.every(role => applicationRoles.includes(role));
    console.log('isadmin:',isAdmin);
    if (!isAdmin) {
      return res.status(401).json({message: "Unauthorized"})
    }
    // if (!userPerms) {
    // res.status(401).json({})
    // }
    //   return res.status(200).json({message: "Admin User Authorized",data: tokenIntrospectResponse.data.resource_access}); //TODO: Check if data is required
    next();
  }catch(error){
    console.error(`Error in authorizeAdmin:`,error);
    console.error(`Error in authorizeUser: ${error.response.status} ,${error.response.statusText}`);
    res.status(error.status).json({message: `authorizeUser unsuccessfull : ${error.response.status}, ${error.response.statusText}`});
  }
}

module.exports = {authorizeAdmin};
const config = require('./src/config');
const {checkUserExists} = require('./src/user/user_check'); 
const express = require('express');
const Redis = require('redis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');            // 
const { checkGroupExists } = require('./src/group/group_check');
const {createGroup} = require('./src/group/create_group');
const {createClient} = require('./src/client/create_client');
const {getClientUUId} = require('./src/client/get_client_uuid');
const {createUser} = require('./src/user/create_user');
const {createClientRoles} = require('./src/client/create_client_roles');
const {createCompositeRoles} = require('./src/client/create_composite_roles');
const {createSubGroups} = require('./src/group/create_sub_groups');
const {createUserAdminOfGroup} = require('./src/group/create_group_admin');
const {assignClientRolesToSubGroups} = require('./src/group/assign_client_roles_sub_group');
const {getUserUUID} = require('./src/user/get_user_uuid');
const { getAdminToken } = require('./src/admin_token');
const {checkSubGroupExists} = require('./src/group/sub_group_check');
const {createUserTempPassword} = require('./src/user/create_user_temp_pass');
const {checkUserExistsInSubGroup} = require('./src/group/user_in_sub_group_check');
const {addUserToSubGroup} = require('./src/group/add_user_in_sub_group');
const {sendResetPasswordEmail} = require('./src/email/reset_password_mail');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',                             
  credentials: true
}));

// Redis connection
const redis = Redis.createClient({ url: 'redis://localhost:6379' });
redis.connect().catch(console.error);

// Rate limiting
const limiter = rateLimit({ 
  windowMs: 60 * 1000,    //windowsms is in seconds
  max: 10000 });
app.use('/', limiter);


const userRoutes = require('./src/routes/user');
app.use('/users',userRoutes);

const groupRoutes = require('./src/routes/group');
app.use('/groups',groupRoutes);

const clientRoutes = require('./src/routes/client');
app.use('/clients',clientRoutes);

const loginRoute = require('./src/routes/login');
app.use('/login',loginRoute);

const signupRoute = require('./src/routes/signup');
app.use('/signup',signupRoute);

const authorizeUserRoute = require('./src/routes')
app.use('/authorizeUser',authorizeUserRoute);



app.post('/authorizeUser', limiter, async (req, res) => {
  // you will get token with request or in data and you'll verify if the user token (access_token) is valid or not
  //req: access token , res: access token is valid or not.
  try {
    console.log('/authorizeUser called...');
    const adminToken = await getAdminToken();
    const {access_token} = req.body;
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
    if (tokenIntrospectResponse.data.active !== true) {
      return res.status(401).json({message: "User Unauthorized"})
    }
    return res.status(200).json({message: "User Authorized",data:tokenIntrospectResponse.data.resource_access}); //TODO: Check if data is required

  }catch(error){
    console.error(`Error in authorizeUser: ${error.response.status} ,${error.response.statusText}`);
    res.status(error.status).json({message: `authorizeUser unsuccessfull : ${error.response.status}, ${error.response.statusText}`});
  }
});


app.post('/authorizeAdmin', limiter,async (req, res) => {
  try {
    console.log('/authorizeAdmin called...');
    const adminToken = await getAdminToken();
    const {access_token} = req.body;
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
});

app.post('/refreshAccessToken', limiter, async (req, res) => {
  try{
    console.log('/refreshAccessToken ...');
    const {refresh_token} = req.body;
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
})

app.post('/createUser', async (req, res) => {
  try{
      const {user_email, tempPassword, groupName, subGroupName} = req.body;
    
      const organizationExists = await checkGroupExists(groupName);
      if(!organizationExists){
        return res.status(403).json({message: `Organization ${groupName} doesn't exist.`});  //200- group exists, 403- doesn't exist
      }
      console.log(`Organization ${groupName} exists.`);
      const subGroupExists = await checkSubGroupExists(groupName,subGroupName);
      if(!subGroupExists){
        return res.status(200).json({message: `Sub group ${subGroupName} doesn't exist.`});
      }
      // console.log(`Checking user ${user_email} exists or not..`);
      const userExists = await checkUserExists(user_email);

      if (userExists) {
        console.log(`User ${user_email} already exists`);
        return res.status(200).json({message: "User already exists"});
      }

      console.log(`User ${user_email} doesn't exist.Creating it.`);
      const userCreatedTempPassResponse = await createUserTempPassword(user_email,tempPassword);
      console.log('userCreatedTempPassResponse:',userCreatedTempPassResponse);
      const addUserToSubGroupResponse = await addUserToSubGroup(user_email,groupName,subGroupName);
      console.log('addUserToSubGroupResponse:',addUserToSubGroupResponse);
      const sendResetPasswordEmailResponse = await sendResetPasswordEmail(user_email);
      console.log('sendResetPasswordEmailResponse:',sendResetPasswordEmailResponse);
      return res.status(200).json({message: `Password reset email has been sent to user ${user_email}`});

    }catch(error){
      console.error(`Error in /addUser:`,error);
      return res.status(error.status).json({message: "Error in adding user", error: error});
    }
});


app.post('/modifyUserGroup', async (req, res) => {
  try {
    //call authorizeadmin endpoint to get the user permissions, if the user is authorized then only he can create subgroups else return user is not authorized
    const { user_email, groupName, subGroupName } = req.body
    const userExists = await checkUserExists(user_email);
    if (!userExists) {
      console.log("User does not exist");
      return res.json(200).json({message: `User ${user_email} does not exists`})
    }

    const subGroupExists = await checkSubGroupExists(groupName,subGroupName);
    if(!subGroupExists){
      return res.status(200).json({message: `Sub group ${subGroupName} doesn't exist.`});
    }

    const userExistsInSubGroupResponse = await checkUserExistsInSubGroup(user_email,groupName,subGroupName);
    console.log('userExistsInSubGroupResponse:',userExistsInSubGroupResponse);
    if(userExistsInSubGroupResponse){
      return res.status(200).json({message: `User ${user_email} already exists in subGroup ${subGroupName}`});
    }
    const addUserToSubGroupResponse = await addUserToSubGroup(user_email,groupName,subGroupName);
    console.log('addUserToSubGroupResponse:',addUserToSubGroupResponse);
    return res.status(204).json({message: `User ${user_email} added to subGroup ${subGroupName}`});
  } catch (error) {
    console.error("Error in modifying user group", error);
    return res.status(error.status).json({message: "Unable to add user to group"})
  }
});


app.listen(3001, () => {
  console.log('🚀 Auth Middleware running on http://localhost:3001');
  console.log('✅ Frontend (5173) → Backend (8000)');
});

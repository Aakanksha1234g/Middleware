const config = require('./src/config');
const {checkUserExists} = require('./src/user/user'); 
const express = require('express');
const Redis = require('redis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { getAdminToken } = require('./src/admin_token');
const { checkGroupExists } = require('./src/group/group_check');
const {create_group} = require('./src/group/create_group');
const {checkClientExists} = require('./src/client/client_check');
const {create_client} = require('./src/client/create_client');
const {getClientId} = require('./src/client/get_client_id');
const {createUser} = require('./src/user/create_user');
const {createClientRoles} = require('./src/client/create_client_roles');
const {createCompositeRoles} = require('./src/client/create_composite_roles');
const {userExistsInGroup} = require('./src/group/user_in_group');
const {createUserAdminOfGroup} = require('./src/user/group_admin');
//const {checkUserAdminOfGroup} = require('./src/user/check_user_admin');

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
const limiter = rateLimit({ windowMs: 60 * 1000, max: 10000 });
app.use('/', limiter);

// [X] DON'T DELETE FOLLOWING CODE, IT IS USED TO DIRECTLY LOGIN THE USER 

app.post('/login', limiter, async (req, res) => {
  try {
    console.log("/login api called");
    const { user_email, user_password } = req.body;

    const tokens = await axios.post(
      `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        username: user_email,
        password: user_password,
        scope: 'openid email profile'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log(`tokens expires in  : ${tokens.data.expires_in}`);

    const decodedToken = jwt.decode(tokens.data.access_token);
    console.log("decoded token:", decodedToken);
    const userId = decodedToken.sub;
    console.log(`userId: ${userId}`);
    
    const enrichedToken = jwt.sign({
      sub: userId
    }, config.JWT_SECRET, { expiresIn: '15m' });

    //check what is in the access token
    console.log("access token:",enrichedToken);
    res.json({
      data: {
        response: {
          access_token: enrichedToken,
          refresh_token: tokens.data.refresh_token
        }
      }
    });

  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    res.status(401).json({ data: { detail: 'Invalid credentials' } });
  }
});

app.post('/signup',limiter,async (req, res) => {
  try {
    console.log("/signup endpoint called...");
    const {user_email, user_password} = req.body;
    //Check if the group name exists with that email id part
    // console.log(`user_email: ${user_email}, user pass: ${user_password}`)
    // console.log(`email type: ${typeof user_email}`)
    // console.log(`Checking if user_email ${user_email} exists or not`);
    const userID = await checkUserExists(user_email);
    console.log('userId:',userID);
    if (!userID){
      const create_user = await createUser(user_email,user_password);
      console.log('User create :',create_user);
      const userID = create_user.userId;
      console.log('userId:',userID);
      const organization = user_email.split('@')[1].split('.')[0];
      const organizationExists = await checkGroupExists(organization);
       console.log("organization exists:",organizationExists);
      if(!organizationExists){
        console.log(`Group ${organization} doesn't exist. Creating it...`);
        const groupCreateResp = await create_group(organization);
        console.log('Group created:',groupCreateResp);
        console.log(`Checking if any user exists in Group ${organization} ...`);
        const userExistsInGroupResp = await userExistsInGroup(organization,user_email);
        console.log('userExistsInGroup response: ',userExistsInGroupResp.userExistsInGroup);
        console.log('user id:',userID);
       const createdUserAdminofGroupResp = await createUserAdminOfGroup(userID,userExistsInGroupResp.groupID);
       console.log('createdUserAdminofGroupResp:',createdUserAdminofGroupResp);
     }
    console.log('returning response...');
    return res.status(200).json({data:{details: `Confirmation email sent to email ${user_email}. Please click the link in your inbox.`,user_id:userID }});
  }
  else {
    console.log(`User with email ${user_email} already exists.`);
      return res.status(200).json({data: { detail: 'User with this email already exists',user_id:userID } });
    }
}catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    res.status(400).json({data: { detail: error.response?.data?.errorMessage || 'Signup failed' } 
    });
  }
});

// DON'T DELETE FOLLOWING CODE, IT IS USED TO CHECK IF THE USER IS ADMIN OR NOT AND THEN LOGIN THAT USER.
//it is working till organization exists check, pending checkUserAdminOfGroup function to be fixed.

// app.post('/login', limiter, async (req, res) => {
//   try {
//     console.log("......../login called...");
//     console.log("/login api called");
//     const { user_email, user_password } = req.body;
//     const userID = await checkUserExists(user_email);
//     console.log('userId:',userID);
//     if (!userID){
//       return res.status(403).json({detail: `User with email ${user_email} not found. Please signup first.`});
//     }
//     else {
//       console.log(`User with email ${user_email} exists with userID: ${userID}`);
//       const organization = user_email.split('@')[1].split('.')[0];
//       // console.log('Checking if group ')
//       const organizationExists = await checkGroupExists(organization);
//       console.log("organization exists:",organizationExists);
//       if(!organizationExists){
//         console.log(`Group ${organization} doesn't exist.`);
//         return res.status(404).json({data: {detail: `Organization group ${organization} not found.`}});
//       }
//       console.log(`Group ${organization} exists.`);
//       console.log(`Checking if user is admin of group ${organization}`);
//       const userAdminOfGroup = await checkUserAdminOfGroup(userID,organization);
//       console.log(`userAdminOfGroup response: `,userAdminOfGroup);
//       if(!userAdminOfGroup){
//         console.log(`User ${user_email} is not admin of group ${organization}`);
//         return res.status(403).json({data: {detail: `User is not admin of organization ${organization}.`}});
//       }
//       else {
//         console.log(`User ${user_email} is admin of group ${organization}`);
//         console.log(`Logging in user ...`);
//         const tokens = await axios.post(
//           `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
//           new URLSearchParams({
//             grant_type: 'password',
//             client_id: config.CLIENT_ID,
//             client_secret: config.CLIENT_SECRET,
//             username: user_email,
//             password: user_password,
//             scope: 'openid email profile'
//           }),
//           { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//         );
//         console.log(`tokens expires in  : ${tokens.data.expires_in}`);

//         const decodedToken = jwt.decode(tokens.data.access_token);
//         console.log("decoded token:", decodedToken);
//         const userId = decodedToken.sub;
//         console.log(`userId: ${userId}`);
        
//         const enrichedToken = jwt.sign({
//           sub: userId,
//           permissions,
//           modules: Object.keys(permissions)
//         }, config.JWT_SECRET, { expiresIn: '15m' });

//         //check what is in the access token
//         console.log("access token:",enrichedToken);
//         res.json({
//           data: {
//             response: {
//               access_token: enrichedToken,
//               refresh_token: tokens.data.refresh_token,
//               permissions,
//               modules: Object.keys(permissions)
//             }
//           }
//         });
//           }
//         }
//   } catch (error) {
//     console.error('Login failed:', error.response?.data || error.message);
//     res.status(401).json({ data: { detail: `Invalid credentials : ${error}` } });
//   }
// });

//DON'T DELETE THIS FUNCTION IT IS THE PREVIOS SIGNUP FLOW THAT CREATES CLIENT,CLIENT ROLES AND COMPOSITE ROLES PER ORGANIZATION
// app.post('/signup',limiter,async (req, res) => {
//   try {
//     console.log("/signup endpoint called...");
//     const {user_email, user_password} = req.body;
//     //Check if the group name exists with that email id part
//     // console.log(`user_email: ${user_email}, user pass: ${user_password}`)
//     // console.log(`email type: ${typeof user_email}`)
//     // console.log(`Checking if user_email ${user_email} exists or not`);
//     const userID = await checkUserExists(user_email);
//     console.log('userId:',userID);
//     if (!userID){
//       const create_user = await createUser(user_email,user_password);
//       console.log('User create :',create_user);
//       const userID = create_user.userId;
//       console.log('userId:',userID);
//       const organization = user_email.split('@')[1].split('.')[0];
//       // console.log('Checking if group ')
//       const organizationExists = await checkGroupExists(organization);
//        console.log("organization exists:",organizationExists);
//       if(!organizationExists){
//         console.log(`Group ${organization} doesn't exist. Creating it...`);
//         const groupCreateResp = await create_group(organization);
//         console.log('Group created:',groupCreateResp);
//          const clientName = `LorvenAI-app-${organization}`;
//          const clientExists = await checkClientExists(clientName);
//          console.log("Client exists :", clientExists);
//         if(!clientExists) {
//           const clientCreateResp = await create_client(clientName,organization);
//           console.log("Client created:",clientCreateResp);
//         }
//         const clientUUID = await getClientId(clientName);
//         console.log('Client Id: ',await clientUUID);
//         const clientRolesCreated = await createClientRoles(clientUUID);
//         console.log('client roles created',await clientRolesCreated);
//         const CompositeRolesCreated = await createCompositeRoles(clientUUID);
//         console.log('Composite roles created : ', await CompositeRolesCreated);
//         console.log(`Checking if any user exists in Group ${organization} ...`);
//         const userExistsInGroupResp = await userExistsInGroup(organization,user_email);
//         console.log('userExistsInGroup response: ',userExistsInGroupResp.userExistsInGroup);
//        const createdUserAdminofGroupResp = await createUserAdminOfGroup(userID,userExistsInGroupResp.groupID);
//        console.log('createdUserAdminofGroupResp:',createdUserAdminofGroupResp);
//      }
//     console.log('returning response...');
//     return res.status(200).json({data:{details: `Confirmation email sent to email ${user_email}. Please click the link in your inbox.`,user_id:userID }});
//   }
//   else {
//     console.log(`User with email ${user_email} already exists.`);
//       return res.status(200).json({data: { detail: 'User with this email already exists',user_id:userID } });
//     }
// }catch (error) {
//     console.error('Signup failed:', error.response?.data || error.message);
//     res.status(400).json({data: { detail: error.response?.data?.errorMessage || 'Signup failed' } 
//     });
//   }
// });



// ✅ NEW: Token refresh endpoint
app.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const tokens = await axios.post(
      `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        refresh_token
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json({
      data: {
        response: {
          access_token: tokens.data.access_token,
          refresh_token: tokens.data.refresh_token
        }
      }
    });
  } catch (error) {
    res.status(401).json({ data: { detail: 'Invalid refresh token' } });
  }
});

app.listen(3001, () => {
  console.log('🚀 Auth Middleware running on http://localhost:3001');
  console.log('✅ Frontend (5173) → Backend (8000)');
});
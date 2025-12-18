const config = require('./src/config');
const {inviteUser} = require('./src/invite/invite_user')
console.log(`config: ${config}`);
const {checkUserExists} = require('./src/user/user'); 

const express = require('express');
const Redis = require('redis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { getAdminToken } = require('./src/admin_token');

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


app.post('/login', limiter, async (req, res) => {
  try {
    console.log("/login api called")
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
    console.log(`tokens are : ${tokens}`);
    const userId = tokens.data.sub;
    const cacheKey = `perms:${userId}`;
    
    let permissions = await redis.get(cacheKey);
    if (!permissions) {
      const userInfo = await axios.get(
        `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
        { headers: { Authorization: `Bearer ${tokens.data.access_token}` } }
      );
      
      permissions = mapRolesToScreens(userInfo.data.realm_access?.roles || []);
      await redis.setEx(cacheKey, 900, JSON.stringify(permissions));
    } else {
      permissions = JSON.parse(permissions);
    }

    const enrichedToken = jwt.sign({
      sub: userId,
      permissions,
      modules: Object.keys(permissions)
    }, config.JWT_SECRET, { expiresIn: '15m' });

    res.json({
      data: {
        response: {
          access_token: enrichedToken,
          refresh_token: tokens.data.refresh_token,
          permissions,
          modules: Object.keys(permissions)
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
    console.log(`user_email: ${user_email}, user pass: ${user_password}`)
    console.log(`email type: ${typeof user_email}`)
    console.log(`Checking if user_email ${user_email} exists or not`);
    const userExists = await checkUserExists(user_email);
    if (!userExists){
      
      const adminToken = await getAdminToken();

      //Create user as Pending(email not verified)
      console.log('Creating user..');
      const createResp = await axios.post(
        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
        {
          username: user_email, email: user_email,enabled:true,
          emailVerified:false, credentials: [{type: 'password',value: user_password,temporary: false
          }],
          requiredActions: ['VERIFY_EMAIL']
        },
        {headers: { Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
      );
      console.log(`User ${user_email} created successfully.`);
      //Get userId fro Location header
      const location = createResp.headers.location;   //../users/{id}
      const userId = location.substring(location.lastIndexOf('/') + 1);     

      //Create email with verify-email link
      await axios.put( `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/execute-actions-email`,
        ['VERIFY_EMAIL'],         //required actions
        {
          params: {
            client_id: config.CLIENT_ID,
            redirect_uri: 'http://localhost:5173/login'
          },
          headers: {
            Authorization: `Bearer ${adminToken}`, 'Content-Type':'application/json'}
        }
      );
      console.log(`Verification email sent to ${user_email}`);
      return res.json({data:{details: 'Confirmation email sent. Please click the link in your inbox.'}});
  } 
  else {
    console.log(`User with email ${user_email} already exists.`);
      return res.status(400).json({data: { detail: 'User with this email already exists' } });
    }
}catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    res.status(400).json({  data: { detail: error.response?.data?.errorMessage || 'Signup failed' } 
    });
  }
});

app.get('/accept-invite/:token',async (req,res) => {
  try {
    const {token} = req.params;
    const data = jwt.verify(token, config.JWT_SECRET);

    //Create user in Keycloak
    const adminToken = await getAdminToken();
    await axios.post(`${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`, {
      username : data.email,
      email: data.email,
      enabled:true,
      emailVerified:true,
      credentials: [{
        type: 'password',
        value:data.password,
        temporary:false
      }]
    },{headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}});
     res.redirect(`http://localhost:5173/dashboard?success=true`);
  }catch(error){
    res.send('<h2>Invalid link. Contact support.</h2>')
  }
});

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

// PERFECT UTILITY FUNCTION ✅
function mapRolesToScreens(roles) {
  const permissions = {};
  roles?.forEach(role => {
    if (role.includes('.')) {
      const [module, screen, operation] = role.split('.');
      if (['cinescribe', 'cinesketch', 'cineflow', 'pitchcraft'].includes(module)) {
        permissions[module] = permissions[module] || {};
        permissions[module][screen] = permissions[module][screen] || [];
        if (!permissions[module][screen].includes(operation)) {
          permissions[module][screen].push(operation);
        }
      }
    }
  });
  return permissions;
}

app.listen(3001, () => {
  console.log('🚀 Auth Middleware running on http://localhost:3001');
  console.log('✅ Frontend (5173) → Middleware (3001) → Keycloak (8081)');
});

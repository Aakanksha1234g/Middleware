const express = require('express');
const Redis = require('redis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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

// 🔐 FIXED: Get these from Keycloak Admin Console → Clients → LorvenAI-app → Credentials
const config = {
  KEYCLOAK_URL: 'http://localhost:8081',
  KEYCLOAK_REALM: 'LorvenAI-realm',
  CLIENT_ID: 'LorvenAI-app',
  CLIENT_SECRET: 'PVFHwZaAQpC1avgo9YjRdaYLgOIC5Fuw', // ← CHANGE THIS
  JWT_SECRET: 'your-super-secret-jwt-key-change-in-prod',
  ADMIN_TOKEN: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEZ2xfSWRLX0NuYmdtMU4tVF9mc1BESU5fMDExaXFKMTF5N0dkcGtTT3VzIn0.eyJleHAiOjE3NjU4NjMwMTgsImlhdCI6MTc2NTg2Mjk1OCwianRpIjoib25sdHJvOmQ1NDA0MmM3LWFlNmEtNTNkMy1kYjY1LWNkNGU5Mzk0ZTc4OCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MS9yZWFsbXMvbWFzdGVyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWRtaW4tY2xpIiwic2lkIjoiODBlNjkwMjQtMTUxMy04YmU1LTI5ZjYtNDlmMDVhMzZmMjkxIiwic2NvcGUiOiJlbWFpbCBwcm9maWxlIn0.P7e-_zqKwqbQ0PVgv7q20ZmaUWzb3u7Xlkr6lkDbGG6hGqmBWVcaKfXHnVANORPiGnNGCnRdlnD8IEx-SJgKWK2WWW_L0HPupK9PU1LmYXbSnTA4becdvrHCAYKpfFhcfWvrhKeaxAOqwFWS6uoIO50y9LrGFrxfQqf5VD97gscdZhZaU9hOYgy_1e2XCsdW84xeoDsvvGgy8BeyFQWSLQQ8ovnol1m4-DwCMdD4AAuOveiUw0L8E30FkdQ-q3Jfvsmf-BDgUtNHRRZzCfNLNKvTGVAZ56rRDc5EFbAE1L4Eq-WygcRgmWuvsNS0eQg0m11lUNuG2Hy2uQInLnxhhg","expires_in":60,"refresh_expires_in":1800,"refresh_token":"eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmY2QyODVjMC02YjIxLTQ4MmEtYTA1OC1lZDcwN2ZjNDU5NWIifQ.eyJleHAiOjE3NjU4NjQ3NTgsImlhdCI6MTc2NTg2Mjk1OCwianRpIjoiNzEwODlhYmEtYjNlMC03Y2YwLWEyZTUtNWFiYTI2NjY1MDYwIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgxL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODEvcmVhbG1zL21hc3RlciIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJhZG1pbi1jbGkiLCJzaWQiOiI4MGU2OTAyNC0xNTEzLThiZTUtMjlmNi00OWYwNWEzNmYyOTEiLCJzY29wZSI6ImVtYWlsIGFjciB3ZWItb3JpZ2lucyByb2xlcyBwcm9maWxlIGJhc2ljIn0.GVtAMFRm6hmH_hWzO6d13rHJoUvlxG4pzhsl40v4s8E1RO5FFRvdq2oeI9VN9dsQrBO58X1CZnlsL_HH0Csivw' // Get via /realms/master/protocol/openid-connect/token
};

// MAIN LOGIN - PERFECT AS-IS ✅
app.post('/login', limiter, async (req, res) => {
  try {
    console.log("/login api called")
    const { user_email, user_password } = req.body;
    
    //Check if the group name exists with that email id part
    console.log(`user_email: ${user_email}, user pass: ${user_password}`)
    console.log(`email type: ${typeof user_email}`)
    const organization = user_email.split('@')[1].split('.')[0];   
    console.log(`Checking if the group name ${organization} exists...`)

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

// ✅ NEW: Complete Signup Implementation
app.post('/signup', limiter, async (req, res) => {
  try {
    const { user_email, user_password} = req.body;

    //Check if the group name exists with that email id part
    console.log(`user_email: ${user_email}, user pass: ${user_password}`)
    console.log("Checking if the group name with ")

    // Step 1: Create user in Keycloak
    const createUser = await axios.post(
      `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
      {
        username: user_email,
        email: user_email,
        enabled: true,
        emailVerified: true,
        credentials: [{
          type: 'password',
          value: user_password,
          temporary: false
        }],
        realmRoles: ['user'] // Default role - customize in Keycloak
      },
      {
        headers: {
          'Authorization': `Bearer ${config.ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (createUser.status === 201) {
      // Step 2: Auto-login new user
      const loginTokens = await axios.post(
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

      const userId = loginTokens.data.sub;
      const permissions = mapRolesToScreens(['user']); // Default user permissions
      const enrichedToken = jwt.sign({
        sub: userId,
        permissions,
        modules: Object.keys(permissions)
      }, config.JWT_SECRET, { expiresIn: '15m' });

      res.json({
        data: {
          response: {
            access_token: enrichedToken,
            refresh_token: loginTokens.data.refresh_token,
            permissions,
            modules: Object.keys(permissions),
            message: 'Account created successfully'
          }
        }
      });
    }
  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    res.status(400).json({ 
      data: { detail: error.response?.data?.errorMessage || 'Signup failed' } 
    });
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

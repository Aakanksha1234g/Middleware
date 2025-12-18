// server.js
//production ready file
// ============== IMPORTS ==============
const express = require('express');              // Web server
const Redis = require('redis');                  // Permissions cache
const axios = require('axios');                  // HTTP client (Keycloak)
const cookieParser = require('cookie-parser');   // Parse cookies
const cors = require('cors');                    // CORS for React
const rateLimit = require('express-rate-limit'); // Basic DDoS protection
const { createRemoteJWKSet, jwtVerify } = require('jose'); // JWT validation

// ============== CONFIG ==============
const config = {
  PORT: process.env.PORT || 3001,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'http://localhost:8081',
  REALM: process.env.KEYCLOAK_REALM || 'LorvenAI-realm',
  CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'LorvenAI-app',
  CLIENT_SECRET:
    process.env.KEYCLOAK_CLIENT_SECRET || 'PVFHwZaAQpC1avgo9YjRdaYLgOIC5Fuw',
};

// Precomputed URLs
const realmBase = `${config.KEYCLOAK_URL}/realms/${config.REALM}`;
const tokenEndpoint = `${realmBase}/protocol/openid-connect/token`;
const jwksUrl = `${realmBase}/protocol/openid-connect/certs`;     


// JOSE JWKS client — validates Keycloak signatures
const jwks = createRemoteJWKSet(new URL(jwksUrl));

// ============== APP + GLOBAL MIDDLEWARE ==============
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// ============== REDIS ==============
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis
  .connect()
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis error:', err));

// ============== RATE LIMITING ==============
// Apply limiter only to /login and /signup
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { data: { detail: 'Too many requests, please try again later.' } },
});

app.use(['/login', '/signup'], authLimiter);

// ============== HELPERS ==============

// Verify Keycloak access token (signature + iss + aud + exp)
async function verifyAccessToken(accessToken) {
  console.log(`jwks : ${jwks}`)
  const { payload } = await jwtVerify(accessToken, jwks, {  //jwtverify function from jose verifies the jwt         
    issuer: realmBase,
    audience: config.CLIENT_ID,
  });
  console.log(`payload : ${payload}`);
  return payload; // trusted claims
}

// Extract all relevant roles (realm + client) from verified payload
function extractRolesFromPayload(payload) {
  const roles = [];

  if (payload.realm_access && Array.isArray(payload.realm_access.roles)) {
    roles.push(...payload.realm_access.roles);
  }

  if (
    payload.resource_access &&
    payload.resource_access[config.CLIENT_ID] &&
    Array.isArray(payload.resource_access[config.CLIENT_ID].roles)
  ) {
    roles.push(...payload.resource_access[config.CLIENT_ID].roles);
  }

  return roles;
}

// Convert roles like "cinescribe.screen1.view" → permissions object
function mapRolesToScreens(roles) {
  const permissions = {};

  roles.forEach(role => {
    if (!role.includes('.')) return;
    const [module, screen, op] = role.split('.');

    const allowedModules = ['cinescribe', 'cinesketch', 'cineflow', 'pitchcraft'];
    if (!allowedModules.includes(module)) return;

    if (!permissions[module]) permissions[module] = {};
    if (!permissions[module][screen]) permissions[module][screen] = [];
    if (!permissions[module][screen].includes(op)) {
      permissions[module][screen].push(op);
    }
  });

  return permissions;
}

// ============== AUTH: LOGIN ==============
// Frontend should POST to http://localhost:3001/login
app.post('/login', async (req, res) => {
  try {
    console.log("/login endpoint called...")
    const { user_email, user_password } = req.body;
    if (!user_email || !user_password) {
      return res
        .status(400)
        .json({ data: { detail: 'user_email and user_password are required' } });
    }

    // 1) Ask Keycloak for tokens (password grant)
    const tokenResp = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: 'password',
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        username: user_email,
        password: user_password,
        scope: 'openid email profile',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log(`token response : ${tokenResp}`)
    const accessToken = tokenResp.data.access_token;
    console.log(`access token ${accessToken}`);
    const refreshToken = tokenResp.data.refresh_token;
    console.log(`\nrefresh token ${refreshToken}`);

    // 2) Verify token and get payload (signature + claims)
    console.log(`verifying the access token...`)
    const payload = await verifyAccessToken(accessToken);
    const userId = payload.sub;
    const cacheKey = `perms:${userId}`;

    // 3) Try Redis cache for permissions
    let permissionsJson = await redis.get(cacheKey);
    let permissions;
    if (!permissionsJson) {
      const roles = extractRolesFromPayload(payload);
      permissions = mapRolesToScreens(roles);
      permissionsJson = JSON.stringify(permissions);
      await redis.setEx(cacheKey, 900, permissionsJson); // 15 min cache
    } else {
      permissions = JSON.parse(permissionsJson);
    }

    const modules = Object.keys(permissions);

    // 4) Return Keycloak tokens + derived permissions
    res.json({
      data: {
        response: {
          access_token: accessToken,
          refresh_token: refreshToken,
          permissions,
          modules,
        },
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.response?.data || err.message);
    res.status(401).json({ data: { detail: 'Invalid credentials' } });
  }
});

// ============== AUTH: SIGNUP ==============
// Frontend should POST to http://localhost:3001/signup
app.post('/signup', async (req, res) => {
  try {
    const { user_email, user_password, firstName, lastName } = req.body;

    if (!user_email || !user_password) {
      return res
        .status(400)
        .json({ data: { detail: 'user_email and user_password are required' } });
    }

    // Get admin/service account token using client credentials
    const adminTokenResp = await axios.post(
      `${config.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.KC_ADMIN_CLIENT_ID || 'admin-cli',
        client_secret: process.env.KC_ADMIN_CLIENT_SECRET || 'CHANGE_ME',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const adminToken = adminTokenResp.data.access_token;

    // 1) Create user in Keycloak
    const createUserResp = await axios.post(
      `${config.KEYCLOAK_URL}/admin/realms/${config.REALM}/users`,
      {
        username: user_email,
        email: user_email,
        enabled: true,
        emailVerified: true,
        firstName: firstName || 'User',
        lastName: lastName || 'User',
        credentials: [
          {
            type: 'password',
            value: user_password,
            temporary: false,
          },
        ],
        // Optionally, add groups or default roles here
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (createUserResp.status !== 201) {
      return res
        .status(400)
        .json({ data: { detail: 'Failed to create user in Keycloak' } });
    }

    // 2) Login new user
    const tokenResp = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: 'password',
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        username: user_email,
        password: user_password,
        scope: 'openid email profile',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResp.data.access_token;
    const refreshToken = tokenResp.data.refresh_token;

    const payload = await verifyAccessToken(accessToken);
    const userId = payload.sub;
    const roles = extractRolesFromPayload(payload);
    const permissions = mapRolesToScreens(roles);
    await redis.setEx(`perms:${userId}`, 900, JSON.stringify(permissions));

    const modules = Object.keys(permissions);

    res.json({
      data: {
        response: {
          access_token: accessToken,
          refresh_token: refreshToken,
          permissions,
          modules,
          message: 'Account created successfully',
        },
      },
    });
  } catch (err) {
    console.error('SIGNUP ERROR:', err.response?.data || err.message);
    res.status(400).json({
      data: { detail: err.response?.data?.errorMessage || 'Signup failed' },
    });
  }
});

// ============== AUTH: REFRESH TOKEN ==============
// Frontend can POST to /refresh if you wire it
app.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res
        .status(400)
        .json({ data: { detail: 'refresh_token is required' } });
    }

    const tokenResp = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        refresh_token,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json({
      data: {
        response: {
          access_token: tokenResp.data.access_token,
          refresh_token: tokenResp.data.refresh_token,
        },
      },
    });
  } catch (err) {
    console.error('REFRESH ERROR:', err.response?.data || err.message);
    res.status(401).json({ data: { detail: 'Invalid refresh token' } });
  }
});

// ============== START SERVER ==============
app.listen(config.PORT, () => {
  console.log(`Auth Middleware running on http://localhost:${config.PORT}`);
  console.log('Frontend → /login and /signup → Middleware → Keycloak');
});

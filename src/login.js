const axios = require('axios');
const config = require('./config');

async function login(user_email, user_password){
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
        console.log(`Access token for User ${user_email} expires in ${tokens.data.expires_in}`);
        console.log(`Refresh token for User ${user_email} expires in ${tokens.data.refresh_expires_in}`); 
        return {
          // access_token: enrichedToken, //TODO: Remove after verification
          access_token: tokens.data.access_token,
          refresh_token: tokens.data.refresh_token
        }   
    }catch (error) {
    console.error('Login failed:', error?.status, error.response.status, error.response.statusText);
    throw {
    status: error.response.status,
    message: error.response.data.error_description}
  };
    
}

module.exports = {login};

// app.post('/login', limiter, async (req, res) => {
//   try {
//     console.log("/login api called...");
//     const { user_email, user_password } = req.body;

//     const tokens = await axios.post(
//       `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
//       new URLSearchParams({
//         grant_type: 'password',
//         client_id: config.ADMIN_CLIENT_ID,
//         client_secret: config.ADMIN_CLIENT_SECRET,
//         username: user_email,
//         password: user_password,
//         scope: 'openid email profile'
//       }),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//     );

//     console.log("token: ", tokens);
//     console.log(`Access token for User ${user_email} expires in ${tokens.data.expires_in}`);
//     console.log(`Refresh token for User ${user_email} expires in ${tokens.data.refresh_expires_in}`)

//     //TODO: Remove the below commented code if not required
//     // const decodedToken = jwt.decode(tokens.data.access_token);
//     // console.log("decoded token:", decodedToken);
//     // const userId = decodedToken.sub;
//     // console.log(`userId: ${userId}`);
    
//     // const enrichedToken = jwt.sign({
//     //   sub: userId
//     // }, config.JWT_SECRET, { expiresIn: '15m' });

//     //check what is in the access token
//     // console.log("access token:",enrichedToken);
//     res.json({
//       data: {
//         response: {
//           // access_token: enrichedToken, //TODO: Remove after verification
//           access_token: tokens.data.access_token,
//           refresh_token: tokens.data.refresh_token
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Login failed:', error?.status, error.response.status, error.response.statusText);
//     res.status(401).json({ message: "Login Failed", data: error.response.status || error.status });
//   }
// });


//extract token from header
// const extractTokenFromHeader = (req, res, next) => {
//   // LINE 1: Get the Authorization header from the incoming request
//   // req.headers is an object containing all HTTP headers sent by the client
//   // Example: req.headers = { 'authorization': 'Bearer eyJhbGci...', 'content-type': 'application/json' }
//   const authHeader = req.headers.authorization;
  
//   // LINE 2: Check if Authorization header exists
//   // If the client didn't send this header, authHeader will be undefined
//   if (!authHeader) {
//     // Return 401 Unauthorized and STOP execution
//     // return statement prevents next() from being called
//     return res.status(401).json({ message: "No authorization header found" });
//   }
//   // LINE 3: Extract the token from "Bearer <token>" format
//   // Authorization header format: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
//   // .split(' ') splits string by space into array: ["Bearer", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."]
//   // [1] gets second element (index 1): "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
//   const token = authHeader.split(' ')[1];
  
//   // LINE 4: Validate that token was successfully extracted
//   // If header was malformed (e.g., just "Bearer" without token), token will be undefined
//   if (!token) {
//     // Return 401 and STOP execution
//     return res.status(401).json({ message: "Invalid authorization header format" });
//   }
  
//   // LINE 5: Attach token to request object for downstream use
//   // Now any middleware or route handler that runs after this can access the token
//   // via req.access_token
//   req.access_token = token;
  
//   // LINE 6: Pass control to next middleware/route handler in the chain
//   // Without this, request processing stops and client never gets a response
//   next();
// };

// 
const express = require('express');
const Redis = require('redis');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');            
const {extractTokenFromHeader} = require('./middleware');
const {authorizeAdmin} = require('./src/middleware/authorize_admin');

const loginRoute = require('./src/routes/login');
const signupRoute = require('./src/routes/signup');
const refreshRouter = require('./src/routes/refresh');
const createUserRouter = require('./src/routes/create_user');
const modifyUserGroup = require('./src/routes/modify_user_group');
const deleteUserGroupRouter = require('./src/routes/delete_user_group');

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
// const limiter = rateLimit({ 
//   windowMs: 60 * 1000,    //windowsms is in seconds
//   max: 10000 });
//   app.use('/', limiter);
  
  
  // const userRoutes = require('./src/routes/user');
  // app.use('/users',userRoutes);
  
  // const groupRoutes = require('./src/routes/group');
  // app.use('/groups',groupRoutes);
  
  // const clientRoutes = require('./src/routes/client');
  // app.use('/clients',clientRoutes);         //
  
  app.use('/login',loginRoute);
  app.use('/signup',signupRoute);
  app.use('/refresh',refreshRouter);
  app.use('/modifyUserGroup',authorizeAdmin, modifyUserGroup);
  app.use('/createUser',authorizeAdmin, createUserRouter);  //giving error as 431(express error: token size is large.
  // app.use('/deleteUserSubGroup', deleteUserGroupRouter);

app.listen(3001, () => {
  console.log('🚀 Auth Middleware running on http://localhost:3001');
  console.log('✅ Frontend (5173) → Backend (8000)');
});

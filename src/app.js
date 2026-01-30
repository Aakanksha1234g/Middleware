const express = require('express');
const Redis = require('redis');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { authorizeAdmin } = require('./middleware/authorize_admin');

const loginRoute = require('./routes/login');
const signupRoute = require('./routes/signup');
const refreshRouter = require('./routes/refresh');
const createUserRouter = require('./routes/create_user');
const modifyUserGroup = require('./routes/modify_user_group');
const deleteUserGroupRouter = require('./routes/delete_user_group');

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

app.use('/login', loginRoute);  //done
app.use('/signup', signupRoute);  //done
app.use('/refresh', refreshRouter);       //done
app.use('/modifyUserGroup', authorizeAdmin, modifyUserGroup);  //done        
app.use('/createUser', authorizeAdmin, createUserRouter);  //giving error as 431(express error: token size is large.)
app.use('/deleteUserSubGroup', deleteUserGroupRouter);

app.listen(3001, () => {
  console.log('🚀 Auth Middleware running on http://localhost:3001');
  console.log('✅ Frontend (5173) → Backend (8000)');
});

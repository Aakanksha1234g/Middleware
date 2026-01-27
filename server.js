const config = require('./src/config');
const express = require('express');
const Redis = require('redis');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');            // 

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

const authorizeRoute = require('./src/routes/authorize');
app.use('/authorize',authorizeRoute);

const refreshRouter = require('./src/routes/refresh');
app.use('/refresh',refreshRouter);

const createUserRouter = require('./src/routes/create_user');
app.use('/create',createUserRouter);

const modifyUserGroup = require('./src/routes/modify_user_group');
app.use('/modify_user_group',modifyUserGroup);

app.listen(3001, () => {
  console.log('🚀 Auth Middleware running on http://localhost:3001');
  console.log('✅ Frontend (5173) → Backend (8000)');
});

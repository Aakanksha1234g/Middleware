const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login_controller');

//login endpoint
router.post('/login_user',loginController.login);

const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signup_controller');

//signup endpoint
router.post('/signup_user',signupController.signup);
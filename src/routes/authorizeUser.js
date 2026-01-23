const express = require('express');
const router = express.Router();
const authorizeUserController = require('../controllers/authorize_user_controller');

//authorizeUser endpoint
router.post('/authorize_user',authorizeUserController.authorizeUser);
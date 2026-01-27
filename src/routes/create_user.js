const express = require('express');
const router = express.Router();
const createUserController = require('../controllers/create_user_controller');

//create user endpoint
router.post('/create_user',createUserController.createUser);

module.exports = router;
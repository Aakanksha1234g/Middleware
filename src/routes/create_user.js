const express = require('express');
const router = express.Router();
const createUserController = require('../controllers/create_user_controller');

//create user endpoint
router.post('',createUserController.createUserWithTempPassword);

module.exports = router;
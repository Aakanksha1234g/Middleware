const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login_controller');

//login endpoint
router.post('',loginController.login);

module.exports = router;


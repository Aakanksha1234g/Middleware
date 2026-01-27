const express = require('express');
const router = express.Router();
const authorizeController = require('../controllers/authorize_controller');

//authorizeUser endpoint
router.post('/user',authorizeController.authorizeUser);

//authorize admin endpoint
router.post('/admin',authorizeController.authorizeAdmin);

module.exports = router;
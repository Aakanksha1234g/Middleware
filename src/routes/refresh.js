const express = require('express');
const router = express.Router();
const refreshController = require('../controllers/refresh_controller');

//refresh
router.post('/refresh_token',refreshController.refresh_token);

module.exports = router;

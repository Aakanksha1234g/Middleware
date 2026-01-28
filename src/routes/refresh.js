const express = require('express');
const router = express.Router();
const refreshController = require('../controllers/refresh_controller');

//refresh
router.post('',refreshController.refreshToken);

module.exports = router;

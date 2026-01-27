const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

//User endpoints
router.post('/create_user',userController.createUser);
router.post('/user_UUID',userController.getUserUUID);
router.post('/create_user_temp_pass',userController.createUserTempPass);
router.get('/user_check',userController.checkUserExists);

module.exports = router;
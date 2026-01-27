const express = require('express');
const router = express.Router();
const modifyUserGroupController = require('../controllers/modify_user_group_controller');

//modify_user_group endpoint
router.post('/modify_user_group',modifyUserGroupController.modifyUserGroup);

module.exports = router;
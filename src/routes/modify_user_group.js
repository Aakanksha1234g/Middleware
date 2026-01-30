const express = require('express');
const router = express.Router();
const modifyUserGroupController = require('../controllers/modify_user_group_controller');

//modify_user_group endpoint
// router.post('', authorizeAdmin, modifyUserGroupController.modifyUserGroup);   //this line is giving error as TypeError: argument handler must be a function
router.post('',modifyUserGroupController.modifyUserGroupController);

module.exports = router;
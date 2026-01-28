const express = require('express');
const router = express.Router();
const deleteUserSubGroupController = require('../controllers/delete_user_group_controller');

//delete user from sub_group endpoint
router.post('',deleteUserSubGroupController.deleteUserSubGroup);

module.exports = router;
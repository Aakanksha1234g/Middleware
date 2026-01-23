const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group_controller');

//group endpoints
router.put('/add_user_in_sub_group',groupController.addUserInSubGroup);
router.post('/assign_client_roles_sub_group',groupController.assignClientRolesToSubGroup);
router.post('/create_group_admin',groupController.createUserAdminOfGroup);
router.post('/create_group',groupController.createGroup);
router.post('/create_sub_groups',groupController.createSubGroup);
router.get('/get_group_id',groupController.getGroupUUID);
router.get('/get_sub_group_id',groupController.getSubGroupUUID);
router.get('/group_check',groupController.checkGroupExists);
router.get('/sub_group_check',groupController.checkSubGroupExists);
router.get('/user_in_group_check',groupController.checkUserExistsInGroup);
router.get('/user_in_sub_group_check',groupController.checkUserExistsInSubGroup);

const {addUserToSubGroup} = require('../group/add_user_in_sub_group');
const {assignClientRolesToSubGroups} = require('../group/assign_client_roles_sub_group');
const {createGroup} = require('../group/create_group');
const {createSubGroups} = require('../group/create_sub_groups');
const {getGroupUUID} = require('../group/get_group_id');
const {getSubGroupUUID} = require('../group/get_sub_group_id');
const {createUserAdminOfGroup} = require('../group/create_group_admin');
const {checkGroupExists} = require('../group/group_check');
const {checkSubGroupExists} = require('../group/sub_group_check');
const {checkUserExistsInGroup} = require('../group/user_in_group_check');
const {checkUserExistsInSubGroup} = require('../group/user_in_sub_group_check');

//Add user in sub group
exports.addUserInSubGroup = async (req,res) => {
    try{
        const user_email = req.body.user_email;
        const group_name = req.body.group_name;
        const sub_group_name = req.body.sub_group_name;
        const addUserInSubGroupResp = await addUserToSubGroup(user_email, group_name, sub_group_name);
        res.status(200).json({success: true, data: addUserInSubGroupResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.assignClientRolesToSubGroup = async (req, res) => {
    try {
        const organization_name = req.body.organization_name;
        const assignClientRolesToSubGroupResp = await assignClientRolesToSubGroups(organization_name);
        res.status(200).json({success: true, data: assignClientRolesToSubGroupResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.createGroup = async (req, res) => {
    try {
        const group_name = req.body.group_name;
        const createGroupResp = await createGroup(group_name);
        res.status(200).json({success: true, data: createGroupResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.createSubGroup = async (req, res) => {
    try {        
        const group_name = req.body.group_name;
        const createSubGroupResp = await createSubGroups(group_name);
        res.status(200).json({success: true, data: createSubGroupResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getGroupUUID = async (req, res) => {
    try {
        const group_name = req.body.group_name;
        const getGroupUUIDResp = await getGroupUUID(group_name);
        res.status(200).json({success: true, data: getGroupUUIDResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getSubGroupUUID = async (req, res) => {
    try {
        const group_name = req.body.group_name;
        const sub_group_name = req.body.sub_group_name;
        const getSubGroupIDResp = await getSubGroupUUID(group_name, sub_group_name);
        res.status(200).json({success: true, data: getSubGroupIDResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.createUserAdminOfGroup = async (req, res) => {
    try {
        const user_email = req.body.user_email;
        const organization_name = req.body.organization_name;
        const createGroupAdminResp = await createUserAdminOfGroup(user_email, organization_name);
        res.status(200).json({success: true, data: createGroupAdminResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.checkGroupExists = async (req, res) => {
    try {
        const organization_name = req.body.organization_name;
        const groupCheckResp = await checkGroupExists(organization_name);
        res.status(200).json({success: true, data: groupCheckResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.checkSubGroupExists = async (req, res) => {
    try {
        const group_name = req.body.group_name;
        const sub_group_name = req.body.sub_group_name;
        const subGroupCheckResp = await checkSubGroupExists(group_name, sub_group_name);
        res.status(200).json({success: true, data: subGroupCheckResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.checkUserExistsInGroup = async (req, res) => {
    try {
        const organization_name = req.body.organization_name;
        const user_email = req.body.user_email;
        const userInGroupCheckResp = await checkUserExistsInGroup(organization_name, user_email);
        res.status(200).json({success: true, data: userInGroupCheckResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.checkUserExistsInSubGroup = async (req, res) => {
    try {
        const user_email = req.body.user_email;
        const organization_name = req.body.organization_name;
        const sub_group_name = req.body.sub_group_name;
        const userInSubGroupCheckResp = await checkUserExistsInSubGroup(user_email, organization_name, sub_group_name);
        res.status(200).json({success: true, data: userInSubGroupCheckResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};


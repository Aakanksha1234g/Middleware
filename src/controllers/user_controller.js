
const {createUser} = require('../user/create_user');
const {getUserUUID} = require('../user/get_user_uuid');
const {createUserTempPassword} = require('../user/create_user_temp_pass');
const {checkUserExists} = require('../user/user_check');

//Create user request
exports.createUser = async (req, res) => {
    try {
        const userResp = await createUser(req.body);
        res.status(200).json({success: true, data: userResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getUserUUID = async (req, res) => {
    try {
        const userUUIDResp = await getUserUUID(req.body);
        res.status(200).json({success: true, data: userUUIDResp})
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.createUserTempPass = async (req,res) => {
    try {
        const userTemPassResp = await createUserTempPassword(req.body);
        res.status(200).json({success: true, data: userTemPassResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

// exports.checkUserAdmin = async (req, res) => {
//     try {
//         const userAdminResp = await checkUserAdminOfGroup(req.body);
//         res.status(200).json({success: true, data: userAdminResp});
//     }catch(error){
//         res.status(400).json({success: false, error: error.message});
//     }
// }

exports.checkUserExists = async (req, res) => {
    try {
        const userExistsResp = await checkUserExists(req.body);
        res.status(200).json({success: true, data: userExistsResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

const {createUser} = require('../user/create_user');
const {getUserUUID} = require('../user/get_user_uuid');
const {createUserTempPassword} = require('../user/create_user_temp_pass');
const {checkUserExists} = require('../user/user_check');

//Create user request
exports.createUser = async (req, res) => {
    try {
        const user_email = req.body.user_email;
        const user_password = req.body.user_password;
        const userResp = await createUser(user_email, user_password);
        res.status(200).json({success: true, data: userResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.getUserUUID = async (req, res) => {
    try {
        const user_email = req.body.user_email;
        const userUUIDResp = await getUserUUID(user_email);
        res.status(200).json({success: true, data: userUUIDResp})
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

exports.createUserTempPass = async (req,res) => {
    try {
        const user_email = req.body.user_email;
        const temp_password = req.body.temp_password;
        const userTemPassResp = await createUserTempPassword(user_email, temp_password);
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
        const user_email = req.body.user_email;
        const userExistsResp = await checkUserExists(user_email);
        res.status(200).json({success: true, data: userExistsResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};
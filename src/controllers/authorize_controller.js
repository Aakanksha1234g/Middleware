const {authorizeUser} = require('../user/authorize_user');
const {authorizeAdmin} = require('../user/authorize_admin');

//authorize user
exports.authorizeUser = async (req, res) => {
    try {
        console.log('req',req);
        const access_token = req.access_token;
        const authorizeUserResp = await authorizeUser(access_token);
        if(!authorizeUserResp){
            res.status(400).json({success: false, message: 'Token expired'});
        }
        res.status(200).json({success: true, data: authorizeUserResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

//authorize admin
exports.authorizeAdmin = async (req, res) => {
    try {
        const authorizeAdminResp = await authorizeAdmin(req.body);
        res.status(200).json({success: true, data: authorizeAdminResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

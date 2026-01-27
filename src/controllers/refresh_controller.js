const {refreshToken} = require('../refresh_token');

//refresh
exports.refresh_token = async (req, res) => {
    try {
        const refreshTokenResp = await refreshToken(req.body);
        res.status(200).json({success: true, data: refreshTokenResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};
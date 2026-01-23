const {login} = require('../login');

//login
exports.login = async (req, res) => {
    try {
        const loginResp = await login(req.body);
        res.status(200).json({success: true, data: loginResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

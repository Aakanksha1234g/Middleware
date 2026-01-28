const {login} = require('../login');

//login
exports.login = async (req, res) => {
    try {
        console.log('request',req.body);
        const user_email = req.body.user_email;
        const user_password = req.body.user_password;
        const loginResp = await login(user_email, user_password);
        res.status(200).json({success: true, data: loginResp});
    }catch(error){
        console.log('error',error);
        res.status(400).json({success: false, error: error.message});
    }
};

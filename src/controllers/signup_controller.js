const {signup} = require('../signup');

//signup
exports.signup = async (req, res) => {
    try {
        const signupResp = await signup(req.body);
        res.status(200).json({success: true, data: signupResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

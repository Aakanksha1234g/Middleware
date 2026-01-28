const {signup} = require('../signup');

//signup
exports.signup = async (req, res) => {
    try {
        console.log('request body',req.body);
        const user_email = req.body.user_email;
        const user_password = req.body.user_password;
        const organization_name = req.body.organization; 
        const signupResp = await signup(user_email, user_password, organization_name);
        console.log('signup response:',signupResp);
        res.status(200).json({success: true, data: signupResp});
    }catch(error){
        console.error('error in signup up',error);
        res.status(400).json({success: false, error: error.message});
    }
};

const {createUser} = require('../create_user');

//create_user
exports.createUser = async (req,res) => {
    try {
        const createUserResp = await createUser(req.body);
        res.status(200).json({success: true, data: createUserResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};
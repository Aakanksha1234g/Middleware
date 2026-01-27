const {modifyUserGroup} = require('../modify_user_group');

exports.modifyUserGroup = async (req,res) => {
    try {
        const modifyUserGroupResp = await modifyUserGroup(req.body);
        res.status(200).json({success: true, data: modifyUserGroupResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

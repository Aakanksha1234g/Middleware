const {checkGroupExists} = require('../group/group_check');
const {checkSubGroupExists} = require('../group/sub_group_check');
const {checkUserExists} = require('../user/user_check');
const {createUserTempPassword} = require('../user/create_user_temp_pass');
const {addUserToSubGroup} = require('../group/add_user_in_sub_group');
const {sendResetPasswordEmail} = require('../email/reset_password_mail');

async function createUser(req, res) {
  console.log('inside createUser function..');
    const { user_email, tempPassword, groupName, subGroupName } = req.body;
    console.log('req body',req.body);
    console.log('user_email',user_email);
    console.log('temp pass:',tempPassword);
    console.log('group name:',groupName);
    console.log('sub group name:',subGroupName);
    try{
      const organizationExists = await checkGroupExists(groupName);
      if(!organizationExists){
        return res.status(403).json({message: `Organization ${groupName} doesn't exist.`});  //200- group exists, 403- doesn't exist
      }
      console.log(`Organization ${groupName} exists.`);
      const subGroupExists = await checkSubGroupExists(groupName,subGroupName);
      if(!subGroupExists){
        return res.status(200).json({message: `Sub group ${subGroupName} doesn't exist.`});
      }
      // console.log(`Checking user ${user_email} exists or not..`);
      const userExists = await checkUserExists(user_email);

      if (userExists) {
        console.log(`User ${user_email} already exists`);
        return res.status(200).json({message: "User already exists"});
      }

      console.log(`User ${user_email} doesn't exist.Creating it.`);
      const userCreatedTempPassResponse = await createUserTempPassword(user_email,tempPassword);
      console.log('userCreatedTempPassResponse:',userCreatedTempPassResponse);
      const addUserToSubGroupResponse = await addUserToSubGroup(user_email,groupName,subGroupName);
      console.log('addUserToSubGroupResponse:',addUserToSubGroupResponse);
      const sendResetPasswordEmailResponse = await sendResetPasswordEmail(user_email);
      console.log('sendResetPasswordEmailResponse:',sendResetPasswordEmailResponse);
      return res.status(200).json({message: `Password reset email has been sent to user ${user_email}`});

    }catch(error){
      console.error(`Error in /createUser:`,error);
      return res.status(error.status).json({message: "Error in adding user", error: error});
    }
}

module.exports = {
    createUser
}

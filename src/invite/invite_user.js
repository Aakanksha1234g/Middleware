const config = require('../config')

async function inviteUser(user_email,user_password) {
    try {
        console.log("Creating invitation token for user:",user_email);
        const invitationPayload = {
            email : user_email,
            password : user_password,
            action:'create-account',
            expires:Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }
        const invitationToken = jwt.sign(invitationPayload, config.JWTSECRET);
        console.log("Creating invite link...")
        const tokenData = { email: user_email, password: user_password}
        const token = jwt.sign(tokenData, config.JWTSECRET)
        const magicLink = `http://localhost:3001/accept-invite/${invitationToken}`;

        console.log(`Sending email on mail id ${user_email}`);
        
    }catch(error){
        res.status(400).json({data: {detail: 'Invitation failed'}});
    }
}
module.exports = {inviteUser};
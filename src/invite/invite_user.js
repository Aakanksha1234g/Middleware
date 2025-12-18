const config = require('../config');
const jwt = require('jsonwebtoken');

async function inviteUser(user_email,user_password) {
    try {
        console.log("Creating invitation token for user:",user_email);
        const tokenData = {
            email : user_email,
            password : user_password,
            action:'create-account',
            expires:Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }
        console.log("jwt secret:", config.JWT_SECRET);
        const token = jwt.sign(tokenData, config.JWT_SECRET);
        console.log("Creating invite link...");
        const link = `http://localhost:3001:/accept-invite/${token}`;

        //Send email
        await transporter.sendMail({
            to: user_email,
            subject: 'Complete Your LorvenAI Signup',
            html : `<h2>Create your account!</h2>
            <p> Click on the link below to complete account creation:</p>
            <a href=${link}></a>`
        });
        console.log(`Invitation sent to ${user_email}`);
        return true;
    }catch(error){
        console.log("Invitation failed:",error.message);
        throw error;
    }
}
module.exports = {inviteUser};
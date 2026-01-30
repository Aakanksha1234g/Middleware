const axios = require('axios');
const config = require('../config');
const {getAdminToken} = require('../controllers/utils');
const { getUserUUID } = require('../controllers/utils');

async function sendResetPasswordEmail(user_email){
    try {
        const adminToken = await getAdminToken();
        const userUUID = await getUserUUID(user_email);
        console.log('Sending email to user...');
        // FIXME: Check the link where the user will be redirected after clicking the verify email link and also expiry time of the link
        //Create email with verify-email link
        const resetPasswordEmailResponse = await axios.put( `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/execute-actions-email`,
        ['UPDATE_PASSWORD'],         // TODO: make descriptive comment if required - required actions
        {
            params: {
            client_id: config.CLIENT_ID,
            redirect_uri: 'http://localhost:5173/login',
            },
            headers: {
            Authorization: `Bearer ${adminToken}`, 'Content-Type':'application/json'}
        }
        );
        console.log('resetPasswordEmailResponse : ',resetPasswordEmailResponse);     //after sending email shows status: 204, statusText:No content
        console.log('resetPasswordEmailResponse data:',resetPasswordEmailResponse.data);  //data is empty string when email is sent
        console.log(`Verification email sent to ${user_email} with status: ${resetPasswordEmailResponse.status}`);
        return resetPasswordEmailResponse.status; // FIXME: return the status code [after checking]
    }catch(error){
        console.error('Error in sending verification email:',error);
        return error.status;   
    }
}
module.exports = {sendResetPasswordEmail};
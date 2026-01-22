const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');


async function sendEmailVerification(userId, user_email){
    try {
        const adminToken = await getAdminToken();
        console.log('Sending email to user...');
        // FIXME: Check the link where the user will be redirected after clicking the verify email link and also expiry time of the link
        //Create email with verify-email link
        const emailResponse = await axios.put( `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/execute-actions-email`,
        ['VERIFY_EMAIL'],         // TODO: make descriptive comment if required - required actions
        {
            params: {
            client_id: config.CLIENT_ID,
            redirect_uri: 'http://localhost:5173/login',
            },
            headers: {
            Authorization: `Bearer ${adminToken}`, 'Content-Type':'application/json'}
        }
        );

        console.log(`Verification email sent to ${user_email} with status: ${emailResponse.status}`);
        return true; // FIXME: return the status code [after checking]
    }catch(error){
        console.error('Error in sending verification email:',error.message);
        console.error('Error response status:',error.response?.status); //TODO: remove after debugging
        console.error('Error response data:',error.response?.data);
        return false; // FIXME: return the status code [after checking]
    }
}

async function createUser(user_email,user_password){
    try {
        const adminToken = await getAdminToken();

        //Create user as Pending(email not verified)
        console.log('Creating user..');
        const createResp = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
            {
                username: user_email, email: user_email, enabled:true, //TODO: Check if the username should be same as user email
                emailVerified:false, credentials: [{type: 'password',value: user_password,temporary: false // TODO: Check the options (params) passed for creating user
                }],
                requiredActions: ['VERIFY_EMAIL']
            },
            {headers: { Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log(`User ${user_email} created successfully.`);
        //Get userId fro Location header
        const location = createResp.headers.location;   //../users/{id} // TODO: Review the code to get user id
        const userId = location.substring(location.lastIndexOf('/') + 1);   
        console.log(`user_id : `,userId);  
        
        const emailResStatus = await sendEmailVerification(userId, user_email);

        if (emailResStatus !== 200){
            console.error(`Failed to send verification email to ${user_email}`);
            return false;
        }        
        return true;
    }catch(error){
        // FIXME: Change the logs
        console.error('Error in creating user:',error.message);
        console.error('Error response status:',error.response?.status);
        console.error('Error response data:',error.response?.data);
        return false;
    }
}

module.exports = {createUser};
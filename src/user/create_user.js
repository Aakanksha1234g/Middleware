const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');


async function createUser(user_email,user_password){
    try {
        const adminToken = await getAdminToken();

        //Create user as Pending(email not verified)
        console.log('Creating user..');
        const createResp = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
            {
                username: user_email, email: user_email,enabled:true,
                emailVerified:false, credentials: [{type: 'password',value: user_password,temporary: false
                }],
                requiredActions: ['VERIFY_EMAIL']
            },
            {headers: { Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log(`User ${user_email} created successfully.`);
        //Get userId fro Location header
        const location = createResp.headers.location;   //../users/{id}
        const userId = location.substring(location.lastIndexOf('/') + 1);   
        console.log(`user_id : `,userId);  
        
        console.log('sending email to user...');
        //Create email with verify-email link
        const emailResponse = await axios.put( `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/execute-actions-email`,
        ['VERIFY_EMAIL'],         //required actions
        {
            params: {
            client_id: config.CLIENT_ID,
            redirect_uri: 'http://localhost:5173/login',
            },
            headers: {
            Authorization: `Bearer ${adminToken}`, 'Content-Type':'application/json'}
        }
        );
        console.log('Email response:',emailResponse.status);
        console.log('user_id:',userId);
        console.log(`Verification email sent to ${user_email}`);
        return {'userCreatedResponse' :createResp.status,
        'userId':userId    
        }
    }catch(error){
        console.error('Error in creating user:',error.message);
        console.error('Error response status:',error.response?.status);
        console.error('Error response data:',error.response?.data);
        return false;
    }
}

module.exports = {createUser};
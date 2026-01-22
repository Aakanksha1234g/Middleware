const config = require('../config');
const axios = require('axios');
const {getAdminToken} = require('../admin_token');

async function createUserTempPassword(user_email,tempPassword){
    try{
        const adminToken = await getAdminToken();
        console.log('Creating user with temp pass...');
        
        const createResp = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
            {username:user_email, email:user_email, enabled:true, emailVerified: true,
                credentials: [{type: 'password',value: tempPassword, temporary:true}],
                 requiredActions: ['UPDATE_PASSWORD']},
            {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        // console.log('createResponse:',createResp);  //shows 201 statusText:Created after creating user
        // console.log('createResponse data:',createResp.data);      //is empty when user is created
        console.log(`createResponse with status: ${createResp.status}, statusText: ${createResp.statusText}`);
        return createResp.status;          //returns 201 statusText:Created
    }catch(error){
        console.error('Error in createUserTempPass:',error);
        return error.status;
    }
}
module.exports = {createUserTempPassword};
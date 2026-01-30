const config = require('../config');
const axios = require('axios'); 
// const {getAdminToken} = require('../admin_token');

async function getAdminToken() {
    // console.log("inside getadmintoken func...")
    try { 
        const params = new URLSearchParams();
        params.append( 'client_id',config.ADMIN_CLIENT_ID);
        params.append('client_secret', config.ADMIN_CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');
        const response = await axios.post(
            `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            params,
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
        );
        // console.log(`response data : ${response.status}`);
        return response.data.access_token;
    } catch(error) {
        console.error("Failed to fetch admin token:", error.message);
        console.error("Response data ",error.response.data);
        const ERROR = error.response.data.error_description;
        console.log(ERROR);
        throw ERROR;
        // return error.response.data.error_description;
    }
}

// /users endpoint returns 200 if user exists else, empty list, 403 if issue with token.
async function checkUserExists(user_email) {
    try {
      const adminToken = await getAdminToken();
      const searchUser = await axios.get(
          `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
          {
            headers: {'Authorization': `Bearer ${adminToken}`}, params : {email : user_email},
          }
      );
      // console.log("user search response:",searchUser);   //shows url, token and a data array which is empty if user doesn't exist
      if(searchUser.data.length === 0){
        console.log(`User with email ${user_email} does not exist.`);
        return false;
      }

       //console.log("searched user:", searchUser.data); //if user exists then search user.data is an array with user details, else search user is empty
       //console.log('searched user id:',searchUser.data[0].id);
      return true;

    } catch(error) {
      // if (error.response?.status === 404) return false;
      console.error('User check failed:',error.message); //FIXME: Check this
      return false;
    }
}

async function getUserUUID(user_email) {
    try {
        console.log('inside getUserUUID');
        const adminToken = await getAdminToken();
        const userResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
            {
                headers: {'Authorization':`Bearer ${adminToken}`}, params : {email: user_email},
            }
        );
        console.log('User response:',userResponse.data[0].id);
        return userResponse.data[0].id;
    }catch(error){
        console.error('Error in getUserUUID:',error);
        return error.status;
    }
}

async function checkGroupExists(organization) {
    try {
        console.log('inside checkGroupExists function...');
        const adminToken = await getAdminToken();
        const groupExistsResponse = await axios.get(
        `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups?search=${organization}&exact=true&max=1`,
        {
            headers: {'Authorization' : `Bearer ${adminToken}`},
        }
        );
         console.log('groupsExistsResponse:',groupExistsResponse); //consists headers, adminToken,url,data:[]
        const group = groupExistsResponse.data;  //this is an array which has searched group info
        // console.log("group check response data:",group); 
        const groupExists = group.some(group => group.name === organization);  //has true/false value
        console.log(`Group ${organization} exists:`, groupExists);
        
        return groupExists;
    } catch(error) {
        // if(error.response?.status === 404) return false; //FIXME: Check this
        console.error('Group check failed:',error.message);
        return false;
    }
}


module.exports = {
    checkUserExists,
    checkGroupExists,
    getUserUUID,
    getAdminToken
};

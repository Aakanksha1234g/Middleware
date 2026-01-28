const config = require('../config');
const axios = require('axios'); 
const {getAdminToken}= require('../admin_token');

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
module.exports = {checkUserExists};
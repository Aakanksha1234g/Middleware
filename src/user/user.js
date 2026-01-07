const config = require('../config');
const axios = require('axios'); 
const {getAdminToken}= require('../admin_token');

// /users endpoint returns 200 if user exists else, empty list, 403 if issue with token.
async function checkUserExists(email) {
    try {
      console.log("inside checkuserexists...");
      const adminToken = await getAdminToken();
      console.log(`adminToken : ${adminToken} `);
      // console.log("list of users in keycloak...");
      // const allUsers = await axios.get(
      //       `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
      //       {headers: {'Authorization': `Bearer ${adminToken}`}}
      //   );
      //   console.log("Users in keycloak:",allUsers.data);
        console.log("checking user exists or not...");
        const searchUser = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
            {
              headers: {'Authorization': `Bearer ${adminToken}`}, params : {email : email},
            }
        );
        console.log("user search response:",searchUser);   //shows url, token and a data array which is empty if user doesn't exist
        console.log("user search response status:",searchUser.status);
        if(searchUser.data.length === 0){
          console.log(`User with email ${email} does not exist.`);
          return false;
        }
        else {
          console.log("searched user:", searchUser.data); //if user exists then search user.data is an array with user details, else search user is empty
          console.log('searched user id:',searchUser.data[0].id);
          return searchUser.data[0].id;
        }

    } catch(error) {
      if (error.response?.status === 404) return false;
      console.error('User check failed:',error.message);
      return false;
    }
}
module.exports = {checkUserExists};
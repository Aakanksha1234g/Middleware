const config = require('../config');
const axios = require('axios'); 
const {getAdminToken}= require('../admin_token');

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
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users?username=${email}&exact=true`,
            {headers: {'Authorization': `Bearer ${adminToken}`}}
        );
        console.log("searched user:", searchUser.data);
        console.log('searched user id:',searchUser.data[0].id);
        return searchUser.data[0].id;
    } catch(error) {
      if (error.response?.status === 404) return false;
      console.error('User check failed:',error.message);
      return false;
    }
}
module.exports = {checkUserExists};
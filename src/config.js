
require('dotenv').config();    //This loads the dotenv file into process.env

const config = {
  KEYCLOAK_REALM : process.env.KEYCLOAK_REALM,
  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  CLIENT_ID: process.env.CLIENT_ID,                          //used for login
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_CLIENT_ID : process.env.ADMIN_CLIENT_ID,                       //used to get tokens
  ADMIN_CLIENT_SECRET : process.env.ADMIN_CLIENT_SECRET,
  KEYCLOAK_DEFAULT_REALM : process.env.KEYCLOAK_DEFAULT_REALM,
  KEYCLOAK_ADMIN_USER : process.env.KEYCLOAK_ADMIN_USER,
  KEYCLOAK_ADMIN_USER_PASSWORD : process.env.KEYCLOAK_ADMIN_USER_PASSWORD,
  REDIRECT_URI : process.env.REDIRECT_URI,
};

module.exports = config;

require('dotenv').config();    //This loads the dotenv file into process.env

const config = {
  KEYCLOAK_REALM : process.env.KEYCLOAK_REALM,
  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_CLIENT_ID : process.env.ADMIN_CLIENT_ID,
  ADMIN_CLIENT_SECRET : process.env.ADMIN_CLIENT_SECRET
};

module.exports = config;

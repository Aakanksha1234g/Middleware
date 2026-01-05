const config = require('../config');
const axios = require('axios');
const { getAdminToken } = require('../admin_token');

async function checkUserExistsController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "email is required"
      });
    }

    console.log("Checking if user exists:", email);

    const adminToken = await getAdminToken();

    const response = await axios.get(
      `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        params: {
          username: email,
          exact: true
        }
      }
    );

    const users = response.data;

    // ✅ User does not exist
    if (users.length === 0) {
      return res.status(200).json({
        exists: false
      });
    }

    // ✅ User exists
    return res.status(200).json({
      exists: true,
      user: users[0]
    });

  } catch (error) {
    console.error(
      "checkUserExistsController failed:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      error: "Keycloak user lookup failed",
      details: error.response?.data || error.message
    });
  }
}

module.exports = { checkUserExistsController };

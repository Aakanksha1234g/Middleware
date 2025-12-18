app.post('/signup', limiter, async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    // 1) Block if already existing
    const exists = await checkUserExists(user_email);
    if (exists) {
      return res.status(400).json({ data: { detail: 'Account already exists. Please log in.' } });
    }

    const adminToken = await getAdminToken();

    // 2) Create user as PENDING (email not verified)
    const createResp = await axios.post(
      `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
      {
        username: user_email,
        email: user_email,
        enabled: true,              // account exists but you will check emailVerified later
        emailVerified: false,       // key flag
        credentials: [{
          type: 'password',
          value: user_password,
          temporary: false
        }],
        requiredActions: ['VERIFY_EMAIL']  // verify email is required
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3) Get userId from Location header
    const location = createResp.headers.location;       // .../users/{id}
    const userId = location.substring(location.lastIndexOf('/') + 1);

    // 4) Trigger Keycloak email with verify-email link
    await axios.put(
      `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userId}/execute-actions-email`,
      ['VERIFY_EMAIL'],  // required actions
      {
        params: {
          client_id: config.CLIENT_ID,
          redirect_uri: 'http://localhost:5173/login'
        },
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      data: { detail: 'Confirmation email sent. Please click the link in your inbox.' }
    });

  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    return res.status(400).json({ data: { detail: 'Signup failed' } });
  }
});


// ONE FUNCTION - Add this to your existing code
async function sendSignupInvitation({ user_email, user_password }) {
  try {
    // 1. Check user doesn't exist
    const userExists = await checkUserExists(user_email);
    if (userExists) throw new Error('User already exists');

    // 2. Create secure token with credentials
    const organization = user_email.split('@')[1].split('.')[0];
    const tokenData = { email: user_email, password: user_password, org: organization, exp: Date.now() + 24*60*60*1000 };
    const token = jwt.sign(tokenData, config.JWT_SECRET);
    const magicLink = `http://localhost:3001/accept-invite/${token}`;

    // 3. Send email
    await transporter.sendMail({
      to: user_email,
      subject: 'Complete Your LorvenAI Signup',
      html: `<h2>Your Account is Ready!</h2><p>Click <a href="${magicLink}">here</a> to activate instantly.</p>`
    });

    console.log(`✅ Invitation sent to ${user_email}`);
    return true;
  } catch (error) {
    console.error('Invitation failed:', error.message);
    throw error;
  }
}


// ONE FUNCTION - Add this to your existing code
async function sendSignupInvitation({ user_email, user_password }) {
  try {
    // 1. Check user doesn't exist
    const userExists = await checkUserExists(user_email);
    if (userExists) throw new Error('User already exists');

    // 2. Create secure token with credentials
    const organization = user_email.split('@')[1].split('.')[0];
    const tokenData = { email: user_email, password: user_password, org: organization, exp: Date.now() + 24*60*60*1000 };
    const token = jwt.sign(tokenData, config.JWT_SECRET);
    const magicLink = `http://localhost:3001/accept-invite/${token}`;

    // 3. Send email
    await transporter.sendMail({
      to: user_email,
      subject: 'Complete Your LorvenAI Signup',
      html: `<h2>Your Account is Ready!</h2><p>Click <a href="${magicLink}">here</a> to activate instantly.</p>`
    });

    console.log(`✅ Invitation sent to ${user_email}`);
    return true;
  } catch (error) {
    console.error('Invitation failed:', error.message);
    throw error;
  }
}

app.get('/accept-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const data = jwt.verify(token, config.JWT_SECRET);
    
    // Create user in Keycloak
    const adminToken = await getAdminToken(); // Your existing function
    await axios.post(`${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`, {
      username: data.email,
      email: data.email,
      enabled: true,
      emailVerified: true,
      credentials: [{ type: 'password', value: data.password, temporary: false }]
    }, { headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } });
    
    res.redirect(`http://localhost:5173/dashboard?success=true`);
  } catch (error) {
    res.send('<h2>Invalid link. Contact support.</h2>');
  }
});

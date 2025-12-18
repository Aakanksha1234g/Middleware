1. /realms/{realm-name}/protocol/openid-connect/certs

   1. It is used for Json Web Key Set(JWKS) which has realm public keys.
   2. It is used to verify any Json Web Token.
2. JWKS - Json web key set is  a list of public keys which keycloak used to sign the token
3. SMTP - simple mail transfer protocol used for sending emails between servers.
4. Nodemail transporter - is a fixed smtp client that knows

   1. host - connect to this server
   2. port - use this port
   3. auth - sender's email and password.
5. dfgfdg
6. 


## Keycloak Email tab

In your realm’s **Email** settings:

1. Keep:
   * From: `aakanksha@thequantum.ai`
   * Host: `smtp-relay.brevo.com`
   * Port: `587`
   * Authentication: ON
   * Username: `9e546b001@smtp-brevo.com`
   * Authentication type: `password`
   * Password: `bskKrlIu5XeM93j` (SMTP key)
2. **Change Encryption:**
   * Disable  **SSL** .
   * Enable **StartTLS** (sometimes labelled just “TLS” in Keycloak UI).

     The SSLException `Unsupported or unrecognized SSL message` is exactly what you get when you use SSL on a STARTTLS port.[](https://www.keycloak.org/docs/latest/server_admin/index.html)

* Optionally disable **Allow UTF‑8** (not required for this).
* Click **Test connection** on the Email tab.

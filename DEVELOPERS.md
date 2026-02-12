# Developer guidelines for IAM middleware setup

---

#### To check access_token data

```bash
echo "YOUR_ACCESS_TOKEN" | cut -d '.' -f2 | base64 -d | jq .
```

#### To run the server on different port

```bash
./bin/kc.sh start-dev --http-port=8081
```

#### To send email to user ( Brevo Credentials)

```bash
Brevo website-> SMTP & API 
FROM NAME : LorvenAI
FROM EMAIL : aakanksha@thequantum.ai     ->displays in receiver's email

SMTP SETTINGS
Password: bskKrlIu5XeM93j                ->SMTP  KEY
SMTP Server : smtp-relay.brevo.com
Port : 587
Login : 9e546b001@smtp-brevo.com

```

**Keycloak Realm (LorvenAI-realm) Email tab**

**Keycloak -> Realm Settings -> Email settings:**

1. **From**:  aakanksha@thequantum.ai                    // this is just for the display`
2. **Host**:  smtp-relay.brevo.com
3. **Port**:  587
4. **Authentication**:  ON
5. **Username**:  9e546b001@smtp-brevo.com
6. **Authentication** **type**:  password
7. **Password**:  bskKrlIu5XeM93j                              // SMTP key
8. **Encryption**:

   1. Disable  SSL.
   2. Enable StartTLS.

   Note : The SSLException `Unsupported or unrecognized SSL message` is exactly what you get when you use SSL.
9. Disable Allow UTF‑8.
10. Click Test connection.



The email sent to the user will look like this:  [Email sent to user](/Middleware/Email sent to the user screenshot.png)


## **Organization Admin Roles :**

```bash
query-groups - List groups
query-users - Search users
manage-users - Create/invite users to their org group
view-users - View group members
```

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

The email sent to the user will look like this:  [Email_sent_to_user](Email_sent_to_the_user_screenshot.png) .

## **Organization Admin Roles :**

```bash
Platform_Admin
usermgmt.assign-role
usermgmt.view-users
usermgmt.update-user
usermgmt.delete-user
usermgmt.create-user
```

#### To delete client :

On terminal :

1. Login with admin credentials :
   ```bash
   ./bin/kcadm.sh config credentials \
     --server http://localhost:8081 \
     --realm master \
     --user admin \
     --password admin_password

   E.g. ./bin/kcadm.sh config credentials \
     --server http://localhost:8081 \
     --realm master \
     --user admin \
     --password admin@123

   ```
2. Get the clients of the realm :

```bash
./bin/kcadm.sh get clients -r yourrealm

E.g: ./bin/kcadm.sh get clients -r LorvenAI-realm
```

This command will display the list of clients with their respective details.

Do not delete the following default clients : realm-management, account, admin-cli

1. realm-management
2. account
3. admin-cli
4. account-console
5. broker
6. realm-management
7. security-admin-console


3. Copy the client UUID.

```bash
"id" : "f27a2087-137f-4af5-bc80-35f3bfba0784",
  "clientId" : "LorvenAI-app-org387"
This id is the client's UUID.
```


4. Delete the client.

```bash
./bin/kcadm.sh delete clients/UUID-OF-CLIENT -r yourrealm

E.g: ./bin/kcadm.sh delete clients/f27a2087-137f-4af5-bc80-35f3bfba0784 -r LorvenAI-realm
```

5.    The client will be deleted.

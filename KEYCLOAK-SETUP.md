## Steps to install Keycloak

#### Install Java (Keycloak runs on JVM)

```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

#### Download Keycloak

```bash
mkdir Projects
cd Projects 
sudo wget https://github.com/keycloak/keycloak/releases/download/26.4.1/keycloak-26.4.1.tar.gz
sudo tar -xvzf keycloak-26.4.1.tar.gz
sudo mv keycloak-26.4.1 keycloak
cd ..
sudo chown -R $USER:$USER ~/Projects/keycloak       or          sudo chown -R $USER:$USER /<add the absolute path here>
```

#### Create Admin User

```bash
cd ~/Projects/keycloak
./bin/kc.sh bootstrap-admin user
```

* Enter username :
* Enter password :
* lEnter password again :

Note :

1. These credentials are admin credentials. Never delete them. If they are deleted from UI, check Issues section to create the admin user.
2. In **Keycloak UI**, in masters **realm** under **Users** tab a user will be created with these credentials.
3. Start the server:

```bash
./bin/kc.sh start-dev
```

#### Start Keycloak

```bash
cd /Projects/keycloak
./bin/kc.sh start-dev
```

By default keycloak runs on port 8080

To run keycloak on different port, e.g. port 8081

```bash
./bin/kc.sh start-dev --http-port=8081
```

#### Access Keycloak

```bash
http://localhost:8081
http://<pc-ip>:8081
```

1. Sign in with admin username and password.
2. After sign in Keycloak's realm : master (default realm) would be created.

#### Connect Keycloak 26.0.0 with Postgresql

###### Install Postgresql

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

###### Start and enable Postgresql

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

###### Create Keycloak DB + user

```bash
sudo -u postgres psql -c "CREATE DATABASE keycloak;"
sudo -u postgres psql -c "CREATE USER keycloak WITH PASSWORD 'StrongPass123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;"
```

###### Download PostgreSQL JDBC driver

```bash
cd ~/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1
mkdir -p providers
cd providers
wget https://jdbc.postgresql.org/download/postgresql-42.7.4.jar
```

###### Configure Keycloak for PostgreSQL

```bash
cat >> ~/Projects/QIAM/keyclk/keycloak-api-client/keycloak-26.4.1/conf/keycloak.conf << EOF
db=postgres
db-url=jdbc:postgresql://localhost:5432/keycloak
db-username=keycloak
db-password=keycloak@123
EOF
```

###### Stop Keycloak if running

```bash
sudo systemctl stop keycloak 2>/dev/null || pkill -f keycloak
```

###### Export env variables

```bash
export KC_BOOTSTRAP_ADMIN_USERNAME=admin
export KC_BOOTSTRAP_ADMIN_PASSWORD=admin@123
```

Provide the credentials used at the time of creating the admin user.

###### Start Keycloak with PostgreSQL (first time setup)

```bash
./bin/kc.sh start-dev
```

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Keycloak UI setup

On browser : http://localhost:8080

### Create Realm

1. On the left panel under Manage realms tab.
2. Click create realm.
3. Realm name : LorvenAI-realm
4. Enabled :ON
5. Click create.
6. You will be redirected to the LorvenAI-realm page.
7. Under Manage realms under LorvenAI-realm (Current realm) will be displayed. This means that you are under LorvenAI-realm and all the users,groups,etc will be displayed of that realm only.

### Create Client

1. On the left panel under Clients tab.
2. Click on create client.
3. Client ID: LorvenAI-application
4. Name : LorvenAI-application
5. Click Next.
6. Client Authentication : ON
7. Authorization : ON
8. Authentication flow :

   1. Standard flow : ON
   2. Direct Access Grants : ON
9. Click Next.
10. Valid redirect URIs:

    1. Frontend IP :
       1. http://localhost:5173/*
       2. Click on (+) to add the IPs
       3. http://127.0.0.1:5173/*
    2. Backend IP:
       1. http://localhost:8000/*
       2. http://127.0.0.1:8000/*
    3. Middleware IP:
       1. http://localhost:3001/*
       2. http://127.0.0.1:3001/*
11. Web origins:

    1. http://localhost:5173
    2. http://127.0.0.1:5173
    3. http://localhost:8000
    4. http://127.0.0.1:8000
    5. http://localhost:3001
    6. http://127.0.0.1:3001

### Client scopes

**Assigned type:**

1. Default :
   1. arc
   2. basic
   3. email
   4. profile
   5. roles
   6. web-origins
2. Optional :
   1. address
   2. microprofile-jwt
   3. offline_access
   4. organization
   5. phone
   6. role_list
3. None :
   1. saml_organization
   2. service_account

**Changes per client scope:**

1. address :

   1. Settings tab : Include in token scope : OFF
2. microprofile-jwt :

   1. Settings tab : Include in token scope : OFF
3. organization :

   1. Settings tab : Include in token scope : OFF
4. phone :

   1. Settings tab : Include in token scope : OFF
5. profile :

   1. Mappers : Keep "username", "profile" and "updated at" and delete rest of the mappers.
6. roles :

   1. Mappers :
      1. audience resolve :

         1. Add to lightweight access token : ON
         2. Click save.
      2. client roles :

         1. Add to access token : OFF
         2. Add to lightweight access token : ON
         3. Click save.
      3. realm roles :

         1. Add to access token : OFF
         2. Add to lightweight access token : ON
         3. Click save.

Rest all changes per client scope should be unchanged.

### Events

1. In the events description click on Event configs you will be redirected to Events Tab.
2. In Events -> User events settings -> Save events : ON
3. Click save.
4. Now the user events will be visible in Events tab.

### Realm settings

1. Email tab :

   1. Template:
      1. From : aakanksha@thequantum.ai
   2. Connection and Authentication :
      1. Host : smtp-relay.brevo.com
      2. Port : 587
      3. Encryption :
         1. Enable SSL : OFF
         2. Enable StartTLS : ON
      4. Authentication : Enabled : ON
      5. Username : 9e546b001@smtp-brevo.com
      6. Authentication Type : Password
      7. Password : bskKrlIu5XeM93j            (paste this password in a terminal then alphabets after 'r' will be clearly displayed.)
2. User Profile :

   1. Atrributes : Users are getting created with username and email therefore delete firstName and lastName attributes.

### Authentication

To accept the username and password from login form.

Flows -> browser -> forms -> Username Password Form ( should be set to required).


--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Issues

**Issue -1 :** 

*On Keycloak UI  a Yellow Line will be displayed on the top saying*

 *"You are logged in as a temporary admin user. To harden security ,create a permanent admin account and delete the temporary one"*

* While using the following command

```bash
bin/kc.sh bootstrap-admin user
```

    warning is displayed:

    Warning: Usage of the default value of the db option in the production......

    After a minute or two prompt is displayed asking for username and password.

    After providing username and password, start the server.

```bash
./bin/kc.sh start-dev
```

    On Keycloak UI  a Yellow Line will be displayed on the top saying

    "You are logged in as a temporary admin user. To harden security ,create a permanent admin account and delete the temporary one"

    This can be ignored in development mode but in production mode this error should be resolved.

**
    Resolution:**

```bash
cd ~/Projects/keycloak/bin
./kcadm.sh start-dev --http-relative-path=/auth
```

    Keep this terminal open and open new terminal.

1. Login with temp-admin account created :

   ```bash
   ./kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user admin
   ```
2. Create new user:

   ```bash
   ./kcadm.sh create users -r master -s username=admin_user -s enabled=true -s emailVerified=true
   ```
3. Set password:

   ```bash
   ./kcadm.sh set-password -r master --username admin_user --new-password "admin_user@123"
   ```
4. Assign admin role to the user:

   ```bash
   ./kcadm.sh add-roles -r master --uusername admin_user --rolename admin
   ```
5. Check the user :

   ```bash
   ./kcadm.sh get users -r master -q username=admin_user
   ```

   User credentials will be displayed like user UUID, username, emailVerified,etc.
6. Login with the new user details on UI.
7. Check the temp-user details:

   ```bash
   ./kcadm.sh get users -r master -q username=admin
   ```

   Copy the temp-user UUID.
8. Delete the temp-user:

   ```bash
   ./kcadm.sh delete users/<temp-user-uuid> -r master
   ```

   E.g.

   ```bash
   ./kcadm.sh delete users/b399e34e-4f1b-4329-a76e-6bd457274488 -r master
   ```
9. The yellow line issue gets resolved.


**Issue -2 :**

* *After creating the user if the user is mistakenly deleted from the UI:*

  ```md

  * Then UI will show sign in error and again from terminal it would be necessary to create admin user.
  * To create admin user:
  	1. export KC_BOOTSTRAP_ADMIN_USERNAME=admin
  	2. echo $KC_BOOTSTRAP_ADMIN_USERNAME
  	3. export KC_BOOTSTRAP_ADMIN_PASSWORD=admin@123
  * Start the server : ./bin/kc.sh start-dev
  ```

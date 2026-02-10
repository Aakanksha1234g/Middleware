## Keycloak APIs Used

```bash
POST ${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token
```

    Pass parameter 'grant_type' as 'password' to get access and refresh token.

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users
```

    This API is used to get the user details (username, user_id, user_email).

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups?search=${organization}&exact=true&max=1
```

    This API is used to get the group details ( group_name, group_id).

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users
```

    This API is used to create user.

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups
```

    This API is used to create group.

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients
```

    This API is used to create clients.

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients
```

    This API is used to get client details( client_uuid).

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles
```

    This API is used to create client roles.

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${defaultClientUUID}/roles/${childRole}
```

    This API is used to get client roles.

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${clientUUID}/roles/${role.name}/composites
```

    This API is used to create composite roles.

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users
```

    This API is used to get user details.

```bash
PUT ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/groups/${groupID}
```

    This API is used to add user in the group.

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/role-mappings/clients/${ClientUUID}
```

    This API is used to assign client roles to the user.

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children
```

    This API is used to create sub groups.

```bash
POST ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupUUID}/role-mappings/clients/${orgClientID}
```

    This API is used to assign client roles to the group.

```bash
POST ${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token
```

    To get new access_token add parameter 'grant_type' as 'refresh_token'.

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children?search=${subGroupName}&exact=true&max=1
```

    This API is used to get the sub-group details.

```bash
GET ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${subGroupUUID}/members
```

    This API is used to get users in sub-group.

```bash
PUT ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/groups/${subGroupUUID}
```

    This API is used to add user in sub-group.

```bash
PUT ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/execute-actions-email
```

    This API is used to send email.

```bash
DELETE ${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/groups/${subGroupUUID}
```

    This API is used to delete user from the sub-group.

## Keycloak Concepts

### Realm

* Realm is a separate entity which consists of users, clients, client roles, realm roles, and groups.
* Master realm is the default realm of the Keycloak.
* Create a new realm and do
* Realms are isolated from each other.
* User, groups, etc created in a realm will be different from the other realms.

### Clients

* Clients are used to request user authentication.
* Client UUID is the unique id for each client.
* Client ID is the client identifier. Without this client can't be created.
* Client Name is for the display. Without this client can be created.
* Valid redirect URIs : Browser redirects to these URIs after successful login.
* Web Origins : Used to allow CORS (Cross Origin Resource Sharing) origins.
* Client Authentication : ON
* Authentication flow :
  * Standard flow : ON
  * Service accounts roles : ON
* Credentials Tab : Contains Client Secret.
* Roles Tab : Consists of client and composite roles.

### Client scopes

* These are the protocols if they are set to Default then they will be visible in the access token.
* Roles :
  * Realm roles:

    * Multivalued : ON
    * Add to lightweight access token: ON
    * Add to token introspection : ON
    * Rest all should be disabled. If the 'Add to access token' is enabled then the access token received fom the keycloak will be large and problems will occur while using that access token in different APIs.
  * Client roles:

    * Multivalued : ON
    * Add to lightweight access token: ON
    * Add to token introspection : ON
    * Rest all should be disabled. If the 'Add to access token' is enabled then the access token received fom the keycloak will be large and problems will occur while using that access token in different APIs.

### Realm roles

* These are the default roles that occur in the access token.
* These roles are by default allocated to the user.

### Client roles

* These are the roles which will be assigned to composite roles. E.g. cinescribe.screen1.read.

### Composite roles

* These are the roles which has more than one client roles. E.g. Platform_Administrator ( cinescribe.screen1.read).
* These roles are allocated to the user and to the SUB-GROUP.

### Users

* These are the users which will be created after the user logs in.

### Groups

* These are the organization names. E.g. Kalki.
* Inside a group SUB-GROUP is the role which is been created in an organization. E.g. Director.
* The composite roles are assigned to the sub-groups.
* The member inside the SUB-GROUP will get all the roles assigned to that SUB-GROUP.

### Sessions

* This tab shows the user details after user logs in.
* The user session is visible until the SSO Session Setting. If 30 mins time has been set, then after 30 mins the user session will not visible in the sessions tab.

### Events

* This tab shows the event occured with time, user ID, event saved type, IP address and client name.

### Realm settings

```bash
 Realm Name : Should be same as the realm name.
Sessions :   
	1. SSO Session Settings:
		1. SSO Session Idle : 1 hour 
                         -> After login untill this time user will be visible in sessions tab
                         -> If user inactivity is found, refresh token expires, user has to login again.
                2. SSO Session Max : 1 day
                         -> After this time refresh token expires, user has to login again.
                3. SSO Session Idle Remember Me :
                4. SSO Session Max Remember Me :

                 Note: If all 4 are checked then session idle and session max are applied.

Tokens : 
	1. Access token Lifespan : This is the access token lifespan which should always be shorter than the SSO session idle time.
```

### Authentication

To accept the username and password from login form.

Flows -> browser -> forms -> Username Password Form ( should be set to required).

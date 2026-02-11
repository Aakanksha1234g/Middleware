### IAM (Identity Access Management)

This is the middleware which checks user authentication and provides authorization.

##### Features

```md
User authentication with Keycloak
Role based access control
Rest APIs built with node.js
Postgresql database integration
```

##### Tech Stack

```md
Language : Node.js, Express
Authorization : Keycloak
Database : Postgresql
OS : Linux
```

##### Project Structure

```plaintext
├── package.json
├── package-lock.json
├── Readme.md
├── resources
│   ├── client_composite_roles_template.json
│   └── client_roles_template.json
└── src
    ├── app.js
    ├── config.js
    ├── controllers
    │   ├── client_utils.js
    │   ├── create_user_controller.js
    │   ├── delete_user_group_controller.js
    │   ├── group_utils.js
    │   ├── login_controller.js
    │   ├── modify_user_group_controller.js
    │   ├── refresh_controller.js
    │   ├── signup_controller.js
    │   ├── user_utils.js
    │   └── utils.js
    ├── email
    │   └── reset_password_mail.js
    ├── middleware
    │   └── authorize_admin.js
    └── routes
        ├── create_user.js
        ├── delete_user_group.js
        ├── login.js
        ├── modify_user_group.js
        ├── refresh.js
        └── signup.j
```

##### Prerequisites

```md
Node.js = v20.19.6
Postgresql = 18.1
Keycloak = 26.4.1
Git = 2.43.0
```

##### Installation

[Kecyloak setup](Middleware/KEYCLOAK-SETUP.md) file has all the steps required for installation of Keycloak in Ubuntu.

##### Usage

```md
Access the Keycloak at http://localhost:8080
Start server : node src/app.js
Use Postman to test secured endpoints.
To check following APIs pass access token in headers.
	1. /modifyUserGroup
	2. /createUser
	3. /deleteUserSubGroup
```

##### API Endpoints

```md
| Method | Endpoint              | Description                         |
|----------------------------------------------------------------------|
| POST   | /login                | User login                          |
| POST   | /signup               | User signup                         |
| POST   | /deleteUserSubGroup   | Delete user from sub-group          |
| POST   | /createUser           | Create user and add it in sub-group |
| POST   | /modifyUserGroup      | Add user in sub-group               |
```

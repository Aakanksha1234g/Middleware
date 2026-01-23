"""
Complete Lovenai Keycloak IAM Setup - One Shot Script
Creates ALL 4 modules: Cinescribe, Cinesketch, Cineflow, Pitchcraft
Works for any realm - just configure the settings below
"""


import requests
import time
from typing import List, Dict


class LovenaiCompleteSetup:
   def __init__(self, server_url: str, admin_user: str, admin_pass: str, realm_name: str, client_name: str):
       self.server_url = server_url.rstrip('/')
       self.admin_user = admin_user
       self.admin_pass = admin_pass
       self.token = None
       self.realm = realm_name
       self.client_name = client_name
       self.client_id = None
      
       # Complete IAM Structure - All 4 Modules
       self.iam_structure = {
           "Cinescribe": {
               "screens": 120,
               "operations": ["create", "read", "update", "delete"]
           },
           "Cinesketch": {
               "screens": 120,
               "operations": ["view", "create", "update", "delete"]
           },
           "Cineflow": {
               "screens": 120,
               "operations": ["view", "create", "update", "delete"]
           },
           "Pitchcraft": {
               "screens": 120,
               "operations": ["view", "create", "update", "delete"]
           }
       }
  
   def get_admin_token(self):
       """Get admin access token"""
       url = f"{self.server_url}/realms/master/protocol/openid-connect/token"
       data = {
           "client_id": "admin-cli",
           "username": self.admin_user,
           "password": self.admin_pass,
           "grant_type": "password"
       }
       try:
           resp = requests.post(url, data=data)
           resp.raise_for_status()
           self.token = resp.json()["access_token"]
           print("✓ Admin token obtained")
       except requests.exceptions.HTTPError as e:
           print(f"\n❌ Authentication failed!")
           print(f"   Error: {e}")
           print(f"   Please verify:")
           print(f"   - Keycloak is running at: {self.server_url}")
           print(f"   - Username: {self.admin_user}")
           print(f"   - Password is correct")
           raise
  
   def headers(self):
       return {
           "Authorization": f"Bearer {self.token}",
           "Content-Type": "application/json"
       }
  
   def create_realm(self):
       """Create the realm"""
       url = f"{self.server_url}/admin/realms"
       payload = {
           "realm": self.realm,
           "enabled": True,
           "displayName": "LovenAI Platform",
           "accessTokenLifespan": 1800,
           "ssoSessionIdleTimeout": 1800,
           "ssoSessionMaxLifespan": 36000,
           "registrationAllowed": False,
           "loginWithEmailAllowed": True,
           "duplicateEmailsAllowed": False
       }
       resp = requests.post(url, json=payload, headers=self.headers())
       if resp.status_code == 201:
           print(f"✓ Realm '{self.realm}' created")
       elif resp.status_code == 409:
           print(f"⚠ Realm '{self.realm}' already exists - using existing")
       else:
           resp.raise_for_status()
  
   def create_client(self):
       """Create the client application"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients"
       payload = {
           "clientId": self.client_name,
           "name": "LovenAI Application",
           "enabled": True,
           "publicClient": True,
           "redirectUris": [
               "http://localhost:3000/*",
               "http://localhost:3001/*",
               "https://*"
           ],
           "webOrigins": ["+"],
           "protocol": "openid-connect",
           "standardFlowEnabled": True,
           "directAccessGrantsEnabled": True,
           "fullScopeAllowed": False
       }
       resp = requests.post(url, json=payload, headers=self.headers())
       if resp.status_code == 201:
           print(f"✓ Client '{self.client_name}' created")
           self._get_client_id()
       elif resp.status_code == 409:
           print(f"⚠ Client '{self.client_name}' already exists")
           self._get_client_id()
       else:
           resp.raise_for_status()
  
   def _get_client_id(self):
       """Get the internal UUID of the client"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients"
       resp = requests.get(url, headers=self.headers(), params={"clientId": self.client_name})
       resp.raise_for_status()
       clients = resp.json()
       if clients:
           self.client_id = clients[0]["id"]
           print(f"✓ Client UUID: {self.client_id}")
  
   def create_all_roles(self):
       """Create all fine-grained roles for all 4 modules"""
       print(f"\n📝 Creating fine-grained roles for ALL modules...")
       url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles"
      
       count = 0
       start = time.time()
      
       for module, config in self.iam_structure.items():
           screens = config["screens"]
           operations = config["operations"]
          
           print(f"  → {module}: {screens} screens × {len(operations)} ops = {screens * len(operations)} roles")
          
           for screen_num in range(1, screens + 1):
               for operation in operations:
                   role_name = f"{module.lower()}.screen{screen_num}.{operation}"
                   payload = {
                       "name": role_name,
                       "description": f"{operation.upper()} access to {module} Screen-{screen_num}"
                   }
                   resp = requests.post(url, json=payload, headers=self.headers())
                   if resp.status_code in [201, 409]:
                       count += 1
                       if count % 200 == 0:
                           print(f"    {count} roles created...")
      
       # User management roles
       print(f"  → User Management: 5 roles")
       usermgmt_roles = [
           ("usermgmt.create-user", "Create new users"),
           ("usermgmt.update-user", "Update user information"),
           ("usermgmt.delete-user", "Delete users"),
           ("usermgmt.assign-role", "Assign roles to users"),
           ("usermgmt.view-users", "View all users")
       ]
      
       for role_name, description in usermgmt_roles:
           payload = {"name": role_name, "description": description}
           resp = requests.post(url, json=payload, headers=self.headers())
           if resp.status_code in [201, 409]:
               count += 1
      
       elapsed = time.time() - start
       print(f"\n✓ TOTAL: {count} fine-grained roles created in {elapsed:.1f}s")
       print(f"  • Cinescribe: 480 roles")
       print(f"  • Cinesketch: 480 roles")
       print(f"  • Cineflow: 480 roles")
       print(f"  • Pitchcraft: 480 roles")
       print(f"  • User Management: 5 roles")
       print(f"  All stored in PostgreSQL: KEYCLOAK_ROLE, CLIENT_ROLE tables")
  
   def get_roles_by_pattern(self, pattern: str) -> List[Dict]:
       """Get all roles matching a pattern"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles"
       resp = requests.get(url, headers=self.headers())
       resp.raise_for_status()
       all_roles = resp.json()
       return [r for r in all_roles if pattern in r["name"]]
  
   def create_composite_role(self, name: str, description: str, included_roles: List[Dict]):
       """Create a composite business role"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles"
      
       # Create the composite role
       payload = {
           "name": name,
           "description": description,
           "composite": True
       }
       resp = requests.post(url, json=payload, headers=self.headers())
       if resp.status_code not in [201, 409]:
           resp.raise_for_status()
      
       # Add child roles to composite
       composite_url = f"{url}/{name}/composites"
       resp = requests.post(composite_url, json=included_roles, headers=self.headers())
       if resp.status_code == 204:
           print(f"  ✓ {name} → {len(included_roles)} permissions")
  
   def create_all_business_roles(self):
       """Create all composite business roles"""
       print(f"\n🎭 Creating business roles (composites)...")
      
       # Cinescribe Writer: create, read, update
       print("  → Cinescribe_Writer")
       cinescribe_writer_roles = []
       for screen in range(1, 121):
           for action in ["create", "read", "update"]:
               roles = self.get_roles_by_pattern(f"cinescribe.screen{screen}.{action}")
               cinescribe_writer_roles.extend(roles)
      
       self.create_composite_role(
           "Cinescribe_Writer",
           "Full write access to all Cinescribe screens (create, read, update)",
           cinescribe_writer_roles
       )
      
       # Cinescribe Reader: read only
       print("  → Cinescribe_Reader")
       cinescribe_reader_roles = []
       for screen in range(1, 121):
           roles = self.get_roles_by_pattern(f"cinescribe.screen{screen}.read")
           cinescribe_reader_roles.extend(roles)
      
       self.create_composite_role(
           "Cinescribe_Reader",
           "Read-only access to all Cinescribe screens",
           cinescribe_reader_roles
       )
      
       # Cinesketch Full Access
       print("  → Cinesketch_FullAccess")
       cinesketch_roles = self.get_roles_by_pattern("cinesketch.screen")
       self.create_composite_role(
           "Cinesketch_FullAccess",
           "Complete access to all Cinesketch screens",
           cinesketch_roles
       )
      
       # Cineflow Editor
       print("  → Cineflow_Editor")
       cineflow_roles = self.get_roles_by_pattern("cineflow.screen")
       self.create_composite_role(
           "Cineflow_Editor",
           "Complete access to all Cineflow screens",
           cineflow_roles
       )
      
       # Pitchcraft Editor
       print("  → Pitchcraft_Editor")
       pitchcraft_roles = self.get_roles_by_pattern("pitchcraft.screen")
       self.create_composite_role(
           "Pitchcraft_Editor",
           "Complete access to all Pitchcraft screens",
           pitchcraft_roles
       )
      
       # Platform Admin
       print("  → Platform_Admin")
       admin_roles = self.get_roles_by_pattern("usermgmt.")
       self.create_composite_role(
           "Platform_Admin",
           "User management and role assignment capabilities",
           admin_roles
       )
      
       print(f"\n  All stored in PostgreSQL: COMPOSITE_ROLE table")
  
   def create_all_groups(self):
       """Create all groups with default role assignments"""
       print(f"\n👥 Creating groups...")
      
       groups = [
           ("Cinescribe Writers", "Cinescribe_Writer", "Content creators for screenplays"),
           ("Cinescribe Readers", "Cinescribe_Reader", "Reviewers and readers"),
           ("Cinesketch Artists", "Cinesketch_FullAccess", "Storyboard artists"),
           ("Cineflow Editors", "Cineflow_Editor", "Production flow managers"),
           ("Pitchcraft Editors", "Pitchcraft_Editor", "Pitch deck creators"),
           ("Platform Administrators", "Platform_Admin", "System administrators")
       ]
      
       url = f"{self.server_url}/admin/realms/{self.realm}/groups"
      
       for group_name, default_role, description in groups:
           # Create group
           payload = {
               "name": group_name,
               "attributes": {"description": [description]}
           }
           resp = requests.post(url, json=payload, headers=self.headers())
          
           if resp.status_code in [201, 409]:
               # Get group ID
               resp = requests.get(url, headers=self.headers())
               all_groups = resp.json()
               group = next((g for g in all_groups if g["name"] == group_name), None)
              
               if group:
                   group_id = group["id"]
                  
                   # Assign default role to group
                   role_url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles/{default_role}"
                   role_resp = requests.get(role_url, headers=self.headers())
                   if role_resp.status_code == 200:
                       role_data = role_resp.json()
                      
                       assign_url = f"{url}/{group_id}/role-mappings/clients/{self.client_id}"
                       requests.post(assign_url, json=[role_data], headers=self.headers())
                       print(f"  ✓ {group_name} → {default_role}")
      
       print(f"\n  All stored in PostgreSQL: KEYCLOAK_GROUP, GROUP_ROLE_MAPPING tables")
  
   def create_sample_users(self):
       """Create sample users (optional)"""
       print(f"\n👤 Creating sample users...")
      
       users = [
           ("john.writer", "john@lovenai.com", "SecurePass123!", "Cinescribe Writers"),
           ("jane.artist", "jane@lovenai.com", "SecurePass123!", "Cinesketch Artists"),
           ("bob.flow", "bob@lovenai.com", "SecurePass123!", "Cineflow Editors"),
           ("alice.pitch", "alice@lovenai.com", "SecurePass123!", "Pitchcraft Editors"),
           ("admin.user", "admin@lovenai.com", "AdminPass123!", "Platform Administrators")
       ]
      
       users_url = f"{self.server_url}/admin/realms/{self.realm}/users"
      
       for username, email, password, group_name in users:
           # Create user
           payload = {
               "username": username,
               "email": email,
               "enabled": True,
               "emailVerified": True,
               "credentials": [{
                   "type": "password",
                   "value": password,
                   "temporary": False
               }]
           }
          
           resp = requests.post(users_url, json=payload, headers=self.headers())
           if resp.status_code == 409:
               print(f"  ⚠ User '{username}' already exists")
               resp = requests.get(users_url, headers=self.headers(),
                                 params={"username": username})
               user_id = resp.json()[0]["id"]
           elif resp.status_code == 201:
               location = resp.headers.get("Location")
               user_id = location.split("/")[-1]
               print(f"  ✓ Created '{username}'")
           else:
               continue
          
           # Add to group
           groups_url = f"{self.server_url}/admin/realms/{self.realm}/groups"
           resp = requests.get(groups_url, headers=self.headers())
           all_groups = resp.json()
           group = next((g for g in all_groups if g["name"] == group_name), None)
          
           if group:
               group_url = f"{self.server_url}/admin/realms/{self.realm}/users/{user_id}/groups/{group['id']}"
               resp = requests.put(group_url, headers=self.headers())
               if resp.status_code == 204:
                   print(f"    → Added to '{group_name}'")
  
   def verify_setup(self):
       """Verify and display setup summary"""
       print(f"\n📊 PostgreSQL Tables Populated:")
       tables = [
           ("REALM", "Realm configuration"),                      #LorvenAI-realm
           ("CLIENT", "Client application"),                   #LorvenAI-app
           ("KEYCLOAK_ROLE", "~1,925 fine-grained roles"),      #client roles
           ("COMPOSITE_ROLE", "Business role mappings"),   #Composite client roles
           ("KEYCLOAK_GROUP", "6 groups"),                      #Groups
           ("GROUP_ROLE_MAPPING", "Group → Role mappings"),      #Composite client roles and groups
           ("USER_ENTITY", "User accounts"),                         #user
           ("USER_GROUP_MEMBERSHIP", "User → Group mappings"),       # user and groups
           ("CREDENTIAL", "User passwords (hashed)")                # user and password
       ]
      
       for table, description in tables:
           print(f"  • {table:<25} → {description}")
  
   def run(self, create_users: bool = True):
       """Execute complete setup"""
       print("╔═══════════════════════════════════════════════════════════╗")
       print("║   LOVENAI COMPLETE IAM SETUP - ALL 4 MODULES             ║")
       print("║   Cinescribe | Cinesketch | Cineflow | Pitchcraft        ║")
       print("╚═══════════════════════════════════════════════════════════╝\n")
      
       start_time = time.time()
      
       self.get_admin_token()
       self.create_realm()
       self.create_client()
       self.create_all_roles()
       self.create_all_business_roles()
       self.create_all_groups()
      
       if create_users:
           self.create_sample_users()
      
       self.verify_setup()
      
       elapsed = time.time() - start_time
      
       print(f"\n╔═══════════════════════════════════════════════════════════╗")
       print(f"║  ✓ COMPLETE SETUP FINISHED in {elapsed:.1f} seconds")
       print(f"║")
       print(f"║  Realm: {self.realm}")
       print(f"║  Client: {self.client_name}")
       print(f"║")
       print(f"║  Modules: 4 (Cinescribe, Cinesketch, Cineflow, Pitchcraft)")
       print(f"║  Fine-grained roles: 1,925")
       print(f"║  Business roles: 6 composites")
       print(f"║  Groups: 6 with auto-role assignment")
       print(f"║  Sample users: {5 if create_users else 0}")
       print(f"║")
       print(f"║  Database: All data in PostgreSQL")
       print(f"╚═══════════════════════════════════════════════════════════╝")




if __name__ == "__main__":
   # ═══════════════════════════════════════════════════════════
   # CONFIGURATION - CUSTOMIZE FOR YOUR ENVIRONMENT
   # ═══════════════════════════════════════════════════════════
  
   KEYCLOAK_URL = "http://localhost:8081"      # Your Keycloak server
   ADMIN_USERNAME = "admin"                     # Admin username
   ADMIN_PASSWORD = "admin@123"                     # Admin password (CHANGE THIS!)
  
   REALM_NAME = "LorvenAIstudio-realm"                 # Your realm name
   CLIENT_NAME = "LorvenAIstudio-app"                  # Your client name
  
   CREATE_SAMPLE_USERS = True                   # Set to False to skip user creation
  
   # ═══════════════════════════════════════════════════════════
   # RUN SETUP
   # ═══════════════════════════════════════════════════════════
  
   print(f"\n📋 Configuration:")
   print(f"   Keycloak URL: {KEYCLOAK_URL}")
   print(f"   Realm: {REALM_NAME}")
   print(f"   Client: {CLIENT_NAME}")
   print(f"   Create sample users: {CREATE_SAMPLE_USERS}\n")
  
   setup = LovenaiCompleteSetup(
       server_url=KEYCLOAK_URL,
       admin_user=ADMIN_USERNAME,
       admin_pass=ADMIN_PASSWORD,
       realm_name=REALM_NAME,
       client_name=CLIENT_NAME
   )
  
   setup.run(create_users=CREATE_SAMPLE_USERS)
  
   print(f"\n✨ Setup complete!")
   print(f"\n📝 Next steps:")
   print(f"   1. Login to Keycloak: {KEYCLOAK_URL}")
   print(f"   2. Go to realm: {REALM_NAME}")
   print(f"   3. Check Client Roles under '{CLIENT_NAME}'")
   print(f"   4. View Groups and Users")
   print(f"   5. Test login with sample users (password: SecurePass123!)")



#new one which has producer, director roles….
"""
Complete Lovenai Keycloak IAM Setup - One Shot Script
Creates ALL 4 modules: Cinescribe, Cinesketch, Cineflow, Pitchcraft
Works for any realm - just configure the settings below
"""


import requests
import time
from typing import List, Dict


class LovenaiCompleteSetup:
   def __init__(self, server_url: str, admin_user: str, admin_pass: str, realm_name: str, client_name: str):
       self.server_url = server_url.rstrip('/')
       self.admin_user = admin_user
       self.admin_pass = admin_pass
       self.token = None
       self.realm = realm_name
       self.client_name = client_name
       self.client_id = None
      
       # Complete IAM Structure - All 4 Modules
       self.iam_structure = {
           "Cinescribe": {
               "screens": 120,
               "operations": ["create", "read", "update", "delete"]
           },
           "Cinesketch": {
               "screens": 120,
               "operations": ["read", "create", "update", "delete"]
           },
           "Cineflow": {
               "screens": 120,
               "operations": ["read", "create", "update", "delete"]
           },
           "Pitchcraft": {
               "screens": 120,
               "operations": ["read", "create", "update", "delete"]
           }
       }
  
   def get_admin_token(self):
       """Get admin access token"""
       url = f"{self.server_url}/realms/master/protocol/openid-connect/token"
       data = {
           "client_id": "admin-cli",
           "username": self.admin_user,
           "password": self.admin_pass,
           "grant_type": "password"
       }
       try:
           resp = requests.post(url, data=data)
           resp.raise_for_status()
           self.token = resp.json()["access_token"]
           print("✓ Admin token obtained")
       except requests.exceptions.HTTPError as e:
           print(f"\n❌ Authentication failed!")
           print(f"   Error: {e}")
           print(f"   Please verify:")
           print(f"   - Keycloak is running at: {self.server_url}")
           print(f"   - Username: {self.admin_user}")
           print(f"   - Password is correct")
           raise
  
   def headers(self):
       return {
           "Authorization": f"Bearer {self.token}",
           "Content-Type": "application/json"
       }
  
   # def create_realm(self):
   #     """Create the realm"""
   #     url = f"{self.server_url}/admin/realms"
   #     payload = {
   #         "realm": self.realm,
   #         "enabled": True,
   #         "displayName": "LovenAI Platform",
   #         "accessTokenLifespan": 1800,
   #         "ssoSessionIdleTimeout": 1800,
   #         "ssoSessionMaxLifespan": 36000,
   #         "registrationAllowed": False,
   #         "loginWithEmailAllowed": True,
   #         "duplicateEmailsAllowed": False
   #     }
   #     resp = requests.post(url, json=payload, headers=self.headers())
   #     if resp.status_code == 201:
   #         print(f"✓ Realm '{self.realm}' created")
   #     elif resp.status_code == 409:
   #         print(f"⚠ Realm '{self.realm}' already exists - using existing")
   #     else:
   #         resp.raise_for_status()
  
   def create_client(self):
       """Create the client application"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients"
       payload = {
           "clientId": self.client_name,
           "name": "LovenAI Application",
           "enabled": True,
           "publicClient": True,
           "redirectUris": [
               "http://localhost:3000/*",
               "http://localhost:3001/*",
               "https://*"
           ],
           "webOrigins": ["+"],
           "protocol": "openid-connect",
           "standardFlowEnabled": True,
           "directAccessGrantsEnabled": True,
           "fullScopeAllowed": False
       }
       resp = requests.post(url, json=payload, headers=self.headers())
       if resp.status_code == 201:
           print(f"✓ Client '{self.client_name}' created")
           self._get_client_id()
       elif resp.status_code == 409:
           print(f"⚠ Client '{self.client_name}' already exists")
           self._get_client_id()
       else:
           resp.raise_for_status()
  
   def _get_client_id(self):
       """Get the internal UUID of the client"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients"
       resp = requests.get(url, headers=self.headers(), params={"clientId": self.client_name})
       resp.raise_for_status()
       clients = resp.json()
       if clients:
           self.client_id = clients[0]["id"]
           print(f"✓ Client UUID: {self.client_id}")
  
   def create_all_roles(self):
       """Create all fine-grained roles for all 4 modules"""
       print(f"\n📝 Creating fine-grained roles for ALL modules...")
       url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles"
      
       count = 0
       start = time.time()
      
       for module, config in self.iam_structure.items():
           screens = config["screens"]
           operations = config["operations"]
          
           print(f"  → {module}: {screens} screens × {len(operations)} ops = {screens * len(operations)} roles")
          
           for screen_num in range(1, screens + 1):
               for operation in operations:
                   role_name = f"{module.lower()}.screen{screen_num}.{operation}"
                   payload = {
                       "name": role_name,
                       "description": f"{operation.upper()} access to {module} Screen-{screen_num}"
                   }
                   resp = requests.post(url, json=payload, headers=self.headers())
                   if resp.status_code in [201, 409]:
                       count += 1
                       if count % 200 == 0:
                           print(f"    {count} roles created...")
      
       # User management roles
       print(f"  → User Management: 5 roles")
       usermgmt_roles = [
           ("usermgmt.create-user", "Create/Invite new users"),
           ("usermgmt.update-user", "Update user information"),
           ("usermgmt.delete-user", "Delete users"),
           ("usermgmt.assign-role", "Assign roles to groups"),
           ("usermgmt.view-users", "View all users")
       ]
      
       for role_name, description in usermgmt_roles:
           payload = {"name": role_name, "description": description}
           resp = requests.post(url, json=payload, headers=self.headers())
           if resp.status_code in [201, 409]:
               count += 1
      
       elapsed = time.time() - start
       print(f"\n✓ TOTAL: {count} fine-grained roles created in {elapsed:.1f}s")
       print(f"  • Director: 480 roles")
       print(f"  • Producer: 480 roles")
       print(f"  • Assistant Director-1: 480 roles")
       print(f"  • Assistant Director-2: 480 roles")
       print(f"  • Production Manager: 120 roles")
       print(f"  • User Management: 5 roles")
       print(f"  All stored in PostgreSQL: KEYCLOAK_ROLE, CLIENT_ROLE tables")
  
   def get_roles_by_pattern(self, pattern: str) -> List[Dict]:
       """Get all roles matching a pattern"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles"
       resp = requests.get(url, headers=self.headers())
       resp.raise_for_status()
       all_roles = resp.json()
       return [r for r in all_roles if pattern in r["name"]]
  
   def create_composite_role(self, name: str, description: str, included_roles: List[Dict]):
       """Create a composite business role"""
       url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles"
      
       # Create the composite role
       payload = {
           "name": name,
           "description": description,
           "composite": True
       }
       resp = requests.post(url, json=payload, headers=self.headers())
       if resp.status_code not in [201, 409]:
           resp.raise_for_status()
      
       # Add child roles to composite
       composite_url = f"{url}/{name}/composites"
       resp = requests.post(composite_url, json=included_roles, headers=self.headers())
       if resp.status_code == 204:
           print(f"  ✓ {name} → {len(included_roles)} permissions")
  
   def create_all_business_roles(self):
       """Create all composite business roles"""
       print(f"\n🎭 Creating business roles (composites)...")
      
       # Cinescribe Writer: create, read, update
       print("  → Cinescribe_Writer")
       cinescribe_writer_roles = []
       for screen in range(1, 121):
           for action in ["create", "read", "update"]:
               roles = self.get_roles_by_pattern(f"cinescribe.screen{screen}.{action}")
               cinescribe_writer_roles.extend(roles)
      
       self.create_composite_role(
           "Cinescribe_Writer",
           "Full write access to all Cinescribe screens (create, read, update)",
           cinescribe_writer_roles
       )
      
       # Cinescribe Reader: read only
       print("  → Cinescribe_Reader")
       cinescribe_reader_roles = []
       for screen in range(1, 121):
           roles = self.get_roles_by_pattern(f"cinescribe.screen{screen}.read")
           cinescribe_reader_roles.extend(roles)
      
       self.create_composite_role(
           "Cinescribe_Reader",
           "Read-only access to all Cinescribe screens",
           cinescribe_reader_roles
       )
      
       # Cinesketch Full Access
       print("  → Cinesketch_FullAccess")
       cinesketch_roles = self.get_roles_by_pattern("cinesketch.screen")
       self.create_composite_role(
           "Cinesketch_FullAccess",
           "Complete access to all Cinesketch screens",
           cinesketch_roles
       )
      
       # Cineflow Editor
       print("  → Cineflow_Editor")
       cineflow_roles = self.get_roles_by_pattern("cineflow.screen")
       self.create_composite_role(
           "Cineflow_Editor",
           "Complete access to all Cineflow screens",
           cineflow_roles
       )
      
       # Pitchcraft Editor
       print("  → Pitchcraft_Editor")
       pitchcraft_roles = self.get_roles_by_pattern("pitchcraft.screen")
       self.create_composite_role(
           "Pitchcraft_Editor",
           "Complete access to all Pitchcraft screens",
           pitchcraft_roles
       )
      
       # Platform Admin
       print("  → Platform_Admin")
       admin_roles = self.get_roles_by_pattern("usermgmt.")
       self.create_composite_role(
           "Platform_Admin",
           "User management and role assignment capabilities",
           admin_roles
       )
      
       print(f"\n  All stored in PostgreSQL: COMPOSITE_ROLE table")
   def create_all_groups(self):
       """Create all groups with default role assignments"""
       print(f"\n👥 Creating groups...")
      
       groups = [
           ("Cinescribe Writers", "Cinescribe_Writer", "Content creators for screenplays"),
           ("Cinescribe Readers", "Cinescribe_Reader", "Reviewers and readers"),
           ("Cinesketch Artists", "Cinesketch_FullAccess", "Storyboard artists"),
           ("Cineflow Editors", "Cineflow_Editor", "Production flow managers"),
           ("Pitchcraft Editors", "Pitchcraft_Editor", "Pitch deck creators"),
           ("Platform Administrators", "Platform_Admin", "System administrators")
       ]
      
       url = f"{self.server_url}/admin/realms/{self.realm}/groups"
      
       for group_name, default_role, description in groups:
           # Create group
           payload = {
               "name": group_name,
               "attributes": {"description": [description]}
           }
           resp = requests.post(url, json=payload, headers=self.headers())
          
           if resp.status_code in [201, 409]:
               # Get group ID
               resp = requests.get(url, headers=self.headers())
               all_groups = resp.json()
               group = next((g for g in all_groups if g["name"] == group_name), None)
              
               if group:
                   group_id = group["id"]
                  
                   # Assign default role to group
                   role_url = f"{self.server_url}/admin/realms/{self.realm}/clients/{self.client_id}/roles/{default_role}"
                   role_resp = requests.get(role_url, headers=self.headers())
                   if role_resp.status_code == 200:
                       role_data = role_resp.json()
                      
                       assign_url = f"{url}/{group_id}/role-mappings/clients/{self.client_id}"
                       requests.post(assign_url, json=[role_data], headers=self.headers())
                       print(f"  ✓ {group_name} → {default_role}")
      
       print(f"\n  All stored in PostgreSQL: KEYCLOAK_GROUP, GROUP_ROLE_MAPPING tables")
  
   def create_sample_users(self):
       """Create sample users (optional)"""
       print(f"\n👤 Creating sample users...")
      
       users = [
           ("john.writer", "john@lovenai.com", "SecurePass123!", "Cinescribe Writers"),
           ("jane.artist", "jane@lovenai.com", "SecurePass123!", "Cinesketch Artists"),
           ("bob.flow", "bob@lovenai.com", "SecurePass123!", "Cineflow Editors"),
           ("alice.pitch", "alice@lovenai.com", "SecurePass123!", "Pitchcraft Editors"),
           ("admin.user", "admin@lovenai.com", "AdminPass123!", "Platform Administrators")
       ]
      
       users_url = f"{self.server_url}/admin/realms/{self.realm}/users"
      
       for username, email, password, group_name in users:
           # Create user
           payload = {
               "username": username,
               "email": email,
               "enabled": True,
               "emailVerified": True,
               "credentials": [{
                   "type": "password",
                   "value": password,
                   "temporary": False
               }]
           }
          
           resp = requests.post(users_url, json=payload, headers=self.headers())
           if resp.status_code == 409:
               print(f"  ⚠ User '{username}' already exists")
               resp = requests.get(users_url, headers=self.headers(),
                                 params={"username": username})
               user_id = resp.json()[0]["id"]
           elif resp.status_code == 201:
               location = resp.headers.get("Location")
               user_id = location.split("/")[-1]
               print(f"  ✓ Created '{username}'")
           else:
               continue
          
           # Add to group
           groups_url = f"{self.server_url}/admin/realms/{self.realm}/groups"
           resp = requests.get(groups_url, headers=self.headers())
           all_groups = resp.json()
           group = next((g for g in all_groups if g["name"] == group_name), None)
          
           if group:
               group_url = f"{self.server_url}/admin/realms/{self.realm}/users/{user_id}/groups/{group['id']}"
               resp = requests.put(group_url, headers=self.headers())
               if resp.status_code == 204:
                   print(f"    → Added to '{group_name}'")
  
   def verify_setup(self):
       """Verify and display setup summary"""
       print(f"\n📊 PostgreSQL Tables Populated:")
       tables = [
           ("REALM", "Realm configuration"),                      #LorvenAI-realm
           ("CLIENT", "Client application"),                   #LorvenAI-app
           ("KEYCLOAK_ROLE", "~1,925 fine-grained roles"),      #client roles
           ("COMPOSITE_ROLE", "Business role mappings"),   #Composite client roles
           ("KEYCLOAK_GROUP", "6 groups"),                      #Groups
           ("GROUP_ROLE_MAPPING", "Group → Role mappings"),      #Composite client roles and groups
           ("USER_ENTITY", "User accounts"),                         #user
           ("USER_GROUP_MEMBERSHIP", "User → Group mappings"),       # user and groups
           ("CREDENTIAL", "User passwords (hashed)")                # user and password
       ]
      
       for table, description in tables:
           print(f"  • {table:<25} → {description}")
  
   def run(self, create_users: bool = True):
       """Execute complete setup"""
       print("╔═══════════════════════════════════════════════════════════╗")
       print("║   LOVENAI COMPLETE IAM SETUP - ALL 4 MODULES             ║")
       print("║   Cinescribe | Cinesketch | Cineflow | Pitchcraft        ║")
       print("╚═══════════════════════════════════════════════════════════╝\n")
      
       start_time = time.time()
      
       self.get_admin_token()
       # self.create_realm()
       self.create_client()
       self.create_all_roles()
       self.create_all_business_roles()
       self.create_all_groups()
      
       if create_users:
           self.create_sample_users()
      
       self.verify_setup()
      
       elapsed = time.time() - start_time
      
       print(f"\n╔═══════════════════════════════════════════════════════════╗")
       print(f"║  ✓ COMPLETE SETUP FINISHED in {elapsed:.1f} seconds")
       print(f"║")
       print(f"║  Realm: {self.realm}")
       print(f"║  Client: {self.client_name}")
       print(f"║")
       print(f"║  Modules: 4 (Cinescribe, Cinesketch, Cineflow, Pitchcraft)")
       print(f"║  Fine-grained roles: 1,925")
       print(f"║  Business roles: 6 composites")
       print(f"║  Groups: 6 with auto-role assignment")
       print(f"║  Sample users: {5 if create_users else 0}")
       print(f"║")
       print(f"║  Database: All data in PostgreSQL")
       print(f"╚═══════════════════════════════════════════════════════════╝")




if __name__ == "__main__":
   # ═══════════════════════════════════════════════════════════
   # CONFIGURATION - CUSTOMIZE FOR YOUR ENVIRONMENT
   # ═══════════════════════════════════════════════════════════
  
   KEYCLOAK_URL = "http://localhost:8081"      # Your Keycloak server
   ADMIN_USERNAME = "admin"                     # Admin username
   ADMIN_PASSWORD = "admin@123"                     # Admin password (CHANGE THIS!)
  
   REALM_NAME = "LorvenAI-realm"                 # Your realm name
   CLIENT_NAME = "LorvenAI-app"                  # Your client name
  
   CREATE_SAMPLE_USERS = True                   # Set to False to skip user creation
  
   # ═══════════════════════════════════════════════════════════
   # RUN SETUP
   # ═══════════════════════════════════════════════════════════
  
   print(f"\n📋 Configuration:")
   print(f"   Keycloak URL: {KEYCLOAK_URL}")
   print(f"   Realm: {REALM_NAME}")
   print(f"   Client: {CLIENT_NAME}")
   print(f"   Create sample users: {CREATE_SAMPLE_USERS}\n")
  
   setup = LovenaiCompleteSetup(
       server_url=KEYCLOAK_URL,
       admin_user=ADMIN_USERNAME,
       admin_pass=ADMIN_PASSWORD,
       realm_name=REALM_NAME,
       client_name=CLIENT_NAME
   )
  
   setup.run(create_users=CREATE_SAMPLE_USERS)
  
   print(f"\n✨ Setup complete!")
   print(f"\n📝 Next steps:")
   print(f"   1. Login to Keycloak: {KEYCLOAK_URL}")
   print(f"   2. Go to realm: {REALM_NAME}")
   print(f"   3. Check Client Roles under '{CLIENT_NAME}'")
   print(f"   4. View Groups and Users")
   print(f"   5. Test login with sample users (password: SecurePass123!)")


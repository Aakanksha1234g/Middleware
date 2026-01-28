const axios = require('axios');
const config = require('../src/config');
const {checkUserExists} = require('../src/user/user_check'); 
const {checkGroupExists} = require('../src/group/group_check');
const {createUser} = require('../src/user/create_user');
const {createGroup} = require('../src/group/create_group');
const {createClient} = require('../src/client/create_client');
const {getClientUUId} = require('../src/client/get_client_uuid');
const {createClientRoles} = require('../src/client/create_client_roles');
const {createCompositeRoles} = require('./client/create_composite_roles');
const {createUserAdminOfGroup} = require('./group/create_group_admin');
const {createSubGroups} = require('./group/create_sub_groups');
const {assignClientRolesToSubGroups} = require('./group/assign_client_roles_sub_group');
const {getUserUUID} = require('./user/get_user_uuid');

async function signup(user_email, user_password, organization_name){
    try {
      console.log('inside signup...');
      console.log(`user_email ${user_email}, pass: ${user_password}, organization_name: ${organization_name}`);
        // const {user_email, user_password, organization_name} = req.body; //FIXME: keep in production
        const userExists = await checkUserExists(user_email);

        if(userExists){
        return {message: 'User already exists'};
        }
        // const organization_name = user_email.split('@')[1].split('.')[0]; //FIXME: Remove in production
        const organizationExists = await checkGroupExists(organization_name);
        if(organizationExists){
        return {message: `Organization with name ${organization_name} already exists.`};
        }

        const userCreated = await createUser(user_email,user_password);
        console.log('User created :',userCreated); // FIXME: Change the logs 
        
        const groupCreateResp = await createGroup(organization_name);
        console.log('Group created:',groupCreateResp);  // FIXME: Change the logs 
        
        const clientName = `LorvenAI-app-${organization_name}`;
        const clientCreateResp = await createClient(clientName,organization_name);
        console.log("Client created:",clientCreateResp); // FIXME: Change the logs
        
        const clientUUID = await getClientUUId(clientName);
        console.log('Client Id: ', clientUUID);

        // ----------------

        const clientRolesCreated = await createClientRoles(clientUUID);
        console.log('client roles created', clientRolesCreated);

        const CompositeRolesCreated = await createCompositeRoles(clientUUID);
        console.log('Composite roles created : ',CompositeRolesCreated);

        const adminRolesAssigned = await createUserAdminOfGroup(user_email,organization_name);
        console.log('admin roles assigned:',adminRolesAssigned);
        
        const subGroupsCreated = await createSubGroups(organization_name);
        console.log('sub groups created:',subGroupsCreated);

        const clientRolesAssignedToSubGroups = await assignClientRolesToSubGroups(organization_name);
        console.log('client roles assigned to group:',clientRolesAssignedToSubGroups);

        const userUUID = await getUserUUID(user_email);
        console.log('User UUID: ',userUUID);

        return {message: "User registered successfully", data: {userId: userUUID}};
    }catch (error) {
      console.error('error in signup',error);
      console.error('Signup failed:', error.response.data || error.message);

      // throw { status: error.response.status, message: error.response.data.error_description}
  }
}
module.exports = {signup};



// app.post('/signup',limiter,async (req, res) => {
//   try {
//     console.log("/signup endpoint called...");
//     // const {user_email, user_password, organization_name} = req.body; //FIXME: keep in production
//     const {user_email, user_password} = req.body;

//     const userExists = await checkUserExists(user_email);

//     if(userExists){
//       return res.status(200).json({message: 'User already exists'});
//     }
//     const organization_name = user_email.split('@')[1].split('.')[0]; //FIXME: Remove in production
//     const organizationExists = await checkGroupExists(organization_name);
//     if(organizationExists){
//       return res.status(200).json({message: `Organization with name ${organization_name} already exists.`});
//     }

//     const userCreated = await createUser(user_email,user_password);
//     console.log('User created :',userCreated); // FIXME: Change the logs 
    
//     const groupCreateResp = await createGroup(organization_name);
//     console.log('Group created:',groupCreateResp);  // FIXME: Change the logs 
    
//     const clientName = `LorvenAI-app-${organization_name}`;
//     const clientCreateResp = await createClient(clientName,organization_name);
//     console.log("Client created:",clientCreateResp); // FIXME: Change the logs
    
//     const clientUUID = await getClientUUId(clientName);
//     console.log('Client Id: ', clientUUID);

//     // ----------------

//     const clientRolesCreated = await createClientRoles(clientUUID);
//     console.log('client roles created', clientRolesCreated);

//     const CompositeRolesCreated = await createCompositeRoles(clientUUID);
//     console.log('Composite roles created : ',CompositeRolesCreated);

//     const adminRolesAssigned = await createUserAdminOfGroup(user_email,organization_name);
//     console.log('admin roles assigned:',adminRolesAssigned);
    
//     const subGroupsCreated = await createSubGroups(organization_name);
//     console.log('sub groups created:',subGroupsCreated);

//     const clientRolesAssignedToSubGroups = await assignClientRolesToSubGroups(organization_name);
//     console.log('client roles assigned to group:',clientRolesAssignedToSubGroups);

//     const userUUID = await getUserUUID(user_email);
//     console.log('User UUID: ',userUUID);

//     return res.status(200).json({message: "User registered successfully", data: {userId: userUUID}})
  
//   } catch (error) {
//     console.error('Signup failed:', error.response?.data || error.message);
//     res.status(400).json({message: "User registration unsuccessful", data: error.response?.data?.errorMessage || 'Signup failed' 
//     });
//   }
// });
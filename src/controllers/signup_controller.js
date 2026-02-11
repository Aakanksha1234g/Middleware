const {checkUserExists} = require('./utils'); 
const {checkGroupExists} = require('./utils');
const {createUser} = require('./user_utils');
const {createGroup} = require('./group_utils');
const {createClient} = require('./client_utils');
const {getClientUUId} = require('./client_utils');
const {createClientRoles} = require('./client_utils');
const {createCompositeRoles} = require('./client_utils');
const {createUserAdminOfGroup} = require('./group_utils');
const {createSubGroups} = require('./group_utils');
const {assignClientRolesToSubGroups} = require('./group_utils');
const {getUserUUID} = require('./utils');

async function signup(req,res){
    const {user_email, user_password, organization_name} = req.body;
    try {
      console.log('inside signup...');
      console.log(`user_email ${user_email}, pass: ${user_password}, organization_name: ${organization_name}`);
        // const {user_email, user_password, organization_name} = req.body; //FIXME: keep in production
        const userExists = await checkUserExists(user_email);

        if(userExists){
        return res.status(200).json({success: true, data:{message: 'User already exists'}});
        }
        // const organization_name = user_email.split('@')[1].split('.')[0]; //FIXME: Remove in production
        const organizationExists = await checkGroupExists(organization_name);
        if(organizationExists){
        return res.status(200).json({success: true, data: {message: `Organization with name ${organization_name} already exists.`}});
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

        return res.status(200).json({success:true, data: {message: "User registered successfully", data: {userId: userUUID}}});
    }catch (error) {
      console.error('error in signup',error);
      console.error('Signup failed:', error.response.data,  error.message);
      return res.status(500).json({success:false, error: error.message});
      // throw { status: error.response.status, message: error.response.data.error_description}
  }
}


module.exports = {
    signup
}

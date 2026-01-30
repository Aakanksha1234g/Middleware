const config = require('../config');
const axios = require('axios');
const { getAdminToken } = require('./utils');
const {getClientUUId} = require('./client_utils');
const { getUserUUID } = require('./utils');

async function createGroup(group_name) {
    try {
        // console.log('Inside create_group function...'); // TODO: Remove debug log
        const adminToken = await getAdminToken();
        const groupCreatedResponse = await axios.post (
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups`,
            {name: group_name},
            {headers : {'Authorization': `Bearer ${adminToken}`,'Content-Type': 'application/json'},
            });
        
        console.log('Group created response:', groupCreatedResponse); // TODO: For debugging - remove later
        console.log(`Group '${group_name}' created successfully. Status: ${groupCreatedResponse.status}. StatusText: ${groupCreatedResponse.statusText}`);        
        return true; // FIXME: return the status code [after checking]
    }catch(error){
        console.error('Group creation failed:',error.message);
        return false; // FIXME: return the status code [after checking]
    }
}

async function getGroupUUID(organization){
    try {
        // console.log(`Inside the getGroupUUId Function...`);
        const adminToken = await getAdminToken();
        const groupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups`,
            {
                params : {search: organization},
                headers : {Authorization : `Bearer ${adminToken}`}
            }
        );
        // console.log('GroupResponse:',groupResponse.data);
        const groupID = groupResponse.data[0].id;
        return groupID;
    }catch(error){
        console.error(`Error in fetching groupID: ${error}`);
        return error.status;
    }
}

async function createUserAdminOfGroup(user_email,organization_name) {
    try {
        const groupID = await getGroupUUID(organization_name);
        console.log('groupID:',groupID);
        const adminToken = await getAdminToken();
        const searchUser = await axios.get(
          `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`,
          {
            headers: {'Authorization': `Bearer ${adminToken}`}, params : {email : user_email},
          }
      );
      console.log('search user response:',searchUser.data);
      const userID = searchUser.data[0].id;
      console.log('userID:',userID);
      
      // Add user to org group as admin, without content-type because keycloak rejects put request with content-type
        //with only headers also the user doesnt get added to group
        // so adding null which means no body which will add user to group
        //in place of null, {} can be used and we will get keycloak response as 204 No Content
      console.log('adding user to the group...');
      const addUserToGroup = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/groups/${groupID}`,
            null,                  
            { headers: { Authorization: `Bearer ${adminToken}` }}
        );
        console.log('addUserToGroup response : ',addUserToGroup);
        console.log(`addUserToGroup response : ${addUserToGroup.status}, ${addUserToGroup.statusText}`);     //if user added to group returns 204 No Content
        const clientName = `LorvenAI-app-${organization_name}`;
        const ClientUUID = await getClientUUId(clientName);

        console.log('assigning admin roles to the user...');
        const adminRole = 'Platform_Admin';
        //Assigning client roles to user
        const adminRolesResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${ClientUUID}/roles/${adminRole}`,
            {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('adminRolesResponse data:',await adminRolesResponse.data); //platform admin info like id, name,etc.
        const adminRolePayload = [adminRolesResponse.data];        //this must be an array
        const rolesAssignedToAdmin = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userID}/role-mappings/clients/${ClientUUID}`,
            adminRolePayload,
            {headers: {Authorization: `Bearer ${adminToken}`,'Content-Type':'application/json'}}
        );
        console.log('rolesAssignedToAdmin response',rolesAssignedToAdmin);
        console.log(` User ${userID} is now admin of org group ${organization_name}`);
        console.log('rolesAssignedToAdmin response:',rolesAssignedToAdmin.status);
        console.log(`Assigned role ${adminRole} to user ${userID}:`, rolesAssignedToAdmin.status);   //returns 204 when role is assigned
       return rolesAssignedToAdmin.status;
        }
    catch(error){
        console.error(`Error in createUserAdminOfGroup function: ${error}`);
        return error.status;
    }
}

async function createSubGroups(organization_name) {
    try { 
        //create these groups
        //Cinescribe Writer, Cinescribe Reader, Cinesketch full access, Cineflow Editor, Pitchcraft Editor, Platform Admin
        
        const groupID = await getGroupUUID(organization_name);
        console.log('group id:',groupID);
        const subGroups = ['Cinescribe_Writer', 'Cinescribe_Reader', 'Cinesketch_FullAccess', 
                            'Cineflow_Editor', 'Pitchcraft_Editor', 'Platform_Admin']
        const adminToken = await getAdminToken();
        console.log(`creating sub groups in group ${organization_name}`);
        for(const group of subGroups){
            const subGroupsCreatedResponse = await axios.post(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children`,
            {name : group},
            { headers: { Authorization: `Bearer ${adminToken}` }}
         );
         console.log('subGroupsCreatedResponse:',subGroupsCreatedResponse);
         console.log('subGroupsCreatedResponse:',subGroupsCreatedResponse.data);
        
        }
        return true;
        
    }catch(error){
        console.error('Error in cretaeSubGroups function:',error);
        return error.status;
    }
}

async function assignClientRolesToSubGroups(organization_name) {
    try {
        //assign these client roles
        // Cinescribe_Writer, Cinescribe_Reader, Cinesketch_FullAccess, Cineflow_Editor, Pitchcraft_Editor, Platform_Admin
        const clientName = `LorvenAI-app-${organization_name}`;
        const orgClientID = await getClientUUId(clientName);          //lorvenai-app-org10's uuid used to assign its roles to sub-groups
        const adminToken = await getAdminToken();

        const rolesPayload = []; 
        const roles = ['Cinescribe_Writer', 'Cinescribe_Reader', 'Cinesketch_FullAccess', 
                        'Cineflow_Editor', 'Pitchcraft_Editor', 'Platform_Admin']
        
        //get the client roles with uuid
        for(const role of roles){
            const rolesResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/clients/${orgClientID}/roles/${role}`,
            {headers : {Authorization : `Bearer ${adminToken}`}}
            );
            // console.log('roles response:',rolesResponse); //gives client role info for each client role
            rolesPayload.push(rolesResponse.data);           //response.data has dictionary with client role info, adding it to rolesPayload list
        }
         console.log('roles payload:',rolesPayload);

        //get the sub-groups with uuid
        const groupID = await getGroupUUID(organization_name);
        const groupsResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children`,
            {headers: {Authorization: `Bearer ${adminToken}`}}
        );
        console.log('groups response:',groupsResponse); //has info about group and sub-groups
        console.log('groups response data:',groupsResponse.data);  //sub-groups info  is already a list of dictionary so assigning it to subGroups variable
        const subGroups = groupsResponse.data;
        console.log('subgroups:',subGroups); //list of sub-groups

        for(const group of subGroups){
            const groupUUID = group.id;         //sub-group uuid e.g. cinescribe_reader group uuid
            console.log('group id:',groupUUID);
            for(const role of rolesPayload){
                console.log('role to be assigned :',role);

                // /groups/group-id is the only endpoint which is used to assign roles to roles to group/sub-groups
                // /groups/group-id/role-mappings/clients/client-uuid ->this client uuid is the client whose role we are assigning to the sub-group
                if(role.name !== group.name){         //checking cinescribe_reader role with group cinescribe_reader
                    continue;
                }
                else{
                    //if matches then assign cinescribe_reader role to cinescribe_reader sub-group
                    const rolesAssignedToSubGroup = await axios.post(
                    `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupUUID}/role-mappings/clients/${orgClientID}`,
                    [{id:role.id, name:role.name}],
                    {headers: {Authorization :`Bearer ${adminToken}`}}
                    );
                    console.log('rolesAssigned to sub group response:',rolesAssignedToSubGroup);
                    console.log('rolesAssigned to sub group response:',rolesAssignedToSubGroup.data);   //if roles assigned returns 204, with statusText:'No Content'
                }
            }
        }
        return true;
    }catch(error){
        console.error('Error in assignClientRolesToSubGroups:',error);
        return error.status;       
        //returns 401 unauthorized if request rolesAssignedTOSubroup url is wrong, e.g. in place of clientuuid clientrole_uuid is written
        //returns 400, if the role passed in the post request is not getting parsed.
    }
}
async function getSubGroupUUID(groupName,subGroupName){
    //GET /admin/realms/{realm}/groups/{group-id}/children
    try {
        const adminToken = await getAdminToken();
        const groupID = await getGroupUUID(groupName);
        const subGroupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children`,
            {
                params : {search: subGroupName},
                headers : {Authorization : `Bearer ${adminToken}`}
            }
        );
        // console.log('subrGroupResponse:',subGroupResponse);  //gives all headers, admin token,sub-group info with id name, parent_id
        const subGroups = subGroupResponse.data; //has sub-group info
        // console.log('Searching subGroup:',subGroupName);
        for(const subGroup of subGroups){
            // console.log('subGroup:',subGroup);
            // console.log('subGroup name:',subGroup.name);
            if(subGroup.name !== subGroupName){
                continue;
            }
            console.log('subGroup name:',subGroup.name);
            return subGroup.id;
        }
        return true;
    } catch(error){
        console.error('Error in getSubGroupUUID:',error);
        return error.status;
    }
}

async function addUserToSubGroup(userEmail,groupName,subGroupName){
    try{
        console.log(`Adding user ${userEmail} to sub-group ${subGroupName}`);
        const adminToken = await getAdminToken();
        console.log('admin token.',adminToken);
        console.log('type of function...',typeof getUserUUID);
        const userUUID = await getUserUUID(userEmail);
        console.log('userUUID:',userUUID);
        const subGroupUUID = await getSubGroupUUID(groupName, subGroupName);
        // Add user to org group as admin, without content-type because keycloak rejects put request with content-type
        //if only headers also the user doesnt get added to group
        // so adding null which means no body which will add user to group
        //in place of null, {} can be used and we will get keycloak response as 204 No Content

        const addUserToSubGroupResponse = await axios.put(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/groups/${subGroupUUID}`,
            null,                                   
            {headers: {Authorization : `Bearer ${adminToken}`}}
        );
        //if user is added to the group then the response returns 204, No Content and response data is empty.
         console.log('addUserToSubGroupResponse:',addUserToSubGroupResponse); 
        // console.log('addUserToSubGroupResponse data:',addUserToSubGroupResponse.data);   
        return addUserToSubGroupResponse.status;
    }catch(error){
        console.error('error in addUserToSubGroup:',error);
        // console.error(`Error in addUserToSubGroup status ${error.response.status}, statusText: ${error.response.statusText}`);
        console.error(`Error in addUserToSubGroup: ${error.response.data.error}`);
        return error.status;    
    }
}

async function deleteUserFromTheSubGroup(user_email,groupName,subGroupName){
    try {
        console.log('inside deleteUserFromSubGroup function...');
        const adminToken = await getAdminToken();
        const userUUID = await getUserUUID(user_email);
        const subGroupUUID = await getSubGroupUUID(groupName, subGroupName);  
                //DELETE /admin/realms/{realm}/users/{user-id}/groups/{groupId}	
        const deleteUserFromSubGroupResponse = await axios.delete(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users/${userUUID}/groups/${subGroupUUID}`,
            {headers : {Authorization : `Bearer ${adminToken}`}}
        )
        console.log('deleteUserFromSubGroupResponse',deleteUserFromSubGroupResponse); //has status 204, statusText : no content when user is deleted
        console.log('deleteUserFromSubGroupResponse data',deleteUserFromSubGroupResponse.data); // is empty 
        console.log(`deleteUserFromSubGroupResponse status: ${deleteUserFromSubGroupResponse.status}, statusText : ${deleteUserFromSubGroupResponse.statusText}`);
        if(deleteUserFromSubGroupResponse.status == 204){
            return { success: true, message : `User ${user_email} has been deleted from sub_group ${subGroupName} of group ${groupName}`};
        }
        return {success : false, message : `Error in deleting user ${user_email} from sub_group ${subGroupName} of group ${groupName}`};
    }catch(error){
        console.error('Error in deleteUserFromTheSubGroup:',error);
        return error;
    }
}

async function checkSubGroupExists(groupName,subGroupName){
    try {
        const adminToken = await getAdminToken();
        const groupID = await getGroupUUID(groupName);
        const subGroupExistResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/children?search=${subGroupName}&exact=true&max=1`,
            {
                headers : {Authorization : `Bearer ${adminToken}`}
            }
        );
        // console.log('subGroupExistsResponse:',subGroupExistResponse); //consists headers, adminToken,url,data:[]
        const subGroup = subGroupExistResponse.data;  //this is an array which has searched group info
        // console.log("subGroup:",subGroup); 
        const subGroupExists = subGroup.some(group => group.name === subGroupName);  //has true/false value
        console.log(`Sub Group ${subGroupName} exists:`, subGroupExists);
        
        return subGroupExists;
    } catch(error){
        console.error('Error in checkSubGroupExists:',error);
        return error.status;
    }
}

async function checkUserExistsInGroup(organization,user_email){
    try {
        console.log(`Checking if the user ${user_email} exists in the group...`);
        console.log(`Inside the userExistsInGroup Function...`);
        const adminToken = await getAdminToken();
        const groupID = await getGroupUUID(organization);
        console.log(`Group id of ${organization} is ${groupID}`);

        const anyUserExistsInGroupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${groupID}/members`,
            {headers: {Authorization : `Bearer ${adminToken}`}}
        );
        console.log(`anyUserExistsInGroupResponse`, anyUserExistsInGroupResponse);
        console.log('UserExistsInGroupResponse data:' , anyUserExistsInGroupResponse.data);  //if it is empty means user doens't exist in that group
        
        return {
           'userExistsInGroup' :anyUserExistsInGroupResponse.data,
           'groupID': groupID
        };
    }catch(error){
        console.error(`Error in userExistsInGroup function: ${error}`);
        return false;
    }
}

async function checkUserExistsInSubGroup(userEmail, groupName,subGroupName){
    try {
        // console.log(`Checking if the user ${userEmail} exists in the group...`);
        // console.log(`Inside the userExistsInGroup Function...`);
        const adminToken = await getAdminToken();
        const subGroupUUID = await getSubGroupUUID(groupName,subGroupName);
        console.log(`Sub group id of ${subGroupName} is ${subGroupUUID}`);

        const userExistsInSubGroupResponse = await axios.get(
            `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/groups/${subGroupUUID}/members`,
            {headers: {Authorization : `Bearer ${adminToken}`}}
        );
        // console.log('userExistsInSubGrou[Response',userExistsInSubGroupResponse);   //has headers, token, data shows the user info if user is in the sub group 
        console.log('userExistsInSubGroupResponse data:' , userExistsInSubGroupResponse.data); //returns nothing if user doesn't exist, else returns all users in sub group
        const userExistsInSubGroup = userExistsInSubGroupResponse.data.some(user => user.email === userEmail);  //has true/false value
        return userExistsInSubGroup;
    }catch(error){
        console.error(`Error in checkUserExistsInSubGroup : ${error}`);
        return error.status;
    }
}


module.exports = {
    createUserAdminOfGroup,
    createGroup,
    getGroupUUID,
    createSubGroups,
    assignClientRolesToSubGroups,
    addUserToSubGroup,
    deleteUserFromTheSubGroup,
    getSubGroupUUID,
    checkSubGroupExists,
    checkUserExistsInGroup,
    checkUserExistsInSubGroup
};


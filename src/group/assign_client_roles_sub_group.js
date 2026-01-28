const axios = require('axios');
const config = require('../config');
const {getGroupUUID} = require('../group/get_group_id');
const {getAdminToken} = require('../admin_token');
const {getClientUUId} = require('../client/get_client_uuid');

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

module.exports = {assignClientRolesToSubGroups};
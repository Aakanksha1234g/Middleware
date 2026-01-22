const axios = require('axios');
const config = require('../config');
const {getGroupID} = require('../group/get_group_id');
const {getAdminToken} = require('../admin_token');


async function createSubGroups(organization_name) {
    try { 
        //create these groups
        //Cinescribe Writer, Cinescribe Reader, Cinesketch full access, Cineflow Editor, Pitchcraft Editor, Platform Admin
        
        const groupID = await getGroupID(organization_name);
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

module.exports = {createSubGroups};
const config = require('./src/config');
async function checkGroupExists(organization) {
    try {
        const response = await axios.get(
        `${config.KEYCLOAK_REALM}/admin/realms/${config.KEYCLOAK_REALM}/groups?search=${organization}`,
        {
            headers: {'Authorization' : `Bearer ${config.ADMIN_TOKEN}`},
            params : {exact: true, max:1}
        }
        );
        return response.data.some(group => group.name == organization);
    } catch(error) {
        if(error.response?.status === 404) return false;
        console.error('Group check failed:',error.message);
        return false;
    }
}
module.exports = {checkGroupExists};
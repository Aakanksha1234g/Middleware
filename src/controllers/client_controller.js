const {checkClientExists} = require('../client/client_check');
const {createClientRoles} = require('../client/create_client_roles');
const {createClient} = require('../client/create_client');
const {createCompositeRoles} = require('../client/create_composite_roles');
const {getClientUUId} = require('../client/get_client_uuid');

//Check client exists
exports.checkClientExists = async (req, res) => {
    try {
        const checkClientExistsResp = await checkClientExists(req.body);
        res.status(200).json({success: true, data: checkClientExistsResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

//create client roles
exports.createClientRoles = async (req, res) => {
    try {
        const createClientRolesResp = await createClientRoles(req.body);
        res.status(200).json({success: true, data: createClientRolesResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

//create client
exports.createClient = async (req, res) => {
    try { 
        const createClientResp = await createClient(req.body);
        res.status(200).json({success: true, data: createClientResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

//create composite roles
exports.createCompositeRoles = async (req, res) => {
    try {
        const createCompositeRolesResp = await createCompositeRoles(req.body);
        res.status(200).json({success: true, data: createCompositeRolesResp});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};

//get client UUID
exports.getClientUUId = async (req, res) => {
    try {
        const getClientUUIdResp = await getClientUUId(req.body);
        res.status(200).json({success: true, data: getClientUUId});
    }catch(error){
        res.status(400).json({success: false, error: error.message});
    }
};
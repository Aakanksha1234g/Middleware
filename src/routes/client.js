const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client_controller');


//client endpoints
router.get('/check_client_exists',clientController.checkClientExists);
router.post('/create_client_roles',clientController.createClientRoles);
router.post('/create_client',clientController.createClient);
router.post('/create_composite_roles',clientController.createCompositeRoles);
router.get('/get_client_UUId',clientController.getClientUUId);

module.exports = router;
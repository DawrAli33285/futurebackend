const router = require('express').Router();
const {middleware} = require('../middleware/middleware'); 
const settingsController = require('../controllers/astrologySettings');

router.get('/getUserSettings', middleware, settingsController.getUserSettings);
router.get('/active', middleware, settingsController.getActiveSettings);
router.post('/createUserSettings', middleware, settingsController.createSettings);
router.put('/:settingsId', middleware, settingsController.updateSettings);
router.put('/:settingsId/activate', middleware, settingsController.activateSettings);
router.delete('/:settingsId', middleware, settingsController.deleteSettings);
router.put('/:settingsId/wheel-planets', middleware, settingsController.updateWheelPlanets);
router.put('/:settingsId/wheel-aspects', middleware, settingsController.updateWheelAspects);
router.put('/:settingsId/graph-planets', middleware, settingsController.updateGraphPlanets);
router.put('/:settingsId/graph-aspects', middleware, settingsController.updateGraphAspects);
router.put('/:settingsId/graph-types', middleware, settingsController.updateGraphTypes);


module.exports=router;
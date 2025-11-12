const router=require('express').Router();
const {getProfile,deleteProfile,getSubscribed}=require('../controllers/profile')
const {middleware}=require('../middleware/middleware')

router.get('/get-profile',middleware,getProfile)
router.post('/deleteProfile',middleware,deleteProfile)
router.get('/getSubscribed',middleware,getSubscribed)
module.exports=router;  
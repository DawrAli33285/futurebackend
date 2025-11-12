const router=require('express').Router();
const {session,webhookHandler}=require('../controllers/subscription')
const {middleware}=require('../middleware/middleware')
router.get('/subscribe',middleware,session)


module.exports=router;
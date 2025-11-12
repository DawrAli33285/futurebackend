const router=require('express').Router();
const {middleware}=require('../middleware/middleware')
const {createMessages,fetchMessages}=require('../controllers/messages')

router.post('/sendMessage',middleware,createMessages)
router.get('/fetchMessages',middleware,fetchMessages)



module.exports=router;
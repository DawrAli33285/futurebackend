const router=require('express').Router();
const {googleAuthenticate,deleteAccount,saveBirthDate,getUser}=require('../controllers/auth');
const { middleware } = require('../middleware/middleware');

router.post('/googleLogin',googleAuthenticate)
router.delete('/deleteAccount',middleware,deleteAccount)
router.patch('/saveBirthDate',middleware,saveBirthDate)
router.get('/getUser',middleware,getUser)
module.exports=router;
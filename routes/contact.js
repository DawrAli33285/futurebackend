const {contactUsEmail,joinNewsLetter}=require('../controllers/contact')
const router=require('express').Router();

router.post('/contactUsEmail',contactUsEmail)
router.post('/joinNewsLetter',joinNewsLetter)

module.exports=router;
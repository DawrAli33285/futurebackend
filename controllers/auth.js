const userModel = require("../models/user");
const jwt=require('jsonwebtoken')
module.exports.googleAuthenticate=async(req,res)=>{
    let {...data}=req.body;
    try{
let emailCheck=await userModel.findOne({email:data.email})
if(!emailCheck){
   let newuser=await userModel.create(data)
   emailCheck=emailCheck.toObject();
   let token=await jwt.sign(emailCheck,process.env.JWT_KEY)
   return res.status(200).json({
    token,
    user:newuser
})
}
emailCheck=emailCheck.toObject();
let token=await jwt.sign(emailCheck,process.env.JWT_KEY)

return res.status(200).json({
    token,
    user:emailCheck
})

    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to login"
        })
    }
}


module.exports.deleteAccount=async(req,res)=>{
    try{
await userModel.findByIdAndDelete(req.user._id)
return res.status(200).json({
    message:"User deleted sucessfully"
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to delete account"
        })
    }
}


module.exports.getUser=async(req,res)=>{
   
    try{
let user=await userModel.findById(req.user._id)
return res.status(200).json({
    birth_date:user.birth_date
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to update account"
        })
    }
}


module.exports.saveBirthDate = async (req, res) => {
    const {birth_date} = req.body;

    try {

        if (!birth_date) {
            return res.status(400).json({ message: 'Birth date is required' });
          }
      const user = await userModel.findByIdAndUpdate(
        req.user._id,
        { $set: { birth_date } },
        { new: true } 
      );
  
      console.log(req.user._id);
      console.log("UPDATED");
  
      return res.status(200).json({ user });
    } catch (e) {
      console.log(e.message);
      return res.status(400).json({
        error: "Error occurred while trying to update user"
      });
    }
  };
  
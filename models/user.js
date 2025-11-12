const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    birth_date:{
        type:Date
    },
  
    default_location:{
        type:String
    },
   
})


const userModel=mongoose.model('user',userSchema)

module.exports=userModel
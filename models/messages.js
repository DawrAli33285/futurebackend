const mongoose=require('mongoose')
const messagesSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'user'
    },
    message:{
        type:String,
        required:true
    }
},{timestamps:true})


const messagesModel=mongoose.model('messages',messagesSchema)

module.exports=messagesModel
const mongoose=require('mongoose')

const newsLetterSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
emailSentOn:{
    type:Date
}

},{timestamps:true})


const newsletterModel=mongoose.model('newsletter',newsLetterSchema)

module.exports=newsletterModel
const messagesModel=require('../models/messages')

module.exports.createMessages = async (req, res) => {
    try {
        const { ...data } = req.body;
        
        
        if (!data.message || data.message.trim() === '') {
            return res.status(400).json({
                error: "Message content is required"
            });
        }

        const messageData = {
            ...data,
            user: req.user._id
        };
     
        let message = await messagesModel.create(messageData);
        message = await message.populate('user');
        

        return res.status(200).json({
            message: "Message created successfully",
            sentMessage:message
        });

    } catch (e) {
        console.log(e.message)
        return res.status(400).json({
            error: "Error occurred while sending message"
        })
    }
}

module.exports.fetchMessages=async(req,res)=>{
    try{
let messages=await messagesModel.find({}).populate('user')
return res.status(200).json({
    messages
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while fetching messages"
        })
    }
}
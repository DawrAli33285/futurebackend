const compositechart = require("../models/compositechart")
const mainchart = require("../models/mainchart")
const messagesModel = require("../models/messages")
const snyastry = require("../models/snyastry")
const graph=require('../models/graph')
const subscription = require("../models/subscription")

const transitchart = require("../models/transitchart")
const userModel = require("../models/user")
const stripe = require('stripe')(process.env.STRIPE_KEY);

module.exports.getProfile=async(req,res)=>{
    try{
let user=await userModel.findById(req.user._id)
let subscriptionData=await subscription.findOne({
    userId: req.user._id,
    $or: [{ status: 'trialing' }, { status: 'active' }]
  });
let mainCharts=await mainchart.find({userId:user._id})
let synastryCharts=await snyastry.find({userId:user._id})
let transitCharts=await transitchart.find({userId:user._id})
let compositeCharts=await compositechart.find({userId:user._id})
let transitGraph=await graph.find({userId:user._id})

return res.status(200).json({
    user,
    subscription:subscriptionData,
    mainCharts,
    synastryCharts,
    transitCharts,
    compositeCharts,
    transitGraph
})
    }catch(e){
console.log(e.message)
return res.status(400).json({
    error:"Error occured while fetching profile"    
})
    }
}


module.exports.deleteProfile = async (req, res) => {
    try {
       
        const subscriptionFound = await subscription.findOne({ userId: req.user._id });
        
        if (subscriptionFound) {
            try {
                await stripe.subscriptions.cancel(subscriptionFound.stripeSubscriptionId);
            } catch (stripeError) {
             
                console.log('Stripe subscription cancellation failed:', stripeError.message);
            }
        }

        
        await Promise.all([
            subscription.deleteMany({ userId: req.user._id }),
            messagesModel.deleteMany({ user: req.user._id }),
            mainchart.deleteMany({ userId: req.user._id }),
            transitchart.deleteMany({ userId: req.user._id }),
            snyastry.deleteMany({ userId: req.user._id }),
            compositechart.deleteMany({ userId: req.user._id }),
            graph.deleteMany({ userId: req.user._id }),
            userModel.findByIdAndDelete(req.user._id)
        ]);

        return res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (e) {
        console.log(e.message);
        return res.status(400).json({
            error: "Error occurred while deleting profile"
        });
    }
};

module.exports.getSubscribed=async(req,res)=>{
    try{
        let subscriptionFound = await subscription.findOne({
            userId: req.user._id,
            $or: [{ status: 'trialing' }, { status: 'active' }]
          });
          
let found=false;

if(subscriptionFound){
    found=true
}

console.log(found)
return res.status(200).json({
  found
  })
}catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to fetch subscription"
        })
    }
}
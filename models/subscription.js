const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    stripeCustomerId: {
        type: String,
        required: true,
        index: true
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    stripePriceId: {
        type: String,
        required: true
    },
    stripeProductId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused'],
        default: 'trialing',
        required: true,
        index: true
    },
    currentPeriodStart: {
        type: Date,
        required: true
    },
    currentPeriodEnd: {
        type: Date,
        required: true
    },
    trialStart: {
        type: Date,
        default: null
    },
    trialEnd: {
        type: Date,
        default: null
    },
    canceledAt: {
        type: Date,
        default: null
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    plan: {
        name: {
            type: String,
            default: 'True Sky Astrology Software'
        },
        amount: {
            type: Number,
            required: true 
        },
        currency: {
            type: String,
            default: 'usd'
        },
        interval: {
            type: String,
            enum: ['day', 'week', 'month', 'year'],
            default: 'month'
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('subscription', subscriptionSchema);
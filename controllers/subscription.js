const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const userModel = require('../models/user');
const subscriptionModel = require('../models/subscription');


module.exports.setupStripeProducts = async () => {
    try {
        const products = await stripe.products.list({ limit: 100 });
        let subscriptionProduct = products.data.find(p => p.name === 'True Sky Astrology Software');
        
        if (!subscriptionProduct) {
            subscriptionProduct = await stripe.products.create({
                name: 'True Sky Astrology Software',
                description: 'Mastering the Zodiac LLC',
                type: 'service'
            });
        }

        const prices = await stripe.prices.list({ 
            product: subscriptionProduct.id,
            limit: 100 
        });
        let subscriptionPrice = prices.data.find(p => p.recurring?.interval === 'month');
        
        if (!subscriptionPrice) {
            subscriptionPrice = await stripe.prices.create({
                product: subscriptionProduct.id,
                currency: 'usd',
                unit_amount: 1500,
                recurring: { interval: 'month' }
            });
        }

        process.env.STRIPE_SUBSCRIPTION_PRICE_ID = subscriptionPrice.id;
      
        return subscriptionPrice.id;
    } catch (error) {
        console.error('Error setting up Stripe products:', error.message);
    }
};

module.exports.webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('ERROR: STRIPE_WEBHOOK_SECRET not set!');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!sig) {
        console.error('ERROR: No stripe-signature header');
        return res.status(400).send('No stripe-signature header found');
    }

    if (!req.body) {
        console.error('ERROR: No webhook payload');
        return res.status(400).send('No webhook payload provided');
    }

    let event;

    try {
        const body = typeof req.body === 'string' ? req.body : req.body.toString();
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      
    } catch (err) {
        console.error('❌ Webhook verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'invoice.paid':
                await handleInvoicePaid(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;
            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;
            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ Error processing webhook:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Error processing webhook' });
    }
};

const handleChargeRefunded = async (charge) => {
    try {
      
     
        if (charge.invoice) {
            const invoice = await stripe.invoices.retrieve(charge.invoice);
            
            if (invoice.subscription) {
                const subscription = await subscriptionModel.findOne({
                    stripeSubscriptionId: invoice.subscription
                });

                if (subscription) {
                  
                    const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
                    subscription.status = stripeSubscription.status;
                    
                    await subscription.save();
                 
                    return;
                }
            }
        }

       
        if (charge.customer) {
        
            const subscription = await subscriptionModel.findOne({
                stripeCustomerId: charge.customer,
                status: { $in: ['active', 'trialing', 'past_due'] }
            });

            if (subscription) {
                try {
                  
                    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
                    
                
                    subscription.status = stripeSubscription.status;
                    subscription.canceledAt = stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : subscription.canceledAt;
                    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
                    
                    await subscription.save();
                  
                } catch (stripeError) {
                   
                    if (stripeError.code === 'resource_missing') {
                        subscription.status = 'canceled';
                        subscription.canceledAt = new Date();
                        await subscription.save();
                      
                    } else {
                        throw stripeError;
                    }
                }
                return;
            }
        }

     
    } catch (error) {
        console.error('❌ Error in handleChargeRefunded:', error.message);
        console.error(error.stack);
    }
};

const handleSubscriptionCreated = async (stripeSubscription) => {
    try {
        

        const existingSubscription = await subscriptionModel.findOne({
            stripeSubscriptionId: stripeSubscription.id
        });

        if (existingSubscription) {
            
            return;
        }

      
        const customer = await stripe.customers.retrieve(stripeSubscription.customer);
        const user = await userModel.findOne({ email: customer.email });
        
        if (!user) {
            console.error('❌ User not found for email:', customer.email);
            return;
        }

    
        const userActiveSubscription = await subscriptionModel.findOne({
            userId: user._id,
            status: { $in: ['trialing', 'active'] }
        });

        if (userActiveSubscription) {
           
            return;
        }

       
        const planDetails = stripeSubscription.items.data[0];
        const price = await stripe.prices.retrieve(planDetails.price.id);

        const subscription = new subscriptionModel({
            userId: user._id,
            stripeCustomerId: stripeSubscription.customer,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: planDetails.price.id,
            stripeProductId: price.product,
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
            trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
            canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            plan: {
                name: price.nickname || 'True Sky Astrology Software',
                amount: price.unit_amount,
                currency: price.currency,
                interval: price.recurring.interval
            },
            metadata: stripeSubscription.metadata || {}
        });

        await subscription.save();
        
     
        if (!user.stripeCustomerId) {
            user.stripeCustomerId = stripeSubscription.customer;
            await user.save();
        }
    } catch (error) {
        console.error('❌ Error in handleSubscriptionCreated:', error.message);
        console.error(error.stack);
    }
};

const handleSubscriptionUpdated = async (stripeSubscription) => {
    try {
    
        const subscription = await subscriptionModel.findOne({
            stripeSubscriptionId: stripeSubscription.id
        });

        if (!subscription) {
            console.error('❌ Subscription not found:', stripeSubscription.id);
            return;
        }

       
        subscription.status = stripeSubscription.status;
        subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
        subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        subscription.trialStart = stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null;
        subscription.trialEnd = stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null;
        subscription.canceledAt = stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null;
        subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        subscription.metadata = stripeSubscription.metadata || {};

        await subscription.save();
       
    } catch (error) {
        
    }
};

const handleSubscriptionDeleted = async (stripeSubscription) => {
    try {
        
        const subscription = await subscriptionModel.findOne({
            stripeSubscriptionId: stripeSubscription.id
        });

        if (!subscription) {
            console.error('❌ Subscription not found in database:', stripeSubscription.id);
            
        
            if (stripeSubscription.customer) {
                const customerSubscription = await subscriptionModel.findOne({
                    stripeCustomerId: stripeSubscription.customer,
                    status: { $in: ['active', 'trialing', 'past_due'] }
                });

                if (customerSubscription) {
                    customerSubscription.status = 'canceled';
                    customerSubscription.canceledAt = new Date();
                    await customerSubscription.save();
                   
                    return;
                }
            }
            
         
            return;
        }

        subscription.status = 'canceled';
        subscription.canceledAt = stripeSubscription.canceled_at 
            ? new Date(stripeSubscription.canceled_at * 1000) 
            : new Date();
        subscription.cancelAtPeriodEnd = false;
        
        await subscription.save();
       
    } catch (error) {
        
        console.error(error.stack);
    }
};

const handleCheckoutSessionCompleted = async (session) => {
    try {
   
        if (session.mode === 'subscription') {
            console.log('   Subscription ID:', session.subscription);
            console.log('Subscription checkout completed');
        } else if (session.mode === 'payment') {
            console.log('One-time payment completed');
            
        }
    } catch (error) {
        console.error('Error in handleCheckoutSessionCompleted:', error.message);
    }
};

const handleInvoicePaid = async (invoice) => {
    try {
       
        if (!invoice.subscription) {
            console.log('ℹ️ Invoice not associated with subscription');
            return;
        }

        const subscription = await subscriptionModel.findOne({
            stripeSubscriptionId: invoice.subscription
        });

        if (!subscription) {
            console.log('ℹ️ Subscription not found yet, will be created by subscription.created');
            return;
        }

        if (subscription.status !== 'active') {
            subscription.status = 'active';
            await subscription.save();
            console.log('Subscription activated:', invoice.subscription);
        }
    } catch (error) {
        console.error('Error in handleInvoicePaid:', error.message);
    }
};

const handleInvoicePaymentSucceeded = async (invoice) => {
    try {
       
        if (!invoice.subscription) {
            console.log('ℹ️ Invoice not associated with subscription');
            return;
        }

        let subscription = await subscriptionModel.findOne({
            stripeSubscriptionId: invoice.subscription
        });

        if (!subscription) {
          
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const customer = await stripe.customers.retrieve(stripeSubscription.customer);
                const user = await userModel.findOne({ email: customer.email });
                
                if (!user) {
                    
                    return;
                }

                const planDetails = stripeSubscription.items.data[0];
                const price = await stripe.prices.retrieve(planDetails.price.id);

                subscription = new subscriptionModel({
                    userId: user._id,
                    stripeCustomerId: stripeSubscription.customer,
                    stripeSubscriptionId: stripeSubscription.id,
                    stripePriceId: planDetails.price.id,
                    stripeProductId: price.product,
                    status: 'active',
                    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                    trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
                    trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
                    canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                    plan: {
                        name: price.nickname || 'True Sky Astrology Software',
                        amount: price.unit_amount,
                        currency: price.currency,
                        interval: price.recurring.interval
                    },
                    metadata: stripeSubscription.metadata || {}
                });

                await subscription.save();
               
            } catch (createError) {
               
                return;
            }
        } else {
            subscription.status = 'active';
            await subscription.save();
           
        }
    } catch (error) {
        console.error('Error in handleInvoicePaymentSucceeded:', error.message);
    }
};

const handleInvoicePaymentFailed = async (invoice) => {
    try {
        console.log('Processing invoice.payment_failed:', invoice.id);

        if (!invoice.subscription) {
            console.log('ℹ️ Invoice not associated with subscription');
            return;
        }

        const subscription = await subscriptionModel.findOne({
            stripeSubscriptionId: invoice.subscription
        });

        if (!subscription) {
            console.error('Subscription not found for invoice:', invoice.subscription);
            return;
        }

        subscription.status = 'past_due';
        await subscription.save();
        console.log('Subscription marked as past_due:', invoice.subscription);
    } catch (error) {
        console.error('Error in handleInvoicePaymentFailed:', error.message);
    }
};

module.exports.session = async (req, res) => {
    try {
        if (!process.env.STRIPE_KEY) {
            return res.status(500).json({
                error: "Stripe is not configured. Please contact support."
            });
        }

        let user = await userModel.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const activeSubscription = await subscriptionModel.findOne({
            userId: user._id,
            status: { $in: ['trialing', 'active'] }
        });

        if (activeSubscription) {
            return res.status(400).json({
                error: "You already have an active subscription"
            });
        }

        let stripeCustomerId = user.stripeCustomerId;
        
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || '',
                metadata: {
                    userId: user._id.toString()
                }
            });
            stripeCustomerId = customer.id;
            
            user.stripeCustomerId = stripeCustomerId;
            await user.save();
        }

        const lineItem = process.env.STRIPE_SUBSCRIPTION_PRICE_ID 
            ? {
                price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
                quantity: 1,
              }
            : {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'True Sky Astrology Software',
                        description: 'Mastering the Zodiac LLC',
                    },
                    recurring: {
                        interval: 'month',
                    },
                    unit_amount: 1500,
                },
                quantity: 1,
              };

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            success_url: `${process.env.FRONTEND_URL}/admin/main`,
            cancel_url: `${process.env.FRONTEND_URL}/admin/main`, 
            line_items: [lineItem],
            mode: 'subscription',
            subscription_data: {
                metadata: {
                    userId: user._id.toString()
                }
            },
            payment_method_collection: 'always', 
        });

        return res.status(200).json({
            sessionId: session.id,
            url: session.url
        });

    } catch (e) {
        console.error('Error creating session:', e.message);
        return res.status(400).json({
            error: "Error occurred while trying to create stripe session",
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};

module.exports.oneTimePaymentSession = async (req, res) => {
    try {
        let user = await userModel.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const { quantity = 1 } = req.body;
        
        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({
                error: "Quantity must be between 1 and 10"
            });
        }
        
        let stripeCustomerId = user.stripeCustomerId;
        
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || '',
                metadata: {
                    userId: user._id.toString()
                }
            });
            stripeCustomerId = customer.id;
            
            user.stripeCustomerId = stripeCustomerId;
            await user.save();
        }
        
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/chart-report`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Chart Report + E-Reading',
                            description: 'Personalized astrology chart with detailed reading',
                        },
                        unit_amount: 9500, 
                    },
                    quantity: quantity,
                    adjustable_quantity: {
                        enabled: true,
                        minimum: 1,
                        maximum: 10 
                    }
                }
            ],
            mode: 'payment',
            metadata: {
                userId: user._id.toString(),
                productType: 'chart_report'
            }
        });

        return res.status(200).json({
            sessionId: session.id,
            url: session.url
        });

    } catch (e) {
        console.error('Error creating one-time payment session:', e.message);
        return res.status(400).json({
            error: "Error occurred while trying to create stripe session",
            details: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
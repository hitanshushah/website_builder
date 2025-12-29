import Stripe from 'stripe'
import { getPremiumPlanByKey } from '../db/premiumPlans'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-08-27.basil'
  })

  const PLAN_PRICE_MAP: Record<string, string> = {
    'plus': config.stripePlusPriceId || '',
    'pro': config.stripeProPriceId || ''
  }

  const PLAN_PRODUCT_MAP: Record<string, string> = {
    'plus': config.stripePlusProductId || '',
    'pro': config.stripeProProductId || ''
  }

  const body = await readBody(event)
  const { planKey, userId } = body

  if (!planKey || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing planKey or userId'
    })
  }

  try {
    // Get the plan details from database
    const plan = await getPremiumPlanByKey(planKey)
    if (!plan) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Plan not found'
      })
    }

    // Basic plan is free, no Stripe checkout needed
    if (planKey === 'basic' || plan.price === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Basic plan is free and does not require payment'
      })
    }

    // Check if user already has this plan
    const { query } = await import('../db/db')
    const existingPlan = await query(
      'SELECT premium_plan_id FROM users WHERE id = $1',
      [userId]
    )
    
    if (existingPlan.length > 0 && (existingPlan[0] as any).premium_plan_id === plan.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You already have this plan. No need to resubscribe.'
      })
    }

    // Get the Stripe price ID for this plan
    let priceId = PLAN_PRICE_MAP[planKey]
    
    // If no price ID is configured, try to get it from the product
    if (!priceId) {
      const productId = PLAN_PRODUCT_MAP[planKey]
      if (productId) {
        // Get the default price for this product
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
          limit: 1
        })
        
        if (prices.data.length > 0) {
          priceId = prices.data[0].id
        }
      }
    }
    
    if (!priceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Stripe price ID not configured for this plan. Please set STRIPE_[PLAN]_PRICE_ID or STRIPE_[PLAN]_PRODUCT_ID environment variables.'
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${config.public.baseUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.public.baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planKey: planKey,
        planId: plan.id.toString()
      },
      customer_email: body.customerEmail, // Optional: if you have user email
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planKey: planKey,
          planId: plan.id.toString()
        }
      },
      // Configure for immediate cancellation on payment failure
      payment_method_collection: 'if_required',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Disable automatic retries for immediate cancellation
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      }
    })

    return { url: session.url }
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Failed to create checkout session' 
    })
  }
})

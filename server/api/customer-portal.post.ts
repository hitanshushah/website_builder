import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-08-27.basil'
  })

  const body = await readBody(event)
  const { userId, customerEmail } = body

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing userId'
    })
  }

  // Check if user is authenticated and not on basic plan
  let userStripeCustomerId: string | null = null
  try {
    const { query } = await import('../db/db')
    const userResult = await query(
      'SELECT premium_plan_id, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    )
    
    if (userResult.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found. Please log in again.'
      })
    }

    const userPlanId = (userResult[0] as any).premium_plan_id
    userStripeCustomerId = (userResult[0] as any).stripe_customer_id
    
    // Check if user is on basic plan (plan ID 1)
    if (userPlanId === 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Customer portal is only available for paid plans. Please upgrade your plan first.'
      })
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify user plan'
    })
  }

  try {
    // If no stored customer ID, return error immediately
    if (!userStripeCustomerId) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No customer found. Please contact support for assistance.'
      })
    }

    // Retrieve customer using stored ID
    const customer = await stripe.customers.retrieve(userStripeCustomerId)

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${config.public.baseUrl}/pricing`
    })

    return { 
      url: portalSession.url,
      success: true 
    }
  } catch (error) {
    console.error('Customer portal session error:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Failed to create customer portal session' 
    })
  }
})

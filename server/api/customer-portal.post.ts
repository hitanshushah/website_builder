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
    let customer = null
    
    // If we have a stored customer ID, use it
    if (userStripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(userStripeCustomerId)
      } catch (error) {
        userStripeCustomerId = null // Reset to null so we create a new customer
      }
    }

    // If no customer found by stored ID, try to find by email (for existing users)
    if (!customer && customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      })
      if (customers.data.length > 0) {
        customer = customers.data[0]
        
        // Update the database with the found customer ID
        const { query } = await import('../db/db')
        await query(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customer.id, userId]
        )
      }
    }

    // If still no customer found, create a new one
    if (!customer) {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId.toString()
        }
      })
      console.log('Created new customer:', customer.id)
      
      // Store the new customer ID in the database
      const { query } = await import('../db/db')
      await query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customer.id, userId]
      )
    }

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

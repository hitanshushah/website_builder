import Stripe from 'stripe'
import { query } from '../db/db'

// Helper function to get plan prices from database
async function getPlanPrices(): Promise<{ plusPrice: number; proPrice: number }> {
  const plans = await query(
    'SELECT id, key, price FROM premium_plans WHERE is_active = true ORDER BY price ASC'
  )
  
  const plusPlan = plans.find((plan: any) => plan.key === 'plus') as any
  const proPlan = plans.find((plan: any) => plan.key === 'pro') as any
  
  return {
    plusPrice: plusPlan?.price,
    proPrice: proPlan?.price
  }
}

// Helper function to determine plan ID from subscription
async function determinePlanIdFromSubscription(stripe: Stripe, subscription: Stripe.Subscription): Promise<number> {
  // First, try to get plan from subscription metadata
  if (subscription.metadata?.planId) {
    const planId = parseInt(subscription.metadata.planId)
    return planId
  }
  
  // Try to determine plan from subscription items
  if (subscription.items?.data && subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id
    
    // Get price details to determine plan
    try {
      const price = await stripe.prices.retrieve(priceId)
      
      // Get plan prices from database
      if (price.unit_amount) {
        const amount = price.unit_amount / 100 // Convert from cents to dollars
        const { plusPrice, proPrice } = await getPlanPrices()
        
        if (amount >= proPrice) {
          return 3 // Pro plan
        } else if (amount >= plusPrice) {
          return 2 // Plus plan
        }
      }
    } catch (error) {
    }
  }
  
  return 2
}

// Helper function to determine plan ID from invoice
async function determinePlanIdFromInvoice(stripe: Stripe, invoice: Stripe.Invoice): Promise<number> {
  // Try to get plan from invoice metadata
  if (invoice.metadata?.planId) {
    const planId = parseInt(invoice.metadata.planId)
    return planId
  }
  
  // Try to determine plan from invoice amount
  if (invoice.amount_paid) {
    const amount = invoice.amount_paid / 100 
    
    // Get plan prices from database
    const { plusPrice, proPrice } = await getPlanPrices()
    
    if (amount >= proPrice) {
      return 3 // Pro plan
    } else if (amount >= plusPrice) {
      return 2 // Plus plan
    }
  }
  
  // Default to Plus plan if we can't determine
  return 2
}

// Helper function to cancel subscription and downgrade user
async function cancelSubscriptionAndDowngradeUser(stripe: Stripe, subscriptionId: string, userId: number, reason: string) {
  try {
    // Cancel the subscription
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    
    // Downgrade user to basic plan
    await query(
      'UPDATE users SET premium_plan_id = 1 WHERE id = $1', // 1 = basic plan
      [userId]
    )
    
    return subscription
  } catch (error: any) {
    throw error
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-08-27.basil'
  })

  const body = await readRawBody(event)
  const sig = getHeader(event, 'stripe-signature')

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body!,
      sig!,
      config.stripeWebhookSecret
    )

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      
      // Update user's premium plan in database
      if (session.metadata?.userId && session.metadata?.planId) {
        const userId = parseInt(session.metadata.userId)
        const planId = parseInt(session.metadata.planId)
        const planKey = session.metadata.planKey
        
        try {
          // Check if user already has an active subscription for this plan
          const existingSubscription = await query(
            `SELECT id FROM users 
             WHERE id = $1 AND premium_plan_id = $2`,
            [userId, planId]
          )
          
          if (existingSubscription.length > 0) {
            return { received: true }
          }
          
          // Update user's premium plan and store customer ID
          await query(
            'UPDATE users SET premium_plan_id = $1, stripe_customer_id = $2 WHERE id = $3',
            [planId, session.customer, userId]
          )
          
          // Send subscription confirmation email
          try {
            // Get plan name from database
            const planResult = await query(
              'SELECT name FROM premium_plans WHERE id = $1',
              [planId]
            )
            
            if (planResult.length > 0) {
              const planName = (planResult[0] as any).name
              
              // Fetch user email using the same logic as user-email.get.ts
              const userEmailSql = `
                SELECT 
                  u.email as user_email,
                  p.override_email,
                  p.secondary_email
                FROM users u
                LEFT JOIN profiles p ON p.user_id = u.id
                WHERE u.id = $1
              `
              
              const userResult = await query(userEmailSql, [userId])
              
              if (userResult.length > 0) {
                const user = userResult[0] as any
                let userEmail = null
                
                // Check override_email logic
                if (user.override_email && user.secondary_email) {
                  userEmail = user.secondary_email
                } else if (user.override_email && !user.secondary_email) {
                  userEmail = user.user_email
                } else if (!user.override_email) {
                  userEmail = user.user_email
                }
                
                if (userEmail) {
                  
                  let userName = userEmail
                  if(userId) {
                    const userNameResult = await query('SELECT name FROM profiles WHERE user_id = $1', [userId])
                    if (userNameResult.length > 0) {
                      userName = userNameResult[0].name
                    }
                  }
                
                try {
                  const result = await $fetch('/api/send-subscription', {
                      method: 'POST',
                      body: {
                        userName: userName,
                        userEmail: userEmail,
                        planName: planName
                      }
                    })

                    console.log(`Subscription confirmation email sent to ${userEmail} for plan ${planName}`)
                } catch (error) {
                  console.error('Error sending subscription confirmation email:', error)
                }
                }
              }
            }
          } catch (emailError) {
            console.error('Error sending subscription confirmation email:', emailError)
            // Don't fail the webhook if email sending fails
          }
        } catch (error) {
          console.error('Error updating user plan:', error)
        }
      }
    }

    // Handle subscription updates and cancellations
    if (stripeEvent.type === 'customer.subscription.updated') {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      
      // If subscription is past due or unpaid, cancel and downgrade to basic plan
      if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
        if (subscription.metadata?.userId) {
          const userId = parseInt(subscription.metadata.userId)
          await cancelSubscriptionAndDowngradeUser(stripe, subscription.id, userId, 'payment failure - past due/unpaid')
        }
      }
      
      // If subscription becomes active again, update user's premium plan
      if (subscription.status === 'active') {
        let userId = null
        let planId = null
        
        // Try to get userId and planId from subscription metadata first
        if (subscription.metadata?.userId && subscription.metadata?.planId) {
          userId = parseInt(subscription.metadata.userId)
          planId = parseInt(subscription.metadata.planId)
        } else {
          
          // Get customer details to find user
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          
          // Find user by email in database
          if ((customer as any).email) {
            const userResult = await query(
              'SELECT id, premium_plan_id FROM users WHERE email = $1',
              [(customer as any).email]
            )
            
            if (userResult.length > 0) {
              userId = (userResult[0] as any).id
              // Determine the correct plan ID from the subscription
              planId = await determinePlanIdFromSubscription(stripe, subscription)
            }
          }
        }
        
        if (userId && planId) {
          try {
            // Update user's premium plan to the correct plan
            await query(
              'UPDATE users SET premium_plan_id = $1 WHERE id = $2',
              [planId, userId]
            )
            
          } catch (error) {
          }
        } else {
        }
      }
    }

    // Handle invoice payment failures (including expired cards)
    if (stripeEvent.type === 'invoice.payment_failed') {
      const invoice = stripeEvent.data.object as Stripe.Invoice
      
      // Check if this is due to an expired card
      if ((invoice as any).last_payment_error?.decline_code === 'expired_card' || 
          (invoice as any).last_payment_error?.code === 'card_declined' ||
          (invoice as any).last_payment_error?.code === 'expired_card') {
        
        
        // Get subscription details first to get user metadata
        const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        
        if (subscription.metadata?.userId) {
          const userId = parseInt(subscription.metadata.userId)
          await cancelSubscriptionAndDowngradeUser(stripe, subscription.id, userId, 'expired card - payment failed')
        }
      }
      
      // Void the failed invoice to prevent further payment attempts
      try {
        if (invoice.status === 'open' && invoice.id) {
          await stripe.invoices.voidInvoice(invoice.id)
        }
      } catch (voidError) {
      }
    }

    // Handle payment action required (additional payment failure scenarios)
    if (stripeEvent.type === 'invoice.payment_action_required') {
      const invoice = stripeEvent.data.object as Stripe.Invoice
      
      // For expired cards or other critical failures, cancel immediately
      if ((invoice as any).last_payment_error?.decline_code === 'expired_card' ||
          (invoice as any).last_payment_error?.code === 'card_declined' ||
          (invoice as any).last_payment_error?.code === 'expired_card') {
        
        
        // Get subscription details first to get user metadata
        const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        
        if (subscription.metadata?.userId) {
          const userId = parseInt(subscription.metadata.userId)
          await cancelSubscriptionAndDowngradeUser(stripe, subscription.id, userId, 'expired card - payment action required')
        }
      }
    }

    // Handle successful invoice payments (including from customer portal)
    if (stripeEvent.type === 'invoice.payment_succeeded') {
      const invoice = stripeEvent.data.object as Stripe.Invoice
      
      // Get subscription details to find user and plan
      if ((invoice as any).subscription) {
        const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
        
        // If subscription is now active, update user's premium plan
        if (subscription.status === 'active') {
          let userId = null
          let planId = null
          
          // Try to get userId and planId from subscription metadata first
          if (subscription.metadata?.userId && subscription.metadata?.planId) {
            userId = parseInt(subscription.metadata.userId)
            planId = parseInt(subscription.metadata.planId)
          } else {
            
            // Get customer details to find user
            const customer = await stripe.customers.retrieve(invoice.customer as string)
            
            // Find user by email in database
            if ((customer as any).email) {
              const userResult = await query(
                'SELECT id, premium_plan_id FROM users WHERE email = $1',
                [(customer as any).email]
              )
              
              if (userResult.length > 0) {
                userId = (userResult[0] as any).id
                // Determine the correct plan ID from the invoice/subscription
                planId = await determinePlanIdFromInvoice(stripe, invoice)
              }
            }
          }
          
          if (userId && planId) {
            try {
              // Update user's premium plan to the correct plan
              await query(
                'UPDATE users SET premium_plan_id = $1 WHERE id = $2',
                [planId, userId]
              )
              
            } catch (error) {
              console.error('Error updating user plan after invoice payment:', error)
            }
          } else {
          }
        } else {
        }
      } else {
      }
    }

    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      
      // Find and void any unpaid invoices for this subscription
      try {
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          limit: 10, // Check last 10 invoices
        })

        for (const invoice of invoices.data) {
          if ((invoice.status === 'open' || invoice.status === 'draft') && invoice.id) {
            try {
              await stripe.invoices.voidInvoice(invoice.id as string)
            } catch (voidError) {
              console.error(`Error voiding invoice ${invoice.id}:`, voidError)
            }
          }
        }
      } catch (invoiceError) {
        console.error('Error checking invoices for canceled subscription:', invoiceError)
      }
      
      // Downgrade user to basic plan and clear customer ID when subscription is cancelled
      if (subscription.metadata?.userId) {
        const userId = parseInt(subscription.metadata.userId)
        await query(
          'UPDATE users SET premium_plan_id = 1, stripe_customer_id = NULL WHERE id = $1', // 1 = basic plan
          [userId]
        )
      }
    }

    return { received: true }
  } catch (err: any) {
    console.error('Webhook Error:', err)
    throw createError({ statusCode: 400, statusMessage: 'Invalid webhook signature' })
  }
})

import { getAllPremiumPlans } from '../db/premiumPlans'

export default defineEventHandler(async (event) => {
  try {
    const plans = await getAllPremiumPlans()
    
    return {
      success: true,
      data: plans
    }
  } catch (error) {
    console.error('Error fetching premium plans:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch premium plans'
    })
  }
})


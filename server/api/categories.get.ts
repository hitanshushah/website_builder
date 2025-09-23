import { getCategories } from '../db/categories'

export default defineEventHandler(async (event) => {
  try {
    const userId = Number(getQuery(event).userId)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    const categories = await getCategories(userId)

    return {
      success: true,
      data: categories
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch categories'
    })
  }
})

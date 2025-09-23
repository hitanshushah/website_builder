import { deleteCategory } from '../db/categories'

export default defineEventHandler(async (event) => {
  try {
    const categoryId = Number(getQuery(event).id)
    
    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required'
      })
    }

    await deleteCategory(categoryId)

    return {
      success: true,
      message: 'Category deleted successfully. Skills in this category have been moved to "Other Skills".'
    }
  } catch (error: any) {
    console.error('Error deleting category:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete category'
    })
  }
})

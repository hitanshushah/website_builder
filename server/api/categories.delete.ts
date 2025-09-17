import { query } from '../db/db'

export default defineEventHandler(async (event) => {
  try {
    const categoryId = Number(getQuery(event).id)
    
    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required'
      })
    }

    // First, update all skills in this category to have no category (set category_id to null)
    const updateSkillsSql = `
      UPDATE skills 
      SET category_id = NULL 
      WHERE category_id = $1
    `
    await query(updateSkillsSql, [categoryId])

    // Then delete the category
    const deleteCategorySql = `
      DELETE FROM skill_categories 
      WHERE id = $1
      RETURNING *
    `

    const result = await query(deleteCategorySql, [categoryId])

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })
    }

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

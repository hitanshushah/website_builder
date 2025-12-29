import { createCategory, type SkillCategory } from '../db/categories'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { user_id, name } = body

    if (!user_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and category name are required'
      })
    }

    const category = await createCategory({
      user_id,
      name: name.trim()
    })

    return {
      success: true,
      data: category
    }
  } catch (error: any) {
    console.error('Error creating category:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create category'
    })
  }
})

import { createSkill } from '../db/skills'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { profile_id, name, category_id, proficiency_level, description } = body

    if (!profile_id || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Profile ID and skill name are required'
      })
    }

    const skill = await createSkill({
      profile_id,
      name,
      category_id,
      proficiency_level,
      description
    })

    return {
      success: true,
      data: skill
    }
  } catch (error: any) {
    console.error('Error creating skill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create skill'
    })
  }
})

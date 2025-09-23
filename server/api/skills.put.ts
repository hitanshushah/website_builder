import { updateSkill } from '../db/skills'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      id,
      name, 
      proficiency_level, 
      category_id 
    } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill ID is required'
      })
    }

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill name is required'
      })
    }

    const updatedSkill = await updateSkill(id, {
      name: name.trim(),
      proficiency_level: proficiency_level || null,
      category_id: category_id || null
    })

    return {
      success: true,
      message: 'Skill updated successfully',
      skill: updatedSkill
    }
  } catch (error: any) {
    console.error('Error updating skill:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update skill'
    })
  }
})

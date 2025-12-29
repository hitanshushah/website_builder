import { deleteSkill } from '../db/skills'

export default defineEventHandler(async (event) => {
  try {
    const skillId = Number(getQuery(event).id)
    
    if (!skillId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Skill ID is required'
      })
    }

    await deleteSkill(skillId)

    return {
      success: true,
      message: 'Skill deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting skill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete skill'
    })
  }
})

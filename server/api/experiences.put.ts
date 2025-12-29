import { updateExperience } from '../db/experiences'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      id,
      role, 
      company_name, 
      company_logo,
      start_date, 
      end_date, 
      location, 
      description,
      skills
    } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Experience ID is required'
      })
    }

    if (!role || !role.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Role is required'
      })
    }

    if (!company_name || !company_name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Company name is required'
      })
    }

    const updatedExperience = await updateExperience(id, {
      role: role.trim(),
      company_name: company_name.trim(),
      company_logo: company_logo || null,
      start_date: start_date || null,
      end_date: end_date || null,
      location: location?.trim() || null,
      description: description?.trim() || null,
      skills: skills || []
    })

    return {
      success: true,
      message: 'Experience updated successfully',
      experience: updatedExperience
    }
  } catch (error: any) {
    console.error('Error updating experience:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update experience'
    })
  }
})

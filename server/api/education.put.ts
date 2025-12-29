import { updateEducation } from '../db/education'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      id,
      university_name, 
      degree, 
      from_date, 
      end_date, 
      location, 
      cgpa 
    } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Education ID is required'
      })
    }

    if (!university_name || !university_name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'University name is required'
      })
    }

    if (!degree || !degree.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Degree is required'
      })
    }

    const updatedEducation = await updateEducation(id, {
      university_name: university_name.trim(),
      degree: degree.trim(),
      from_date: from_date || null,
      end_date: end_date || null,
      location: location?.trim() || null,
      cgpa: cgpa || null
    })

    return {
      success: true,
      message: 'Education record updated successfully',
      education: updatedEducation
    }
  } catch (error: any) {
    console.error('Error updating education:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update education record'
    })
  }
})

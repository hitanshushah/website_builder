import { createEducation } from '../db/education'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      userId, 
      university_name, 
      degree, 
      from_date, 
      end_date, 
      location, 
      cgpa 
    } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!university_name || !degree) {
      throw createError({
        statusCode: 400,
        statusMessage: 'University name and degree are required'
      })
    }

    const education = await createEducation(userId, {
      university_name,
      degree,
      from_date,
      end_date,
      location,
      cgpa
    })

    return {
      success: true,
      message: 'Education record added successfully',
      education
    }
  } catch (error: any) {
    console.error('Error adding education:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add education record'
    })
  }
})

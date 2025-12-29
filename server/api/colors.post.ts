import { checkColorKeyExists, createCustomColor } from '../db/colors'
import { validatePlusPlan } from '../utils/planValidation'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, primary_color, secondary_color, background_color, fourth_color, user_id } = body

    if (!name || !primary_color || !secondary_color || !background_color || !user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, primary color, secondary color, background color, and user ID are required'
      })
    }

    const userId = parseInt(user_id)

    // Validate Plus plan for custom color creation
    const planValidation = await validatePlusPlan(userId)
    if (!planValidation.isValid) {
      throw createError({
        statusCode: 403,
        statusMessage: planValidation.message || 'Custom color schemes require a Plus plan or higher'
      })
    }

    const key = name.toLowerCase().replace(/\s+/g, '')

    const keyExists = await checkColorKeyExists(key)
    if (keyExists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A color scheme with this name already exists. Please choose a different name.'
      })
    }

    const newColor = await createCustomColor({
      key,
      name,
      primary_color,
      secondary_color,
      background_color,
      fourth_color,
      user_id: userId
    })

    return {
      success: true,
      message: 'Custom color scheme created successfully',
      data: newColor
    }
  } catch (error: any) {
    console.error('Error creating custom color:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create custom color scheme'
    })
  }
})


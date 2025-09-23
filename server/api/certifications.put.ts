import { updateCertification } from '../db/certifications'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      id,
      name, 
      description, 
      start_date, 
      end_date, 
      institute_name, 
      certificate_pdf 
    } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certification ID is required'
      })
    }

    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certification name is required'
      })
    }

    const updatedCertification = await updateCertification(id, {
      name: name.trim(),
      description: description?.trim() || null,
      start_date: start_date || null,
      end_date: end_date || null,
      institute_name: institute_name?.trim() || null,
      certificate_pdf: certificate_pdf || null
    })

    return {
      success: true,
      message: 'Certification updated successfully',
      certification: updatedCertification
    }
  } catch (error: any) {
    console.error('Error updating certification:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update certification'
    })
  }
})

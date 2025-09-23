import { updatePublication } from '../db/publications'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      id,
      paper_name, 
      conference_name, 
      published_date, 
      description, 
      paper_link, 
      paper_pdf 
    } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Publication ID is required'
      })
    }

    if (!paper_name || !paper_name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Paper name is required'
      })
    }

    const updatedPublication = await updatePublication(id, {
      paper_name: paper_name.trim(),
      conference_name: conference_name?.trim() || null,
      published_date: published_date || null,
      description: description?.trim() || null,
      paper_link: paper_link || null,
      paper_pdf: paper_pdf || null
    })

    return {
      success: true,
      message: 'Publication updated successfully',
      publication: updatedPublication
    }
  } catch (error: any) {
    console.error('Error updating publication:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update publication'
    })
  }
})

import { getActiveTemplates } from '../db/templates'

export default defineEventHandler(async (event) => {
  try {
    const templates = await getActiveTemplates()
    return templates
  } catch (err) {
    console.error('Error fetching templates:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch templates'
    })
  }
})

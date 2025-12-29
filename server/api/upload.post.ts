import { uploadFile, getPublicUrl, minioConfig } from '../minio/client'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const file = formData[0]
    const username = formData.find(field => field.name === 'username')?.data?.toString()
    const fileType = formData.find(field => field.name === 'fileType')?.data?.toString() || 'image'
    
    if (!username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username is required'
      })
    }

    if (!file.data || !file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file data'
      })
    }

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only image and PDF files are allowed'
      })
    }

    // Validate file size (max 5MB for images, 10MB for PDFs)
    const isPDF = file.type === 'application/pdf'
    const maxSize = isPDF ? 10 * 1024 * 1024 : 5 * 1024 * 1024 // 10MB for PDFs, 5MB for images
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `File size must be less than ${isPDF ? '10MB' : '5MB'}`
      })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.filename.split('.').pop()
    // Determine folder based on file type context
    const folder = (fileType === 'certificate' || fileType === 'publication') ? 'documents' : 'images'
    const objectName = `${username}/${folder}/${timestamp}_${file.filename}`

    // Upload to MinIO
    await uploadFile(
      minioConfig.bucket,
      objectName,
      file.data,
      file.type || 'application/octet-stream'
    )

    // Generate public URL
    const publicUrl = getPublicUrl(minioConfig.bucket, objectName)

    return {
      success: true,
      url: publicUrl,
      filename: file.filename,
      size: file.data.length,
      type: file.type
    }
  } catch (error: any) {
    console.error('Error uploading file:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload file'
    })
  }
})

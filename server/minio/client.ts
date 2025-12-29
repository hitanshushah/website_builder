import * as Minio from 'minio'

// Get runtime config
const config = useRuntimeConfig()

// MinIO configuration
const minioConfig = {
  endpoint: config.minioEndpoint,
  publicUrl: config.minioPublicUrl,
  bucket: config.minioBucket,
  region: config.minioRegion,
  accessKey: config.minioAccessKey,
  secretKey: config.minioSecretKey,
  useSSL: config.minioUseSSL,
}

// Parse endpoint for MinIO client
const parseEndpoint = (endpoint: string) => {
  const cleanEndpoint = endpoint.replace('http://', '').replace('https://', '')
  const [host, port] = cleanEndpoint.split(':')
  return {
    host: host || 'localhost',
    port: port ? parseInt(port) : 4810
  }
}

const { host, port } = parseEndpoint(minioConfig.endpoint)

// Create MinIO client
export const minioClient = new Minio.Client({
  endPoint: host,
  port: port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
})

// Ensure bucket exists
export const ensureBucketExists = async (bucketName: string) => {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (!exists) {
      await minioClient.makeBucket(bucketName, minioConfig.region)
    } else {
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
    throw error
  }
}

// Upload file to MinIO
export const uploadFile = async (
  bucketName: string,
  objectName: string,
  fileBuffer: Buffer,
  contentType: string
) => {
  try {
    await ensureBucketExists(bucketName)
    
    const result = await minioClient.putObject(
      bucketName,
      objectName,
      fileBuffer,
      fileBuffer.length,
      {
        'Content-Type': contentType,
      }
    )
    
    return result
  } catch (error) {
    console.error('Error uploading file to MinIO:', error)
    throw error
  }
}

// Generate public URL for uploaded file
export const getPublicUrl = (bucketName: string, objectName: string) => {
  return `${minioConfig.publicUrl}/${bucketName}/${objectName}`
}

export { minioConfig }

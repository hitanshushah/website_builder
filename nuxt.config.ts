// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim())
  : []

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui','@pinia/nuxt','@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts
    },
    optimizeDeps: {
      exclude: ['pg']
    }
  },
  experimental: {
    clientNodeCompat: true
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  runtimeConfig: {
    dbUsername: process.env.DB_USERNAME,
    dbHost: process.env.DB_HOST,
    dbDatabase: process.env.DB_DATABASE,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT,
    authentikLogoutUrl: process.env.AUTHENTIK_LOGOUT_URL,
    
    // MinIO Configuration
    minioEndpoint: process.env.MINIO_ENDPOINT,
    minioPublicUrl: process.env.MINIO_PUBLIC_URL,
    minioBucket: process.env.MINIO_BUCKET,
    minioRegion: process.env.MINIO_REGION,
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    minioUseSSL: process.env.MINIO_USE_SSL === 'true',
    
    public: {
      authentikLogoutUrl: process.env.AUTHENTIK_LOGOUT_URL,
      domainUrl: process.env.DOMAIN_URL,
    }
  }
})
// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/eslint',
    'nuxt-nodemailer',
    '@unlok-co/nuxt-stripe'
  ],
  nodemailer: {
    from: '"John Doe" <john@doe.com>',
    host: 'smtp.mailtrap.io',
    port: 465,
    secure: true,
    auth: {
      user: 'john@doe.com',
      pass: '',
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: [] // will get from runtimeConfig if needed in code
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
  // Stripe & Nodemailer keys will be read at runtime via runtimeConfig
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

    // Stripe Configuration
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePlusPriceId: process.env.STRIPE_PLUS_PRICE_ID,
    stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID,
    stripePlusProductId: process.env.STRIPE_PLUS_PRODUCT_ID,
    stripeProProductId: process.env.STRIPE_PRO_PRODUCT_ID,

    public: {
      authentikLogoutUrl: process.env.AUTHENTIK_LOGOUT_URL,
      supportEmail: process.env.SUPPORT_EMAIL,
      domainUrl: process.env.DOMAIN_URL,
      brandName: process.env.BRAND_NAME,
      ddns: process.env.DDNS,
      brandUrl: process.env.BRAND_URL,
      baseUrl: process.env.BASE_URL,
      allowedHosts: process.env.VITE_ALLOWED_HOSTS || '',
      projectsboardDomain: process.env.PROJECTS_BOARD_DOMAIN,
      webbstyleDomain: process.env.WEBBSTYLE_DOMAIN
    }
  }
})


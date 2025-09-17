// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import Aura from '@primeuix/themes/aura';

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim())
  : []

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt','@nuxt/eslint', '@nuxt/ui', '@primevue/nuxt-module'],
  css: ['~/assets/css/main.css', 'primeicons/primeicons.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts
    },
    ssr: {
      noExternal: ['@primevue/nuxt-module']
    },
    optimizeDeps: {
      exclude: ['pg']
    }
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
  primevue: {
        options: {
            theme: {
                preset: Aura
            }
        }
    },
  runtimeConfig: {
    dbUsername: process.env.DB_USERNAME,
    dbHost: process.env.DB_HOST,
    dbDatabase: process.env.DB_DATABASE,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT,
    authentikLogoutUrl: process.env.AUTHENTIK_LOGOUT_URL,
    
    public: {
      authentikLogoutUrl: process.env.AUTHENTIK_LOGOUT_URL
    }
  }
})
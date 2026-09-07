import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'super-secret-store-jwt-key-2026',
    public: {
      adminPath: process.env.ADMIN_PATH || '/admin-secret',
    }
  },
  app: {
    head: {
      title: 'TokoOnline - Belanja Produk Berkualitas & Checkout WhatsApp Cepat',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Katalog produk lengkap dengan pilihan variant terbaik dan proses pemesanan praktis via WhatsApp.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})

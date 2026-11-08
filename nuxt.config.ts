export default defineNuxtConfig({
  compatibilityDate: '2025-11-01',
  devtools: { enabled: false },
  telemetry: false,
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    adminPassword: '', sessionSecret: '',
    gotenbergUrl: '', gotenbergUsername: '', gotenbergPassword: '',
  },
  app: { head: {
    title: 'Tracer Letter · UNISA Yogyakarta',
    htmlAttrs: { lang: 'id' },
    meta: [{ name: 'description', content: 'Ruang kerja administrasi surat pengantar Tracer Study.' }],
  } },
  typescript: { strict: true },
})

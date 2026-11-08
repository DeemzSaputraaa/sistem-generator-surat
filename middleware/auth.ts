export default defineNuxtRouteMiddleware(async () => {
  try { await useRequestFetch()('/api/auth/session') }
  catch { return navigateTo('/login') }
})

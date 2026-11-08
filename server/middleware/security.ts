export default defineEventHandler(event => {
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'Referrer-Policy', 'same-origin')
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})

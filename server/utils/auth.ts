import { createHash, timingSafeEqual } from 'node:crypto'
import { createError, getRequestURL, getHeader, useSession, type H3Event } from 'h3'

export function constantEqual(a: string, b: string) {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest())
}
export async function adminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  if (config.sessionSecret.length < 32 || !config.adminPassword) throw createError({ statusCode: 503, statusMessage: 'Isi NUXT_ADMIN_PASSWORD dan NUXT_SESSION_SECRET (minimal 32 karakter) di environment server.' })
  return useSession<{ admin: boolean; fingerprint: string }>(event, {
    name: 'tracer-session', password: config.sessionSecret, maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, sameSite: 'strict', secure: !import.meta.dev, path: '/' },
  })
}
export function credentialFingerprint(password: string) {
  return createHash('sha256').update(password).digest('hex')
}
export async function requireAdmin(event: H3Event) {
  const session = await adminSession(event)
  if (!session.data.admin || session.data.fingerprint !== credentialFingerprint(useRuntimeConfig(event).adminPassword)) throw createError({ statusCode: 401, statusMessage: 'Sesi berakhir. Silakan login kembali.' })
  return session
}
export function requireSameOrigin(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (!origin || origin !== getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin) throw createError({ statusCode: 403, statusMessage: 'Permintaan lintas situs ditolak.' })
}

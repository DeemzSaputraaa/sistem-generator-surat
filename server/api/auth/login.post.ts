import { adminSession, constantEqual, credentialFingerprint, requireSameOrigin } from '../../utils/auth'

// Batas per instance; tambahkan Vercel Firewall rate limiting untuk seluruh deployment.
const attempts = new Map<string, { count: number; expires: number }>()
export default defineEventHandler(async event => {
  requireSameOrigin(event)
  const now = Date.now()
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const attempt = attempts.get(ip) || { count: 0, expires: now + 15 * 60 * 1000 }
  if (attempt.count >= 10) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' })
  if (Number(getHeader(event, 'content-length')) > 4096) throw createError({ statusCode: 413, statusMessage: 'Permintaan terlalu besar.' })
  const body = await readBody(event)
  const session = await adminSession(event)
  if (typeof body?.password !== 'string' || body.password.length > 1024 || !constantEqual(body.password, useRuntimeConfig(event).adminPassword)) {
    attempt.count++; attempts.set(ip, attempt)
    throw createError({ statusCode: 401, statusMessage: 'Password tidak sesuai.' })
  }
  attempts.delete(ip)
  await session.clear()
  await session.update({ admin: true, fingerprint: credentialFingerprint(useRuntimeConfig(event).adminPassword) })
  return { authenticated: true }
})

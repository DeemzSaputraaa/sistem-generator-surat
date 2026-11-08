import { adminSession, requireSameOrigin } from '../../utils/auth'
export default defineEventHandler(async event => {
  requireSameOrigin(event)
  await (await adminSession(event)).clear()
  return { authenticated: false }
})

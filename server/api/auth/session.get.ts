import { requireAdmin } from '../../utils/auth'
export default defineEventHandler(async event => {
  await requireAdmin(event)
  return { authenticated: true, pdfEnabled: Boolean(useRuntimeConfig(event).gotenbergUrl) }
})

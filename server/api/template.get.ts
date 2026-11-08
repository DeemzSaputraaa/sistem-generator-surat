import { requireAdmin } from '../utils/auth'

export default defineEventHandler(async event => {
  await requireAdmin(event)
  const file = await useStorage('assets:server').getItemRaw<Buffer>('templates/draft-surat-pengantar-tracer-study.docx')
  if (!file) throw createError({ statusCode: 404, statusMessage: 'Template bawaan belum tersedia. Unggah template melalui pengaturan.' })
  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  setHeader(event, 'Content-Disposition', 'attachment; filename="draft-surat-pengantar-tracer-study.docx"')
  return Buffer.from(file)
})

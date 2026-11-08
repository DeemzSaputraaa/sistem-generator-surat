import { requireAdmin, requireSameOrigin } from '../utils/auth'
export default defineEventHandler(async event => {
  requireSameOrigin(event)
  await requireAdmin(event)
  const config = useRuntimeConfig(event)
  if (!config.gotenbergUrl) throw createError({ statusCode: 503, statusMessage: 'Layanan PDF belum dikonfigurasi.' })
  const limit = 3 * 1024 * 1024
  if (Number(getHeader(event, 'content-length')) > limit + 4096) throw createError({ statusCode: 413, statusMessage: 'Dokumen PDF maksimal 3 MB.' })
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file')
  if (!file || file.data.length > limit || file.data[0] !== 0x50 || file.data[1] !== 0x4b) throw createError({ statusCode: 400, statusMessage: 'Unggah dokumen DOCX valid, maksimal 3 MB.' })
  const form = new FormData()
  form.append('files', new Blob([new Uint8Array(file.data)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'surat.docx')
  try {
    const headers: Record<string, string> = {}
    if (config.gotenbergUsername) headers.Authorization = `Basic ${Buffer.from(`${config.gotenbergUsername}:${config.gotenbergPassword}`).toString('base64')}`
    const response = await fetch(`${config.gotenbergUrl.replace(/\/$/, '')}/forms/libreoffice/convert`, { method: 'POST', headers, body: form, signal: AbortSignal.timeout(45000), redirect: 'error' })
    if (!response.ok) throw new Error('Conversion failed')
    const pdf = Buffer.from(await response.arrayBuffer())
    if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF')
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'attachment; filename="surat.pdf"')
    return pdf
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Konversi PDF gagal. Periksa layanan konversi atau coba unduh Word.' })
  }
})

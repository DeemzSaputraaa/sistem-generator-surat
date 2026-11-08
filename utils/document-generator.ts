import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import type { Alumni } from '../types/alumni'
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const placeholders = ['nama', 'nim', 'program_studi', 'tahun_lulus', 'tempat_kerja', 'nomor_whatsapp', 'tanggal', 'nomor_surat']
export function validateAlumni(a: Alumni) {
  if (!a.nama || !a.nim || !a.prodi || !/^\d{4}$/.test(a.tahunLulus) || !a.tempatKerja) throw new Error(`Lengkapi nama, NIM, prodi, tahun lulus (4 digit), dan tempat kerja ${a.nama}.`)
}
function templateDocument(buffer: ArrayBuffer) {
  const zip = new PizZip(buffer)
  if (!zip.file('word/document.xml')) throw new Error('File bukan dokumen Word DOCX yang valid.')
  let total = 0
  for (const entry of Object.values(zip.files)) {
    const size = (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0
    total += size
  }
  if (total > 30 * 1024 * 1024) throw new Error('Isi template terlalu besar (maksimal 30 MB setelah diekstrak).')
  const tags = new Set<string>()
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true, linebreaks: true,
    parser: tag => {
      const key = tag.trim()
      if (!placeholders.includes(key)) throw new Error(`Placeholder {${key}} tidak didukung.`)
      tags.add(key)
      return { get: scope => scope[key] ?? '' }
    },
  })
  if (!tags.has('nama') || !tags.has('nim')) throw new Error('Template wajib memuat placeholder {nama} dan {nim}.')
  return doc
}
export function createDocument(buffer: ArrayBuffer, alumni: Alumni, nomorSurat: string, tanggal: string): Uint8Array {
  validateAlumni(alumni)
  const doc = templateDocument(buffer)
  doc.render({ nama: alumni.nama, nim: alumni.nim, program_studi: alumni.prodi, tahun_lulus: alumni.tahunLulus, tempat_kerja: alumni.tempatKerja, nomor_whatsapp: alumni.whatsapp, tanggal, nomor_surat: nomorSurat })
  const xml = doc.getZip().file('word/document.xml')!.asText()
  if (!xml.includes(alumni.nim.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))) throw new Error('Template harus memuat placeholder {nim} agar surat dapat diidentifikasi.')
  return doc.getZip().generate({ type: 'uint8array', compression: 'DEFLATE' })
}
export function documentName(a: Alumni, format: string) {
  const safe = (s: string) => s.replace(/[^\p{L}\p{N}_-]/gu, '_').slice(0, 80)
  return `Surat_Pengantar_${safe(a.nama)}_${safe(a.nim)}.${format}`
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), anchor = document.createElement('a')
  anchor.href = url; anchor.download = filename; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import PizZip from 'pizzip'

// Run explicitly when replacing the original draft; never overwrite the source.
const source = process.argv[2] || 'draft-surat-pengantar-tracer-study.docx'
const zip = new PizZip(readFileSync(source))
const part = zip.file('word/document.xml')
if (!part) throw new Error('DOCX tidak memiliki badan dokumen.')
const textOf = xml => [...xml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('').replace(/\s+/g, ' ').trim()
function replaceParagraph(paragraph, replacement) {
  let first = true
  return paragraph.replace(/(<w:t\b[^>]*>)[\s\S]*?(<\/w:t>)/g, (_, open, close) => {
    const value = first ? replacement : ''
    first = false
    return open + value + close
  })
}
let xml = part.asText()
const counts = { tanggal: 0, nomor: 0, instansi: 0, alumni: 0 }
xml = xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, paragraph => {
  const text = textOf(paragraph)
  if (/^Yogyakarta,/.test(text)) { counts.tanggal++; return replaceParagraph(paragraph, 'Yogyakarta, {tanggal}') }
  if (/^Nomor\s*:/.test(text)) { counts.nomor++; return replaceParagraph(paragraph, 'Nomor : {nomor_surat}') }
  if (/^Direktur\s/.test(text)) { counts.instansi++; return replaceParagraph(paragraph, 'Direktur {tempat_kerja}') }
  return paragraph
})
xml = xml.replace(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g, row => {
  const cells = [...row.matchAll(/<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g)]
  if (cells.length !== 5 || textOf(cells[0][0]) !== '1') return row
  counts.alumni++
  let index = 0
  const replacements = ['1', '{nama}', '{nim}', '{program_studi}', '{tahun_lulus}']
  return row.replace(/<w:tc\b[^>]*>[\s\S]*?<\/w:tc>/g, cell => {
    const replacement = replacements[index++]
    let first = true
    return cell.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, paragraph => {
      if (!/<w:t\b/.test(paragraph)) return paragraph
      const value = first ? replacement : ''
      first = false
      return replaceParagraph(paragraph, value)
    })
  })
})
if (Object.values(counts).some(count => count !== 1)) throw new Error('Struktur draft berubah. Periksa pemetaan sebelum menyiapkan template: ' + JSON.stringify(counts))
zip.file('word/document.xml', xml)
mkdirSync('server/assets/templates', { recursive: true })
writeFileSync('server/assets/templates/draft-surat-pengantar-tracer-study.docx', zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }))
console.log('Template siap: tanggal, nomor surat, instansi, dan 4 field alumni dipetakan. File asli tidak diubah.')

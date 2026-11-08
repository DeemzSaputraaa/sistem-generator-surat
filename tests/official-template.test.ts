import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import PizZip from 'pizzip'
import { createDocument } from '../utils/document-generator'

const file = readFileSync(new URL('../server/assets/templates/draft-surat-pengantar-tracer-study.docx', import.meta.url))
const buffer = new Uint8Array(file).buffer
const alumni = { nama: 'Alumni Pengujian Template', nim: '0099988877', prodi: 'Program Studi Uji', tahunLulus: '2025', tempatKerja: 'Instansi Pengujian', whatsapp: '' }
describe('Template resmi bawaan', () => {
  it('mengisi identitas, instansi, tanggal, dan nomor surat pilihan admin', () => {
    const output = new PizZip(createDocument(buffer, alumni, '123/UJI/2026', '9 November 2026'))
    const xml = output.file('word/document.xml')!.asText()
    const text = [...xml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1]).join('')
    for (const value of [alumni.nama, alumni.nim, alumni.prodi, alumni.tahunLulus, 'Direktur ' + alumni.tempatKerja, 'Yogyakarta, 9 November 2026', 'Nomor : 123/UJI/2026']) expect(text).toContain(value)
    expect(text).not.toMatch(/\{(?:nama|nim|program_studi|tahun_lulus|tempat_kerja|tanggal|nomor_surat)\}/)
    expect(text).toContain('https://forms.gle/wTAQA5TZrULVMLfc9')
  })
  it('mempertahankan aset gambar, gaya, dan ukuran halaman template', () => {
    const source = new PizZip(buffer)
    const output = new PizZip(createDocument(buffer, alumni, '', '9 November 2026'))
    const media = Object.keys(source.files).filter(path => path.startsWith('word/media/') && !source.files[path]?.dir)
    expect(media.length).toBeGreaterThan(0)
    for (const path of [...media, 'word/styles.xml']) expect(output.file(path)!.asUint8Array()).toEqual(source.file(path)!.asUint8Array())
    const sections = (zip: PizZip) => zip.file('word/document.xml')!.asText().match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g)
    expect(sections(output)).toEqual(sections(source))
  })
})

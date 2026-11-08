import { describe, expect, it } from 'vitest'
import PizZip from 'pizzip'
import JSZip from 'jszip'
import { parseCsv } from '../utils/csv-parser'
import { normalizePhone, whatsappLink } from '../utils/whatsapp'
import { createDocument, documentName, validateAlumni } from '../utils/document-generator'
import type { Alumni } from '../types/alumni'
const headers = 'Nama,NIM,Program Studi,Tahun Lulus,Tempat Kerja,Nomor WhatsApp\n'
const alumni: Alumni = { nama: 'Alumni Uji & Rekan', nim: '001234', prodi: 'Keperawatan', tahunLulus: '2024', tempatKerja: 'Rumah Sakit Uji', whatsapp: '081234567890' }
function template(body = '{nama} / {nim} / {program_studi} / {tahun_lulus} / {tempat_kerja} / {nomor_surat} / {tanggal}') {
  const zip = new PizZip()
  zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
  zip.file('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
  zip.file('word/document.xml', `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>${body}</w:t></w:r></w:p><w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr></w:body></w:document>`)
  return zip.generate({ type: 'arraybuffer' })
}
describe('CSV alumni', () => {
  it('preserves leading-zero NIM and quoted commas', () => {
    const result = parseCsv('\uFEFF' + headers + '"Alumni, Uji",00123,Keperawatan,2024,"RS, Uji",081234567890')
    expect(result.alumni[0]).toMatchObject({ nama: 'Alumni, Uji', nim: '00123', tempatKerja: 'RS, Uji' })
  })
  it('accepts semicolons and optional WhatsApp', () => {
    const result = parseCsv('nama;nim;prodi;tahun_lulus;tempat_kerja\nUji;001;Ners;2023;RS Uji')
    expect(result.alumni).toHaveLength(1); expect(result.warnings).toHaveLength(1)
  })
  it('skips duplicates and empty identities without merging different alumni', () => {
    const result = parseCsv(headers + 'Uji,001,Ners,2023,RS,\nDuplikat,001,Ners,2024,RS,\n,002,Ners,2024,RS,\nLain,003,Ners,2024,RS,')
    expect(result.alumni.map(a => a.nim)).toEqual(['001', '003']); expect(result.skipped).toBe(2)
  })
  it('rejects missing required columns and malformed rows', () => {
    expect(() => parseCsv('Nama,NIM\nA,1')).toThrow('Kolom wajib')
    expect(() => parseCsv(headers + 'A,1,Ners')).toThrow('CSV tidak valid')
  })
  it('rejects duplicate normalized headers to avoid ambiguous mapping', () => {
    expect(() => parseCsv('Nama,Nama,NIM,Program Studi,Tahun Lulus,Tempat Kerja\nA,B,1,Ners,2024,RS')).toThrow('Header CSV duplikat')
  })
  it('warns about incomplete employment data and prevents generation', () => {
    const result = parseCsv(headers + 'Uji,1,Ners,2024,,')
    expect(result.warnings.join(' ')).toContain('belum lengkap')
    expect(() => validateAlumni(result.alumni[0]!)).toThrow('Lengkapi')
  })
})
describe('Word documents', () => {
  it('fills one alumni, escapes XML, and retains formatting and page dimensions', () => {
    const bytes = createDocument(template(), alumni, '123/UNISA/XI/2026', '8 November 2026')
    const xml = new PizZip(bytes).file('word/document.xml')!.asText()
    expect(xml).toContain('Alumni Uji &amp; Rekan'); expect(xml).toContain('001234')
    expect(xml).toContain('123/UNISA/XI/2026'); expect(xml).toContain('<w:b/>')
    expect(xml).toContain('w:w="11906"'); expect(xml).not.toContain('{nama}')
  })
  it('rejects templates without identity placeholders', () => {
    expect(() => createDocument(template('{nama}'), alumni, '', '')).toThrow('wajib memuat')
    expect(() => createDocument(template('{nim}'), alumni, '', '')).toThrow('wajib memuat')
  })
  it('rejects corrupt documents and incomplete data', () => {
    expect(() => createDocument(new ArrayBuffer(0), alumni, '', '')).toThrow()
    expect(() => createDocument(template(), { ...alumni, tahunLulus: 'abc' }, '', '')).toThrow('Lengkapi')
  })
  it('makes separate identifiable files in a ZIP', async () => {
    const second = { ...alumni, nama: 'Alumni Kedua', nim: '002345' }, zip = new JSZip()
    for (const a of [alumni, second]) zip.file(documentName(a, 'docx'), createDocument(template(), a, '', ''))
    const archive = await JSZip.loadAsync(await zip.generateAsync({ type: 'uint8array' }))
    expect(Object.keys(archive.files)).toHaveLength(2)
    const xml = new PizZip(await archive.file(documentName(second, 'docx'))!.async('uint8array')).file('word/document.xml')!.asText()
    expect(xml).toContain('Alumni Kedua'); expect(xml).not.toContain(alumni.nim)
  })
  it('sanitizes filename separators', () => expect(documentName({ ...alumni, nama: '../A:B' }, 'docx')).not.toMatch(/[/:]/))
})
describe('WhatsApp', () => {
  it('normalizes local and international numbers', () => {
    expect(normalizePhone('0812-3456-7890')).toBe('6281234567890')
    expect(normalizePhone('+62 812 3456 7890')).toBe('6281234567890')
  })
  it('rejects malformed or missing numbers', () => {
    for (const value of ['', '123', 'abc081234567890', '++6281234567890']) expect(normalizePhone(value)).toBeNull()
  })
  it('encodes recipient name and message without auto-sending', () => {
    const link = new URL(whatsappLink(alumni)!)
    expect(link.hostname).toBe('wa.me'); expect(link.pathname).toBe('/6281234567890')
    expect(link.searchParams.get('text')).toContain(alumni.nama)
    expect(whatsappLink({ ...alumni, whatsapp: '' })).toBeNull()
  })
})

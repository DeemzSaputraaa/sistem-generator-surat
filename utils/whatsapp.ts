import type { Alumni } from '../types/alumni'
export function normalizePhone(input: string): string | null {
  if (/[^\d+\s().-]/.test(input)) return null
  let phone = input.replace(/[\s().-]/g, '').replace(/^\+/, '')
  if (phone.startsWith('0')) phone = '62' + phone.slice(1)
  if (!/^[1-9]\d{7,14}$/.test(phone)) return null
  return phone
}
export function whatsappLink(alumni: Alumni): string | null {
  const phone = normalizePhone(alumni.whatsapp)
  if (!phone) return null
  const caption = `Yth. Saudara/i ${alumni.nama},\n\nBerikut kami sampaikan surat pengantar Tracer Study dari Universitas 'Aisyiyah Yogyakarta.\n\nMohon kesediaannya untuk memperhatikan informasi dalam surat tersebut.\n\nTerima kasih.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(caption)}`
}

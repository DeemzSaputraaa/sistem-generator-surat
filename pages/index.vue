<script setup lang="ts">
import type { Alumni } from '~/types/alumni'
import { parseCsv } from '~/utils/csv-parser'
import { placeholders, createDocument } from '~/utils/document-generator'
definePageMeta({ middleware: 'auth' })
const alumni = ref<Alumni[]>([]), warnings = ref<string[]>([]), selected = ref<string[]>([])
const query = ref(''), prodi = ref(''), year = ref(''), page = ref(1)
const filename = ref(''), templateName = ref(''), template = shallowRef<ArrayBuffer | null>(null)
const error = ref(''), message = ref(''), importing = ref(false), detail = ref<Alumni | null>(null), generating = ref<Alumni[] | null>(null)
const pdfEnabled = ref(false), showSettings = ref(false)
const { data: session } = await useFetch('/api/auth/session')
pdfEnabled.value = session.value?.pdfEnabled || false
onMounted(async () => {
  try {
    const bytes = await $fetch<ArrayBuffer>('/api/template', { responseType: 'arrayBuffer' })
    // A manually selected template takes precedence if the download finishes later.
    if (!template.value) {
      template.value = bytes
      templateName.value = 'draft-surat-pengantar-tracer-study.docx (bawaan)'
    }
  } catch {
    error.value = 'Template bawaan gagal dimuat. Muat ulang halaman atau unggah DOCX melalui Template surat.'
  }
})
const programs = computed(() => [...new Set(alumni.value.map(a => a.prodi))].filter(Boolean).sort())
const years = computed(() => [...new Set(alumni.value.map(a => a.tahunLulus))].filter(Boolean).sort().reverse())
const filtered = computed(() => alumni.value.filter(a => (!query.value || `${a.nama} ${a.nim}`.toLowerCase().includes(query.value.toLowerCase().trim())) && (!prodi.value || a.prodi === prodi.value) && (!year.value || a.tahunLulus === year.value)))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 15)))
const visible = computed(() => filtered.value.slice((page.value - 1) * 15, page.value * 15))
const allVisible = computed(() => visible.value.length > 0 && visible.value.every(a => selected.value.includes(a.nim)))
watch([query, prodi, year], () => { page.value = 1 })
function togglePage() {
  const ids = visible.value.map(a => a.nim)
  selected.value = allVisible.value ? selected.value.filter(id => !ids.includes(id)) : [...new Set([...selected.value, ...ids])]
}
async function uploadCsv(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  if (!file) return
  error.value = ''; message.value = ''; importing.value = true
  try {
    await $fetch('/api/auth/session')
    if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Pilih file dengan ekstensi .csv.')
    if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran CSV maksimal 10 MB.')
    const result = parseCsv(await file.text())
    alumni.value = result.alumni; warnings.value = result.warnings; filename.value = file.name
    selected.value = []; page.value = 1; query.value = ''; prodi.value = ''; year.value = ''
    message.value = `${result.alumni.length} alumni berhasil diimpor${result.skipped ? `, ${result.skipped} baris dilewati` : ''}.`
  } catch (e: any) { error.value = e.data?.statusMessage || e.message }
  finally { importing.value = false; input.value = '' }
}
async function uploadTemplate(event: Event) {
  const input = event.target as HTMLInputElement, file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    if (!file.name.endsWith('.docx') || file.size > 3 * 1024 * 1024) throw new Error('Template harus berupa DOCX, maksimal 3 MB.')
    const bytes = await file.arrayBuffer()
    createDocument(bytes, { nama: 'Validasi Template', nim: 'TEST-NIM-001', prodi: 'Program Studi', tahunLulus: '2024', tempatKerja: 'Instansi', whatsapp: '' }, '', '1 Januari 2026')
    template.value = bytes; templateName.value = file.name; message.value = 'Template berhasil dimuat dan divalidasi.'
  } catch (e: any) { error.value = `Template tidak dapat digunakan: ${e.message}` }
  finally { input.value = '' }
}
function saveDetail(updated: Alumni) {
  const i = alumni.value.findIndex(a => a.nim === updated.nim)
  if (i >= 0) alumni.value[i] = { ...updated }
  detail.value = null; message.value = 'Data alumni diperbarui untuk sesi ini.'
}
function prepare(items?: Alumni[]) {
  error.value = ''; message.value = ''
  if (!template.value) { showSettings.value = true; error.value = 'Unggah template surat resmi DOCX terlebih dahulu.'; return }
  const targets = items || alumni.value.filter(a => selected.value.includes(a.nim))
  if (!targets.length || targets.length > 50) { error.value = 'Pilih 1–50 alumni untuk satu proses pembuatan surat.'; return }
  generating.value = targets.map(a => ({ ...a })); detail.value = null
}
function detailGenerate(a: Alumni) { saveDetail(a); prepare([a]) }
async function logout() {
  try { await $fetch('/api/auth/logout', { method: 'POST' }); alumni.value = []; template.value = null; selected.value = []; await navigateTo('/login') }
  catch { error.value = 'Gagal keluar. Periksa koneksi lalu coba lagi.' }
}
function done(count: number) { generating.value = null; message.value = `${count} surat berhasil dibuat. Lampirkan file yang diunduh secara manual saat mengirim WhatsApp.` }
</script>
<template>
  <div><AppHeader @logout="logout" /><main class="workspace">
    <div class="breadcrumb">Administrasi <span>/</span> Surat pengantar</div>
    <section class="page-heading"><div><span class="eyebrow">TRACER STUDY</span><h1>Surat pengantar alumni<span class="accent-dot">.</span></h1><p class="muted">Dari data alumni menjadi surat yang siap dikirim.</p></div><button class="btn secondary" @click="showSettings = !showSettings">⚙ Template surat</button></section>
    <section class="workflow-strip" aria-label="Tahapan kerja"><div><span class="step-number">01</span><strong>Impor data</strong><small>Unggah CSV Tracer Study</small></div><span class="step-line" /><div><span class="step-number">02</span><strong>Pilih alumni</strong><small>Periksa informasi penerima</small></div><span class="step-line" /><div><span class="step-number">03</span><strong>Siapkan surat</strong><small>Unduh Word atau PDF</small></div></section>
    <p v-if="error" class="notice error mb-5" role="alert">{{ error }}</p><p v-if="message" class="notice success mb-5" role="status">{{ message }}</p>
    <section v-if="showSettings" class="panel template-panel mb-6"><div><span class="eyebrow">TEMPLATE RESMI</span><h2>Gunakan format surat Anda</h2><p class="muted text-sm mt-2">Template resmi bawaan dimuat otomatis setelah login. Anda dapat menggantinya dengan DOCX lain untuk sesi ini.</p><p class="text-sm mt-3">Placeholder: <code v-for="p in placeholders" :key="p">{{ '{' + p + '}' }}</code></p><p class="muted text-xs mt-3">Wajib memuat {nama} dan {nim}. Nomor surat diisi manual; tidak dibuat otomatis. Template pengganti hanya berlaku selama sesi ini.</p><p class="muted text-xs mt-2">PDF: {{ pdfEnabled ? 'layanan konversi sudah dikonfigurasi' : 'belum aktif — isi environment layanan Gotenberg untuk mengaktifkan' }}.</p></div><label class="btn secondary cursor-pointer">{{ templateName ? 'Ganti template' : 'Unggah DOCX ↑' }}<input class="sr-only" type="file" accept=".docx" @change="uploadTemplate" /></label><p v-if="templateName" class="text-sm text-teal-700 break-all">✓ {{ templateName }}</p></section>
    <section class="import-card"><div class="file-symbol">CSV</div><div class="flex-1"><h2>{{ filename || 'Mulai dengan data alumni' }}</h2><p class="muted text-sm mt-1">{{ filename ? `${alumni.length} alumni dimuat · Impor ulang akan mengganti data sesi ini.` : 'Unggah data-tracer-study.csv untuk menampilkan daftar alumni.' }}</p><p class="muted text-xs mt-2">CSV · Maks. 10 MB / 20.000 baris · Data hanya tersimpan selama sesi</p></div><label class="btn primary cursor-pointer" :class="{ 'opacity-50 pointer-events-none': importing }">{{ importing ? 'Membaca…' : filename ? 'Ganti CSV ↑' : 'Impor CSV ↑' }}<input class="sr-only" type="file" accept=".csv,text/csv" :disabled="importing" @change="uploadCsv" /></label></section>
    <details v-if="warnings.length" class="notice mt-4"><summary class="cursor-pointer font-medium">Catatan impor ({{ warnings.length }})</summary><ul class="list-disc pl-5 mt-2 text-sm"><li v-for="warning in warnings" :key="warning">{{ warning }}</li></ul></details>
    <section class="panel data-panel"><div class="section-heading"><div class="flex items-center gap-3"><h2>Daftar alumni</h2><span class="count-chip">{{ alumni.length }}</span></div><span class="muted text-xs">{{ templateName ? '✓ Template siap' : 'Template belum dimuat' }}</span></div>
      <div class="filters"><div class="search-wrap"><span aria-hidden="true">⌕</span><input v-model="query" aria-label="Cari nama atau NIM" placeholder="Cari nama atau NIM alumni…" /></div><select v-model="prodi" aria-label="Filter program studi"><option value="">Semua program studi</option><option v-for="p in programs" :key="p">{{ p }}</option></select><select v-model="year" aria-label="Filter tahun lulus"><option value="">Semua tahun</option><option v-for="y in years" :key="y">{{ y }}</option></select></div>
      <div v-if="selected.length" class="selection-bar"><span><strong>{{ selected.length }} alumni dipilih</strong> · Maksimal 50 per proses</span><button class="text-button" @click="selected = []">Batalkan pilihan</button><button class="btn primary small" :disabled="selected.length > 50" @click="prepare()">Buat surat terpilih →</button></div>
      <div v-if="!alumni.length" class="empty-state"><div class="empty-icon">↥</div><h3>Data alumni akan tampil di sini</h3><p>Impor CSV untuk mulai mencari alumni dan menyiapkan surat.</p><div class="schema-example"><span>KOLOM CSV YANG DIBUTUHKAN</span><p>Nama · NIM · Program Studi · Tahun Lulus · Tempat Kerja</p><small>Nomor WhatsApp opsional dan dapat dilengkapi nanti.</small></div></div>
      <div v-else-if="!filtered.length" class="empty-state"><h3>Tidak ada alumni yang sesuai</h3><p>Coba nama, NIM, atau filter lain.</p><button class="btn secondary mt-4" @click="query = ''; prodi = ''; year = ''">Reset pencarian</button></div>
      <div v-else class="table-scroll"><table><thead><tr><th class="checkbox-cell"><input type="checkbox" aria-label="Pilih semua alumni di halaman ini" :checked="allVisible" @change="togglePage" /></th><th>Nama / NIM</th><th>Program studi</th><th>Tahun lulus</th><th>Tempat kerja</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody><tr v-for="a in visible" :key="a.nim" :class="{ 'selected-row': selected.includes(a.nim) }"><td class="checkbox-cell"><input v-model="selected" type="checkbox" :value="a.nim" :aria-label="'Pilih ' + a.nama" /></td><td><button class="name-button" @click="detail = a">{{ a.nama }}</button><span class="nim">{{ a.nim }}</span></td><td>{{ a.prodi || 'Belum diisi' }}</td><td><span class="year-tag">{{ a.tahunLulus || '—' }}</span></td><td>{{ a.tempatKerja || 'Belum diisi' }}</td><td><button class="text-button whitespace-nowrap" @click="detail = a">Detail ↗</button></td></tr></tbody></table></div>
      <div class="table-footer"><span>{{ filtered.length ? (page - 1) * 15 + 1 : 0 }}–{{ Math.min(page * 15, filtered.length) }} dari {{ filtered.length }} alumni</span><div class="flex items-center gap-3"><button class="icon-button" aria-label="Halaman sebelumnya" :disabled="page <= 1" @click="page--">←</button><span>{{ page }} / {{ totalPages }}</span><button class="icon-button" aria-label="Halaman berikutnya" :disabled="page >= totalPages" @click="page++">→</button></div></div>
    </section>
    <footer class="workspace-footer"><span>Universitas 'Aisyiyah Yogyakarta</span><span>Data bersifat sementara. Muat ulang halaman memerlukan impor kembali.</span></footer>
  </main><AlumniDetail v-if="detail" :alumni="detail" @close="detail = null" @save="saveDetail" @generate="detailGenerate" /><GenerateDialog v-if="generating && template" :alumni="generating" :template="template" :pdf-enabled="pdfEnabled" @close="generating = null" @done="done" /></div>
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import type { Alumni } from '~/types/alumni'
import { createDocument, documentName, downloadBlob, validateAlumni, DOCX_MIME } from '~/utils/document-generator'
import { convertToPdf } from '~/utils/pdf-generator'
useModalFocus()
const props = defineProps<{ alumni: Alumni[]; template: ArrayBuffer; pdfEnabled: boolean }>()
const emit = defineEmits<{ close: []; done: [count: number] }>()
const format = ref('docx'), busy = ref(false), progress = ref(0), error = ref(''), checked = ref(false)
const date = ref(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }))
const numbers = ref<Record<string, string>>({})
const invalid = computed(() => props.alumni.filter(a => { try { validateAlumni(a); return false } catch { return true } }))
async function generate() {
  error.value = ''; progress.value = 0; busy.value = true
  try {
    await $fetch('/api/auth/session')
    if (!checked.value || invalid.value.length || props.alumni.length > 50) throw new Error('Periksa data dan pilih maksimal 50 alumni.')
    const zip = new JSZip(), usedNames = new Set<string>()
    const tanggal = new Date(date.value + 'T12:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    for (const alumni of props.alumni) {
      const bytes = createDocument(props.template, alumni, numbers.value[alumni.nim] || '', tanggal)
      const blob = format.value === 'pdf' ? await convertToPdf(bytes) : new Blob([new Uint8Array(bytes)], { type: DOCX_MIME })
      let name = documentName(alumni, format.value)
      if (usedNames.has(name)) name = `${progress.value + 1}_${name}`
      usedNames.add(name)
      if (props.alumni.length === 1) downloadBlob(blob, name)
      else zip.file(name, await blob.arrayBuffer())
      progress.value++
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    if (props.alumni.length > 1) downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), `Surat_Tracer_Study_${date.value}.zip`)
    emit('done', props.alumni.length)
  } catch (e: any) { error.value = e.data?.statusMessage || e.message || 'Dokumen gagal dibuat. Periksa template.' }
  finally { busy.value = false }
}
</script>
<template><div class="modal-overlay" @click.self="!busy && emit('close')"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="generate-title" @keydown.esc="!busy && emit('close')"><div class="flex justify-between items-start"><div><span class="eyebrow">TINJAU & UNDUH</span><h2 id="generate-title">Siapkan {{ alumni.length }} surat</h2></div><button autofocus class="icon-button" aria-label="Tutup" :disabled="busy" @click="emit('close')">×</button></div><p class="muted mt-2">Satu alumni, satu dokumen. {{ alumni.length > 1 ? 'Semua surat akan dikemas dalam ZIP.' : 'Dokumen siap diunduh setelah dibuat.' }}</p><form @submit.prevent="generate"><fieldset :disabled="busy"><div class="review-list"><div v-for="a in alumni" :key="a.nim" class="review-item"><strong>{{ a.nama }}</strong><span>{{ a.nim }} · {{ a.prodi }} · {{ a.tahunLulus }}</span><span>{{ a.tempatKerja || 'Tempat kerja belum diisi' }}</span><label :for="'number-' + a.nim" class="mt-2">Nomor surat (opsional)</label><input :id="'number-' + a.nim" v-model.trim="numbers[a.nim]" placeholder="Isi nomor resmi jika sudah tersedia" maxlength="150" /></div></div><div class="field-grid"><div><label for="date">Tanggal surat</label><input id="date" v-model="date" type="date" required /></div><div><label for="format">Format dokumen</label><select id="format" v-model="format"><option value="docx">Word (.docx)</option><option value="pdf" :disabled="!pdfEnabled">PDF (.pdf){{ !pdfEnabled ? ' — belum dikonfigurasi' : '' }}</option></select></div></div><p v-if="format === 'pdf'" class="notice mt-4">Untuk konversi PDF, dokumen dikirim sementara ke layanan konversi yang dikonfigurasi pengelola.</p><p v-if="invalid.length" class="notice error mt-4">Lengkapi data {{ invalid.map(a => a.nama).join(', ') }} melalui detail alumni terlebih dahulu.</p><label class="check-label mt-5"><input v-model="checked" type="checkbox" required />Saya telah memeriksa data alumni dan template surat resmi.</label></fieldset><p v-if="error" class="notice error mt-4" role="alert">{{ error }}</p><div v-if="busy" class="mt-4" role="status"><progress :value="progress" :max="alumni.length" class="w-full" /><p class="muted text-sm">Memproses {{ progress }} dari {{ alumni.length }} surat…</p></div><div class="modal-actions"><button type="button" class="btn secondary" :disabled="busy" @click="emit('close')">Batal</button><button class="btn primary" :disabled="busy || !checked || !!invalid.length || alumni.length > 50">{{ busy ? 'Sedang menyiapkan…' : 'Buat & unduh surat ↓' }}</button></div></form></section></div></template>

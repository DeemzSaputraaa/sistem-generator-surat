<script setup lang="ts">
import type { Alumni } from '~/types/alumni'
import { whatsappLink } from '~/utils/whatsapp'
useModalFocus()
const props = defineProps<{ alumni: Alumni }>()
const emit = defineEmits<{ close: []; save: [alumni: Alumni]; generate: [alumni: Alumni] }>()
const draft = ref({ ...props.alumni })
const link = computed(() => whatsappLink(draft.value))
const fields: { key: keyof Alumni; label: string }[] = [{ key: 'nama', label: 'Nama lengkap' }, { key: 'nim', label: 'NIM' }, { key: 'prodi', label: 'Program studi' }, { key: 'tahunLulus', label: 'Tahun lulus' }, { key: 'tempatKerja', label: 'Tempat kerja' }, { key: 'whatsapp', label: 'Nomor WhatsApp' }]
</script>
<template><div class="modal-overlay" @click.self="emit('close')"><section role="dialog" aria-modal="true" aria-labelledby="detail-title" class="modal" @keydown.esc="emit('close')"><div class="flex justify-between items-start"><div><span class="eyebrow">PERIKSA DATA ALUMNI</span><h2 id="detail-title">Detail alumni</h2></div><button autofocus class="icon-button" aria-label="Tutup detail" @click="emit('close')">×</button></div><form @submit.prevent="emit('save', draft)"><div class="field-grid mt-5"><div v-for="field in fields" :key="field.key"><label :for="field.key">{{ field.label }}</label><input :id="field.key" v-model.trim="draft[field.key]" :readonly="field.key === 'nim'" :required="field.key !== 'whatsapp'" :maxlength="field.key === 'whatsapp' ? 25 : 200" /></div></div><p class="muted text-xs mt-4">Perubahan hanya berlaku selama sesi ini. NIM digunakan sebagai identitas unik.</p><div class="modal-actions"><button class="btn secondary" type="submit">Simpan perubahan</button><button class="btn primary" type="button" @click="emit('generate', draft)">Siapkan surat →</button></div></form><div class="wa-section"><a v-if="link" :href="link" target="_blank" rel="noopener noreferrer" class="text-button">Buka WhatsApp ↗</a><p v-else class="muted text-sm">Isi nomor WhatsApp yang valid, misalnya 081234567890.</p><p class="muted text-xs mt-2">Unduh surat terlebih dahulu, lalu lampirkan secara manual di WhatsApp.</p></div></section></div></template>

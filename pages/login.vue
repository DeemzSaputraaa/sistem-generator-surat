<script setup lang="ts">
const password = ref(''), busy = ref(false), error = ref('')
async function login() {
  busy.value = true; error.value = ''
  try { await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } }); password.value = ''; await navigateTo('/') }
  catch (e: any) { error.value = e.data?.statusMessage || 'Tidak dapat masuk. Periksa koneksi dan konfigurasi server.' }
  finally { busy.value = false }
}
</script>
<template>
  <main class="login-page">
    <section class="login-story">
      <div class="brand"><span class="brand-mark">t.</span><span>tracer<span class="font-normal opacity-70">letter</span></span></div>
      <div><span class="eyebrow text-teal-200">UNIVERSITAS 'AISYIYAH YOGYAKARTA</span><h1>Langkah kecil.<br />Koneksi yang<br /><em>terus berarti.</em></h1><p>Ruang kerja untuk menyiapkan surat pengantar Tracer Study dan menjaga hubungan dengan alumni.</p></div>
      <span class="text-sm opacity-60">Administrasi alumni · Tracer Study</span>
    </section>
    <section class="login-form-wrap"><form class="login-form" @submit.prevent="login">
      <span class="eyebrow">RUANG ADMINISTRASI</span><h2>Selamat datang kembali</h2><p class="muted mb-8">Masuk untuk mulai menyiapkan surat alumni.</p>
      <label for="password">Password admin</label><input id="password" v-model="password" type="password" autocomplete="current-password" required placeholder="Masukkan password" :disabled="busy" />
      <p v-if="error" class="notice error mt-4" role="alert">{{ error }}</p>
      <button class="btn primary w-full mt-6" :disabled="busy">{{ busy ? 'Memeriksa…' : 'Masuk ke ruang kerja →' }}</button>
      <p class="text-sm muted mt-8 leading-relaxed">Akses terbatas untuk admin. Data alumni diproses sementara dan tidak disimpan dalam database.</p>
    </form></section>
  </main>
</template>

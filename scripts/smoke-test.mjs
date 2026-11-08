import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import PizZip from 'pizzip'
import JSZip from 'jszip'

const password = randomBytes(24).toString('hex'), base = 'http://localhost:4311'
const child = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: { ...process.env, PORT: '4311', HOST: 'localhost', NUXT_ADMIN_PASSWORD: password, NUXT_SESSION_SECRET: randomBytes(32).toString('hex'), NUXT_GOTENBERG_URL: '' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
let logs = ''
child.stdout.on('data', data => { logs += data })
child.stderr.on('data', data => { logs += data })
let browser
try {
  let ready = false
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base + '/login')).ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  assert(ready, 'Server failed to start: ' + logs)
  assert.equal((await fetch(base + '/api/auth/session')).status, 401)
  assert.equal((await fetch(base + '/api/template')).status, 401)
  assert.equal((await fetch(base + '/', { redirect: 'manual' })).status, 302)
  const login = (body, origin = base) => fetch(base + '/api/auth/login', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  assert.equal((await login({ password }, 'https://outside.invalid')).status, 403)
  assert.equal((await login({ password: 'wrong' })).status, 401)
  const result = await login({ password })
  assert.equal(result.status, 200)
  const setCookie = result.headers.get('set-cookie')
  assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /Secure/i); assert.match(setCookie, /SameSite=Strict/i)
  const cookie = result.headers.getSetCookie().filter(c => c.startsWith('tracer-session=')).at(-1).split(';')[0]
  assert.equal((await fetch(base + '/api/auth/session', { headers: { cookie } })).status, 200)
  assert.equal((await fetch(base + '/api/convert', { method: 'POST', headers: { origin: base } })).status, 401)
  assert.equal((await fetch(base + '/api/convert', { method: 'POST', headers: { origin: base, cookie } })).status, 503)
  const html = await (await fetch(base + '/', { headers: { cookie } })).text()
  assert(!html.includes(password), 'Password must never appear in HTML')
  console.log('PASS HTTP: protected routes, login, cookies, CSRF, PDF access, secret isolation')

  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(base)
  await page.getByLabel('Password admin').fill(password)
  await page.getByRole('button', { name: 'Masuk ke ruang kerja' }).click()
  await page.getByRole('heading', { name: 'Surat pengantar alumni' }).waitFor()
  const csv = 'Nama,NIM,Program Studi,Tahun Lulus,Tempat Kerja,Nomor WhatsApp\nAlumni Uji,001234,Keperawatan,2024,RS Contoh,081234567890\nAlumni Kedua,005678,Fisioterapi,2023,Klinik Contoh,\n'
  await page.locator('input[type=file][accept*="csv"]').setInputFiles({ name: 'data-tracer-study.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  await page.getByRole('button', { name: 'Alumni Uji', exact: true }).waitFor()
  assert.equal(await page.locator('tbody tr').count(), 2)
  await page.getByLabel('Cari nama atau NIM').fill('001234')
  assert.equal(await page.locator('tbody tr').count(), 1)
  await page.getByLabel('Cari nama atau NIM').fill('')
  await page.getByLabel('Filter program studi').selectOption('Fisioterapi')
  assert.equal(await page.locator('tbody tr').count(), 1)
  await page.getByLabel('Filter program studi').selectOption('')
  await page.getByRole('button', { name: 'Alumni Uji', exact: true }).click()
  assert.match(await page.getByRole('link', { name: 'Buka WhatsApp' }).getAttribute('href'), /^https:\/\/wa.me\/6281234567890\?text=/)
  await page.getByLabel('Tempat kerja', { exact: true }).fill('RS Diperbarui')
  await page.getByRole('button', { name: 'Simpan perubahan' }).click()
  await page.getByText('RS Diperbarui', { exact: true }).waitFor()

  await page.getByText('✓ Template siap', { exact: true }).waitFor()
  await page.getByLabel('Pilih Alumni Uji', { exact: true }).check()
  await page.getByRole('button', { name: 'Buat surat terpilih' }).click()
  await page.getByLabel('Saya telah memeriksa').check()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Buat & unduh surat' }).click()
  const download = await downloadPromise
  assert.match(download.suggestedFilename(), /001234.docx$/)
  const xml = new PizZip(await readFile(await download.path())).file('word/document.xml').asText()
  assert(xml.includes('Alumni Uji') && xml.includes('RS Diperbarui'))
  assert(xml.replace(/<[^>]+>/g, '').includes('Tracer Pengguna Lulusan'))
  await page.getByLabel('Pilih Alumni Kedua', { exact: true }).check()
  await page.getByRole('button', { name: 'Buat surat terpilih' }).click()
  await page.getByLabel('Saya telah memeriksa').check()
  const batchPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Buat & unduh surat' }).click()
  const batch = await batchPromise
  const archive = await JSZip.loadAsync(await readFile(await batch.path()))
  assert.equal(Object.keys(archive.files).length, 2)
  await mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true })
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.screenshot({ path: 'test-results/tablet.png', fullPage: true })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Tablet page should not overflow')
  await page.reload()
  await page.getByRole('heading', { name: 'Data alumni akan tampil di sini' }).waitFor()
  await page.getByRole('button', { name: 'Keluar' }).click()
  await page.getByLabel('Password admin').waitFor()
  assert.equal((await page.request.get(base + '/api/auth/session')).status(), 401)
  assert.deepEqual(errors, [])
  console.log('PASS browser: login, CSV, search, filters, edit, WhatsApp, DOCX download, ZIP, tablet, refresh, logout; no browser errors')
  for (let i = 0; i < 10; i++) assert.equal((await login({ password: 'wrong' })).status, 401)
  assert.equal((await login({ password })).status, 429)
  console.log('PASS login attempt limiting')
} finally {
  await browser?.close()
  child.kill()
}

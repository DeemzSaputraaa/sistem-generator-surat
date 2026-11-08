import { randomBytes } from 'node:crypto'
import { writeFileSync, existsSync } from 'node:fs'
if (existsSync('.env')) {
  console.log('.env sudah tersedia, tidak diubah.')
} else {
  writeFileSync('.env', `# Kredensial lokal. Jangan commit atau bagikan file ini.\nNUXT_ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}\nNUXT_SESSION_SECRET=${randomBytes(32).toString('hex')}\nNUXT_GOTENBERG_URL=\nNUXT_GOTENBERG_USERNAME=\nNUXT_GOTENBERG_PASSWORD=\n`, { flag: 'wx' })
  console.log('.env dibuat dengan password dan session secret acak. Buka .env untuk melihat password admin.')
}

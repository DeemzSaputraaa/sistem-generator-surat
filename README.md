# Tracer Letter

Aplikasi internal Universitas 'Aisyiyah Yogyakarta untuk membuat surat pengantar Tracer Study. Nuxt 3, Vue 3, TypeScript, Tailwind CSS; tanpa database. Implementasi mengacu pada `prd.md`.

## Menjalankan lokal

1. Gunakan Node.js 22.22+ (atau Node.js 24 LTS) dan jalankan `npm ci`.
2. Jalankan `npm run setup:local` untuk membuat `.env` dengan password dan secret acak tanpa menimpa file yang sudah ada. Alternatif: salin `.env.example` menjadi `.env`, isi `NUXT_ADMIN_PASSWORD` dengan password kuat dan `NUXT_SESSION_SECRET` dengan secret acak minimal 32 karakter. Jangan commit `.env`.
3. Jalankan `npm run dev`, lalu buka URL lokal yang dicetak di terminal.
4. Login menggunakan password di `.env`.

Untuk membuat secret: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

## Alur penggunaan

1. Impor `data-tracer-study.csv`. Kolom wajib: `Nama,NIM,Program Studi,Tahun Lulus,Tempat Kerja`. `Nomor WhatsApp` opsional. UTF-8 disarankan; delimiter koma maupun titik koma dideteksi otomatis. Alias seperti `prodi`, `tahun_lulus`, `tempat_kerja`, dan `no hp` diterima.
2. NIM diperlakukan sebagai teks sehingga nol di depan dipertahankan. Baris tanpa nama/NIM dilewati. NIM duplikat memakai baris pertama. Kesalahan struktur CSV menolak impor tanpa menghapus data lama.
3. Cari nama/NIM dan filter prodi/tahun. Klik **Detail** untuk memeriksa atau melengkapi data dan nomor WhatsApp. Perubahan tidak menulis ulang CSV asli.
4. Template resmi bawaan otomatis dimuat setelah login. Buka **Template surat** jika ingin menggantinya dengan DOCX lain (maksimal 3 MB) untuk sesi tersebut. Nomor surat tetap diisi manual.
5. Pilih alumni (checkbox di header memilih halaman aktif). Pilihan tetap ada saat filter berganti; jumlah pilihan keseluruhan selalu ditampilkan. Maksimal 50 alumni per proses.
6. Periksa data pada dialog, isi tanggal dan nomor surat resmi bila tersedia, pilih Word/PDF, lalu unduh. Satu alumni menghasilkan satu file; beberapa alumni menghasilkan ZIP berisi file terpisah.
7. Buka WhatsApp dari detail. Caption terisi otomatis, tetapi **lampirkan file dan kirim pesan secara manual**.

Contoh CSV sintetis (bukan data alumni nyata):

```csv
Nama,NIM,Program Studi,Tahun Lulus,Tempat Kerja,Nomor WhatsApp
Alumni Uji,001234,Keperawatan,2024,Rumah Sakit Contoh,
```

Impor dibatasi 10 MB / 20.000 baris. Data hanya berada di memori browser, hilang saat refresh/logout. Tidak menggunakan localStorage, database, atau folder publik untuk CSV.

## Template Word

Letakkan placeholder berikut langsung pada template Word. Gaya paragraf, kop, tabel, gambar, serta ukuran halaman mengikuti DOCX asli:

| Placeholder | Sumber |
| --- | --- |
| `{nama}` | Nama lengkap (wajib ada di template) |
| `{nim}` | NIM (wajib ada di template) |
| `{program_studi}` | Program studi |
| `{tahun_lulus}` | Tahun lulus |
| `{tempat_kerja}` | Instansi/perusahaan |
| `{nomor_whatsapp}` | Nomor kontak, boleh kosong |
| `{tanggal}` | Tanggal pilihan admin, format Indonesia |
| `{nomor_surat}` | Nomor resmi yang diisi admin per alumni, boleh kosong |

Template bawaan berada di `server/assets/templates/draft-surat-pengantar-tracer-study.docx` dan disajikan melalui `/api/template` yang memerlukan login. Salinan ini berasal dari draft Word yang diberikan; data contoh pada tanggal, nomor surat, direktur instansi, dan baris alumni sudah diganti placeholder. Isi surat, tautan kuesioner, kop, serta gambar tetap mengikuti draft. File asli di root tidak diubah dan tetap diabaikan Git. Untuk menyiapkan ulang salinan dari draft dengan struktur yang sama, jalankan `node scripts/prepare-template.mjs`. Script akan menolak struktur yang tidak cocok; template pengganti berstruktur lain dapat disiapkan manual menggunakan placeholder berikut. Template pengganti yang diunggah melalui UI hanya berlaku selama sesi. Placeholder lain/ekspresi tidak didukung. Placeholder wajib harus berada di badan surat. Dokumen gagal bila identitas atau data wajib belum lengkap. Alumni tanpa pekerjaan perlu keputusan admin atas isi surat; aplikasi tidak mengisi instansi fiktif.

## PDF dengan Gotenberg

PDF dikonversi dari DOCX yang sama menggunakan LibreOffice melalui [Gotenberg](https://gotenberg.dev/docs/getting-started/routes), bukan mengganti ekstensi atau mencetak HTML. Ini mempertahankan struktur Word sebaik mesin LibreOffice. Font yang berbeda dapat mengubah tata letak; pasang font template pada layanan konversi dan bandingkan hasil dengan surat resmi sebelum digunakan.

Untuk lokal:

```sh
docker compose up -d
```

Isi `NUXT_GOTENBERG_URL=http://127.0.0.1:3001` lalu restart Nuxt. Untuk produksi, jalankan Gotenberg di host/container terpisah dan arahkan `NUXT_GOTENBERG_URL` ke HTTPS layanan tersebut. Gunakan autentikasi Basic di reverse proxy dan isi `NUXT_GOTENBERG_USERNAME` / `NUXT_GOTENBERG_PASSWORD` di Vercel. Jangan arahkan ke layanan publik tanpa kontrol akses. Batasi akses jaringan keluar layanan konversi sesuai kebutuhan.

Dokumen yang dikonversi dikirim sementara dari browser melalui API Nuxt ke Gotenberg; CSV asli tidak dikirim. Pastikan pengelola layanan konversi tidak menyimpan isi dokumen. Tanpa URL layanan, PDF dinonaktifkan dengan keterangan jelas. Word dan ZIP tetap berfungsi. Batas DOCX untuk PDF 3 MB, timeout konversi 45 detik. Batch dikonversi berurutan agar tidak membanjiri layanan. Kegagalan batch tidak mengunduh ZIP parsial.

## Deployment Vercel

Konfigurasi mengikuti [panduan Nuxt di Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt).

1. Push source beserta `package-lock.json` ke repository privat. `.gitignore` mengecualikan `.env`, CSV, DOCX, PDF, ZIP, dan hasil build.
2. Import repository di Vercel, pilih preset **Nuxt.js**, Node.js 22.22+ / 24, build `npm run build`, install `npm ci`. Nitro memilih adapter Vercel otomatis.
3. Tambahkan `NUXT_ADMIN_PASSWORD` dan `NUXT_SESSION_SECRET` pada Environment Variables, serta variabel Gotenberg bila menggunakan PDF. Jangan memakai prefix `NUXT_PUBLIC_` untuk secret.
4. Deploy, uji login, DOCX, ZIP, serta PDF dengan template resmi. Jika menggunakan PDF, sediakan durasi function setidaknya 60 detik dalam pengaturan project Vercel.
5. Atur Vercel Firewall rate limiting untuk `/api/auth/login` guna melindungi percobaan login lintas instance.

Belum ada deployment/domain Vercel yang dibuat dari workspace ini. Kredensial proyek Vercel dan layanan konversi produksi belum diberikan. Template resmi sudah diintegrasikan.

## Keamanan dan verifikasi

- Password hanya diperiksa di server, perbandingan hash waktu konstan. Sesi terenkripsi HttpOnly, SameSite Strict, Secure pada produksi, berumur 8 jam. Mengganti password membatalkan validitas sesi lama.
- Mutasi API memeriksa Origin; API konversi memerlukan sesi admin. Respons menggunakan `Cache-Control: no-store`. Logout menghapus cookie dan state halaman. Seperti sesi cookie stateless umumnya, logout tidak mencabut salinan cookie yang sudah dicuri; rotasi secret membatalkan seluruh sesi.
- Pembatasan login lokal: 10 kegagalan/IP/15 menit **per instance**, bukan pembatasan global serverless. Gunakan Firewall Vercel untuk batas global.
- Tidak ada analitik, penyimpanan alumni server, pengiriman WhatsApp otomatis, atau pembuatan nomor surat otomatis.

```sh
npm test
npm run typecheck
npm run build
npm run test:smoke
```

Tes mencakup CSV (BOM, delimiter, duplikat, data kosong, NIM nol depan), DOCX (placeholder, escaping XML, format, satu penerima/file), ZIP dan WhatsApp. Smoke test menjalankan build produksi pada port 4311 dengan kredensial acak khusus pengujian, memeriksa autentikasi/CSRF/rate limiting, lalu menguji alur browser serta hasil unduhan. Microsoft Edge diperlukan secara default; set `PLAYWRIGHT_CHANNEL=chrome` untuk Chrome. Screenshot desktop/tablet disimpan di `test-results/` (diabaikan Git). Server pengujian selalu dihentikan setelah selesai.

Pemeriksaan visual PDF terhadap template resmi baru dapat diselesaikan setelah layanan konversi tersedia. Docker Desktop harus berjalan sebelum `docker compose up -d`.

### Catatan dependensi Nuxt 3

PRD menetapkan Nuxt 3. Audit npm masih melaporkan advisory tingkat moderate/low untuk Nuxt 3 dan dependensi build yang perbaikannya memerlukan migrasi major atau belum tersedia. Aplikasi ini tidak memakai server islands, `useHeadSafe`, route rules untuk otorisasi, atau tautan Nuxt dinamis dari input pengguna. Otorisasi dilakukan langsung di handler server. Dev server hanya bind ke loopback; jangan membagikan dev server melalui tunnel karena advisory kebocoran bundle konfigurasi private di mode development. Gunakan build produksi untuk hosting. Jalankan `npm audit` sebelum rilis dan rencanakan migrasi Nuxt jika persyaratan framework dapat diperbarui.

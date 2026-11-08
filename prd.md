# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Tracer Study Letter Generator

**Versi:** 1.0\
**Status:** Draft\
**Platform:** Web Application\
**Deployment:** Vercel\
**Framework:** Nuxt 3 / Vue 3\
**Database:** Tidak menggunakan database

------------------------------------------------------------------------

# 1. Ringkasan Produk

## 1.1 Latar Belakang

Proses pembuatan surat pengantar Tracer Study alumni masih memerlukan
pengolahan data secara manual. Data alumni diperoleh dengan mengunduh
file CSV dari sistem Tracer Study karena aplikasi yang dikembangkan
tidak terintegrasi secara langsung dengan sistem tersebut.

Proses manual dalam mencari data alumni, memasukkan informasi ke dalam
template surat, membuat dokumen, dan mendistribusikannya melalui
WhatsApp berpotensi memerlukan waktu lebih lama serta menimbulkan
kesalahan pengisian data.

Oleh karena itu, diperlukan aplikasi berbasis web yang dapat membaca
data alumni dari file CSV dan menghasilkan surat pengantar secara
otomatis berdasarkan template surat resmi yang telah tersedia.

## 1.2 Tujuan Produk

Membangun aplikasi sederhana untuk membantu admin dalam:

1.  Membaca dan mengelola data alumni dari file CSV.
2.  Mencari alumni berdasarkan nama dan NIM.
3.  Menampilkan informasi pekerjaan alumni.
4.  Menghasilkan surat pengantar Tracer Study secara otomatis.
5.  Menghasilkan surat dalam format Word (.docx) dan PDF.
6.  Menghasilkan surat untuk satu maupun banyak alumni sekaligus.
7.  Mempermudah distribusi surat melalui WhatsApp.

## 1.3 Target Pengguna

**Admin**

Satu-satunya pengguna aplikasi yang memiliki akses untuk mengelola data
dan menghasilkan surat.

**Alumni**

Tidak memiliki akses ke aplikasi. Alumni hanya menerima surat melalui
WhatsApp yang dikirimkan oleh admin.

------------------------------------------------------------------------

# 2. Ruang Lingkup Produk

## 2.1 Fitur Utama

  No.   Fitur             Deskripsi
  ----- ----------------- ---------------------------------------------
  1     Login Admin       Membatasi akses aplikasi
  2     Import CSV        Mengunggah data Tracer Study
  3     Data Alumni       Membaca dan menampilkan data alumni
  4     Pencarian         Mencari alumni berdasarkan nama atau NIM
  5     Filter            Memfilter berdasarkan prodi dan tahun lulus
  6     Detail Alumni     Menampilkan informasi alumni
  7     Generate Surat    Menghasilkan surat berdasarkan template
  8     Generate Massal   Menghasilkan surat untuk beberapa alumni
  9     Export Word       Menghasilkan dokumen DOCX
  10    Export PDF        Menghasilkan dokumen PDF
  11    WhatsApp          Membuka chat dengan caption otomatis

## 2.2 Informasi Alumni

Data yang perlu dibaca oleh sistem:

  Field            Keterangan
  ---------------- -----------------------------------------------------
  Nama             Nama lengkap alumni
  NIM              Nomor Induk Mahasiswa
  Program Studi    Program studi alumni
  Tahun Lulus      Tahun kelulusan
  Tempat Kerja     Nama perusahaan atau instansi tempat alumni bekerja
  Nomor WhatsApp   Nomor kontak alumni

Nomor WhatsApp diperlukan untuk fitur distribusi surat. Jika kolom
tersebut tidak tersedia dalam CSV, admin perlu menyediakan sumber data
tambahan atau mengisi nomor secara manual.

------------------------------------------------------------------------

# 3. Alur Kerja Sistem

## 3.1 Alur Utama

1.  Admin membuka aplikasi.
2.  Admin melakukan login.
3.  Admin mengunggah file `data-tracer-study.csv`.
4.  Sistem membaca dan memvalidasi struktur CSV.
5.  Sistem menampilkan daftar alumni.
6.  Admin mencari atau memfilter alumni.
7.  Admin memilih satu atau beberapa alumni.
8.  Sistem menyiapkan data untuk pengisian template.
9.  Admin memilih format Word atau PDF.
10. Sistem menghasilkan surat.
11. Admin mengunduh surat atau mengirimkannya melalui WhatsApp.

## 3.2 Alur Generate Satu Surat

-   Admin memilih satu alumni.
-   Sistem menampilkan detail alumni.
-   Admin memeriksa informasi.
-   Admin menekan tombol Generate Surat.
-   Sistem mengisi template berdasarkan data alumni.
-   Surat dapat diunduh dalam format DOCX atau PDF.

**Ketentuan:** Satu alumni menghasilkan satu dokumen surat.

## 3.3 Alur Generate Banyak Surat

-   Admin memilih beberapa alumni melalui checkbox.
-   Admin menentukan format dokumen.
-   Admin menekan tombol Generate Massal.
-   Sistem menghasilkan satu dokumen untuk setiap alumni.
-   Semua dokumen dikemas dalam satu file ZIP.

**Ketentuan:** Tidak menggabungkan banyak alumni ke dalam satu surat.
Setiap alumni tetap mendapatkan surat terpisah.

------------------------------------------------------------------------

# 4. Persyaratan Fungsional

## FR-01 --- Login Admin

-   Aplikasi menyediakan halaman login.
-   Admin menggunakan password untuk masuk.
-   Password disimpan menggunakan environment variable Vercel.
-   Tidak menggunakan database untuk autentikasi.
-   Admin dapat melakukan logout.

## FR-02 --- Import CSV

-   Admin dapat mengunggah file CSV melalui antarmuka aplikasi.
-   Nama file yang digunakan adalah `data-tracer-study.csv`.
-   Sistem membaca data menggunakan PapaParse.
-   Sistem memeriksa kolom yang dibutuhkan.
-   Sistem menampilkan pesan apabila format CSV tidak sesuai.
-   Sistem dapat menangani data kosong dan duplikat.

## FR-03 --- Data Alumni

Sistem menampilkan tabel alumni dengan informasi:

-   Nama.
-   NIM.
-   Program Studi.
-   Tahun Lulus.
-   Tempat Kerja.

Sistem menyediakan pencarian berdasarkan nama dan NIM serta filter
program studi dan tahun lulus.

## FR-04 --- Detail Alumni

Admin dapat membuka detail alumni sebelum membuat surat.

Informasi yang ditampilkan:

-   Nama lengkap.
-   NIM.
-   Program Studi.
-   Tahun Lulus.
-   Tempat Kerja.
-   Nomor WhatsApp.

## FR-05 --- Generate Surat

-   Sistem menggunakan template
    `draft-surat-pengantar-tracer-study.docx`.
-   Sistem mengganti placeholder dengan data alumni.
-   Format dan susunan dokumen mengikuti template asli.
-   Setiap surat hanya memuat informasi satu alumni.
-   Sistem menyediakan preview atau pemeriksaan data sebelum generate.

## FR-06 --- Export Word

-   Menghasilkan dokumen DOCX.
-   Mempertahankan format template.
-   Nama file dibuat otomatis, misalnya:

`Surat_Pengantar_Nama_Alumni_NIM.docx`

## FR-07 --- Export PDF

-   Menghasilkan surat dalam format PDF.
-   Tata letak harus konsisten dengan template Word.
-   PDF dapat diunduh secara terpisah maupun melalui generate massal.

## FR-08 --- Generate Massal

-   Admin dapat memilih beberapa alumni.
-   Sistem menghasilkan dokumen terpisah untuk setiap alumni.
-   Dokumen dikemas dalam ZIP.
-   Nama setiap file mengikuti identitas alumni.

## FR-09 --- Integrasi WhatsApp

-   Sistem menyediakan tombol Kirim via WhatsApp.
-   Nomor WhatsApp diambil dari data alumni.
-   Sistem membuka WhatsApp Web atau aplikasi WhatsApp.
-   Caption sudah terisi otomatis.
-   Admin tetap melakukan pengiriman secara manual.
-   File surat harus diunduh dan dilampirkan oleh admin.

Contoh caption:

> Yth. Saudara/i \[Nama Alumni\],
>
> Berikut kami sampaikan surat pengantar Tracer Study dari Universitas
> 'Aisyiyah Yogyakarta.
>
> Mohon kesediaannya untuk memperhatikan informasi dalam surat tersebut.
>
> Terima kasih.

------------------------------------------------------------------------

# 5. Persyaratan Nonfungsional

## NFR-01 --- Performa

-   Pembacaan CSV harus berjalan secara efisien.
-   Pencarian alumni harus responsif.
-   Proses generate tidak boleh menyebabkan aplikasi mengalami crash
    untuk penggunaan normal.

## NFR-02 --- Keamanan

-   Aplikasi hanya dapat digunakan admin.
-   CSV tidak disimpan dalam folder publik.
-   Data alumni tidak dimasukkan ke repository GitHub publik.
-   Password tidak boleh ditulis langsung di source code.
-   Data CSV diproses sementara dan tidak disimpan permanen di server.

## NFR-03 --- Kompatibilitas

-   Dapat digunakan melalui browser modern.
-   Mendukung desktop dan tablet.
-   Mendukung penggunaan WhatsApp Web maupun aplikasi WhatsApp.

## NFR-04 --- Kemudahan Penggunaan

-   Antarmuka sederhana.
-   Navigasi mudah dipahami.
-   Informasi kesalahan ditampilkan dengan jelas.
-   Proses generate dapat dilakukan tanpa langkah yang rumit.

------------------------------------------------------------------------

# 6. Teknologi yang Digunakan

  Teknologi             Fungsi
  --------------------- ---------------------------
  Nuxt 3                Framework aplikasi
  Vue 3                 Pengembangan antarmuka
  TypeScript            Pengelolaan tipe data
  Tailwind CSS          Styling
  PapaParse             Parsing CSV
  Docxtemplater         Pengisian template Word
  PizZip                Pemrosesan file DOCX
  JSZip                 Pengemasan dokumen massal
  Vercel                Deployment aplikasi
  WhatsApp URL Scheme   Membuka chat WhatsApp

**Catatan PDF:** Konversi DOCX ke PDF perlu diuji secara teknis sebelum
implementasi final. Vercel tidak menyediakan LibreOffice secara default.
Solusi konversi harus menggunakan pendekatan yang kompatibel dengan
lingkungan deployment, misalnya layanan konversi eksternal atau
mekanisme konversi client-side yang telah diuji. Mengubah ekstensi DOCX
menjadi PDF tidak cukup.

------------------------------------------------------------------------

# 7. Struktur Proyek

``` text
tracer-letter-generator/
│
├── assets/
│   └── css/
│       └── main.css
│
├── components/
│   ├── AppHeader.vue
│   ├── AlumniTable.vue
│   ├── AlumniDetail.vue
│   ├── CsvUploader.vue
│   ├── SearchFilter.vue
│   └── GenerateDialog.vue
│
├── pages/
│   ├── login.vue
│   ├── index.vue
│   ├── alumni.vue
│   └── generate.vue
│
├── server/
│   └── api/
│
├── public/
│   └── templates/
│       └── draft-surat-pengantar-tracer-study.docx
│
├── utils/
│   ├── csv-parser.ts
│   ├── alumni-mapper.ts
│   ├── document-generator.ts
│   ├── pdf-generator.ts
│   └── whatsapp.ts
│
├── types/
│   └── alumni.ts
│
├── nuxt.config.ts
├── package.json
└── README.md
```

File CSV tidak dimasukkan ke dalam folder `public` dan tidak perlu
disimpan di repository.

------------------------------------------------------------------------

# 8. Batasan Sistem (Project Constraints)

## 8.1 Batasan Data

1.  Sistem tidak terintegrasi langsung dengan aplikasi Tracer Study.
2.  Data alumni hanya berasal dari file CSV yang diunggah admin.
3.  Sistem tidak dapat mengambil data terbaru secara otomatis.
4.  Apabila terdapat perubahan data alumni, admin harus mengunggah CSV
    terbaru.
5.  Sistem hanya dapat membaca kolom yang telah dipetakan.
6.  Data yang tidak tersedia dalam CSV tidak dapat dihasilkan secara
    otomatis.
7.  Data alumni tidak disimpan dalam database.

## 8.2 Batasan Penyimpanan

1.  Tidak menggunakan MySQL, PostgreSQL, MongoDB, maupun database
    lainnya.
2.  File CSV diproses sementara di browser.
3.  Data yang berada dalam memori aplikasi dapat hilang ketika halaman
    dimuat ulang atau sesi berakhir.
4.  Admin perlu mengunggah kembali CSV ketika data tidak lagi tersedia.
5.  Dokumen hasil generate diunduh oleh admin dan tidak disimpan
    permanen di server.

## 8.3 Batasan Generate Surat

1.  Format surat mengikuti template resmi yang diberikan.
2.  Sistem tidak mengubah desain atau isi template secara otomatis.
3.  Perubahan template harus dilakukan dengan memperbarui file DOCX yang
    digunakan aplikasi.
4.  Satu dokumen hanya berlaku untuk satu alumni.
5.  Sistem tidak membuat tanda tangan digital.
6.  Sistem tidak menghasilkan nomor surat resmi secara otomatis kecuali
    format dan aturan penomorannya telah ditentukan.

## 8.4 Batasan WhatsApp

1.  Sistem menggunakan WhatsApp Link, bukan WhatsApp Business API.
2.  Sistem hanya membuka percakapan dengan nomor tujuan.
3.  Caption dapat diisi otomatis.
4.  Pengiriman dokumen tetap dilakukan manual.
5.  Sistem tidak dapat memastikan pesan telah terkirim atau dibaca.
6.  Sistem tidak menyediakan riwayat pengiriman WhatsApp.

## 8.5 Batasan Deployment

1.  Aplikasi dipublikasikan menggunakan Vercel.
2.  Sistem tidak mengandalkan penyimpanan file permanen pada serverless
    function.
3.  Proses pembuatan dokumen harus kompatibel dengan batasan runtime
    Vercel.
4.  Proses konversi PDF harus menggunakan solusi yang kompatibel dengan
    deployment Vercel.
5.  Aplikasi tidak menyediakan sinkronisasi data antarperangkat.

## 8.6 Batasan Pengguna

1.  Aplikasi hanya digunakan oleh admin.
2.  Alumni tidak memiliki akun.
3.  Tidak terdapat sistem registrasi pengguna.
4.  Tidak terdapat pembagian role admin dan superadmin.
5.  Aplikasi menggunakan satu kredensial akses admin.

------------------------------------------------------------------------

# 9. Fitur di Luar Ruang Lingkup (Out of Scope)

Fitur berikut tidak termasuk dalam versi pertama:

-   Integrasi API Tracer Study.
-   Database dan penyimpanan data permanen.
-   Portal khusus alumni.
-   Registrasi dan pengelolaan akun alumni.
-   Pengiriman WhatsApp otomatis menggunakan API.
-   Notifikasi WhatsApp otomatis.
-   Riwayat pengiriman surat.
-   Dashboard analitik Tracer Study.
-   Statistik pekerjaan alumni.
-   Tanda tangan elektronik.
-   Workflow persetujuan surat.
-   Manajemen arsip surat jangka panjang.

------------------------------------------------------------------------

# 10. Kriteria Keberhasilan (Acceptance Criteria)

  -----------------------------------------------------------------------
  No.                     Kriteria                Indikator Keberhasilan
  ----------------------- ----------------------- -----------------------
  1                       Login                   Admin dapat masuk
                                                  menggunakan password

  2                       Upload CSV              CSV berhasil dibaca

  3                       Validasi                Kolom wajib dapat
                                                  diperiksa

  4                       Data Alumni             Informasi alumni tampil
                                                  dengan benar

  5                       Search                  Alumni dapat ditemukan
                                                  berdasarkan nama dan
                                                  NIM

  6                       Filter                  Alumni dapat difilter
                                                  berdasarkan prodi dan
                                                  tahun lulus

  7                       Generate DOCX           Surat berhasil dibuat
                                                  sesuai template

  8                       Generate PDF            Surat berhasil
                                                  dikonversi dengan
                                                  format yang sesuai

  9                       Generate Massal         Setiap alumni
                                                  menghasilkan satu
                                                  dokumen

  10                      ZIP                     Dokumen massal dapat
                                                  diunduh dalam ZIP

  11                      WhatsApp                Chat terbuka dengan
                                                  nomor dan caption yang
                                                  benar

  12                      Deployment              Aplikasi dapat diakses
                                                  melalui domain Vercel
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 11. Tahapan Pengembangan

  Tahap   Aktivitas                             Output
  ------- ------------------------------------- -----------------------------
  1       Setup Nuxt 3 dan konfigurasi proyek   Kerangka aplikasi
  2       Membuat login admin                   Proteksi akses
  3       Implementasi CSV parser               Data alumni terbaca
  4       Membuat halaman data alumni           Tabel, pencarian, filter
  5       Implementasi template DOCX            Generate surat Word
  6       Implementasi PDF                      Export PDF
  7       Implementasi generate massal          ZIP berisi surat terpisah
  8       Integrasi WhatsApp                    Pengiriman melalui WhatsApp
  9       Testing                               Sistem teruji
  10      Deployment Vercel                     Aplikasi online

------------------------------------------------------------------------

# 12. Prioritas Pengembangan

## P0 --- Wajib tersedia

-   Login admin.
-   Import CSV.
-   Pembacaan dan validasi data.
-   Pencarian alumni.
-   Generate surat Word.
-   Generate surat satuan dan massal.

## P1 --- Fitur pendukung utama

-   Export PDF.
-   Download ZIP.
-   Integrasi WhatsApp dengan caption otomatis.
-   Filter program studi dan tahun lulus.

## P2 --- Pengembangan lanjutan

-   Preview surat sebelum download.
-   Pengaturan template.
-   Pengaturan caption WhatsApp.
-   Peningkatan pengalaman pengguna.

------------------------------------------------------------------------

# 13. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Struktur CSV berubah                Buat mekanisme validasi dan
                                      pemetaan kolom

  Data alumni tidak lengkap           Tampilkan peringatan sebelum
                                      generate

  Template DOCX berubah               Uji ulang placeholder setiap kali
                                      template diperbarui

  Format PDF berbeda                  Lakukan pengujian hasil konversi

  File massal terlalu besar           Batasi jumlah alumni per proses

  Nomor WhatsApp tidak valid          Validasi nomor sebelum membuka
                                      WhatsApp

  Data pribadi terekspos              Proses CSV di browser dan hindari
                                      penyimpanan publik

  Akses admin tidak aman              Gunakan autentikasi server-side dan
                                      session yang aman
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 14. Definisi Produk Akhir

Tracer Study Letter Generator merupakan aplikasi web internal yang
membantu admin mengotomatisasi pembuatan surat pengantar Tracer Study
berdasarkan data alumni yang berasal dari file CSV.

Aplikasi memungkinkan admin melakukan pencarian alumni, memilih satu
atau beberapa alumni, menghasilkan surat Word maupun PDF berdasarkan
template resmi, serta mendistribusikan surat melalui WhatsApp dengan
caption otomatis.

Aplikasi tidak menggunakan database dan tidak memiliki integrasi
langsung dengan sistem Tracer Study. Seluruh proses pengelolaan data
dilakukan berdasarkan file CSV yang disediakan admin.

**Prinsip utama produk: sederhana, akurat, efisien, dan mudah digunakan
oleh admin.**

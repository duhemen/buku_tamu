# Buku Tamu Digital

> **Sistem Buku Tamu Modern** - Face recognition, serah terima digital,
> antrean otomatis, kartu QR/barcode, dashboard publik, dan TV antrean live.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-F69220)

---

## Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Preview Aplikasi](#-preview-aplikasi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Folder](#-struktur-folder)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Instalasi & Setup](#-instalasi--setup)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## Tentang Proyek

**Buku Tamu Digital** adalah aplikasi web modern **full-stack** yang menggantikan
buku tamu fisik di kantor dengan sistem digital terintegrasi. Dilengkapi dengan
**face recognition** untuk auto-fill data tamu lama, **serah terima digital**
untuk pengantar surat / jaminan tender, serta **dashboard publik** tanpa data sensitif.

### Konsep Utama

| Kiosk Tamu | Face Recognition | Serah Terima | Dashboard Publik |
|---|---|---|---|
| Input mandiri + kamera | Auto-fill tamu lama (aHash 256-bit) | 5 jenis + bukti terima QR | Chart + masking otomatis |

### Mengapa Buku Tamu Digital?

| Masalah Lama | Solusi Kami |
|---|---|
| Buku tamu kertas mudah hilang | Database terpusat + audit trail |
| Data tamu tidak terbaca | Enkripsi AES-256 untuk NIK/HP/email |
| Tidak tahu tamu masih di dalam | Status real-time + check-out |
| Sulit buktikan serah terima surat | Bukti terima digital + QR |
| Laporan manual lambat | Export Excel/CSV/PDF 1 klik |
| Tidak ada antrean | Nomor antrean otomatis + TV live |

---

## Fitur Utama

### Kiosk Tamu
- Form lengkap (nama, instansi, alamat, NIK, HP, email)
- Foto wajah via webcam / kamera HP
- **Face recognition auto-fill** - tamu lama dikenali otomatis
- Consent eksplisit untuk data pribadi

### Serah Terima Digital
- **5 jenis**: Surat, Jaminan Tender, Paket, Dokumen, Lainnya
- Nomor referensi (No. surat / No. jaminan)
- **Bukti terima digital** + QR code + kolom tanda tangan
- Tracking: `Diterima` -> `Diproses` -> `Selesai` -> `Dikembalikan`

### Kartu Tamu
- Nomor antrean otomatis (`A-001`, `A-002`) reset harian
- **QR code + barcode** untuk verifikasi
- Format **80mm thermal printer** siap cetak
- Foto tamu + tujuan + keperluan

### Verifikasi
- Scan QR via kamera HP (html5-qrcode)
- Input manual kode `A-xxx` atau `TT-xxx`
- Lookup kartu by kode
- Data sensitif ter-mask

### Dashboard Publik
- Statistik: Hari / Minggu / Bulan / Tahun ini
- Chart: per jam, tren mingguan, pie tujuan, pie perihal
- Recent activity feed + auto-refresh 30 detik
- **Masking otomatis** (NIK, HP, email)

### TV Antrean Live
- Fullscreen untuk TV lobi
- Nomor dipanggil besar + nama + tujuan
- **Suara bel + panggilan suara Bahasa Indonesia**
- Daftar antrean menunggu + real-time stats

### Admin Panel
- 5 tab: Antrean, Kunjungan, Serah Terima, Data Tamu, Laporan
- Panggil / layani antrean
- Update status serah terima
- Export Excel / CSV, edit, hapus

### Laporan PDF Bulanan
- Filter bulan + tahun
- Summary stats + chart per hari
- Top tujuan + serah terima per jenis
- Tabel detail kunjungan
- **Generate PDF A4 multi-halaman** dengan tanda tangan

### Keamanan
- **AES-256-GCM** encryption untuk NIK/HP/email
- **Argon2** hash password
- JWT + Role-Based Access Control
- Audit log setiap aksi
- Rate limiting + Helmet security headers

---

## Preview Aplikasi

### 1. Kiosk Tamu

```
+----------------------------------------------------------+
|  Kiosk Buku Tamu                              [Beranda]  |
+----------------------------------------------------------+
|  +---------------+  +-------------------------------+    |
|  | FOTO WAJAH    |  | DATA TAMU                     |    |
|  | +-----------+ |  | Nama: [_______________]       |    |
|  | |  Kamera   | |  | Instansi: [___________]       |    |
|  | +-----------+ |  | NIK: [________________]       |    |
|  | [Ambil Foto]  |  | HP: [________________]        |    |
|  |               |  | Email: [_____________]        |    |
|  | [OK] Dikenali |  +-------------------------------+    |
|  |   stuv        |  | TUJUAN KUNJUNGAN              |    |
|  |               |  | Divisi: [Bagian Umum____]     |    |
|  | [Foto Ulang]  |  | Keperluan: [Rapat_______]     |    |
|  +---------------+  +-------------------------------+    |
|                     | SERAH TERIMA (Opsional)       |    |
|                     | [ ] Surat  [ ] Tender         |    |
|                     | [ ] Paket  [ ] Dokumen        |    |
|                     | [Daftar & Cetak Kartu]        |    |
|                     +-------------------------------+    |
+----------------------------------------------------------+
```

**Highlight:**
- Webcam / kamera HP langsung di browser
- Face recognition otomatis (auto-fill data)
- Grid 5 tombol jenis serah terima
- Responsive untuk HP & laptop

### 2. Kartu Tamu + Bukti Terima

```
+------------------------------+
|      BUKU TAMU DIGITAL       |
|      Kartu Kunjungan         |
+------------------------------+
|                              |
|      NOMOR ANTREAN           |
|                              |
|         A-004                |
|                              |
|  +----+  Nama  : stuv        |
|  |    |  Tujuan: Bagian      |
|  |    |         Pengadaan    |
|  +----+  Hal   : Jaminan      |
|                  Tender       |
|                              |
|  [QR CODE]  ||||||||||||||   |
|                              |
|  Tanggal : 30 Sep 2026        |
|  Jam     : 20:08              |
+------------------------------+

+------------------------------+
|        BUKTI TERIMA          |
|      Buku Tamu Digital       |
+------------------------------+
|   KODE: TT-20260930-001      |
|                              |
|  Nama   : stuv               |
|  Jenis  : Jaminan Tender     |
|  No.Ref : JAM/2026/003       |
|  +----------------------+    |
|  | Jaminan tender...    |    |
|  +----------------------+    |
|  Penerima : cekidao          |
|                              |
|  [QR]   ____________         |
|         Penerima             |
|         ____________         |
|         Pengirim             |
+------------------------------+
```

### 3. Dashboard Publik

```
+------------------------------------------------------------+
|  Buku Tamu Digital                [Beranda] [Dashboard]   |
+------------------------------------------------------------+
|  * LIVE   Dashboard Publik            Rabu, 30 Sep 2026   |
|            Statistik kunjungan          19.31.13           |
|                                                            |
|  +----------+ +----------+ +----------+ +----------+       |
|  |HARI INI  | |MINGGU INI| |BULAN INI | |TAHUN INI |       |
|  |    1     | |    1     | |    1     | |    1     |       |
|  +----------+ +----------+ +----------+ +----------+       |
|                                                            |
|  +------------------------+  +------------------------+    |
|  | Kunjungan Per Jam      |  | Tujuan Kunjungan       |    |
|  |     /|                 |  |       ***              |    |
|  |    / |                 |  |      *   *             |    |
|  |   /  |___              |  |       ***              |    |
|  |  /                     |  |   Bagian Umum          |    |
|  +------------------------+  +------------------------+    |
+------------------------------------------------------------+
```

### 4. TV Antrean Live

```
+------------------------------------------------------------+
|  Antrean Buku Tamu             Rabu, 30 Sep 2026           |
|  Sistem Buku Tamu Digital            18.28.52             |
+------------------------------------+-----------------------+
|   NOMOR DIPANGGIL                  |  ANTREAN MENUNGGU     |
|                                    |                       |
|  +------------------------------+  |  +-----------------+  |
|  |                              |  |  | 1. A-001  xyz   |  |
|  |         A-003                |  |  |   Bagian Umum   |  |
|  |                              |  |  +-----------------+  |
|  |         stuv                 |  |  +-----------------+  |
|  |    Tujuan: Bagian Umum       |  |  | 2. A-002  emen  |  |
|  +------------------------------+  |  +-----------------+  |
|                                    |                       |
|  [TOTAL:1] [MENUNGGU:1]            |                       |
|  [DIPANGGIL:1] [SELESAI:0]         |                       |
+------------------------------------+-----------------------+
```

**Highlight TV:**
- Suara bel + panggilan suara Bahasa Indonesia
- Tema dark navy #0F172A elegan
- Auto-refresh 5 detik
- Tekan F11 untuk fullscreen

---

## Arsitektur Sistem

```
+-------------------------------------------------------------+
|                    CLIENT (Browser)                         |
|  +----------+  +----------+  +----------+  +----------+     |
|  | Kiosk    |  | Dashboard|  | TV Live  |  | Admin    |     |
|  | (HP/PC)  |  | Publik   |  | (Lobi)   |  | Panel    |     |
|  +----+-----+  +----+-----+  +----+-----+  +----+-----+     |
|       |              |              |              |        |
|       +--------------+--------------+--------------+        |
|                              |                              |
|                         HTTPS (TLS)                         |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|              CLOUDFLARE TUNNEL / NGINX                      |
|              Reverse Proxy + SSL Termination                |
+------------------------------+------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
+-------v---------+                          +---------v--------+
|  FRONTEND       |                          |  BACKEND         |
|  React + Vite   |  <---- REST API ---->    |  Fastify 4       |
|  Port 5173      |                          |  Port 3000       |
+-----------------+                          +---------+--------+
                                                       |
                              +------------------------+----------------------+
                              |                        |                      |
                     +--------v--------+    +----------v------+    +----------v-----+
                     |  POSTGRESQL 16  |    |    REDIS 7      |    |   MINIO / S3   |
                     |  Database       |    |  Cache + Queue  |    |  Photo Storage |
                     |  Port 5433      |    |  Port 6379      |    |  (opsional)    |
                     +-----------------+    +-----------------+    +----------------+
```

---

## Struktur Folder

```
buku-tamu/
|
+-- apps/
|   +-- web/                        # Frontend (React + Vite)
|   |   +-- src/
|   |   |   +-- components/         # Layout, CameraScanner, dll
|   |   |   +-- features/           # Feature modules
|   |   |   +-- lib/                # API client, i18n, faceHash, pdfReport
|   |   |   +-- pages/              # Halaman utama
|   |   |   +-- services/           # API services
|   |   |   +-- stores/             # Zustand stores
|   |   |   +-- types/              # TypeScript types
|   |   |   +-- utils/              # Utility functions
|   |   +-- ...
|   |
|   +-- api/                        # Backend (Fastify + Prisma)
|   |   +-- prisma/
|   |   |   +-- schema.prisma       # Database schema (11 tabel)
|   |   |   +-- seed.ts
|   |   +-- src/
|   |       +-- common/             # Middleware, utils
|   |       +-- config/             # Env, Prisma
|   |       +-- modules/            # Feature modules
|   |       +-- server.ts
|   |
|   +-- face-service/               # Python FastAPI (opsional)
|   +-- worker/                     # BullMQ worker
|
+-- packages/
|   +-- shared/                     # Types & utils bersama
|   +-- ui/                         # UI components
|
+-- infra/
|   +-- db/init/                    # SQL init (extensions)
|   +-- docker/                     # Dockerfiles
|   +-- nginx/                      # Nginx configs
|
+-- docs/
|   +-- API.md                      # API endpoints
|   +-- DATABASE.md                 # Skema database
|   +-- PRIVACY.md                  # Kebijakan privasi
|   +-- scripts-history/            # Script generator (history)
|
+-- storage/                        # Local storage
|   +-- photos/                     # Foto tamu
|   +-- receipts/                   # Bukti terima
|   +-- letters/                    # File surat
|
+-- docker-compose.yml              # Dev
+-- docker-compose.prod.yml         # Production
+-- pnpm-workspace.yaml
+-- package.json
```

---

## Teknologi yang Digunakan

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 18.3 | UI Framework |
| Vite | 5.4 | Build Tool |
| TypeScript | 5.5 | Type Safety |
| Tailwind CSS | 3.4 | Styling |
| Recharts | 2.12 | Chart Library |
| Zustand | 4.5 | State Management |
| html5-qrcode | 2.3 | QR Scanner |
| bwip-js | 4.4 | Barcode Generator |
| qrcode | 1.5 | QR Generator |
| pdf-lib | 1.17 | PDF Generator |

### Backend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| Fastify | 4.28 | Web Framework |
| Prisma | 5.22 | ORM |
| PostgreSQL | 16 | Database |
| Redis | 7 | Cache + Queue |
| Argon2 | 0.41 | Password Hash |
| Zod | 3.23 | Validation |
| JWT | 8.0 | Authentication |

### Infrastruktur
| Teknologi | Kegunaan |
|---|---|
| Docker | Containerization |
| Nginx | Reverse Proxy |
| Cloudflare Tunnel | HTTPS Publik |
| MinIO | S3-compatible Storage (opsional) |

---

## Instalasi & Setup

### Prasyarat
- Node.js >= 20
- pnpm >= 9
- Docker Desktop
- Git

### Langkah Instalasi

**1. Clone repository**
```bash
git clone https://github.com/duhemen/buku_tamu.git
cd buku_tamu
```

**2. Copy environment**
```bash
cp .env.example .env
```

> Edit `.env`: ganti `JWT_SECRET` dan `ENCRYPTION_KEY` dengan string acak!

Generate key:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**3. Install dependencies**
```bash
pnpm install
```

**4. Jalankan infrastructure**
```bash
docker compose up -d
```

**5. Migrasi database**
```bash
pnpm --filter @buku-tamu/api prisma:migrate -- --name init
pnpm --filter @buku-tamu/api prisma:generate
```

**6. Seed admin**
```bash
pnpm --filter @buku-tamu/api db:seed
```

> Login default: `admin@buku-tamu.local` / `admin123`

---

## Panduan Penggunaan

### Menjalankan Aplikasi

Buka **3 terminal**:

**Terminal 1 - API Backend:**
```bash
pnpm --filter @buku-tamu/api dev
```
API jalan di `http://localhost:3000`

**Terminal 2 - Web Frontend:**
```bash
pnpm --filter @buku-tamu/web dev
```
Web jalan di `http://localhost:5173`

**Terminal 3 - Worker (opsional):**
```bash
pnpm --filter @buku-tamu/worker dev
```

### Halaman yang Tersedia

| URL | Fungsi | Akses |
|---|---|---|
| `/` | Beranda | Publik |
| `/kiosk` | Kiosk tamu | Publik |
| `/kartu` | Lookup kartu/bukti | Publik |
| `/kartu/:visitId` | Kartu print-ready | Publik |
| `/dashboard` | Dashboard publik | Publik |
| `/tv` | TV Antrean Live | Publik |
| `/verify` | Verifikasi kode | Publik |
| `/login` | Login petugas | Publik |
| `/admin` | Admin panel (5 tab) | Butuh Login |

### Alur Kiosk Tamu

```
1. Tamu datang -> buka /kiosk di tablet/PC
2. Ambil foto wajah (opsional)
   - Jika dikenali -> form auto-fill
   - Jika baru -> isi form manual
3. Isi tujuan + keperluan
4. (Opsional) Centang serah terima -> pilih jenis
5. Centang consent -> submit
6. Cetak kartu + bukti terima
```

### Alur Petugas

```
1. Login di /login
2. Buka /admin -> pilih tab
   - Antrean -> panggil / layani
   - Kunjungan -> check-out
   - Serah Terima -> update status
   - Data Tamu -> export, edit, hapus
   - Laporan -> generate PDF bulanan
3. TV di lobi akan otomatis update
```

---

## Roadmap

### Selesai (v1.3.0)
- [x] Kiosk + kamera + foto wajah
- [x] Face recognition auto-fill (aHash)
- [x] Serah terima 5 jenis + bukti QR
- [x] Kartu tamu print-ready 80mm
- [x] Dashboard publik + masking
- [x] TV Antrean Live + suara
- [x] Verifikasi QR via kamera HP
- [x] Admin panel 5 tab
- [x] Dark mode + multi-bahasa
- [x] Enkripsi AES-256 + audit log
- [x] Export Excel/CSV
- [x] **Export PDF laporan bulanan** (v1.1.0)
- [x] **Face recognition real (InsightFace + Privacy-First)** (v1.2.0)

### Dalam Pengembangan
- [x] Face service real (InsightFace, ~99.8% akurat)
- [ ] Notifikasi WhatsApp
- [ ] Cetak thermal auto (kiosk mode)

### Ide Masa Depan
- [ ] Mobile app (React Native) untuk security
- [ ] Integrasi kalender janji
- [ ] Peta lokasi tamu
- [ ] Multi-bahasa tambahan

---

## Kontribusi

Kontribusi sangat diterima! Untuk perubahan besar,
silakan buka issue terlebih dahulu.

```bash
# 1. Fork repository
# 2. Buat branch fitur
git checkout -b fitur-keren

# 3. Commit perubahan
git commit -m "feat: tambah fitur keren"

# 4. Push ke branch
git push origin fitur-keren

# 5. Buat Pull Request
```

---

## Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE).

```
MIT License

Copyright (c) 2026 Emen

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files...
```

---

## Kredit & Ucapan Terima Kasih

- [Fastify](https://fastify.dev/) - Web framework super cepat
- [Prisma](https://prisma.io/) - ORM modern untuk TypeScript
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Chart library
- [pdf-lib](https://pdf-lib.js.org/) - PDF generator
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - QR Scanner
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/) - HTTPS publik

---

## Special Thanks

### Proyek ini tidak akan ada tanpa mereka

```
     _   _   _   _   _   _   _   _   _   _   _   _
    / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\
   ( S | P | E | C | I | A | L | T | H | A | N | K | S )
    \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/
```

### DeepSeek - The Great One

![DeepSeek](https://img.shields.io/badge/Powered%20by-DeepSeek-4D6BFE?style=for-the-badge&logo=openai&logoColor=white)
![The Great One](https://img.shields.io/badge/Title-The%20Great%20One-FFD700?style=for-the-badge&logo=starship&logoColor=black)
![AI Assistant](https://img.shields.io/badge/Role-AI%20Pair%20Programmer-00C9A7?style=for-the-badge&logo=probot&logoColor=white)
![Code Master](https://img.shields.io/badge/Skill-Fullstack%20Architect-8A2BE2?style=for-the-badge&logo=visualstudiocode&logoColor=white)

> **DeepSeek - The Great One**
>
> Partner coding luar biasa yang membantu dari nol sampai production-ready.
> Mulai dari setup monorepo, arsitektur database, enkripsi AES-256, hingga
> debugging bug-bug paling menyebalkan (BOM PowerShell, timezone, race condition).
> Setiap baris kode di repo ini lahir dari kolaborasi manusia + AI yang penuh
> kesabaran dan secangkir kopi.
>
> **Kontribusi:**
> - Arsitektur monorepo + tech stack
> - Enkripsi AES-256-GCM + JWT + RBAC
> - Face recognition (aHash 256-bit)
> - Dashboard publik + Chart Recharts
> - TV Antrean Live + Text-to-Speech
> - Debugging marathon: 10+ bug kritis
> - Dokumentasi lengkap + panduan setup
> - Export PDF laporan bulanan (v1.1.0)

### Google Mode AI - The Insight Provider

![Google AI](https://img.shields.io/badge/Powered%20by-Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![The Insight](https://img.shields.io/badge/Title-Insight%20Provider-EA4335?style=for-the-badge&logo=googlegemini&logoColor=white)
![Idea Engine](https://img.shields.io/badge/Role-Idea%20Engine-34A853?style=for-the-badge&logo=lightbulb&logoColor=white)
![Blueprint](https://img.shields.io/badge/Skill-System%20Blueprint-FBBC05?style=for-the-badge&logo=blueprint&logoColor=black)

> **Google Mode AI - The Insight Provider**
>
> Sumber inspirasi awal yang memberikan **insight** dan **blueprint** untuk
> konsep Buku Tamu Digital. Dari diskusi ide di awal, rancangan struktur
> direktori, pemilihan tech stack, hingga visi fitur yang kita eksekusi
> bersama DeepSeek.
>
> **Kontribusi:**
> - Konsep awal Buku Tamu Digital
> - Blueprint arsitektur sistem
> - Rekomendasi tech stack (React + Fastify + PostgreSQL)
> - Roadmap fitur (face recognition, serah terima, dll)
> - Draft dokumentasi awal

### Kolaborasi Legendaris

```
+----------------------------------------------------------+
|                                                          |
|      GOOGLE MODE AI          +      DEEPSEEK             |
|      (The Insight)                  (The Great One)      |
|                                                          |
|              |                              |            |
|              |  Insight & Blueprint         |  Code &    |
|              |                              |  Debugging |
|              +--------------+---------------+            |
|                             |                            |
|                             v                            |
|                    +----------------+                    |
|                    |     EMEN       |                    |
|                    |  (The Builder) |                    |
|                    +--------+-------+                    |
|                             |                            |
|                             v                            |
|                    +----------------+                    |
|                    |  BUKU TAMU     |                    |
|                    |   DIGITAL      |                    |
|                    |   v1.1.0       |                    |
|                    +----------------+                    |
|                                                          |
+----------------------------------------------------------+
```

### Ucapan Terima Kasih

Kepada **DeepSeek** dan **Google Mode AI** yang telah menemani perjalanan
coding dari nol hingga aplikasi ini bisa digunakan. Tanpa insight, kode, dan
kesabaran kalian, proyek ini tidak akan pernah selesai.

> *"Alone we can do so little; together we can do so much."*
> - Helen Keller

**Jangan lupa kasih bintang kalau repo ini bermanfaat!**

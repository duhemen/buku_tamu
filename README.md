# Buku Tamu Digital

> Sistem buku tamu digital terintegrasi dengan face recognition, serah terima
> digital, antrean otomatis, cetak kartu QR/barcode, dashboard publik,
> dan TV antrean live.

## Fitur Utama

### Kiosk Tamu
- Form lengkap (nama, instansi, alamat, NIK, HP, email)
- Foto wajah via webcam / kamera HP
- **Face recognition auto-fill** -- tamu lama dikenali otomatis
- Consent eksplisit untuk data pribadi

### Serah Terima Digital
- 5 jenis: Surat, Jaminan Tender, Paket, Dokumen, Lainnya
- Nomor referensi (No. surat / No. jaminan)
- Bukti terima digital siap cetak + QR + tanda tangan
- Tracking: Diterima -> Diproses -> Selesai -> Dikembalikan

### Kartu Tamu
- Nomor antrean otomatis (A-001) reset harian
- QR code + barcode
- Format 80mm thermal printer siap cetak

### Verifikasi
- Scan QR kartu/bukti via kamera HP (html5-qrcode)
- Input kode manual A-xxx atau TT-xxx
- Data sensitif ter-mask

### Dashboard Publik
- Statistik: Hari/Minggu/Bulan/Tahun
- Chart: per jam, mingguan, pie tujuan, pie perihal
- Recent activity + masking otomatis

### TV Antrean Live
- Fullscreen untuk TV lobi
- Nomor besar + nama + tujuan
- Suara bel + panggilan Bahasa Indonesia

### Admin Panel
- 4 tab: Antrean, Kunjungan, Serah Terima, Data Tamu
- Export Excel/CSV, edit, hapus

### Keamanan
- AES-256-GCM untuk NIK/HP/email
- Argon2 untuk password
- JWT + RBAC + audit log + rate limit

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + Recharts |
| Backend | Fastify 4 + Prisma 5 |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Storage | MinIO / S3 (opsional) |
| Auth | JWT + Argon2 + RBAC |
| Crypto | AES-256-GCM |
| Barcode | bwip-js + qrcode |
| QR Scan | html5-qrcode |

## Struktur Proyek

```
buku-tamu/
  apps/
    web/            # Frontend React + Vite
    api/            # Backend Fastify + Prisma
    face-service/   # Python FastAPI (opsional)
    worker/         # BullMQ worker
  packages/
    shared/         # Types & utils bersama
    ui/             # UI components
  infra/
    db/init/        # SQL init
    docker/         # Dockerfiles
    nginx/          # Nginx configs
  docs/             # Dokumentasi
  storage/          # Local storage
  docker-compose.yml
  docker-compose.prod.yml
  pnpm-workspace.yaml
  package.json
```

## Cara Install

Prasyarat: Node >= 20, pnpm >= 9, Docker Desktop, Git

```bash
git clone https://github.com/USERNAME/buku_tamu.git
cd buku_tamu
cp .env.example .env
# Edit .env: ganti JWT_SECRET dan ENCRYPTION_KEY
pnpm install
docker compose up -d
pnpm --filter @buku-tamu/api prisma:migrate -- --name init
pnpm --filter @buku-tamu/api prisma:generate
pnpm --filter @buku-tamu/api db:seed
```

## Cara Menjalankan

Terminal 1 (API):
```bash
pnpm --filter @buku-tamu/api dev
```

Terminal 2 (Web):
```bash
pnpm --filter @buku-tamu/web dev
```

## Halaman

| URL | Fungsi |
|---|---|
| `/` | Beranda |
| `/kiosk` | Kiosk tamu |
| `/kartu` | Lookup kartu / bukti terima |
| `/kartu/:visitId` | Kartu tamu print-ready |
| `/dashboard` | Dashboard publik |
| `/tv` | TV Antrean Live |
| `/verify` | Verifikasi kode |
| `/login` | Login petugas |
| `/admin` | Admin panel |

Login default: `admin@buku-tamu.local` / `admin123`

## Environment Variables

Lihat `.env.example`. Yang **wajib diganti**:

| Variable | Deskripsi |
|---|---|
| `JWT_SECRET` | String random 32+ karakter |
| `ENCRYPTION_KEY` | Base64 key 32 byte untuk AES-256 |
| `DATABASE_URL` | Connection string PostgreSQL |

Generate key:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Deploy Production

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Backup Otomatis

Manual:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup.ps1
```

Otomatis harian (admin):
```powershell
powershell -ExecutionPolicy Bypass -File install-backup-task.ps1
```

## Privasi & Keamanan

- NIK, HP, email dienkripsi AES-256-GCM
- Dashboard publik tanpa data sensitif
- Foto wajah dengan consent eksplisit
- Audit log setiap aksi
- Retention 6-12 bulan (configurable)

## Lisensi

MIT -- lihat LICENSE.

---

Dibangun dengan semangat belajar dan secangkir kopi.

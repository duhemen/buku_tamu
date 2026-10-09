# Panduan Instalasi Buku Tamu Digital

Panduan lengkap untuk menginstall Buku Tamu Digital dari nol.

**Waktu setup: ~30 menit (termasuk download Docker)**

---

## Prasyarat

| Software | Versi Minimum | Wajib? |
|---|---|---|
| Windows | 10 / 11 64-bit | Wajib |
| Docker Desktop | 4.30+ | Wajib |
| Node.js | 20+ | Wajib |
| Python | 3.11.x | Opsional (face recognition) |
| WSL2 | Aktif | Wajib (untuk Docker) |
| RAM | 8 GB (minimal) | Rekomendasi |
| Storage | 5 GB kosong | Wajib |

---

## Langkah 1: Download Bundle

1. Download file `BukuTamu-Digital-v1.6.0.zip` (~500 MB)
2. Extract ke folder: `C:\buku_tamu\`
3. Pastikan struktur:

```
C:\buku_tamu\
├── BukuTamu-Menu.bat
├── buku-tamu-tools.ps1
├── cloudflared.exe
├── apps/
├── packages/
├── infra/
└── ...
```

---

## Langkah 2: Jalankan Setup Awal (Menu 22)

1. Klik 2x `BukuTamu-Menu.bat`
2. Pilih **[22] Setup Awal (Cek Docker + Prasyarat)**
3. Wizard akan cek:
   - Docker Desktop - install kalau belum (via winget)
   - Node.js - install kalau belum
   - Python 3.11 - install kalau belum (opsional)
   - WSL2 - aktifkan kalau belum
4. Kalau ada yang baru diinstall, **restart Windows** dulu

Kalau Docker Desktop sudah terinstall, skip langkah ini.

---

## Langkah 3: Aktifkan Docker Desktop

1. Cari **Docker Desktop** di Start Menu
2. Klik - tunggu sampai ikon Docker di system tray **berhenti berputar** (hijau)
3. Biasanya 30-60 detik
4. Kalau ada popup update, ikutin saja

**Cek berhasil:**
```
docker info
```
Harus keluar output panjang dengan `Server Version: ...`.

---

## Langkah 4: Setup Token Cloudflare (Menu 8)

Kalau mau akses publik via internet:

1. Dari menu, pilih **[8] Setup Token Cloudflare**
2. Ikuti wizard - paste token Cloudflare
3. Detail setup Cloudflare: **baca `docs/SETUP-CLOUDFLARE.md`**

Kalau hanya akses lokal (tanpa internet):
- Skip langkah ini
- Aplikasi tetap bisa diakses di `http://localhost:5173`

---

## Langkah 5: Jalankan Aplikasi (Menu 1)

1. Dari menu, pilih **[1] Start Semua**
2. Tunggu proses:
   - Start Docker Desktop (kalau belum)
   - Start Docker containers (30 detik)
   - Start API + Web
   - Start Cloudflare Tunnel (kalau token ada)
   - Auto-open browser
3. Selesai!

**Akses aplikasi:**
- Lokal: `http://localhost:5173`
- Publik: `https://kantorsaya.com` (kalau setup Cloudflare)

---

## Langkah 6: Login Admin

1. Buka `http://localhost:5173/login`
2. Login dengan:
   - Email: `admin@buku-tamu.local`
   - Password: `admin123`
3. **SEGERA GANTI PASSWORD** di Admin - Data Tamu (atau tambah user baru)

---

## Langkah 7: Konfigurasi Awal

Setelah login, lakukan setup:

### A. Setup Jam Operasional (Menu Admin - Jam Operasional)

1. Tab **Jam Kerja**
2. Edit tiap hari sesuai jam kerja kantor
3. Set cut-off (30 menit sebelum tutup)
4. Save

### B. Tambah Petugas (Menu Admin - Petugas)

1. Tab **Kelola Petugas**
2. Klik **+ Tambah Petugas**
3. Isi: nama, jabatan, unit, ruangan
4. Save
5. Ulangi untuk semua petugas

### C. Setup Agenda (Menu Admin - Agenda)

1. Klik **+ Tambah Agenda**
2. Isi: judul, kategori, tanggal, jam, lokasi
3. Save

### D. Konfirmasi Harian (Menu Admin - Petugas - Konfirmasi Hari Ini)

1. Setiap pagi, konfirmasi ke masing-masing petugas
2. Input status: Tersedia / Sibuk / Tidak Ada
3. Save - kiosk otomatis update

---

## Struktur Folder

```
C:\buku_tamu\
├── BukuTamu-Menu.bat          # Main launcher (klik 2x)
├── start-semua.bat            # Quick start
├── stop-semua.bat
├── status.bat
├── buku-tamu-tools.ps1        # Logic
├── cloudflared.exe            # Cloudflare tunnel binary
├── .env                       # Konfigurasi utama
├── config/
│   └── cloudflare.json        # Token Cloudflare
├── apps/
│   ├── web/                   # Frontend React
│   ├── api/                   # Backend Fastify
│   └── face-service/          # Python face recognition
├── packages/
│   ├── shared/
│   └── ui/
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── db/
├── docs/
│   ├── SETUP-CLOUDFLARE.md
│   ├── INSTALL.md             # File ini
│   └── PRIVACY.md
├── backups/                   # Backup database
└── storage/                   # File upload
```

---

## Cara Start & Stop

### Start

```
1. Klik 2x BukuTamu-Menu.bat
2. Pilih [1] Start Semua
3. Tunggu ~1 menit
4. Browser auto-open
```

### Stop

```
1. Klik 2x BukuTamu-Menu.bat
2. Pilih [2] Stop Semua
3. Semua service berhenti
```

### Cek Status

```
Menu [4] Cek Status Semua
```

### Restart

```
Menu [3] Restart Semua
```

---

## Troubleshooting

### Docker daemon not running

**Solusi:** Buka Docker Desktop dulu, tunggu sampai ikon hijau di system tray.

### Port 5173 already in use

**Solusi:** Ada aplikasi lain pakai port 5173. Tutup, atau ubah port di `.env`.

### Database connection failed

**Solusi:**
1. Cek Docker containers aktif: menu [4]
2. Restart Docker: menu [14]
3. Kalau masih error, cek log: menu [16]

### Out of memory

**Solusi:**
1. Tutup aplikasi lain
2. Naikkan RAM Docker Desktop: Settings - Resources - Memory
3. Minimal 4 GB, rekomendasi 8 GB

### Face recognition error

**Solusi:**
1. Cek Python 3.11 terinstall: menu [22]
2. Model InsightFace download ~280 MB saat pertama run
3. Tunggu 5-10 menit saat pertama kali

---

## Update Aplikasi

Untuk update ke versi baru:

1. Stop aplikasi (menu [2])
2. Backup database (menu [20])
3. Extract bundle baru ke folder temporary
4. Copy folder `data/` dan `config/` dari lama ke baru
5. Start aplikasi baru (menu [1])

---

## Uninstall

1. Stop aplikasi (menu [2])
2. Hapus folder `C:\buku_tamu\`
3. Uninstall Docker Desktop (kalau tidak dipakai)
4. Selesai

Catatan: Backup database dulu sebelum uninstall!

---

## Bantuan

- Baca `README-ENDUER.md`
- Baca `docs/SETUP-CLOUDFLARE.md` (untuk tunnel)
- Buka issue: https://github.com/duhemen/buku_tamu

---

**Selamat menggunakan Buku Tamu Digital!**